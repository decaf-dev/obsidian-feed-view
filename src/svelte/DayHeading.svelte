<script lang="ts">
	import type { HeadingRow } from "../model/types";

	let { row }: { row: HeadingRow } = $props();
</script>

<div class="feed-view-row feed-view-heading-row" class:is-first={row.first}>
	<div class="feed-view-column">
		<h3 class="feed-view-day-heading">{row.label}</h3>
	</div>
</div>
