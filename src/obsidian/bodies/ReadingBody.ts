import {
	Component,
	getFrontMatterInfo,
	Keymap,
	MarkdownRenderer,
	Menu,
	type App,
	type HoverParent,
	type TFile,
} from "obsidian";
import { FEED_VIEW_TYPE } from "../../constants";
import { openTagSearch } from "../internal/search";

/**
 * A read-only card body rendered like Obsidian's Reading view (R4). Also the
 * fallback when the live editor can't be created. Frontmatter is left out:
 * it's shown as properties instead (R10). Re-renders when the note changes.
 *
 * `MarkdownRenderer.render` only draws the HTML. Obsidian's own Reading view
 * wires up link and tag clicks separately, so this body does the same.
 */
export class ReadingBody extends Component {
	private renderChild: Component | null = null;
	private renderId = 0;
	private alive = false;
	private readonly contentEl: HTMLElement;

	constructor(
		private readonly app: App,
		private readonly file: TFile,
		hostEl: HTMLElement,
		private readonly hoverParent: HoverParent
	) {
		super();
		this.contentEl = hostEl.createDiv({
			cls: "feed-view-reading markdown-preview-view markdown-rendered",
		});
		this.registerLinkEvents();
	}

	/** Opens links and tags the way Obsidian's Reading view does. */
	private registerLinkEvents() {
		const el = this.contentEl;
		const sourcePath = this.file.path;
		const { workspace } = this.app;

		const openLink = (evt: MouseEvent, linkEl: HTMLElement) => {
			if (evt.button !== 0 && evt.button !== 1) return;
			const href = this.ownHref(evt, linkEl);
			if (href === null) return;
			evt.preventDefault();
			void workspace.openLinkText(href, sourcePath, Keymap.isModEvent(evt));
		};
		el.on("click", "a.internal-link", openLink);
		el.on("auxclick", "a.internal-link", openLink);

		el.on("contextmenu", "a.internal-link", (evt, linkEl) => {
			const href = this.ownHref(evt, linkEl);
			if (href === null) return;
			const menu = new Menu();
			if (workspace.handleLinkContextMenu(menu, href, sourcePath)) {
				evt.preventDefault();
				menu.showAtMouseEvent(evt);
			}
		});

		el.on("mouseover", "a.internal-link", (evt, linkEl) => {
			const href = this.ownHref(evt, linkEl);
			if (href === null) return;
			workspace.trigger("hover-link", {
				event: evt,
				source: FEED_VIEW_TYPE,
				hoverParent: this.hoverParent,
				targetEl: linkEl,
				linktext: href,
				sourcePath,
			});
		});

		el.on("click", "a.tag", (evt, tagEl) => {
			if (evt.button !== 0 || evt.defaultPrevented || !this.ownsElement(tagEl)) return;
			evt.preventDefault();
			openTagSearch(this.app, tagEl.getText());
		});
	}

	/** The link's target, or null when a `![[note]]` embed inside this body handles it. */
	private ownHref(evt: MouseEvent, linkEl: HTMLElement): string | null {
		if (evt.defaultPrevented || !this.ownsElement(linkEl)) return null;
		return linkEl.getAttr("data-href") || linkEl.getAttr("href") || null;
	}

	/** False inside a `![[note]]` embed, which wires up its own links. */
	private ownsElement(target: HTMLElement): boolean {
		return target.closest(".markdown-preview-view") === this.contentEl;
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
