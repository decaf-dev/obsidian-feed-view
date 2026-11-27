<script lang="ts">
	import { icon } from "./actions";
	import type { FeedActions, FeedState } from "./feedState.svelte";

	let { feed, actions }: { feed: FeedState; actions: FeedActions } = $props();

	const full = $derived(feed.width === "full");
	const live = $derived(feed.mode === "live");
</script>

<!-- R4, R6, R7: the feed's own controls, above the first card (not in the Base toolbar) -->
<div class="feed-view-bar">
	<div class="feed-view-segmented" role="group" aria-label="Note mode">
		<button
			type="button"
			class="feed-view-segment"
			class:is-active={live}
			aria-pressed={live}
			disabled={!feed.liveAvailable}
			aria-label={feed.liveAvailable ? undefined : "Live preview isn't available in this version of Obsidian"}
			onclick={() => actions.setMode("live")}
		>
			<span class="feed-view-icon" use:icon={"pen-line"}></span>Live preview
		</button>
		<button
			type="button"
			class="feed-view-segment"
			class:is-active={!live}
			aria-pressed={!live}
			onclick={() => actions.setMode("reading")}
		>
			<span class="feed-view-icon" use:icon={"book-open"}></span>Reading
		</button>
	</div>
	<div class="feed-view-bar-actions">
		<button type="button" class="feed-view-bar-button" aria-pressed={full} onclick={() => actions.toggleWidth()}>
			<span class="feed-view-icon" use:icon={full ? "fold-horizontal" : "move-horizontal"}></span>
			{full ? "Fixed width" : "Full width"}
		</button>
		<button
			type="button"
			class="feed-view-bar-button"
			disabled={feed.allPaths.length === 0}
			onclick={() => actions.toggleAll()}
		>
			<span class="feed-view-icon" use:icon={feed.anyExpanded ? "chevrons-down-up" : "chevrons-up-down"}></span>
			{feed.anyExpanded ? "Collapse all" : "Expand all"}
		</button>
	</div>
</div>
