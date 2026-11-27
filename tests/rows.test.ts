import { describe, expect, test } from "bun:test";
import { buildRows, cardRowKey } from "../src/model/rows";
import type { FeedRow, Thread } from "../src/model/types";

const at = (d: number, h = 12) => new Date(2026, 10, d, h).getTime(); // November 2026
const now = at(27, 9);

const threads: Thread[] = [
	{ root: { path: "t1.md", dateMs: at(27, 10) }, replies: [{ path: "t1-r.md", dateMs: at(20) }] },
	{ root: { path: "t2.md", dateMs: at(27, 8) }, replies: [] },
	{ root: { path: "y1.md", dateMs: at(26) }, replies: [] },
	{ root: { path: "w1.md", dateMs: at(25) }, replies: [] },
];

const summary = (rows: FeedRow[]) =>
	rows.map((r) => (r.kind === "heading" ? `# ${r.label}` : `${r.depth ? "  " : ""}${r.path}`));

describe("buildRows", () => {
	test("a heading appears only where the day changes; replies don't add headings", () => {
		const rows = buildRows({ threads, folded: new Set(), nowMs: now });
		expect(summary(rows)).toEqual([
			"# Today",
			"t1.md",
			"  t1-r.md",
			"t2.md",
			"# Yesterday",
			"y1.md",
			"# Wednesday, November 25",
			"w1.md",
		]);
	});

	test("only the first heading is marked first, and cards know when they follow a heading", () => {
		const rows = buildRows({ threads, folded: new Set(), nowMs: now });
		const headings = rows.filter((r) => r.kind === "heading");
		expect(headings.map((h) => h.kind === "heading" && h.first)).toEqual([true, false, false]);
		const cards = rows.filter((r) => r.kind === "card");
		expect(cards.map((c) => c.kind === "card" && c.afterHeading)).toEqual([true, false, false, true, true]);
	});

	test("a folded root hides its replies", () => {
		const rows = buildRows({ threads, folded: new Set(["t1.md"]), nowMs: now });
		expect(summary(rows).slice(0, 3)).toEqual(["# Today", "t1.md", "t2.md"]);
	});

	test("folding a reply keeps the reply row (it shows as a folded card)", () => {
		const rows = buildRows({ threads, folded: new Set(["t1-r.md"]), nowMs: now });
		expect(summary(rows)).toContain("  t1-r.md");
	});

	test("card rows are keyed by note path", () => {
		const rows = buildRows({ threads, folded: new Set(), nowMs: now });
		const reply = rows.find((r) => r.kind === "card" && r.path === "t1-r.md");
		expect(reply?.key).toBe(cardRowKey("t1-r.md"));
	});

	test("keys are unique and stable", () => {
		const a = buildRows({ threads, folded: new Set(), nowMs: now });
		const b = buildRows({ threads, folded: new Set(), nowMs: now });
		const keys = a.map((r) => r.key);
		expect(new Set(keys).size).toBe(keys.length);
		expect(b.map((r) => r.key)).toEqual(keys);
	});

	test("a day that comes up twice under a non-date sort gets two headings with distinct keys", () => {
		const mixed: Thread[] = [
			{ root: { path: "a.md", dateMs: at(27) }, replies: [] },
			{ root: { path: "b.md", dateMs: at(25) }, replies: [] },
			{ root: { path: "c.md", dateMs: at(27) }, replies: [] },
		];
		const rows = buildRows({ threads: mixed, folded: new Set(), nowMs: now });
		const headingKeys = rows.filter((r) => r.kind === "heading").map((r) => r.key);
		expect(headingKeys).toHaveLength(3);
		expect(new Set(headingKeys).size).toBe(3);
	});

	test("an empty feed has no rows", () => {
		expect(buildRows({ threads: [], folded: new Set(), nowMs: now })).toEqual([]);
	});
});
