/**
 * UNDOCUMENTED OBSIDIAN INTERNALS (global search).
 *
 * Clicking a tag in Obsidian opens the core Search plugin with `tag:#name`.
 * There's no public API for that, so this calls the same
 * `openGlobalSearch` that Obsidian's own Reading view and editor call.
 * Checked against Obsidian 1.15.1.
 */
import type { App } from "obsidian";

interface InternalApp {
	internalPlugins?: {
		getEnabledPluginById?: (id: string) => { openGlobalSearch?: (query: string) => void } | null;
	};
}

/**
 * Opens Search for a tag, as clicking a tag anywhere in Obsidian does. Does
 * nothing if the Search core plugin is off or this Obsidian version has changed it.
 */
export function openTagSearch(app: App, tag: string) {
	const search = (app as unknown as InternalApp).internalPlugins?.getEnabledPluginById?.("global-search");
	if (typeof search?.openGlobalSearch !== "function") return;
	search.openGlobalSearch(`tag:${tag.startsWith("#") ? tag : `#${tag}`}`);
}
