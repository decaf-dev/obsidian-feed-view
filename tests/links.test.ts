import { describe, expect, test } from "bun:test";
import { parseWikilink } from "../src/model/links";

describe("parseWikilink", () => {
	test("wikilinks, with and without an alias", () => {
		expect(parseWikilink("[[test-note-1]]")).toBe("test-note-1");
		expect(parseWikilink("[[folder/Note|Shown name]]")).toBe("folder/Note");
		expect(parseWikilink("  [[ spaced ]]  ")).toBe("spaced");
	});

	test("keeps heading and block subpaths for the link resolver to strip", () => {
		expect(parseWikilink("[[Note#Heading]]")).toBe("Note#Heading");
	});

	test("a bare note name", () => {
		expect(parseWikilink("test-note-1")).toBe("test-note-1");
	});

	test("the first item of a list", () => {
		expect(parseWikilink(["[[first]]", "[[second]]"])).toBe("first");
	});

	test("nothing usable", () => {
		expect(parseWikilink("")).toBeNull();
		expect(parseWikilink("[[]]")).toBeNull();
		expect(parseWikilink("[[|alias]]")).toBeNull();
		expect(parseWikilink(null)).toBeNull();
		expect(parseWikilink(42)).toBeNull();
		expect(parseWikilink([])).toBeNull();
	});
});
