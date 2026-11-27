import { orderReplies, orderTopLevel } from "./ordering";
import type { FeedNote, Thread } from "./types";

export interface BuildThreadsInput<T extends FeedNote> {
	/** The notes the Base returned, in the Base's order. */
	entries: T[];
	/**
	 * The thread root a note replies to, or null when it isn't a reply.
	 * Replies are never shown as top-level cards, even when the Base returns them.
	 */
	rootOf: (path: string) => string | null;
	/** All replies to a root, from anywhere in the vault (not only the Base results). */
	repliesOf: (rootPath: string) => T[];
	/** Whether the Base has a sort configured. */
	hasBaseSort: boolean;
}

/**
 * Groups the Base's notes into threads (R8): each top-level note followed by
 * its replies. A reply whose root isn't a top-level note in the results is
 * hidden, so filtering out a note also hides its thread.
 */
export function buildThreads<T extends FeedNote>(input: BuildThreadsInput<T>): Thread<T>[] {
	const topLevel: T[] = [];
	const seen = new Set<string>();
	for (const note of input.entries) {
		if (seen.has(note.path)) continue;
		seen.add(note.path);
		if (input.rootOf(note.path) === null) topLevel.push(note);
	}

	return orderTopLevel(topLevel, input.hasBaseSort).map((root) => {
		const replies = input
			.repliesOf(root.path)
			.filter((reply) => reply.path !== root.path);
		return { root, replies: orderReplies(dedupe(replies)) };
	});
}

function dedupe<T extends FeedNote>(notes: T[]): T[] {
	const seen = new Set<string>();
	return notes.filter((n) => (seen.has(n.path) ? false : (seen.add(n.path), true)));
}

/** Every card path in the feed, replies included (used by Collapse all / Expand all). */
export function allCardPaths(threads: Thread[]): string[] {
	const paths: string[] = [];
	for (const t of threads) {
		paths.push(t.root.path);
		for (const r of t.replies) paths.push(r.path);
	}
	return paths;
}
