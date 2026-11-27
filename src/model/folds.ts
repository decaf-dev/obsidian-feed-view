/**
 * Fold state (R5, R6): the set of folded card paths. All functions return a
 * new set so Svelte sees a change.
 */

export function toggleFold(folded: ReadonlySet<string>, path: string): Set<string> {
	const next = new Set(folded);
	if (next.has(path)) next.delete(path);
	else next.add(path);
	return next;
}

/** True while any of `paths` is unfolded; drives the Collapse all / Expand all label. */
export function anyExpanded(paths: readonly string[], folded: ReadonlySet<string>): boolean {
	return paths.some((p) => !folded.has(p));
}

/** Collapse all folds every card; Expand all unfolds every card. Replies are included. */
export function setAllFolded(
	folded: ReadonlySet<string>,
	paths: readonly string[],
	fold: boolean
): Set<string> {
	const next = new Set(folded);
	for (const p of paths) {
		if (fold) next.add(p);
		else next.delete(p);
	}
	return next;
}

/** Moves a folded path when its note is renamed. */
export function renameFold(folded: ReadonlySet<string>, oldPath: string, newPath: string): Set<string> {
	if (!folded.has(oldPath)) return new Set(folded);
	const next = new Set(folded);
	next.delete(oldPath);
	next.add(newPath);
	return next;
}

/** Drops paths for notes that no longer exist. */
export function pruneFolds(folded: ReadonlySet<string>, exists: (path: string) => boolean): Set<string> {
	return new Set([...folded].filter(exists));
}

export function serializeFolds(folded: ReadonlySet<string>): string[] {
	return [...folded].sort();
}

/** Reads stored fold state, ignoring anything malformed. */
export function deserializeFolds(raw: unknown): Set<string> {
	if (!Array.isArray(raw)) return new Set();
	return new Set(raw.filter((p): p is string => typeof p === "string" && p.length > 0));
}
