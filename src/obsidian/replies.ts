import { normalizePath, TFile, type App } from "obsidian";
import { REPLY_KEY } from "../constants";
import { nextUntitledName } from "../model/untitled";

/**
 * Creates a reply note (R8): an "Untitled" note in the parent's folder whose
 * only property is `reply: "[[Parent]]"`, with `text` (often empty) as its body.
 *
 * The link is written as a wikilink even when the vault prefers Markdown
 * links, because Obsidian only recognises wikilinks as links in properties.
 */
export async function createReply(app: App, parent: TFile, text: string): Promise<TFile> {
	const folder = parent.parent ?? app.vault.getRoot();
	const taken = new Set(
		folder.children
			.filter((child): child is TFile => child instanceof TFile)
			.map((file) => file.basename.toLowerCase())
	);

	const body = text.trim();
	let lastError: unknown = null;
	for (let attempt = 0; attempt < 5; attempt++) {
		const name = nextUntitledName(taken);
		taken.add(name.toLowerCase());
		const path = normalizePath(folder.isRoot() ? `${name}.md` : `${folder.path}/${name}.md`);
		if (app.vault.getAbstractFileByPath(path)) continue;

		const link = `[[${app.metadataCache.fileToLinktext(parent, path, true)}]]`;
		// a JSON string is also a valid double-quoted YAML scalar
		const frontmatter = `---\n${REPLY_KEY}: ${JSON.stringify(link)}\n---\n`;
		const content = body ? `${frontmatter}${body}\n` : frontmatter;
		try {
			return await app.vault.create(path, content);
		} catch (error) {
			// another note took the name between the check and the create; try the next one
			lastError = error;
		}
	}
	throw lastError instanceof Error ? lastError : new Error("Could not find a free name for the reply.");
}
