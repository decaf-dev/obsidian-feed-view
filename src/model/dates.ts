/**
 * Day keys and day heading labels (R9).
 *
 * Everything works on local calendar days, so a note written at 23:59 and one
 * written at 00:01 land under different headings, and daylight saving changes
 * never shift a note into the wrong day.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** A local calendar day as `YYYY-MM-DD`. */
export function dayKey(ms: number): string {
	const d = new Date(ms);
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The day key of the calendar day before the one containing `ms`. */
export function previousDayKey(ms: number): string {
	const d = new Date(ms);
	// setDate handles month/year rollover and DST (the time of day may move, the day doesn't)
	d.setHours(12, 0, 0, 0);
	d.setDate(d.getDate() - 1);
	return dayKey(d.getTime());
}

const WEEKDAY_FORMAT = new Intl.DateTimeFormat("en-US", {
	weekday: "long",
	month: "long",
	day: "numeric",
});

const WEEKDAY_YEAR_FORMAT = new Intl.DateTimeFormat("en-US", {
	weekday: "long",
	month: "long",
	day: "numeric",
	year: "numeric",
});

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

/** The time of day, as shown on a card: "3:42 PM". */
export function timeLabel(ms: number): string {
	return TIME_FORMAT.format(new Date(ms));
}

/** The full date and time, for a card time's tooltip: "Friday, November 27, 2026 at 3:42 PM". */
export function dateTimeLabel(ms: number): string {
	return `${WEEKDAY_YEAR_FORMAT.format(new Date(ms))} at ${timeLabel(ms)}`;
}

/**
 * The heading for the day containing `ms`, seen from `nowMs`:
 * "Today", "Yesterday", "Wednesday, November 25", or
 * "Wednesday, November 25, 2025" when the year differs from the current one.
 * The feed upper-cases it with CSS.
 */
export function dayLabel(ms: number, nowMs: number): string {
	const key = dayKey(ms);
	if (key === dayKey(nowMs)) return "Today";
	if (key === previousDayKey(nowMs)) return "Yesterday";
	const sameYear = new Date(ms).getFullYear() === new Date(nowMs).getFullYear();
	return (sameYear ? WEEKDAY_FORMAT : WEEKDAY_YEAR_FORMAT).format(new Date(ms));
}
