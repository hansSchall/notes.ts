import { vec2, vec4 } from "../lib/vec";
import { WeakGridFormat } from "./webgpu";

export const gridFormats = new Map<string, () => WeakGridFormat>();

gridFormats.set("grid", () => ({
    border: vec4(0, 0, 0, 0),
    grid: vec2(5, 5),
    lineWidth: vec2(.4, .4),
}));

gridFormats.set("grid-border", () => ({
    border: vec4(15, 15, 15, 15),
    grid: vec2(5, 5),
    lineWidth: vec2(.4, .4),
}));

gridFormats.set("lines", () => ({
    border: vec4(0, 0, 0, 0),
    grid: vec2(10, 10),
    lineWidth: vec2(0, .4),
}));

gridFormats.set("lines-border", () => ({
    border: vec4(15, 15, 15, 15),
    grid: vec2(10, 10),
    lineWidth: vec2(0, .4),
}));

gridFormats.set("lines-border-right", () => ({
    border: vec4(5, 15, 50, 5),
    grid: vec2(10, 10),
    lineWidth: vec2(0, .4),
}));

export const defaultGridFormat = gridFormats.get("grid-border")!;

export const gridFormatLabel = new Map([
    ["grid", "Kariert ohne Rand"],
    ["grid-border", "Kariert mit Rand"],
    ["lines", "Liniert ohne Rand"],
    ["lines-border", "Liniert mit Rand"],
    ["lines-border-right", "Liniert mit Rand rechts"],
]);

export function gridFormatEquals(a: WeakGridFormat, b: WeakGridFormat) {
    return (
        a.border[0] === b.border[0] &&
        a.border[1] === b.border[1] &&
        a.border[2] === b.border[2] &&
        a.border[3] === b.border[3] &&
        a.grid[0] === b.grid[0] &&
        a.grid[1] === b.grid[1] &&
        a.lineWidth[0] === b.lineWidth[0] &&
        a.lineWidth[1] === b.lineWidth[1]
    );
}
