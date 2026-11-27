<script lang="ts">
	import { icon, renderValue } from "./actions";
	import type { CardView, FeedActions } from "./feedState.svelte";

	let { card, actions }: { card: CardView; actions: FeedActions } = $props();

	const render = (el: HTMLElement, value: Parameters<FeedActions["renderValue"]>[1]) =>
		actions.renderValue(el, value);
</script>

<!-- R10: the properties enabled in the Base's Properties menu, styled like Obsidian's -->
<div class="feed-view-properties">
	{#each card.properties as prop (prop.id)}
		<div class="feed-view-property" data-property={prop.id}>
			<span class="feed-view-property-icon" use:icon={prop.icon}></span>
			<span class="feed-view-property-name">{prop.name}</span>
			<div class="feed-view-property-value">
				{#if prop.kind === "checkbox"}
					<input
						type="checkbox"
						class="feed-view-checkbox"
						checked={prop.checked}
						disabled={!prop.editable}
						aria-label={prop.name}
						onchange={(evt) => actions.toggleCheckbox(card.path, prop.id, evt.currentTarget.checked)}
					/>
				{:else if prop.kind === "list"}
					<div class="feed-view-pills">
						{#each prop.items as item, i (i)}
							<span
								class="feed-view-pill"
								use:renderValue={{ value: item, signature: `${prop.signature}:${i}`, render }}
							></span>
						{/each}
					</div>
				{:else if prop.value !== null}
					<span
						class="feed-view-property-text"
						use:renderValue={{ value: prop.value, signature: prop.signature, render }}
					></span>
				{/if}
			</div>
		</div>
	{/each}
</div>
