import { setIcon, type Value } from "obsidian";

/** `use:icon={"chevron-down"}` renders an Obsidian (Lucide) icon into the element. */
export function icon(node: HTMLElement, name: string) {
	setIcon(node, name);
	return {
		update(next: string) {
			if (next !== name) {
				name = next;
				setIcon(node, name);
			}
		},
	};
}

interface RenderValueParams {
	value: Value | string;
	signature: string;
	render: (el: HTMLElement, value: Value | string) => void;
}

/**
 * `use:renderValue={{ value, signature, render }}` renders a Bases value into
 * the element, re-rendering only when its signature changes (Value objects
 * are recreated on every data update).
 */
export function renderValue(node: HTMLElement, params: RenderValueParams) {
	let signature = params.signature;
	params.render(node, params.value);
	return {
		update(next: RenderValueParams) {
			if (next.signature === signature) return;
			signature = next.signature;
			next.render(node, next.value);
		},
	};
}
