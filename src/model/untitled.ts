/**
 * The next free name in Obsidian's "Untitled" style: "Untitled", then
 * "Untitled 1", "Untitled 2", … Names are compared case-insensitively,
 * because macOS and Windows file systems are.
 *
 * @param taken lower-cased basenames already used in the folder
 */
export function nextUntitledName(taken: ReadonlySet<string>, base = "Untitled"): string {
	if (!taken.has(base.toLowerCase())) return base;
	for (let i = 1; ; i++) {
		const name = `${base} ${i}`;
		if (!taken.has(name.toLowerCase())) return name;
	}
}
