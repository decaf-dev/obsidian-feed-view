// Minimal types for Bun's built-in test runner, so `tsc` and `svelte-check`
// can type-check the tests without adding `bun-types` as a dependency.
declare module "bun:test" {
	interface Matchers {
		not: Matchers;
		toBe(expected: unknown): void;
		toEqual(expected: unknown): void;
		toBeNull(): void;
		toBeTrue(): void;
		toBeFalse(): void;
		toHaveLength(length: number): void;
		toContain(item: unknown): void;
	}
	export function describe(name: string, fn: () => void): void;
	export function test(name: string, fn: () => void | Promise<void>): void;
	export function expect(actual: unknown): Matchers;
}
