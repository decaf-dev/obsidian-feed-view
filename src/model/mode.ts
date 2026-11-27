import { DEFAULT_MODE, type FeedMode } from "../constants";

/** Reads a stored mode, falling back to the default for anything unknown. */
export function parseFeedMode(raw: unknown): FeedMode {
	return raw === "live" || raw === "reading" ? raw : DEFAULT_MODE;
}
