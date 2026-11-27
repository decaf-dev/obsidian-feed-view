import { PluginSettingTab, type SettingDefinitionItem } from "obsidian";
import type FeedViewPlugin from "./main";

/** Plugin-wide settings, stored in the plugin's data.json. */
export interface FeedViewSettings {
	/** Span the full width of the view instead of the readable line length. */
	fullWidth: boolean;
}

export const DEFAULT_SETTINGS: FeedViewSettings = {
	fullWidth: false,
};

export class FeedViewSettingTab extends PluginSettingTab {
	constructor(private readonly plugin: FeedViewPlugin) {
		super(plugin.app, plugin);
	}

	getSettingDefinitions(): SettingDefinitionItem<keyof FeedViewSettings>[] {
		return [
			{
				name: "Full width",
				desc: "Span the full width of the view instead of the readable line length.",
				control: { type: "toggle", key: "fullWidth", defaultValue: DEFAULT_SETTINGS.fullWidth },
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		// the default write path saves the settings; then open feeds pick up the change
		await super.setControlValue(key, value);
		this.plugin.applySettings();
	}
}
