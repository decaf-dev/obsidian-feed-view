import { Plugin, type WorkspaceLeaf } from "obsidian";
import { FEED_VIEW_TYPE } from "./constants";
import { FeedBasesView } from "./obsidian/FeedBasesView";
import { findLeafContaining } from "./obsidian/foldStore";
import { rebuildLeaf, rebuildRememberedLeaves, rememberLeavesToRebuild } from "./obsidian/internal/workspace";
import { ReplyIndex } from "./obsidian/ReplyIndex";
import { feedViewOptions } from "./obsidian/viewOptions";
import "./styles.css";

export default class FeedViewPlugin extends Plugin {
	/** Vault-wide index of reply notes, shared by every open feed. */
	replyIndex!: ReplyIndex;
	/** Every feed currently open, so they can be torn down when the plugin unloads. */
	readonly views = new Set<FeedBasesView>();

	onload() {
		this.replyIndex = this.addChild(new ReplyIndex(this.app));

		// lets Obsidian's Page preview show notes when hovering card titles
		this.registerHoverLinkSource(FEED_VIEW_TYPE, { display: "Feed View", defaultMod: true });

		const registered = this.registerBasesView(FEED_VIEW_TYPE, {
			name: "Feed",
			icon: "lucide-newspaper",
			factory: (controller, containerEl) => new FeedBasesView(controller, containerEl, this),
			options: feedViewOptions,
		});
		if (!registered) {
			console.warn("[feed-view] Bases is turned off in this vault, so the Feed layout isn't available.");
			return;
		}

		// after a reload or re-enable, bring back the feeds the last unload took down
		this.app.workspace.onLayoutReady(() => rebuildRememberedLeaves(this.app));
	}

	onunload() {
		// Bases would otherwise keep these feeds running after the plugin is
		// disabled or reloaded. Rebuilding their tabs unloads them (saving any
		// typing first); Bases then shows "Unknown view type" until the plugin
		// loads again and rebuilds the same tabs (see onload).
		const byLeaf = new Map<WorkspaceLeaf, FeedBasesView[]>();
		for (const view of this.views) {
			const leaf = findLeafContaining(this.app, view.hostEl);
			if (!leaf) {
				view.unload();
				continue;
			}
			byLeaf.set(leaf, [...(byLeaf.get(leaf) ?? []), view]);
		}
		this.views.clear();
		if (byLeaf.size === 0) return;

		for (const [leaf, views] of byLeaf) {
			if (!rebuildLeaf(leaf)) for (const view of views) view.unload();
		}
		rememberLeavesToRebuild(this.app, byLeaf.keys());
	}
}
