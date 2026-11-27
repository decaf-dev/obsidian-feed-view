import type { BasesAllOptions, BasesPropertyId } from "obsidian";
import { CONFIG_DATE_PROPERTY } from "../constants";

/**
 * Options shown in the view's configuration menu. Live preview / Reading and
 * the width live in the feed bar instead (R4, R7), so they aren't repeated here.
 */
export function feedViewOptions(): BasesAllOptions[] {
	return [
		{
			type: "property",
			key: CONFIG_DATE_PROPERTY,
			displayName: "Date property",
			placeholder: "Created time",
			// file.ctime is the default; other file properties aren't dates
			filter: (id: BasesPropertyId) => id === "file.ctime" || id === "file.mtime" || !id.startsWith("file."),
		},
	];
}
