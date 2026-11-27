import { FileView, type App, type WorkspaceLeaf } from "obsidian";
import { deserializeFolds, serializeFolds } from "../model/folds";

/**
 * Fold state is remembered per note, per view, on this device only (R5).
 * It lives in the vault's localStorage, so folding never writes to the .base
 * file or syncs.
 */
export class FoldStore {
	constructor(
		private readonly app: App,
		private readonly key: string
	) {}

	load(): Set<string> {
		return deserializeFolds(this.app.loadLocalStorage(this.key));
	}

	save(folded: ReadonlySet<string>) {
		this.app.saveLocalStorage(this.key, folded.size > 0 ? serializeFolds(folded) : null);
	}
}

export function foldStorageKey(baseKey: string, viewName: string): string {
	return `feed-view:folds:v1:${baseKey}:${viewName}`;
}

/**
 * Identifies the Base a feed belongs to. There's no public API for this, so
 * it looks for the open view whose element contains the feed: a .base file
 * gives its own path; a Base embedded in a note gives `<note path>#embed`.
 */
export function findBaseKey(app: App, el: HTMLElement): string {
	const view = findLeafContaining(app, el)?.view;
	const file = view instanceof FileView ? view.file : null;
	if (!file) return "unknown";
	return file.extension === "base" ? file.path : `${file.path}#embed`;
}

/** The workspace tab whose view contains `el`, if any (not hover popovers). */
export function findLeafContaining(app: App, el: HTMLElement): WorkspaceLeaf | null {
	let found: WorkspaceLeaf | null = null;
	app.workspace.iterateAllLeaves((leaf) => {
		if (found === null && leaf.view.containerEl.contains(el)) found = leaf;
	});
	return found;
}
