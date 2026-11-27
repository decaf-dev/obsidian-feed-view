import { DEFAULT_MODE, type FeedMode } from "../constants";

/** A feed's settings that are kept on this device only, per view. */
export interface ViewSettings {
	mode: FeedMode;
}

export const DEFAULT_VIEW_SETTINGS: ViewSettings = { mode: DEFAULT_MODE };

/** Reads stored settings, falling back to the default for anything missing or malformed. */
export function parseViewSettings(raw: unknown): ViewSettings {
	if (typeof raw !== "object" || raw === null) return { ...DEFAULT_VIEW_SETTINGS };
	const { mode } = raw as Record<string, unknown>;
	return { mode: mode === "live" || mode === "reading" ? mode : DEFAULT_VIEW_SETTINGS.mode };
}

/** What to store; null (remove the entry) when every setting is the default. */
export function serializeViewSettings(settings: ViewSettings): ViewSettings | null {
	return settings.mode === DEFAULT_VIEW_SETTINGS.mode ? null : { mode: settings.mode };
}
