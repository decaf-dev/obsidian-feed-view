import type { BasesEntry, TFile } from "obsidian";
import type { FeedNote } from "../model/types";

/** A note as the feed shows it. `entry` is null for replies the Base itself didn't return. */
export interface CardNote extends FeedNote {
	file: TFile;
	title: string;
	entry: BasesEntry | null;
}

/** Notes are filed under the day of their created time (R9). */
export function toCardNote(file: TFile, entry: BasesEntry | null): CardNote {
	return {
		path: file.path,
		title: file.basename,
		file,
		entry,
		dateMs: file.stat.ctime,
	};
}
