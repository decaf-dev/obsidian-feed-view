/** The Bases view type id. "feed" is already used by another community plugin. */
export const FEED_VIEW_TYPE = "feed-view";

/** The frontmatter key a reply note uses to point at its thread's top note. */
export const REPLY_KEY = "reply";

/** Keys this view stores in its entry of the .base file. */
export const CONFIG_MODE = "feedMode";
export const CONFIG_WIDTH = "feedWidth";
export const CONFIG_DATE_PROPERTY = "dateProperty";

export type FeedMode = "live" | "reading";
export type FeedWidth = "fixed" | "full";

export const DEFAULT_MODE: FeedMode = "live";
export const DEFAULT_WIDTH: FeedWidth = "fixed";

/** Rows the virtual list keeps rendered above and below the viewport. */
export const VIRTUAL_BUFFER_SIZE = 5;

/** A first guess at a row's height, used until the row has been measured. */
export const ESTIMATED_ROW_HEIGHT = 150;

export const NOT_IMPLEMENTED_MESSAGE = "This feature isn't implemented yet";
