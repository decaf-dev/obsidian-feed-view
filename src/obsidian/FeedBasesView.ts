import {
	BasesView,
	Keymap,
	Menu,
	Notice,
	TFile,
	type BasesEntry,
	type BasesPropertyId,
	type HoverParent,
	type HoverPopover,
	type QueryController,
	type Value,
} from "obsidian";
import { mount, unmount } from "svelte";
import {
	FEED_VIEW_TYPE,
	NOT_IMPLEMENTED_MESSAGE,
} from "../constants";
import { pruneFolds, renameFold, setAllFolded, toggleFold } from "../model/folds";
import { buildRows, cardRowKey } from "../model/rows";
import { allCardPaths, buildThreads } from "../model/threads";
import type { Thread } from "../model/types";
import { DEFAULT_VIEW_SETTINGS, type ViewSettings } from "../model/viewSettings";
import type FeedViewPlugin from "../main";
import type { FeedViewSettings } from "../settings";
import Feed from "../svelte/Feed.svelte";
import { FeedState, type CardView, type FeedActions } from "../svelte/feedState.svelte";
import { BodyController } from "./bodies/BodyController";
import { confirmThreadDeletion } from "./ConfirmDeleteModal";
import { findBaseKey, FoldStore, foldStorageKey } from "./foldStore";
import { LineCounter } from "./lineCounts";
import { buildPropertyRows, setCheckbox } from "./properties";
import { toCardNote, type CardNote } from "./records";
import { createReply } from "./replies";
import { SettingsStore, settingsStorageKey } from "./settingsStore";

/** How often day headings are refreshed, so "Today" rolls over after midnight. */
const HEADING_REFRESH_MS = 5 * 60 * 1000;

/**
 * The Feed layout for Bases: every note the Base returns as a card in one
 * scrolling column, grouped by day and threaded with replies.
 */
export class FeedBasesView extends BasesView implements HoverParent {
	readonly type = FEED_VIEW_TYPE;

	/** The element Bases gave this view to render into. */
	get hostEl(): HTMLElement {
		return this.containerEl;
	}
	hoverPopover: HoverPopover | null = null;

	private readonly rootEl: HTMLElement;
	private readonly feed = new FeedState();
	private readonly lineCounter: LineCounter;
	private bodies: BodyController | null = null;
	private svelteApp: Record<string, unknown> | null = null;

	private threads: Thread<CardNote>[] = [];
	/** Whether to group cards under day headings (a plugin setting). */
	private dayHeadings = true;
	private notes = new Map<string, CardNote>();
	private foldStore: FoldStore | null = null;
	private settingsStore: SettingsStore | null = null;
	private settings: ViewSettings = { ...DEFAULT_VIEW_SETTINGS };
	/** The Base file and view name the stores were loaded for. */
	private localKey: string | null = null;

	/** A reply that was just created, to scroll to once its card is rendered. */
	private pendingReveal: string | null = null;
	private scrollSeq = 0;
	private replyInFlight = false;

	private renderFrame: number | null = null;
	/** A data update arrived while a card's editor had focus; render it on blur. */
	private renderDeferred = false;

	constructor(
		controller: QueryController,
		private readonly containerEl: HTMLElement,
		private readonly plugin: FeedViewPlugin
	) {
		super(controller);
		this.rootEl = containerEl.createDiv({ cls: "feed-view-root" });
		this.lineCounter = new LineCounter(this.app);
	}

	onload() {
		this.plugin.views.add(this);
		this.containerEl.addClass("feed-view-container");
		this.applySettings(this.plugin.settings);

		const bodies = new BodyController(this.app, (path) => this.app.vault.getFileByPath(path), this.feed.mode);
		this.bodies = this.addChild(bodies);
		this.feed.liveAvailable = bodies.liveAvailable;
		if (!this.feed.liveAvailable) this.feed.mode = "reading";

		this.svelteApp = mount(Feed, {
			target: this.rootEl,
			props: { feed: this.feed, actions: this.actions },
		});

		this.register(this.plugin.replyIndex.onChange(() => this.scheduleRender()));
		this.registerEvent(
			this.app.vault.on("rename", (file, oldPath) => {
				if (!(file instanceof TFile) || !this.feed.folded.has(oldPath)) return;
				this.setFolded(renameFold(this.feed.folded, oldPath, file.path));
			})
		);
		this.registerDomEvent(this.rootEl, "focusout", () => {
			// let focus land first, then render what was held back while typing
			window.setTimeout(() => {
				if (this.renderDeferred && !this.bodies?.hasFocusedEditor()) this.scheduleRender();
			}, 0);
		});
		this.registerInterval(window.setInterval(() => this.updateRows(), HEADING_REFRESH_MS));

		this.scheduleRender();
	}

	onunload() {
		if (this.renderFrame !== null) window.cancelAnimationFrame(this.renderFrame);
		this.renderFrame = null;
		if (this.svelteApp) void unmount(this.svelteApp);
		this.svelteApp = null;
		this.rootEl.remove();
		this.containerEl.removeClass("feed-view-container");
		this.plugin.views.delete(this);
	}

	onDataUpdated(): void {
		this.scheduleRender();
	}

	private scheduleRender() {
		if (this.renderFrame !== null) return;
		this.renderFrame = window.requestAnimationFrame(() => {
			this.renderFrame = null;
			this.render();
		});
	}

	private render() {
		if (!this.svelteApp) return;
		// Hold updates while typing: an auto-save can change the Base's order
		// (e.g. sorted by modified time) and moving the card would drop focus.
		// A new reply waiting to appear is never held back.
		if (this.pendingReveal === null && this.bodies?.hasFocusedEditor()) {
			this.renderDeferred = true;
			return;
		}
		this.renderDeferred = false;

		const config = this.config;
		this.ensureLocalStores();
		const mode = this.feed.liveAvailable ? this.settings.mode : "reading";
		if (mode !== this.feed.mode) {
			this.feed.mode = mode;
			this.bodies?.setMode(mode);
		}

		const hasBaseSort = config.getSort().length > 0;
		const order = config.getOrder();

		const entries = (this.data?.data ?? []).filter((entry) => entry.file.extension === "md");
		const entryByPath = new Map<string, BasesEntry>(entries.map((entry) => [entry.file.path, entry]));
		const notes = entries.map((entry) => toCardNote(entry.file, entry));
		const replyIndex = this.plugin.replyIndex;

		this.threads = buildThreads<CardNote>({
			entries: notes,
			rootOf: (path) => replyIndex.rootOf(path),
			repliesOf: (rootPath) =>
				replyIndex.repliesOf(rootPath).flatMap((path) => {
					const file = this.app.vault.getFileByPath(path);
					return file ? [toCardNote(file, entryByPath.get(path) ?? null)] : [];
				}),
			hasBaseSort,
		});

		const cards = new Map<string, CardView>();
		this.notes = new Map();
		const displayName = (id: BasesPropertyId) => config.getDisplayName(id);
		for (const { root, replies } of this.threads) {
			for (const note of [root, ...replies]) {
				this.notes.set(note.path, note);
				cards.set(note.path, {
					path: note.path,
					title: note.title,
					createdMs: note.file.stat.ctime,
					properties: buildPropertyRows(this.app, note, order, displayName),
				});
			}
		}

		this.feed.cards = cards;
		this.feed.allPaths = allCardPaths(this.threads);
		this.refreshLineCounts();
		this.updateRows();
		this.feed.loaded = true;

		// a reply was just created: once its card exists, scroll to it (its editor focuses on mount)
		if (this.pendingReveal !== null && cards.has(this.pendingReveal)) {
			this.feed.scrollRequest = { key: cardRowKey(this.pendingReveal), seq: ++this.scrollSeq };
			this.pendingReveal = null;
		}
	}

	/** Rebuilds just the row list (after folding, a settings change, or at midnight). */
	private updateRows() {
		this.feed.rows = buildRows({
			threads: this.threads,
			folded: this.feed.folded,
			nowMs: Date.now(),
			headings: this.dayHeadings,
		});
	}

	/**
	 * Reply (R8): creates the reply note right away and focuses its editor in
	 * the thread, so you can start typing. The card appears once the reply
	 * index has picked up the new note.
	 */
	private async createReplyAndFocus(rootPath: string) {
		const parent = this.noteFile(rootPath);
		if (!parent || this.replyInFlight || !this.feed.replies) return;
		this.replyInFlight = true;
		try {
			// leave the card being typed in (its typing is saved); focus moves to the new reply
			const active = activeDocument.activeElement;
			if (active instanceof HTMLElement && this.rootEl.contains(active)) active.blur();
			if (this.feed.folded.has(rootPath)) this.setFolded(toggleFold(this.feed.folded, rootPath));
			const reply = await createReply(this.app, parent, "");
			if (this.feed.liveAvailable && this.bodies) {
				this.bodies.focusWhenMounted(reply.path);
				this.pendingReveal = reply.path;
				this.scheduleRender();
			} else {
				// no in-feed editor in this Obsidian version: edit the reply in a tab instead
				await this.app.workspace.getLeaf("tab").openFile(reply);
			}
		} catch (error) {
			console.error("[feed-view] Could not create reply", error);
			new Notice("Could not create the reply note.");
		} finally {
			this.replyInFlight = false;
		}
	}

	/** Applies the plugin-wide settings; called on load and whenever they change. */
	applySettings(settings: FeedViewSettings) {
		this.feed.fullWidth = settings.fullWidth;
		this.feed.replies = settings.replies;
		this.feed.showTime = settings.showTime;
		if (settings.dayHeadings !== this.dayHeadings) {
			this.dayHeadings = settings.dayHeadings;
			this.updateRows();
		}
	}

	/**
	 * Loads this view's fold state and settings from local storage. Both are
	 * keyed by the Base file and view name, so they reload when either changes.
	 */
	private ensureLocalStores() {
		const baseKey = findBaseKey(this.app, this.containerEl);
		const viewName = this.config.name;
		const key = `${baseKey}:${viewName}`;
		if (key === this.localKey) return;
		this.localKey = key;
		this.foldStore = new FoldStore(this.app, foldStorageKey(baseKey, viewName));
		this.feed.folded = pruneFolds(this.foldStore.load(), (path) => this.app.vault.getFileByPath(path) !== null);
		this.settingsStore = new SettingsStore(this.app, settingsStorageKey(baseKey, viewName));
		this.settings = this.settingsStore.load();
	}

	private updateSettings(change: Partial<ViewSettings>) {
		this.settings = { ...this.settings, ...change };
		this.settingsStore?.save(this.settings);
	}

	private setFolded(folded: ReadonlySet<string>) {
		this.feed.folded = folded;
		this.foldStore?.save(folded);
		this.updateRows();
	}

	private refreshLineCounts() {
		for (const path of this.feed.folded) {
			if (this.feed.cards.has(path)) this.actions.requestLineCount(path);
		}
	}

	private noteFile(path: string): TFile | null {
		return this.notes.get(path)?.file ?? this.app.vault.getFileByPath(path);
	}

	/**
	 * Deletes a note and every reply under it, so deleting a thread leaves no
	 * orphaned replies behind. Files go to the trash the user's "Deleted files"
	 * setting picks.
	 */
	private async deleteWithReplies(file: TFile) {
		const replies = this.plugin.replyIndex.repliesOf(file.path).flatMap((path) => {
			const reply = this.app.vault.getFileByPath(path);
			return reply ? [reply] : [];
		});
		if (replies.length === 0) {
			// Obsidian's own flow: asks first only if "Confirm file deletion" is on
			await this.app.fileManager.promptForDeletion(file);
			return;
		}

		const title = this.notes.get(file.path)?.title ?? file.basename;
		if (!(await confirmThreadDeletion(this.app, title, replies.length))) return;

		// deepest replies first and the note itself last, so nothing is briefly orphaned
		let failed = 0;
		for (const target of [...replies.reverse(), file]) {
			try {
				await this.app.fileManager.trashFile(target);
			} catch (error) {
				failed++;
				console.error(`[feed-view] Could not delete ${target.path}`, error);
			}
		}
		if (failed > 0) new Notice(`Could not delete ${failed === 1 ? "1 note" : `${failed} notes`} in the thread.`);
	}

	private showMenu(path: string, rootPath: string, anchorEl: HTMLElement) {
		const file = this.noteFile(path);
		if (!file) return;
		const menu = new Menu();
		if (this.feed.replies) {
			menu.addItem((item) =>
				item
					.setTitle("Reply")
					.setIcon("reply")
					.onClick(() => this.actions.reply(rootPath))
			);
			menu.addSeparator();
		}
		menu.addItem((item) =>
			item
				.setTitle("Read aloud")
				.setIcon("volume-2")
				.onClick(() => new Notice(NOT_IMPLEMENTED_MESSAGE))
		);
		menu.addSeparator();
		menu.addItem((item) =>
			item
				.setTitle("Delete")
				.setIcon("trash-2")
				.setWarning(true)
				.onClick(() => void this.deleteWithReplies(file))
		);
		menu.onHide(() => {
			if (this.feed.menuOpenFor === path) this.feed.menuOpenFor = null;
		});
		this.feed.menuOpenFor = path;
		const rect = anchorEl.getBoundingClientRect();
		menu.showAtPosition({ x: rect.right, y: rect.bottom + 6, left: true }, anchorEl.doc);
	}

	private readonly actions: FeedActions = {
		setMode: (mode) => {
			if (mode === "live" && !this.feed.liveAvailable) return;
			if (mode === this.feed.mode) return;
			this.feed.mode = mode;
			this.bodies?.setMode(mode);
			this.updateSettings({ mode });
		},
		toggleFold: (path) => this.setFolded(toggleFold(this.feed.folded, path)),
		toggleAll: () =>
			this.setFolded(setAllFolded(this.feed.folded, this.feed.allPaths, this.feed.anyExpanded)),
		openNote: (path, evt) => {
			void this.app.workspace.openLinkText(path, "", Keymap.isModEvent(evt));
		},
		hoverNote: (path, evt, targetEl) => {
			this.app.workspace.trigger("hover-link", {
				event: evt,
				source: FEED_VIEW_TYPE,
				hoverParent: this,
				targetEl,
				linktext: path,
			});
		},
		openMenu: (path, rootPath, anchorEl) => this.showMenu(path, rootPath, anchorEl),
		showNoteMenu: (path, evt) => {
			// Obsidian adds the Open items, then fires "file-menu" so core and
			// community plugins fill in the rest, as for any internal link
			const menu = new Menu();
			if (this.app.workspace.handleLinkContextMenu(menu, path, "")) menu.showAtMouseEvent(evt);
		},
		reply: (rootPath) => void this.createReplyAndFocus(rootPath),
		toggleCheckbox: (path, id, checked) => {
			const file = this.noteFile(path);
			if (file) void setCheckbox(this.app, file, id, checked);
		},
		renderValue: (el: HTMLElement, value: Value | string) => {
			el.empty();
			if (typeof value === "string") el.setText(value);
			else value.renderTo(el, this.app.renderContext);
		},
		registerBody: (path, el) => this.bodies?.attach(path, el),
		releaseBody: (el) => this.bodies?.detach(el),
		requestLineCount: (path) => {
			const file = this.noteFile(path);
			if (!file) return;
			const cached = this.lineCounter.peek(file);
			if (cached !== null) {
				if (this.feed.lineCounts.get(path) !== cached) this.setLineCount(path, cached);
				return;
			}
			void this.lineCounter.count(file).then((count) => this.setLineCount(path, count));
		},
	};

	private setLineCount(path: string, count: number) {
		const next = new Map(this.feed.lineCounts);
		next.set(path, count);
		this.feed.lineCounts = next;
	}
}
