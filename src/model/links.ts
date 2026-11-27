/**
 * Pulls the link target out of a `reply` property value: `[[Target]]`,
 * `[[Target|Alias]]`, a bare `Target`, or the first item of a list.
 * Returns null when there's no usable target.
 */
export function parseWikilink(value: unknown): string | null {
	const raw = Array.isArray(value) ? (value as unknown[])[0] : value;
	if (typeof raw !== "string") return null;
	const trimmed = raw.trim();
	const match = /^\[\[([^\]|]*)(?:\|[^\]]*)?\]\]$/.exec(trimmed);
	const target = (match ? match[1] : trimmed)?.trim();
	return target ? target : null;
}
