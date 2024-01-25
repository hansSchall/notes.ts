import { Vec2, Vec4 } from "../lib/vectors";
import { WeakGridFormat } from "./webgpu";

export const gridFormats = new Map<string, () => WeakGridFormat>();

gridFormats.set("grid", () => ({
    border: new Vec4(0, 0, 0, 0),
    grid: new Vec2(5, 5),
    lineWidth: new Vec2(.4, .4),
}));

gridFormats.set("grid-border", () => ({
    border: new Vec4(15, 15, 15, 15),
    grid: new Vec2(5, 5),
    lineWidth: new Vec2(.4, .4),
}));

gridFormats.set("lines", () => ({
    border: new Vec4(0, 0, 0, 0),
    grid: new Vec2(100000, 10),
    lineWidth: new Vec2(0, .4),
}));

gridFormats.set("lines-border", () => ({
    border: new Vec4(15, 15, 15, 15),
    grid: new Vec2(100000, 10),
    lineWidth: new Vec2(0, .4),
}));

gridFormats.set("lines-border-right", () => ({
    border: new Vec4(5, 15, 50, 5),
    grid: new Vec2(100000, 10),
    lineWidth: new Vec2(0, .4),
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
    return Vec4.eq(a.border, b.border) && Vec2.eq(a.grid, b.grid) && Vec2.eq(a.lineWidth, b.lineWidth);
}
