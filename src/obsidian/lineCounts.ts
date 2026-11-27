import { getFrontMatterInfo, type App, type TFile } from "obsidian";
import { countBodyLines } from "../model/lines";

/**
 * Counts the non-blank body lines of notes for the "N lines hidden" label on
 * folded cards (R5). Results are cached until the file changes.
 */
export class LineCounter {
	private cache = new Map<string, { mtime: number; count: number }>();
	private inFlight = new Map<string, Promise<number>>();

	constructor(private readonly app: App) {}

	/** The cached count, if it's still current. */
	peek(file: TFile): number | null {
		const hit = this.cache.get(file.path);
		return hit && hit.mtime === file.stat.mtime ? hit.count : null;
	}

	async count(file: TFile): Promise<number> {
		const cached = this.peek(file);
		if (cached !== null) return cached;
		const running = this.inFlight.get(file.path);
		if (running) return running;

		const job = (async () => {
			const mtime = file.stat.mtime;
			const content = await this.app.vault.cachedRead(file);
			const count = countBodyLines(content.slice(getFrontMatterInfo(content).contentStart));
			this.cache.set(file.path, { mtime, count });
			return count;
		})();
		this.inFlight.set(file.path, job);
		try {
			return await job;
		} finally {
			this.inFlight.delete(file.path);
		}
	}
}
