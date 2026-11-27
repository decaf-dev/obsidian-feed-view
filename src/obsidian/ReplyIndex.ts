import { Component, TFile, debounce, getLinkpath, type App } from "obsidian";
import { REPLY_KEY } from "../constants";
import { parseWikilink } from "../model/links";

/**
 * A vault-wide index of reply notes: every note whose frontmatter has
 * `reply: "[[Parent]]"`, mapped to the note it replies to.
 *
 * Replies are looked up here rather than in the Base results, so a reply
 * shows under its parent even when the Base's filters exclude the reply.
 * Because Bases won't re-run a view when a note outside its results changes,
 * the index tells the open feeds to re-render itself.
 */
export class ReplyIndex extends Component {
	/** child path → the path of the note it replies to */
	private parentOf = new Map<string, string>();
	/** parent path → paths of its direct replies */
	private childrenOf = new Map<string, Set<string>>();
	/** child path → a `reply` link that doesn't resolve yet */
	private pending = new Map<string, string>();
	private listeners = new Set<() => void>();
	private ready = false;

	private readonly notify = debounce(() => this.notifyNow(), 100, true);

	constructor(private readonly app: App) {
		super();
	}

	onload() {
		this.app.workspace.onLayoutReady(() => {
			for (const file of this.app.vault.getMarkdownFiles()) this.update(file);
			this.ready = true;
			this.notifyNow();
		});

		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				if (this.ready && this.update(file)) this.notify();
			})
		);
		this.registerEvent(
			this.app.metadataCache.on("resolved", () => {
				if (this.ready && this.retryPending()) this.notify();
			})
		);
		this.registerEvent(
			this.app.vault.on("delete", (file) => {
				if (file instanceof TFile && this.remove(file.path)) this.notify();
			})
		);
		this.registerEvent(
			this.app.vault.on("rename", (file, oldPath) => {
				if (!(file instanceof TFile)) return;
				this.rename(oldPath, file.path);
				this.notify();
			})
		);
	}

	onunload() {
		this.notify.cancel();
		this.listeners.clear();
	}

	/** Calls `listener` whenever replies change. Returns a function that unsubscribes. */
	onChange(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	/**
	 * The top note of the thread `path` belongs to, or null when `path` isn't
	 * a reply. Threads are one level deep, so a reply to a reply belongs to
	 * the original note's thread.
	 */
	rootOf(path: string): string | null {
		let current = this.parentOf.get(path);
		if (current === undefined) return null;
		const seen = new Set([path]);
		for (;;) {
			const next = this.parentOf.get(current);
			if (next === undefined || seen.has(next)) return current;
			seen.add(current);
			current = next;
		}
	}

	/** Every reply in the thread under `rootPath`, including replies to replies. */
	repliesOf(rootPath: string): string[] {
		const out: string[] = [];
		const seen = new Set([rootPath]);
		const queue = [rootPath];
		while (queue.length > 0) {
			const parent = queue.shift() as string;
			for (const child of this.childrenOf.get(parent) ?? []) {
				if (seen.has(child)) continue;
				seen.add(child);
				out.push(child);
				queue.push(child);
			}
		}
		return out;
	}

	private notifyNow() {
		for (const listener of this.listeners) listener();
	}

	/** Re-reads one note's `reply` property. Returns true when the index changed. */
	private update(file: TFile): boolean {
		if (file.extension !== "md") return false;
		const target = this.resolveTarget(file);
		const previous = this.parentOf.get(file.path);
		if (previous === target) return false;
		if (previous !== undefined) this.unlink(file.path, previous);
		if (target !== undefined) this.link(file.path, target);
		return true;
	}

	/** The path the note's `reply` property links to, if it resolves to another note. */
	private resolveTarget(file: TFile): string | undefined {
		this.pending.delete(file.path);
		const cache = this.app.metadataCache.getFileCache(file);
		const frontmatter: unknown = cache?.frontmatter;
		if (!frontmatter || typeof frontmatter !== "object" || !(REPLY_KEY in frontmatter)) return undefined;

		const fromCache = cache?.frontmatterLinks?.find(
			(l) => l.key === REPLY_KEY || l.key.startsWith(`${REPLY_KEY}.`)
		)?.link;
		const linktext = fromCache ?? parseWikilink((frontmatter as Record<string, unknown>)[REPLY_KEY]);
		if (!linktext) return undefined;

		const dest = this.app.metadataCache.getFirstLinkpathDest(getLinkpath(linktext), file.path);
		if (!dest) {
			this.pending.set(file.path, linktext);
			return undefined;
		}
		return dest.path === file.path ? undefined : dest.path;
	}

	private retryPending(): boolean {
		let changed = false;
		for (const path of [...this.pending.keys()]) {
			const file = this.app.vault.getFileByPath(path);
			if (!file) this.pending.delete(path);
			else if (this.update(file)) changed = true;
		}
		return changed;
	}

	private link(child: string, parent: string) {
		this.parentOf.set(child, parent);
		let set = this.childrenOf.get(parent);
		if (!set) this.childrenOf.set(parent, (set = new Set()));
		set.add(child);
	}

	private unlink(child: string, parent: string) {
		this.parentOf.delete(child);
		const set = this.childrenOf.get(parent);
		set?.delete(child);
		if (set?.size === 0) this.childrenOf.delete(parent);
	}

	private remove(path: string): boolean {
		let changed = this.pending.delete(path);
		const parent = this.parentOf.get(path);
		if (parent !== undefined) {
			this.unlink(path, parent);
			changed = true;
		}
		// replies to a deleted note stay indexed: they reappear if a note with that name comes back
		if (this.childrenOf.has(path)) changed = true;
		return changed;
	}

	private rename(oldPath: string, newPath: string) {
		const parent = this.parentOf.get(oldPath);
		if (parent !== undefined) {
			this.unlink(oldPath, parent);
			this.link(newPath, parent);
		}
		const children = this.childrenOf.get(oldPath);
		if (children) {
			this.childrenOf.delete(oldPath);
			this.childrenOf.set(newPath, children);
			for (const child of children) this.parentOf.set(child, newPath);
		}
		const pendingLink = this.pending.get(oldPath);
		if (pendingLink !== undefined) {
			this.pending.delete(oldPath);
			this.pending.set(newPath, pendingLink);
		}
	}
}
