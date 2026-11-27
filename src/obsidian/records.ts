import { moment, parsePropertyId, type App, type BasesEntry, type BasesPropertyId, type TFile } from "obsidian";
import type { FeedNote } from "../model/types";

/** A note as the feed shows it. `entry` is null for replies the Base itself didn't return. */
export interface CardNote extends FeedNote {
	file: TFile;
	title: string;
	entry: BasesEntry | null;
}

export function toCardNote(
	app: App,
	file: TFile,
	entry: BasesEntry | null,
	dateProperty: BasesPropertyId | null
): CardNote {
	return {
		path: file.path,
		title: file.basename,
		file,
		entry,
		dateMs: resolveDateMs(app, file, entry, dateProperty),
	};
}

/**
 * The date a note is filed under (R9): the chosen date property when it holds
 * a valid date, otherwise the file's created time.
 */
export function resolveDateMs(
	app: App,
	file: TFile,
	entry: BasesEntry | null,
	dateProperty: BasesPropertyId | null
): number {
	if (!dateProperty) return file.stat.ctime;
	const { type, name } = parsePropertyId(dateProperty);

	let raw: unknown = null;
	if (type === "file") {
		if (name === "ctime") return file.stat.ctime;
		if (name === "mtime") return file.stat.mtime;
		raw = entry?.getValue(dateProperty)?.toString();
	} else if (type === "note") {
		raw = app.metadataCache.getFileCache(file)?.frontmatter?.[name];
	} else {
		raw = entry?.getValue(dateProperty)?.toString();
	}
	return parseDate(raw) ?? file.stat.ctime;
}

const DATE_FORMATS = [moment.ISO_8601, "YYYY-MM-DD", "YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DDTHH:mm"];

// Obsidian exports moment's namespace type, which TypeScript doesn't see as callable
type ParseMoment = (
	input: string,
	formats: typeof DATE_FORMATS,
	strict: boolean
) => { isValid(): boolean; valueOf(): number };
const parseMoment = moment as unknown as ParseMoment;

/** Parses a property value as a local date. Returns null when it isn't one. */
export function parseDate(raw: unknown): number | null {
	if (raw === null || raw === undefined) return null;
	if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
	if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw.getTime();
	if (typeof raw !== "string") return null;
	const text = raw.trim();
	if (!text) return null;
	const parsed = parseMoment(text, DATE_FORMATS, true);
	return parsed.isValid() ? parsed.valueOf() : null;
}
