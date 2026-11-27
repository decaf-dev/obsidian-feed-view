import { PluginSettingTab, type SettingDefinitionItem } from "obsidian";
import type FeedViewPlugin from "./main";
import {
	CUSTOM_WIDTH_STEP,
	MAX_CUSTOM_WIDTH,
	MIN_CUSTOM_WIDTH,
	parseCustomWidth,
	parseWidthMode,
	type WidthMode,
} from "./model/width";

/**
 * Plugin-wide settings, stored in the plugin's data.json. Anything that
 * differs per Base or per view belongs in local storage instead
 * (src/obsidian/settingsStore.ts), never in the .base file.
 */
export interface FeedViewSettings {
	/** The column width: readable line length, the full view, or `customWidth`. */
	width: WidthMode;
	/** The column width in percent of the view, used when `width` is "custom". */
	customWidth: number;
	/** Group cards under a heading for each day (TODAY, YESTERDAY, …). */
	dayHeadings: boolean;
	/** Show reply notes under the note they reply to. Off hides them from the feed. */
	showReplies: boolean;
	/** Offer Reply on cards and in the ⋯ menu. Only applies while replies are shown. */
	replyButtons: boolean;
	/** Show the time each note was created on its card. */
	showTimestamp: boolean;
}

export const DEFAULT_SETTINGS: FeedViewSettings = {
	width: "default",
	customWidth: MAX_CUSTOM_WIDTH,
	dayHeadings: true,
	showReplies: true,
	replyButtons: true,
	showTimestamp: true,
};

/** Fills in defaults and corrects stored values that are out of range or unknown. */
export function parseSettings(raw: unknown): FeedViewSettings {
	const stored = (typeof raw === "object" && raw !== null ? raw : {}) as Partial<FeedViewSettings>;
	const settings = { ...DEFAULT_SETTINGS, ...stored };
	settings.width = parseWidthMode(stored.width);
	settings.customWidth = parseCustomWidth(stored.customWidth);
	return settings;
}

export class FeedViewSettingTab extends PluginSettingTab {
	constructor(private readonly plugin: FeedViewPlugin) {
		super(plugin.app, plugin);
	}

	getSettingDefinitions(): SettingDefinitionItem<keyof FeedViewSettings>[] {
		return [
			{
				type: "group",
				heading: "Features",
				items: [
					{
						name: "Day headings",
						desc: "Group cards under a heading for each day, such as Today and Yesterday.",
						control: { type: "toggle", key: "dayHeadings", defaultValue: DEFAULT_SETTINGS.dayHeadings },
					},
					{
						name: "Show replies on threads",
						desc: "Show reply notes under the note they reply to. When off, replies are hidden from the feed.",
						control: { type: "toggle", key: "showReplies", defaultValue: DEFAULT_SETTINGS.showReplies },
					},
					{
						name: "Reply buttons",
						desc: "Show Reply on cards and in the card menu.",
						// a new reply would never appear while replies are hidden
						visible: () => this.plugin.settings.showReplies,
						control: { type: "toggle", key: "replyButtons", defaultValue: DEFAULT_SETTINGS.replyButtons },
					},
					{
						name: "Show timestamp",
						desc: "Show the time each note was created on its card.",
						control: { type: "toggle", key: "showTimestamp", defaultValue: DEFAULT_SETTINGS.showTimestamp },
					},
				],
			},
			{
				type: "group",
				heading: "Styling",
				items: [
					{
						name: "Width",
						desc: "Default follows Obsidian's readable line length. Full width spans the view.",
						control: {
							type: "dropdown",
							key: "width",
							defaultValue: DEFAULT_SETTINGS.width,
							options: { default: "Default", full: "Full width", custom: "Custom width" },
						},
					},
					{
						name: "Custom width",
						desc: "How much of the view's width the feed uses.",
						visible: () => this.plugin.settings.width === "custom",
						control: {
							type: "slider",
							key: "customWidth",
							defaultValue: DEFAULT_SETTINGS.customWidth,
							min: MIN_CUSTOM_WIDTH,
							max: MAX_CUSTOM_WIDTH,
							step: CUSTOM_WIDTH_STEP,
							displayFormat: (value) => `${value}%`,
						},
					},
				],
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		// the default write path saves the settings; then open feeds pick up the change
		await super.setControlValue(key, value);
		this.plugin.applySettings();
		// re-evaluate `visible`: Reply buttons follows Show replies, the slider follows Width
		if (key === "showReplies" || key === "width") this.update();
	}
}
