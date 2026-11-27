<script lang="ts">
	import SvelteVirtualList from "@humanspeak/svelte-virtual-list";
	import { ESTIMATED_ROW_HEIGHT, VIRTUAL_BUFFER_SIZE } from "../constants";
	import type { FeedRow } from "../model/types";
	import DayHeading from "./DayHeading.svelte";
	import FeedBar from "./FeedBar.svelte";
	import type { FeedActions, FeedState } from "./feedState.svelte";
	import NoteCard from "./NoteCard.svelte";

	let { feed, actions }: { feed: FeedState; actions: FeedActions } = $props();

	const rowKey = (row: FeedRow) => row.key;

	let list: SvelteVirtualList<FeedRow> | undefined = $state();

	// viewportLabel is left empty: Obsidian shows every aria-label as a hover
	// tooltip, so a label on the scroll area would pop up over the whole feed.

	// Bring a requested row (e.g. a reply that was just created) into view.
	$effect(() => {
		const request = feed.scrollRequest;
		if (!request || !list) return;
		const index = feed.rows.findIndex((row) => row.key === request.key);
		if (index < 0) return;
		void list.scroll({ index, smoothScroll: true, align: "nearest", shouldThrowOnBounds: false });
	});
</script>

<div class="feed-view" class:is-full-width={feed.fullWidth}>
	<SvelteVirtualList
		bind:this={list}
		items={feed.rows}
		itemKey={rowKey}
		bufferSize={VIRTUAL_BUFFER_SIZE}
		defaultEstimatedItemHeight={ESTIMATED_ROW_HEIGHT}
		containerClass="feed-view-list"
		viewportClass="feed-view-viewport"
		contentClass="feed-view-content"
		itemsClass="feed-view-items"
		viewportLabel=""
	>
		{#snippet header()}
			<div class="feed-view-row feed-view-bar-row">
				<div class="feed-view-column">
					<FeedBar {feed} {actions} />
				</div>
			</div>
			{#if feed.loaded && feed.rows.length === 0}
				<div class="feed-view-row">
					<div class="feed-view-column feed-view-empty">No notes to show.</div>
				</div>
			{/if}
		{/snippet}

		{#snippet footer()}
			<div class="feed-view-footer"></div>
		{/snippet}

		{#snippet renderItem(row: FeedRow)}
			{#if row.kind === "heading"}
				<DayHeading {row} />
			{:else}
				{@const card = feed.cards.get(row.path)}
				{#if card}
					<NoteCard {row} {card} {feed} {actions} />
				{/if}
			{/if}
		{/snippet}
	</SvelteVirtualList>
</div>
