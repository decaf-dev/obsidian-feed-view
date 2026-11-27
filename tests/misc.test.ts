import { describe, expect, test } from "bun:test";
import {
	anyExpanded,
	deserializeFolds,
	pruneFolds,
	renameFold,
	serializeFolds,
	setAllFolded,
	toggleFold,
} from "../src/model/folds";
import { countBodyLines, hiddenLinesLabel } from "../src/model/lines";
import { parseFeedMode } from "../src/model/mode";
import { nextUntitledName } from "../src/model/untitled";

describe("nextUntitledName", () => {
	test("Untitled in an empty folder", () => {
		expect(nextUntitledName(new Set())).toBe("Untitled");
	});

	test("counts up from 1, filling gaps", () => {
		expect(nextUntitledName(new Set(["untitled"]))).toBe("Untitled 1");
		expect(nextUntitledName(new Set(["untitled", "untitled 1", "untitled 3"]))).toBe("Untitled 2");
	});

	test("compares case-insensitively", () => {
		expect(nextUntitledName(new Set(["untitled"]))).toBe("Untitled 1");
	});
});

describe("countBodyLines", () => {
	test("counts non-blank lines only", () => {
		expect(countBodyLines("This is my test note\n\nwith\n\nsome\n\nline\n\nbreaks\n")).toBe(5);
	});

	test("handles CRLF and whitespace-only lines", () => {
		expect(countBodyLines("a\r\n   \r\nb\r\n\t\r\n")).toBe(2);
	});

	test("an empty body has no lines", () => {
		expect(countBodyLines("")).toBe(0);
		expect(countBodyLines("\n\n  \n")).toBe(0);
	});
});

describe("hiddenLinesLabel", () => {
	test("singular and plural", () => {
		expect(hiddenLinesLabel(1)).toBe("1 line hidden");
		expect(hiddenLinesLabel(0)).toBe("0 lines hidden");
		expect(hiddenLinesLabel(5)).toBe("5 lines hidden");
	});
});

describe("folds", () => {
	const paths = ["a.md", "b.md", "r.md"];

	test("toggle folds and unfolds without mutating", () => {
		const empty = new Set<string>();
		const folded = toggleFold(empty, "a.md");
		expect(folded.has("a.md")).toBeTrue();
		expect(empty.size).toBe(0);
		expect(toggleFold(folded, "a.md").has("a.md")).toBeFalse();
	});

	test("anyExpanded drives Collapse all / Expand all", () => {
		expect(anyExpanded(paths, new Set())).toBeTrue();
		expect(anyExpanded(paths, new Set(["a.md", "b.md"]))).toBeTrue();
		expect(anyExpanded(paths, new Set(paths))).toBeFalse();
		expect(anyExpanded([], new Set())).toBeFalse();
	});

	test("collapse all and expand all include replies and leave other paths alone", () => {
		const collapsed = setAllFolded(new Set(["elsewhere.md"]), paths, true);
		expect([...collapsed].sort()).toEqual(["a.md", "b.md", "elsewhere.md", "r.md"]);
		expect([...setAllFolded(collapsed, paths, false)]).toEqual(["elsewhere.md"]);
	});

	test("rename moves the fold", () => {
		expect([...renameFold(new Set(["a.md"]), "a.md", "z.md")]).toEqual(["z.md"]);
		expect([...renameFold(new Set(["b.md"]), "a.md", "z.md")]).toEqual(["b.md"]);
	});

	test("prune drops missing notes", () => {
		expect([...pruneFolds(new Set(["a.md", "gone.md"]), (p) => p !== "gone.md")]).toEqual(["a.md"]);
	});

	test("serialize and deserialize round-trip, ignoring junk", () => {
		expect(serializeFolds(new Set(["b.md", "a.md"]))).toEqual(["a.md", "b.md"]);
		expect([...deserializeFolds(["a.md", 3, "", null, "b.md"])]).toEqual(["a.md", "b.md"]);
		expect(deserializeFolds("nope").size).toBe(0);
		expect(deserializeFolds(null).size).toBe(0);
	});
});

describe("parseFeedMode", () => {
	test("keeps a known mode", () => {
		expect(parseFeedMode("live")).toBe("live");
		expect(parseFeedMode("reading")).toBe("reading");
	});

	test("falls back to Live preview for anything else", () => {
		expect(parseFeedMode(undefined)).toBe("live");
		expect(parseFeedMode("edit")).toBe("live");
		expect(parseFeedMode({ mode: "reading" })).toBe("live");
	});
});
