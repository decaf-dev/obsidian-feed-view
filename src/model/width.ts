/**
 * The feed's column width (a plugin setting): Obsidian's readable line
 * length, the full view, or a chosen percentage of the view.
 */
export type WidthMode = "default" | "full" | "custom";

export const WIDTH_MODES: readonly WidthMode[] = ["default", "full", "custom"];

/** The custom width slider's range, in percent of the view's width. */
export const MIN_CUSTOM_WIDTH = 25;
export const MAX_CUSTOM_WIDTH = 100;
export const CUSTOM_WIDTH_STEP = 5;

/** Reads a stored width mode, falling back to "default" for anything unknown. */
export function parseWidthMode(raw: unknown): WidthMode {
	return WIDTH_MODES.includes(raw as WidthMode) ? (raw as WidthMode) : "default";
}

/** Reads a stored custom width, kept within the slider's range. */
export function parseCustomWidth(raw: unknown): number {
	if (typeof raw !== "number" || !Number.isFinite(raw)) return MAX_CUSTOM_WIDTH;
	return Math.min(MAX_CUSTOM_WIDTH, Math.max(MIN_CUSTOM_WIDTH, Math.round(raw)));
}
