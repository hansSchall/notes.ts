import { signal } from "@preact/signals";

export enum Tool {
    PENCIL,
    MARKER,
    ERASER,
}

export const tool = signal(Tool.PENCIL);

export const pencilThickness = signal(1);
export const markerThickness = signal(1);
export const eraserThickness = signal(1);

export function getActiveThickness() {
    switch (tool.value) {
        case Tool.PENCIL:
            return pencilThickness;
        case Tool.MARKER:
            return markerThickness;
        case Tool.ERASER:
            return eraserThickness;
    }
}

export const pencilColor = signal("#f00");
export const markerColor = signal("#f00");

export function getActiveColor() {
    switch (tool.value) {
        case Tool.PENCIL:
        case Tool.ERASER:
            return pencilColor;
        case Tool.MARKER:
            return markerColor;
    }
}
