import type { App } from "obsidian";
import { parseViewSettings, serializeViewSettings, type ViewSettings } from "../model/viewSettings";

/**
 * A view's Live preview / Reading mode, remembered per view
 * on this device only. Like fold state, they live in the vault's localStorage,
 * so changing them never writes to the .base file or syncs.
 *
 * Feed View never stores anything in a .base file: per-Base and per-view
 * state goes here (or in FoldStore), and plugin-wide settings go in data.json
 * (see src/settings.ts).
 */
export class SettingsStore {
	constructor(
		private readonly app: App,
		private readonly key: string
	) {}

	load(): ViewSettings {
		return parseViewSettings(this.app.loadLocalStorage(this.key));
	}

	save(settings: ViewSettings) {
		this.app.saveLocalStorage(this.key, serializeViewSettings(settings));
	}
}

export function settingsStorageKey(baseKey: string, viewName: string): string {
	return `feed-view:settings:v1:${baseKey}:${viewName}`;
}
