/**
 * THE ONLY FILE THAT USES UNDOCUMENTED OBSIDIAN INTERNALS.
 *
 * Obsidian has no public API for putting an editable Live Preview editor for
 * a file inside a custom view (R3). This uses the same internal note embed
 * that Canvas cards and `![[note]]` embeds use: it brings Obsidian's real
 * editor, saving (debounced `vault.modify`), live sync with other panes,
 * merging of outside changes, hotkeys and undo.
 *
 * Every member is checked before use. If anything is missing (a future
 * Obsidian version changed it), `mountEmbeddedEditor` returns null and the
 * caller falls back to a read-only card.
 *
 * Checked against Obsidian 1.15.1. See the README's "Known limitations".
 */
import { StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { App, Component, TFile } from "obsidian";

interface InternalEditMode {
	sourceMode: boolean;
	cm: EditorView;
	get(): string;
	focus(): void;
	toggleSource(): void;
	saveHistory?: () => void;
}

interface InternalMarkdownEmbed extends Component {
	file: TFile;
	editable: boolean;
	dirty: boolean;
	text: string;
	data: string;
	editMode: InternalEditMode | null;
	requestSave: { cancel(): void };
	loadFile(): Promise<void>;
	loadFileInternal(data: string, cache?: unknown): void;
	onFileChanged(file: TFile, data: string, cache: unknown): void;
	set(text: string, clear?: boolean): void;
	save(text: string, immediate?: boolean): Promise<void>;
	showEditor(): void;
	showPreview(): void;
	toggleMode(): void;
}

type EmbedFactory = (
	context: { app: App; containerEl: HTMLElement; state: Record<string, unknown> },
	file: TFile,
	subpath: string
) => unknown;

interface InternalApp {
	embedRegistry?: { embedByExtension?: Record<string, EmbedFactory | undefined> };
}

interface InternalWorkspace {
	unsetActiveEditor?: (editor: unknown) => void;
}

const REQUIRED_METHODS = [
	"loadFile",
	"loadFileInternal",
	"onFileChanged",
	"set",
	"save",
	"showEditor",
	"showPreview",
	"toggleMode",
	"load",
	"unload",
] as const;

function getFactory(app: App): EmbedFactory | null {
	const factory = (app as unknown as InternalApp).embedRegistry?.embedByExtension?.md;
	return typeof factory === "function" ? factory : null;
}

/** Whether this Obsidian version has the internals the live editor needs. */
export function isEmbeddedEditorAvailable(app: App): boolean {
	return getFactory(app) !== null;
}

function isUsableEmbed(embed: unknown): embed is InternalMarkdownEmbed {
	if (!embed || typeof embed !== "object") return false;
	const record = embed as Record<string, unknown>;
	return (
		REQUIRED_METHODS.every((name) => typeof record[name] === "function") &&
		"editable" in record &&
		typeof (record.requestSave as { cancel?: unknown } | undefined)?.cancel === "function"
	);
}

function isUsableEditMode(editMode: unknown): editMode is InternalEditMode {
	if (!editMode || typeof editMode !== "object") return false;
	const record = editMode as Record<string, unknown>;
	return (
		record.cm instanceof EditorView &&
		typeof record.get === "function" &&
		typeof record.toggleSource === "function"
	);
}

export interface EmbeddedEditor {
	/** True while the editor (or something inside it) has keyboard focus. */
	hasFocus(): boolean;
	/** Saves any pending typing, then tears the editor down. Safe to call twice. */
	destroy(): Promise<void>;
}

export interface MountOptions {
	/**
	 * Focus the editor with the cursor at the end of the note, e.g. for a
	 * reply that was just created. Otherwise mounting never takes focus.
	 */
	focus?: boolean;
}

/**
 * Mounts an editable Live Preview editor for `file` into `hostEl`.
 * Mounting never scrolls the feed, and only takes keyboard focus when asked.
 *
 * @returns null when the internals are unavailable; the caller should fall back.
 */
export async function mountEmbeddedEditor(
	app: App,
	file: TFile,
	hostEl: HTMLElement,
	parent: Component,
	options: MountOptions = {}
): Promise<EmbeddedEditor | null> {
	const factory = getFactory(app);
	if (!factory) return null;

	let embed: unknown;
	try {
		embed = factory({ app, containerEl: hostEl, state: {} }, file, "");
	} catch (error) {
		console.error("[feed-view] Could not create the note editor", error);
		return null;
	}
	if (!isUsableEmbed(embed)) return null;
	const md: InternalMarkdownEmbed = embed;
	const proto = Object.getPrototypeOf(md) as InternalMarkdownEmbed;

	md.editable = true;

	// Out of the box the embed ignores outside changes while it has unsaved
	// typing, then later saves over them. loadFileInternal does a 3-way merge,
	// so let it run even when dirty.
	md.onFileChanged = function (this: InternalMarkdownEmbed, changed: TFile, data: string, cache: unknown) {
		if (changed === this.file && data !== this.data) this.loadFileInternal(data, cache);
	};

	parent.addChild(md);
	try {
		await md.loadFile();
	} catch (error) {
		console.error("[feed-view] Could not load", file.path, error);
		parent.removeChild(md);
		hostEl.empty();
		return null;
	}
	if (!hostEl.isConnected) {
		// the card scrolled away while the file was loading
		parent.removeChild(md);
		hostEl.empty();
		return null;
	}

	// Once the editor exists, apply reloads as a diff (clear = false) so an
	// outside change doesn't reset the cursor or the undo history.
	md.set = function (this: InternalMarkdownEmbed, text: string, clear?: boolean) {
		proto.set.call(this, text, this.editMode ? false : clear);
	};

	const previousFocus = activeDocument.activeElement;
	const scrollSnapshot = snapshotScroll(hostEl);

	try {
		md.showEditor();
	} catch (error) {
		console.error("[feed-view] Could not open the note editor", error);
		parent.removeChild(md);
		hostEl.empty();
		return null;
	}

	const editMode = md.editMode;
	if (!isUsableEditMode(editMode)) {
		parent.removeChild(md);
		hostEl.empty();
		return null;
	}

	if (!options.focus) {
		// showEditor focuses the new editor in a deferred callback; a card coming
		// into view must not steal focus (or open the keyboard on mobile).
		// The no-op is an own property shadowing the real method; deleting it restores focus().
		editMode.focus = () => {};
		window.setTimeout(() => {
			Reflect.deleteProperty(editMode, "focus");
		}, 250);
		restoreFocus(app, md, hostEl, previousFocus);
	}
	restoreScroll(scrollSnapshot);

	// Always Live Preview, even when the vault default is Source mode.
	if (editMode.sourceMode) editMode.toggleSource();

	if (options.focus) {
		// cursor at the end of the note, below its (hidden) frontmatter
		editMode.cm.dispatch({ selection: { anchor: editMode.cm.state.doc.length } });
		editMode.cm.focus();
	}

	// Escape / "Toggle reading view" would swap the editor for a preview and
	// tear it down; the feed's own Reading switch handles that instead.
	md.showPreview = () => {};
	md.toggleMode = () => {};

	// The editor asks to scroll itself (e.g. to the top on first measure).
	// In an auto-height editor that would scroll the whole feed, so only a
	// focused editor may scroll (to keep the caret visible while typing).
	editMode.cm.dispatch({
		effects: StateEffect.appendConfig.of(EditorView.scrollHandler.of((view) => !view.hasFocus)),
	});

	let destroyed = false;
	const flush = async () => {
		md.requestSave.cancel();
		const current = md.editMode;
		if (!current) return;
		const text = current.cm.state.doc.toString();
		if (md.dirty || text !== md.text) await md.save(text, true);
		current.saveHistory?.();
	};

	// If the view or plugin unloads first, still save before the embed goes away.
	const originalUnload = md.unload.bind(md);
	md.unload = () => {
		if (!destroyed) {
			destroyed = true;
			void flush()
				.catch((error) => console.error("[feed-view] Could not save", file.path, error))
				.finally(() => originalUnload());
			return;
		}
		originalUnload();
	};

	return {
		hasFocus: () => editMode.cm.hasFocus,
		destroy: async () => {
			if (destroyed) return;
			destroyed = true;
			try {
				await flush();
			} catch (error) {
				console.error("[feed-view] Could not save", file.path, error);
			}
			parent.removeChild(md);
			hostEl.empty();
		},
	};
}

function restoreFocus(app: App, md: InternalMarkdownEmbed, hostEl: HTMLElement, previous: Element | null) {
	if (!hostEl.contains(activeDocument.activeElement)) return;
	(app.workspace as unknown as InternalWorkspace).unsetActiveEditor?.(md);
	if (previous instanceof HTMLElement && previous !== activeDocument.body && previous.isConnected) {
		previous.focus({ preventScroll: true });
	} else if (activeDocument.activeElement instanceof HTMLElement) {
		activeDocument.activeElement.blur();
	}
}

type ScrollSnapshot = [HTMLElement, number][];

function snapshotScroll(el: HTMLElement): ScrollSnapshot {
	const out: ScrollSnapshot = [];
	for (let node = el.parentElement; node; node = node.parentElement) {
		if (node.scrollTop !== 0) out.push([node, node.scrollTop]);
	}
	return out;
}

function restoreScroll(snapshot: ScrollSnapshot) {
	for (const [node, top] of snapshot) {
		if (node.scrollTop !== top) node.scrollTop = top;
	}
}
