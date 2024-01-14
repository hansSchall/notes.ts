import { signal } from "@preact/signals";

export enum OptionsMode {
    CLOSED,
    PAGE,
    LAYER,
}

export const importSidebar = signal(false);
export const pagesSidebar = signal(false);
export const selectedPage = signal("");
export const selectedLayer = signal("");
export const options = signal(false);
