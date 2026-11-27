import { PluginSettingTab, type SettingDefinitionItem } from "obsidian";
import type FeedViewPlugin from "./main";

/**
 * Plugin-wide settings, stored in the plugin's data.json. Anything that
 * differs per Base or per view belongs in local storage instead
 * (src/obsidian/settingsStore.ts), never in the .base file.
 */
export interface FeedViewSettings {
	/** Span the full width of the view instead of the readable line length. */
	fullWidth: boolean;
	/** Group cards under a heading for each day (TODAY, YESTERDAY, …). */
	dayHeadings: boolean;
	/** Offer Reply on cards and in the ⋯ menu. Existing replies still show in their threads. */
	replies: boolean;
	/** Show the time each note was created on its card. */
	showTime: boolean;
}

export const DEFAULT_SETTINGS: FeedViewSettings = {
	fullWidth: false,
	dayHeadings: true,
	replies: true,
	showTime: true,
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
			{
				name: "Day headings",
				desc: "Group cards under a heading for each day, such as Today and Yesterday.",
				control: { type: "toggle", key: "dayHeadings", defaultValue: DEFAULT_SETTINGS.dayHeadings },
			},
			{
				name: "Replies",
				desc: "Show Reply on cards and in the card menu. Existing replies still show in their threads.",
				control: { type: "toggle", key: "replies", defaultValue: DEFAULT_SETTINGS.replies },
			},
			{
				name: "Show time",
				desc: "Show the time each note was created on its card.",
				control: { type: "toggle", key: "showTime", defaultValue: DEFAULT_SETTINGS.showTime },
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		// the default write path saves the settings; then open feeds pick up the change
		await super.setControlValue(key, value);
		this.plugin.applySettings();
	}
}
