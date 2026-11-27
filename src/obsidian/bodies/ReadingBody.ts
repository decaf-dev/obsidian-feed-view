import { Component, getFrontMatterInfo, MarkdownRenderer, type App, type TFile } from "obsidian";

/**
 * A read-only card body rendered like Obsidian's Reading view (R4). Also the
 * fallback when the live editor can't be created. Frontmatter is left out:
 * it's shown as properties instead (R10). Re-renders when the note changes.
 */
export class ReadingBody extends Component {
	private renderChild: Component | null = null;
	private renderId = 0;
	private alive = false;
	private readonly contentEl: HTMLElement;

	constructor(
		private readonly app: App,
		private readonly file: TFile,
		hostEl: HTMLElement
	) {
		super();
		this.contentEl = hostEl.createDiv({
			cls: "feed-view-reading markdown-preview-view markdown-rendered",
		});
	}

	onload() {
		this.alive = true;
		void this.render();
		this.registerEvent(
			this.app.metadataCache.on("changed", (changed) => {
				if (changed === this.file) void this.render();
			})
		);
	}

	onunload() {
		this.alive = false;
		this.contentEl.remove();
	}

	private async render() {
		const id = ++this.renderId;
		const content = await this.app.vault.cachedRead(this.file);
		if (id !== this.renderId || !this.alive) return;

		const body = content.slice(getFrontMatterInfo(content).contentStart);
		const child = new Component();
		const target = createDiv();
		this.addChild(child);
		await MarkdownRenderer.render(this.app, body, target, this.file.path, child);
		if (id !== this.renderId || !this.alive) {
			this.removeChild(child);
			return;
		}
		// swap in one go so the card height doesn't collapse while rendering
		this.contentEl.replaceChildren(...Array.from(target.childNodes));
		if (this.renderChild) this.removeChild(this.renderChild);
		this.renderChild = child;
	}
}
