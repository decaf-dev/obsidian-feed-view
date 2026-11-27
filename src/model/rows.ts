import { dayKey, dayLabel } from "./dates";
import type { FeedRow, Thread } from "./types";

export interface BuildRowsInput {
	threads: Thread[];
	/** Paths of folded cards. A folded root hides its replies (R5). */
	folded: ReadonlySet<string>;
	nowMs: number;
	/** Insert day headings where the day changes. Defaults to true. */
	headings?: boolean;
}

/**
 * Flattens threads into the rows the virtual list renders: a day heading
 * wherever the day changes (R9), then each card followed by its replies.
 * Replies never start a heading of their own.
 *
 * Keys are stable across updates so rows keep their DOM and measured height.
 */
export function buildRows({ threads, folded, nowMs, headings = true }: BuildRowsInput): FeedRow[] {
	const rows: FeedRow[] = [];
	let lastDay: string | null = null;
	let headingCount = 0;

	for (const { root, replies } of threads) {
		const day = dayKey(root.dateMs);
		const newDay = headings && day !== lastDay;
		if (newDay) {
			// the same day can come up again under a non-date sort, so the key also carries the position
			rows.push({
				kind: "heading",
				key: `h:${day}:${headingCount}`,
				label: dayLabel(root.dateMs, nowMs),
				first: headingCount === 0,
			});
			headingCount++;
			lastDay = day;
		}

		rows.push({
			kind: "card",
			key: cardRowKey(root.path),
			path: root.path,
			rootPath: root.path,
			depth: 0,
			afterHeading: newDay,
		});

		if (folded.has(root.path)) continue;

		for (const reply of replies) {
			rows.push({
				kind: "card",
				key: cardRowKey(reply.path),
				path: reply.path,
				rootPath: root.path,
				depth: 1,
				afterHeading: false,
			});
		}
	}

	return rows;
}

/** The row key of a note's card. */
export function cardRowKey(path: string): string {
	return `c:${path}`;
}
