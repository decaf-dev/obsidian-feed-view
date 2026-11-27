import { describe, expect, test } from "bun:test";
import { dateTimeLabel, dayKey, dayTimeLabel, dayLabel, previousDayKey, timeLabel } from "../src/model/dates";

const at = (y: number, m: number, d: number, h = 12, min = 0) =>
	new Date(y, m - 1, d, h, min).getTime();

describe("dayKey", () => {
	test("uses the local calendar day", () => {
		expect(dayKey(at(2026, 11, 27, 0, 1))).toBe("2026-11-27");
		expect(dayKey(at(2026, 11, 27, 23, 59))).toBe("2026-11-27");
	});

	test("pads month and day", () => {
		expect(dayKey(at(2026, 1, 5))).toBe("2026-01-05");
	});
});

describe("previousDayKey", () => {
	test("rolls over months and years", () => {
		expect(previousDayKey(at(2026, 3, 1))).toBe("2026-02-28");
		expect(previousDayKey(at(2027, 1, 1, 0, 5))).toBe("2026-12-31");
	});

	test("is not thrown off by daylight saving changes", () => {
		// US DST starts 2026-03-08 and ends 2026-11-01; the day before is always the calendar day before
		expect(previousDayKey(at(2026, 3, 9, 0, 30))).toBe("2026-03-08");
		expect(previousDayKey(at(2026, 11, 2, 0, 30))).toBe("2026-11-01");
	});
});

describe("dayLabel", () => {
	const now = at(2026, 11, 27, 9);

	test("Today and Yesterday", () => {
		expect(dayLabel(at(2026, 11, 27, 0, 0), now)).toBe("Today");
		expect(dayLabel(at(2026, 11, 27, 23, 59), now)).toBe("Today");
		expect(dayLabel(at(2026, 11, 26, 23, 59), now)).toBe("Yesterday");
		expect(dayLabel(at(2026, 11, 26, 0, 0), now)).toBe("Yesterday");
	});

	test("weekday and date for older days in the current year", () => {
		expect(dayLabel(at(2026, 11, 25), now)).toBe("Wednesday, November 25");
	});

	test("adds the year when it is not the current year", () => {
		expect(dayLabel(at(2025, 11, 25), now)).toBe("Tuesday, November 25, 2025");
	});

	test("Yesterday across a year boundary", () => {
		expect(dayLabel(at(2026, 12, 31, 22), at(2027, 1, 1, 8))).toBe("Yesterday");
	});

	test("future days get a full date, not Today", () => {
		expect(dayLabel(at(2026, 11, 28), now)).toBe("Saturday, November 28");
	});
});

describe("timeLabel", () => {
	test("shows the local time of day", () => {
		expect(timeLabel(at(2026, 11, 27, 15, 42))).toBe("3:42 PM");
		expect(timeLabel(at(2026, 11, 27, 0, 5))).toBe("12:05 AM");
	});

	test("the tooltip carries the full date", () => {
		expect(dateTimeLabel(at(2026, 11, 27, 15, 42))).toBe("Friday, November 27, 2026 at 3:42 PM");
	});
});

describe("dayTimeLabel", () => {
	const now = at(2026, 11, 27, 9);

	test("Today and Yesterday with the time", () => {
		expect(dayTimeLabel(at(2026, 11, 27, 15, 13), now)).toBe("Today at 3:13 pm");
		expect(dayTimeLabel(at(2026, 11, 26, 0, 5), now)).toBe("Yesterday at 12:05 am");
	});

	test("short date for older days in the current year", () => {
		expect(dayTimeLabel(at(2026, 11, 13, 15, 13), now)).toBe("Nov 13 at 3:13 pm");
	});

	test("adds the year when it is not the current year", () => {
		expect(dayTimeLabel(at(2025, 11, 13, 15, 13), now)).toBe("Nov 13, 2025 at 3:13 pm");
	});
});
