<script lang="ts">
	import { hiddenLinesLabel } from "../model/lines";
	import type { CardRow } from "../model/types";
	import { icon } from "./actions";
	import CardBody from "./CardBody.svelte";
	import type { CardView, FeedActions, FeedState } from "./feedState.svelte";
	import PropertyList from "./PropertyList.svelte";

	let { row, card, feed, actions }: { row: CardRow; card: CardView; feed: FeedState; actions: FeedActions } =
		$props();

	const isReply = $derived(row.depth === 1);
	const folded = $derived(feed.folded.has(card.path));
	const menuOpen = $derived(feed.menuOpenFor === card.path);
	const hiddenLines = $derived(feed.lineCounts.get(card.path));

	$effect(() => {
		if (folded) actions.requestLineCount(card.path);
	});

	function onTitleClick(evt: MouseEvent) {
		evt.preventDefault();
		actions.openNote(card.path, evt);
	}

	function onTitleAuxClick(evt: MouseEvent) {
		if (evt.button !== 1) return;
		evt.preventDefault();
		actions.openNote(card.path, evt);
	}
</script>

<div class="feed-view-row feed-view-card-row" class:is-reply={isReply} class:is-after-heading={row.afterHeading}>
	<div class="feed-view-column feed-view-thread-column">
		{#if isReply}
			<div class="feed-view-indent" aria-hidden="true"><div class="feed-view-connector"></div></div>
		{/if}
		<article
			class="feed-view-card"
			class:is-reply={isReply}
			class:is-folded={folded}
			class:is-menu-open={menuOpen}
			data-path={card.path}
		>
			<div class="feed-view-card-header">
				<button
					type="button"
					class="feed-view-chevron clickable-icon"
					aria-label={folded ? "Expand" : "Collapse"}
					aria-expanded={!folded}
					onclick={() => actions.toggleFold(card.path)}
					use:icon={"chevron-down"}
				></button>
				<h2 class="feed-view-card-title">
					<!-- hovering shows Obsidian's page preview; keyboard users open the note with Enter instead -->
					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<a
						class="feed-view-title-link"
						href={card.path}
						data-href={card.path}
						onclick={onTitleClick}
						onauxclick={onTitleAuxClick}
						onmouseover={(evt) => actions.hoverNote(card.path, evt, evt.currentTarget)}>{card.title}</a
					>
				</h2>
				{#if folded && hiddenLines !== undefined}
					<span class="feed-view-hidden-lines">{hiddenLinesLabel(hiddenLines)}</span>
				{/if}
				<button
					type="button"
					class="feed-view-more clickable-icon"
					aria-label="More options"
					aria-haspopup="menu"
					aria-expanded={menuOpen}
					onclick={(evt) => actions.openMenu(card.path, row.rootPath, evt.currentTarget)}
					use:icon={"ellipsis"}
				></button>
			</div>
			{#if !folded}
				<div class="feed-view-card-content">
					{#if card.properties.length > 0}
						<PropertyList {card} {actions} />
					{/if}
					<CardBody path={card.path} {actions} />
					<div class="feed-view-card-actions">
						<button type="button" class="feed-view-reply-button" onclick={() => actions.reply(row.rootPath)}>
							<span class="feed-view-icon" use:icon={"reply"}></span>Reply
						</button>
					</div>
				</div>
			{/if}
		</article>
	</div>
</div>
