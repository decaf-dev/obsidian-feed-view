import { Component, Notice, type App, type HoverParent, type TFile } from "obsidian";
import type { FeedMode } from "../../constants";
import { isEmbeddedEditorAvailable, mountEmbeddedEditor, type EmbeddedEditor } from "../internal/embeddedEditor";
import { ReadingBody } from "./ReadingBody";

interface BodySlot {
	path: string;
	hostEl: HTMLElement;
	/** What's mounted now; null while queued */
	mounted: { kind: "live"; editor: EmbeddedEditor } | { kind: "reading"; body: ReadingBody } | null;
	/** Bumped whenever the slot is remounted or released, to cancel stale async mounts. */
	generation: number;
}

/**
 * Mounts card bodies (R3, R4). The virtual list only renders rows near the
 * viewport (R13), so a body is attached when its card row mounts and
 * detached when the row unmounts. Mounting is queued and done one card per
 * animation frame, so scrolling fast doesn't build dozens of editors at once.
 */
export class BodyController extends Component {
	private slots = new Map<HTMLElement, BodySlot>();
	private queue: BodySlot[] = [];
	private frame: number | null = null;
	private mode: FeedMode;
	private warnedFallback = false;
	private alive = false;
	/** A note whose editor should take focus as soon as its card mounts (a new reply). */
	private focusPath: string | null = null;
	readonly liveAvailable: boolean;

	constructor(
		private readonly app: App,
		private readonly resolveFile: (path: string) => TFile | null,
		mode: FeedMode,
		/** Where hover previews of links in Reading mode cards open from. */
		private readonly hoverParent: HoverParent
	) {
		super();
		this.mode = mode;
		this.liveAvailable = isEmbeddedEditorAvailable(app);
	}

	onload() {
		this.alive = true;
		this.schedule();
	}

	onunload() {
		this.alive = false;
		if (this.frame !== null) window.cancelAnimationFrame(this.frame);
		this.frame = null;
		this.queue = [];
		// child components (editors, reading bodies) unload with this one and save first
		this.slots.clear();
	}

	attach(path: string, hostEl: HTMLElement) {
		const slot: BodySlot = { path, hostEl, mounted: null, generation: 0 };
		this.slots.set(hostEl, slot);
		if (path === this.focusPath) {
			// mount the card waiting for focus ahead of everything else
			this.queue.unshift(slot);
			this.schedule();
		} else {
			this.enqueue(slot);
		}
	}

	/**
	 * Focuses the note's editor, with the cursor at the end, once its card
	 * mounts. The card gets a live editor even in Reading mode, so a new reply
	 * can be typed straight away.
	 */
	focusWhenMounted(path: string) {
		this.focusPath = path;
		for (const slot of this.slots.values()) {
			if (slot.path !== path) continue;
			// already on screen (unlikely for a brand-new note): remount it focused
			slot.generation++;
			void this.unmount(slot).then(() => {
				this.queue = [slot, ...this.queue.filter((s) => s !== slot)];
				this.schedule();
			});
		}
	}

	detach(hostEl: HTMLElement) {
		const slot = this.slots.get(hostEl);
		if (!slot) return;
		this.slots.delete(hostEl);
		this.queue = this.queue.filter((s) => s !== slot);
		slot.generation++;
		void this.unmount(slot);
	}

	/** Switches every mounted body between Live preview and Reading. */
	setMode(mode: FeedMode) {
		if (mode === this.mode) return;
		this.mode = mode;
		for (const slot of this.slots.values()) {
			slot.generation++;
			void this.unmount(slot).then(() => this.enqueue(slot));
		}
	}

	/** True while a card's editor has keyboard focus. */
	hasFocusedEditor(): boolean {
		for (const slot of this.slots.values()) {
			if (slot.mounted?.kind === "live" && slot.mounted.editor.hasFocus()) return true;
		}
		return false;
	}

	private enqueue(slot: BodySlot) {
		if (!this.queue.includes(slot)) this.queue.push(slot);
		this.schedule();
	}

	private schedule() {
		if (this.frame !== null || this.queue.length === 0 || !this.alive) return;
		this.frame = window.requestAnimationFrame(() => {
			this.frame = null;
			const slot = this.queue.shift();
			if (!slot) return;
			void this.mount(slot).finally(() => this.schedule());
		});
	}

	private async mount(slot: BodySlot) {
		if (!this.slots.has(slot.hostEl) || slot.mounted) return;
		const file = this.resolveFile(slot.path);
		if (!file) return;
		const generation = slot.generation;
		const focus = slot.path === this.focusPath;

		if ((this.mode === "live" || focus) && this.liveAvailable) {
			const editor = await mountEmbeddedEditor(this.app, file, slot.hostEl, this, { focus });
			if (editor) {
				if (generation !== slot.generation || !this.slots.has(slot.hostEl)) {
					await editor.destroy();
					return;
				}
				slot.mounted = { kind: "live", editor };
				if (focus) this.focusPath = null;
				return;
			}
			this.warnFallback();
		}

		if (generation !== slot.generation || !this.slots.has(slot.hostEl)) return;
		const body = new ReadingBody(this.app, file, slot.hostEl, this.hoverParent);
		this.addChild(body);
		slot.mounted = { kind: "reading", body };
	}

	private async unmount(slot: BodySlot) {
		const mounted = slot.mounted;
		slot.mounted = null;
		if (!mounted) return;
		if (mounted.kind === "live") await mounted.editor.destroy();
		else this.removeChild(mounted.body);
	}

	private warnFallback() {
		if (this.warnedFallback) return;
		this.warnedFallback = true;
		new Notice("Couldn't open the note editor in this version of Obsidian, so notes are shown read-only.");
	}
}
