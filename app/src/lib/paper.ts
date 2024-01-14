import { signal } from "@preact/signals";

export interface PaperFormat {
    label: string;
    height: number;
    width: number;
}

export const paperFormat = new Map<string, PaperFormat>();

paperFormat.set("a3", {
    label: "A3",
    height: 420,
    width: 297,
});

paperFormat.set("a4", {
    label: "A4",
    height: 297,
    width: 210,
});

paperFormat.set("a5", {
    label: "A5",
    height: 210,
    width: 148,
});

paperFormat.set("a6", {
    label: "A6",
    height: 148,
    width: 105,
});

export const defaultPaper = paperFormat.get("a4")!;

export const pxPerMm = signal(parseFloat(localStorage.getItem("px/mm") || "") || 5);
