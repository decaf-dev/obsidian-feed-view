/**
 * Plain data shared by the pure model functions. Nothing here may import
 * from "obsidian" or "svelte", so the model can be unit tested with `bun test`.
 */

/** The minimum the model needs to know about a note. */
export interface FeedNote {
	/** Vault path, used as the note's stable identity. */
	path: string;
	/** The date that decides the note's day heading and default order (ms since epoch). */
	dateMs: number;
}

/** A top-level note and its replies, which are one level deep. */
export interface Thread<T extends FeedNote = FeedNote> {
	root: T;
	replies: T[];
}

/** A day heading row ("TODAY", "WEDNESDAY, NOVEMBER 25"). */
export interface HeadingRow {
	kind: "heading";
	key: string;
	label: string;
	/** The first heading in the feed gets a smaller top margin. */
	first: boolean;
}

/** A note card: either a top-level note (depth 0) or a reply (depth 1). */
export interface CardRow {
	kind: "card";
	key: string;
	path: string;
	rootPath: string;
	depth: 0 | 1;
	/** True when a day heading sits directly above this card. */
	afterHeading: boolean;
}

export type FeedRow = HeadingRow | CardRow;
