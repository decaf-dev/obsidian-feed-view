import type { BasesPropertyId, Value } from "obsidian";
import { DEFAULT_MODE, type FeedMode } from "../constants";
import { anyExpanded } from "../model/folds";
import type { FeedRow } from "../model/types";
import type { PropertyRow } from "../obsidian/properties";

/** What a card shows. Rebuilt on every data update; cards are keyed by `path`. */
export interface CardView {
	path: string;
	title: string;
	/** The file's created time (ms since epoch), shown when the "Show time" setting is on. */
	createdMs: number;
	properties: PropertyRow[];
}

/** Reactive state shared by the feed's Svelte components. */
/* eslint-disable svelte/prefer-svelte-reactivity -- these collections are never mutated: each update assigns a new one, which $state.raw tracks */
export class FeedState {
	rows = $state.raw<FeedRow[]>([]);
	cards = $state.raw<ReadonlyMap<string, CardView>>(new Map());
	allPaths = $state.raw<readonly string[]>([]);
	folded = $state.raw<ReadonlySet<string>>(new Set());
	lineCounts = $state.raw<ReadonlyMap<string, number>>(new Map());
	/* eslint-enable svelte/prefer-svelte-reactivity -- end of the immutable collections */

	mode = $state<FeedMode>(DEFAULT_MODE);
	/** Span the view instead of the readable line length (a plugin setting). */
	fullWidth = $state(false);
	/** Offer Reply on cards and in the ⋯ menu (a plugin setting). */
	replies = $state(true);
	/** Show each note's created time on its card (a plugin setting). */
	showTime = $state(true);
	/** False when this Obsidian version lacks the internals for the live editor. */
	liveAvailable = $state(true);
	/** True once the first data update has been rendered. */
	loaded = $state(false);

	/** Asks the virtual list to bring a row into view; `seq` makes repeat requests distinct. */
	scrollRequest = $state.raw<{ key: string; seq: number } | null>(null);
	/** The card whose ⋯ menu is open; keeps its ⋯ button visible (R11). */
	menuOpenFor = $state<string | null>(null);

	anyExpanded = $derived(anyExpanded(this.allPaths, this.folded));
}

/** Callbacks from the Svelte components into the Bases view. */
export interface FeedActions {
	setMode(mode: FeedMode): void;
	toggleFold(path: string): void;
	toggleAll(): void;
	openNote(path: string, evt: MouseEvent): void;
	hoverNote(path: string, evt: MouseEvent, targetEl: HTMLElement): void;
	openMenu(path: string, rootPath: string, anchorEl: HTMLElement): void;
	/** Obsidian's own context menu for a note link (right-click on a title). */
	showNoteMenu(path: string, evt: MouseEvent): void;
	/** Creates a reply note in the thread and focuses its editor. */
	reply(rootPath: string): void;
	toggleCheckbox(path: string, id: BasesPropertyId, checked: boolean): void;
	renderValue(el: HTMLElement, value: Value | string): void;
	registerBody(path: string, el: HTMLElement): void;
	releaseBody(el: HTMLElement): void;
	requestLineCount(path: string): void;
}
