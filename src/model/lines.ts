/** Counts the non-blank lines of a note body (frontmatter already removed). */
export function countBodyLines(body: string): number {
	let count = 0;
	for (const line of body.split(/\r?\n/)) {
		if (line.trim() !== "") count++;
	}
	return count;
}

/** "1 line hidden" / "N lines hidden" for a folded card (R5). */
export function hiddenLinesLabel(count: number): string {
	return `${count} ${count === 1 ? "line" : "lines"} hidden`;
}
