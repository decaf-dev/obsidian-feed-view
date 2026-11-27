/**
 * UNDOCUMENTED OBSIDIAN INTERNALS (workspace).
 *
 * Bases keeps a view instance alive after the plugin that created it is
 * disabled or reloaded, so an open feed would keep running old code. And once
 * a tab shows "Unknown view type", Bases doesn't recover when the plugin is
 * turned back on. `WorkspaceLeaf.rebuildView()` and `WorkspaceLeaf.id` (not in
 * the public API) let the plugin recreate those tabs. Checked against
 * Obsidian 1.15.1.
 */
import type { App, WorkspaceLeaf } from "obsidian";

interface InternalLeaf {
	id?: unknown;
	rebuildView?: () => Promise<void> | void;
}

/** Tabs that held a feed when the plugin last unloaded, rebuilt when it loads again. */
const REBUILD_KEY = "feed-view:rebuild-leaves";

/** Recreates the leaf's view. Returns false when this Obsidian version can't. */
export function rebuildLeaf(leaf: WorkspaceLeaf): boolean {
	const rebuild = (leaf as unknown as InternalLeaf).rebuildView;
	if (typeof rebuild !== "function") return false;
	try {
		void Promise.resolve(rebuild.call(leaf)).catch((error) =>
			console.error("[feed-view] Could not refresh a tab", error)
		);
		return true;
	} catch (error) {
		console.error("[feed-view] Could not refresh a tab", error);
		return false;
	}
}

/** Remembers tabs to rebuild the next time the plugin loads (a reload or re-enable). */
export function rememberLeavesToRebuild(app: App, leaves: Iterable<WorkspaceLeaf>) {
	const ids: string[] = [];
	for (const leaf of leaves) {
		const id = (leaf as unknown as InternalLeaf).id;
		if (typeof id === "string") ids.push(id);
	}
	app.saveLocalStorage(REBUILD_KEY, ids.length > 0 ? ids : null);
}

/** Rebuilds the remembered tabs that still show a Base, so their feeds come back. */
export function rebuildRememberedLeaves(app: App) {
	const saved: unknown = app.loadLocalStorage(REBUILD_KEY);
	app.saveLocalStorage(REBUILD_KEY, null);
	if (!Array.isArray(saved)) return;
	for (const id of saved) {
		if (typeof id !== "string") continue;
		const leaf = app.workspace.getLeafById(id);
		if (leaf && showsABase(leaf)) rebuildLeaf(leaf);
	}
}

function showsABase(leaf: WorkspaceLeaf): boolean {
	return leaf.view.getViewType() === "bases" || leaf.view.containerEl.querySelector(".bases-embed") !== null;
}
