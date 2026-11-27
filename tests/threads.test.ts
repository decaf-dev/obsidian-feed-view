import { describe, expect, test } from "bun:test";
import { orderReplies, orderTopLevel } from "../src/model/ordering";
import { allCardPaths, buildThreads } from "../src/model/threads";
import type { FeedNote } from "../src/model/types";

const note = (path: string, dateMs: number): FeedNote => ({ path, dateMs });

describe("orderTopLevel", () => {
	const a = note("a.md", 100);
	const b = note("b.md", 300);
	const c = note("c.md", 200);

	test("newest first when the Base has no sort", () => {
		expect(orderTopLevel([a, b, c], false).map((n) => n.path)).toEqual(["b.md", "c.md", "a.md"]);
	});

	test("keeps the Base's order when it has a sort", () => {
		expect(orderTopLevel([a, b, c], true).map((n) => n.path)).toEqual(["a.md", "b.md", "c.md"]);
	});

	test("breaks ties by path so the order is stable", () => {
		const x = note("x.md", 5);
		const y = note("y.md", 5);
		expect(orderTopLevel([y, x], false).map((n) => n.path)).toEqual(["x.md", "y.md"]);
	});

	test("does not mutate its input", () => {
		const input = [a, b];
		orderTopLevel(input, false);
		expect(input.map((n) => n.path)).toEqual(["a.md", "b.md"]);
	});
});

describe("orderReplies", () => {
	test("oldest first", () => {
		const r = orderReplies([note("r2.md", 20), note("r1.md", 10), note("r3.md", 30)]);
		expect(r.map((n) => n.path)).toEqual(["r1.md", "r2.md", "r3.md"]);
	});
});

describe("buildThreads", () => {
	const parent = note("parent.md", 1000);
	const other = note("other.md", 2000);
	const replyInBase = note("reply-in-base.md", 1500);
	const replyOutside = note("reply-outside.md", 1200);
	const orphan = note("orphan.md", 3000);

	const roots: Record<string, string> = {
		"reply-in-base.md": "parent.md",
		"reply-outside.md": "parent.md",
		"orphan.md": "filtered-out.md",
	};
	const replies: Record<string, FeedNote[]> = {
		"parent.md": [replyInBase, replyOutside],
		"filtered-out.md": [orphan],
	};

	const threads = buildThreads({
		entries: [parent, replyInBase, other, orphan],
		rootOf: (p) => roots[p] ?? null,
		repliesOf: (p) => replies[p] ?? [],
		hasBaseSort: false,
	});

	test("replies the Base returns are not shown as top-level cards", () => {
		expect(threads.map((t) => t.root.path)).toEqual(["other.md", "parent.md"]);
	});

	test("replies from outside the Base results are attached to their parent, oldest first", () => {
		const t = threads.find((x) => x.root.path === "parent.md");
		expect(t?.replies.map((r) => r.path)).toEqual(["reply-outside.md", "reply-in-base.md"]);
	});

	test("a reply whose parent is not in the results is hidden", () => {
		expect(allCardPaths(threads)).not.toContain("orphan.md");
	});

	test("allCardPaths lists roots and replies", () => {
		expect(allCardPaths(threads)).toEqual([
			"other.md",
			"parent.md",
			"reply-outside.md",
			"reply-in-base.md",
		]);
	});

	test("ignores duplicate entries and self-replies", () => {
		const t = buildThreads({
			entries: [parent, parent],
			rootOf: () => null,
			repliesOf: () => [parent, replyOutside, replyOutside],
			hasBaseSort: true,
		});
		expect(t).toHaveLength(1);
		expect(t[0]?.replies.map((r) => r.path)).toEqual(["reply-outside.md"]);
	});
});
