import {
	BooleanValue,
	DateValue,
	FileValue,
	LinkValue,
	ListValue,
	Notice,
	NumberValue,
	parsePropertyId,
	TagValue,
	type App,
	type BasesPropertyId,
	type TFile,
	type Value,
} from "obsidian";
import type { CardNote } from "./records";

export type PropertyKind = "checkbox" | "list" | "value";

/** One property row on a card (R10). */
export interface PropertyRow {
	id: BasesPropertyId;
	name: string;
	icon: string;
	kind: PropertyKind;
	/** checkbox: its state */
	checked: boolean;
	/** checkbox: whether it can be toggled from the card (only note properties can) */
	editable: boolean;
	/** list: one entry per pill */
	items: (Value | string)[];
	/** value: rendered with Value.renderTo, or as plain text */
	value: Value | string | null;
	/** changes whenever what's shown changes, so the UI knows to re-render */
	signature: string;
}

/**
 * The properties to show on a card: the ones enabled in the Base's Properties
 * menu, in the Base's order, minus the file name (already the card title).
 * Empty values are left out, so a note with none shows no property area.
 */
export function buildPropertyRows(
	app: App,
	note: CardNote,
	order: BasesPropertyId[],
	displayName: (id: BasesPropertyId) => string
): PropertyRow[] {
	const rows: PropertyRow[] = [];
	for (const id of order) {
		if (id === "file.name" || id === "file.basename") continue;
		const row = note.entry
			? rowFromValue(id, displayName(id), note.entry.getValue(id))
			: rowFromFrontmatter(app, note.file, id, displayName(id));
		if (row) rows.push(row);
	}
	return rows;
}

function rowFromValue(id: BasesPropertyId, name: string, value: Value | null): PropertyRow | null {
	if (!value) return null;
	const isNote = parsePropertyId(id).type === "note";
	if (value instanceof BooleanValue) {
		const checked = value.isTruthy();
		return row(id, name, "lucide-check-square", "checkbox", { checked, editable: isNote, signature: String(checked) });
	}
	if (!value.isTruthy()) return null;
	if (value instanceof ListValue) {
		const items: Value[] = [];
		for (let i = 0; i < value.length(); i++) items.push(value.get(i));
		const icon = items.length > 0 && items.every((v) => v instanceof TagValue) ? "lucide-tags" : "lucide-list";
		return row(id, name, isTagsProperty(id) ? "lucide-tags" : icon, "list", {
			items,
			signature: value.toString(),
		});
	}
	return row(id, name, iconForValue(id, value), "value", { value, signature: value.toString() });
}

/**
 * Replies the Base didn't return have no BasesEntry, so their note properties
 * are read from the frontmatter instead. Formula and file properties can't be
 * shown for them.
 */
function rowFromFrontmatter(app: App, file: TFile, id: BasesPropertyId, name: string): PropertyRow | null {
	const { type, name: key } = parsePropertyId(id);
	if (type !== "note") return null;
	const raw: unknown = app.metadataCache.getFileCache(file)?.frontmatter?.[key];
	if (raw === null || raw === undefined || raw === "") return null;
	if (typeof raw === "boolean") {
		return row(id, name, "lucide-check-square", "checkbox", { checked: raw, editable: true, signature: String(raw) });
	}
	if (Array.isArray(raw)) {
		const items = raw.filter((v) => v !== null && v !== undefined && v !== "").map((v) => String(v));
		if (items.length === 0) return null;
		return row(id, name, isTagsProperty(id) ? "lucide-tags" : "lucide-list", "list", {
			items,
			signature: items.join("\u0000"),
		});
	}
	const text = typeof raw === "string" || typeof raw === "number" ? String(raw) : JSON.stringify(raw);
	return row(id, name, typeof raw === "number" ? "lucide-binary" : "lucide-text", "value", { value: text, signature: text });
}

function row(
	id: BasesPropertyId,
	name: string,
	icon: string,
	kind: PropertyKind,
	parts: Partial<Pick<PropertyRow, "checked" | "editable" | "items" | "value">> & { signature: string }
): PropertyRow {
	return {
		id,
		name,
		icon,
		kind,
		checked: parts.checked ?? false,
		editable: parts.editable ?? false,
		items: parts.items ?? [],
		value: parts.value ?? null,
		signature: `${kind}:${parts.signature}`,
	};
}

function isTagsProperty(id: BasesPropertyId): boolean {
	return id === "note.tags" || id === "file.tags";
}

function iconForValue(id: BasesPropertyId, value: Value): string {
	if (value instanceof DateValue) return "lucide-calendar";
	if (value instanceof NumberValue) return "lucide-binary";
	if (value instanceof LinkValue || value instanceof FileValue) return "lucide-link";
	if (isTagsProperty(id)) return "lucide-tags";
	return "lucide-text";
}

/** Toggles a checkbox property in the note's frontmatter (R10). */
export async function setCheckbox(app: App, file: TFile, id: BasesPropertyId, checked: boolean): Promise<void> {
	const { type, name } = parsePropertyId(id);
	if (type !== "note") return;
	try {
		await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
			frontmatter[name] = checked;
		});
	} catch (error) {
		console.error("[feed-view] Could not update property", name, error);
		new Notice(`Could not update "${name}" in ${file.basename}.`);
	}
}
