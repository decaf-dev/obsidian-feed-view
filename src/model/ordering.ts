import type { FeedNote } from "./types";

const byPath = (a: FeedNote, b: FeedNote) =>
	a.path < b.path ? -1 : a.path > b.path ? 1 : 0;

/**
 * Orders top-level notes. When the Base has a sort, Bases has already applied
 * it, so the order is kept. Without one, the newest note comes first.
 */
export function orderTopLevel<T extends FeedNote>(notes: T[], hasBaseSort: boolean): T[] {
	if (hasBaseSort) return notes.slice();
	return notes.slice().sort((a, b) => b.dateMs - a.dateMs || byPath(a, b));
}

/** Orders the replies in a thread: oldest first, like a conversation. */
export function orderReplies<T extends FeedNote>(replies: T[]): T[] {
	return replies.slice().sort((a, b) => a.dateMs - b.dateMs || byPath(a, b));
}
