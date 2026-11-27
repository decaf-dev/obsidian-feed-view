<script lang="ts">
	import { onMount, untrack } from "svelte";
	import type { FeedActions } from "./feedState.svelte";

	let { path, actions }: { path: string; actions: FeedActions } = $props();

	let host: HTMLDivElement;

	// The editor or reading renderer is mounted by hand into `host`, once per
	// card row. It must not remount when the card's data object changes, so
	// `path` is read untracked here; a different note is a different row key.
	onMount(() => {
		const notePath = untrack(() => path);
		actions.registerBody(notePath, host);
		return () => actions.releaseBody(host);
	});
</script>

<div class="feed-view-body" bind:this={host}></div>
