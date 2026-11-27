<script lang="ts">
	import { icon } from "./actions";
	import type { FeedActions, FeedState } from "./feedState.svelte";

	let { feed, actions }: { feed: FeedState; actions: FeedActions } = $props();

	const live = $derived(feed.mode === "live");
	// Like Obsidian's own view header: the icon shows the mode a click switches to.
	const modeLabel = $derived(
		live
			? "Current view: Live preview\nClick to read"
			: feed.liveAvailable
				? "Current view: Reading\nClick to edit"
				: "Live preview isn't available in this version of Obsidian",
	);
</script>

<!-- R4, R6: the feed's own controls, above the first card (not in the Base toolbar) -->
<div class="feed-view-bar">
	<div class="feed-view-bar-actions">
		<button
			type="button"
			class="feed-view-bar-button feed-view-mode-button"
			disabled={!live && !feed.liveAvailable}
			aria-label={modeLabel}
			onclick={() => actions.setMode(live ? "reading" : "live")}
		>
			<span class="feed-view-icon" use:icon={live ? "book-open" : "pencil"}></span>
		</button>
		<button
			type="button"
			class="feed-view-bar-button"
			disabled={feed.allPaths.length === 0}
			aria-label={feed.anyExpanded ? "Collapse all" : "Expand all"}
			onclick={() => actions.toggleAll()}
		>
			<span class="feed-view-icon" use:icon={feed.anyExpanded ? "chevrons-down-up" : "chevrons-up-down"}></span>
		</button>
	</div>
</div>
