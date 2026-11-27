import { describe, expect, test } from "bun:test";
import { MAX_CUSTOM_WIDTH, MIN_CUSTOM_WIDTH, parseCustomWidth, parseWidthMode } from "../src/model/width";

describe("parseWidthMode", () => {
	test("keeps known modes", () => {
		expect(parseWidthMode("default")).toBe("default");
		expect(parseWidthMode("full")).toBe("full");
		expect(parseWidthMode("custom")).toBe("custom");
	});

	test("falls back to default for anything else", () => {
		expect(parseWidthMode(undefined)).toBe("default");
		expect(parseWidthMode("wide")).toBe("default");
		expect(parseWidthMode(true)).toBe("default");
	});
});

describe("parseCustomWidth", () => {
	test("defaults to 100% when missing or not a number", () => {
		expect(parseCustomWidth(undefined)).toBe(100);
		expect(parseCustomWidth("80")).toBe(100);
		expect(parseCustomWidth(Number.NaN)).toBe(100);
	});

	test("keeps values in range and clamps the rest", () => {
		expect(parseCustomWidth(70)).toBe(70);
		expect(parseCustomWidth(5)).toBe(MIN_CUSTOM_WIDTH);
		expect(parseCustomWidth(250)).toBe(MAX_CUSTOM_WIDTH);
		expect(parseCustomWidth(72.4)).toBe(72);
	});
});
