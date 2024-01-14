import { Signal, signal } from "@preact/signals";
import { z } from "zod";
import { defaultPaper } from "../lib/paper";
import { ArrayUpdate, Assign, S } from "../lib/signal";
import { defaultGridFormat } from "../render/grids";
import { WeakGridFormat } from "../render/webgpu";
import { vec2 } from "../lib/vec";

// used instead of uuid to mark the element before the first one
const MARKER_FIRST = "#first";

export const DocumentPage = z.object({
    uid: z.string().uuid(),
    width: z.number().positive(),
    height: z.number().positive(),
});
export type DocumentPage = z.infer<typeof DocumentPage>;

export const Document = z.object({
    lastEdit: z.number(),
    pages: z.array(DocumentPage),
    assets: z.array(z.object({
        id: z.string(),
        mime: z.string(),
        data: z.instanceof(Uint8Array),
    })),
});
export type Document = z.infer<typeof Document>;

export const documentChanged = signal(false);

const history: HistoryAction[] = [];
let historyPointer = -1;

export const undoAvailable = signal(false);
export const redoAvailable = signal(false);

export const lastChanged = signal(Date.now());

export const historyLog = signal<string[]>([]);
export const historyLogPointer = signal(0);

function updateUndoRedoAvailable() {
    undoAvailable.value = !!(history[historyPointer]);
    redoAvailable.value = !!(history[historyPointer + 1]);
    historyLogPointer.value = historyPointer;
}

export function undo() {
    if (S(undoAvailable)) {
        history[historyPointer]?.undo();
        historyPointer--;
        didChange();
        updateUndoRedoAvailable();
    }
}

export function redo() {
    if (S(redoAvailable)) {
        historyPointer++;
        history[historyPointer]?.redo();
        didChange();
        updateUndoRedoAvailable();
    }
}

function didChange() {
    lastChanged.value = Date.now();
    documentChanged.value = true;
}

export function pushHistory(action: HistoryAction) {
    historyPointer++;
    while (history.length > historyPointer) {
        history.pop();
    }
    history[historyPointer] = action;
    didChange();
    historyLog.value = history.map($ => $.label || "Action");
    updateUndoRedoAvailable();
}

export function mergeHistoryAction(actions: HistoryAction[]): HistoryAction {
    return {
        undo() {
            for (const action of actions) {
                action.undo();
            }
        },
        redo() {
            for (const action of actions) {
                action.redo();
            }
        }
    };
}

interface HistoryAction {
    label?: string,
    timestamp?: number,
    target?: unknown,
    undo(): void;
    redo(): void;
}

export enum PageLayerType {
    IMG,
    PATTERN,
    DRAW,
    OBJECT,
    TEXT,
}

export abstract class PageLayerModel {
    constructor(readonly uid: string, readonly type: PageLayerType) {

    }
    pack() {
        return {
            uid: this.uid,
            type: this.type,
        };
    }
}

export class PageImgLayerModel extends PageLayerModel {
    constructor(uid: string) {
        super(uid, PageLayerType.IMG);
    }
    src = signal("");
    // height = signal(0);
    pack() {
        return {
            ...super.pack(),
            src: S(this.src),
        };
    }
}

export class PagePatternLayerModel extends PageLayerModel {
    constructor(uid: string) {
        super(uid, PageLayerType.PATTERN);
    }
    pattern = signal<WeakGridFormat>(defaultGridFormat());
    // height = signal(0);
    pack() {
        return {
            ...super.pack(),
            ...this.pattern.value,
        };
    }
}

export class PageDrawLayerModel extends PageLayerModel {
    constructor(uid: string) {
        super(uid, PageLayerType.DRAW);
    }
    pack() {
        return {
            ...super.pack(),
        };
    }
}

export class PageObjectLayerModel extends PageLayerModel {
    constructor(uid: string) {
        super(uid, PageLayerType.OBJECT);
    }
    pack() {
        return {
            ...super.pack(),
        };
    }
}

export class PageTextLayerModel extends PageLayerModel {
    constructor(uid: string) {
        super(uid, PageLayerType.OBJECT);
    }
    pack() {
        return {
            ...super.pack(),
        };
    }
}

function getLayerConstructor(type: PageLayerType): {
    new(uid: string): PageLayerModel;
} {
    switch (type) {
        case PageLayerType.IMG:
            return PageImgLayerModel;
        case PageLayerType.PATTERN:
            return PagePatternLayerModel;
        case PageLayerType.DRAW:
            return PageDrawLayerModel;
        case PageLayerType.OBJECT:
            return PageObjectLayerModel;
        case PageLayerType.TEXT:
            return PageTextLayerModel;
    }
}

export class PageModel {
    constructor(readonly uid: string) {

    }
    size = signal(vec2(defaultPaper.width, defaultPaper.height));
    label = signal("");
    layers = signal<PageLayerModel[]>([new PageImgLayerModel(crypto.randomUUID()), new PagePatternLayerModel(crypto.randomUUID())]);
    pack(): DocumentPage {
        return {
            uid: this.uid,
            width: S(this.size)[0],
            height: S(this.size)[1],
        };
    }

    private $insertLayer(newLayer: PageLayerModel, position: string) {
        const layers = this.layers;
        if (S(layers).length) {
            let inserted = false;
            ArrayUpdate(layers, function* (layers) {
                for (const existing of layers) {
                    if (inserted) {
                        yield existing;
                    } else {
                        if (position === MARKER_FIRST) {
                            yield newLayer;
                            inserted = true;
                        }
                        yield existing;
                        if (existing.uid === position) {
                            yield newLayer;
                            inserted = true;
                        }
                    }
                }
                if (!inserted) {
                    yield newLayer;
                }
            });
        } else {
            Assign(layers, [newLayer]);
        }
        return newLayer;
    }

    private $removeLayer(layer: PageLayerModel) {
        ArrayUpdate(this.layers, function* (layers) {
            for (const item of layers) {
                if (item !== layer) {
                    yield item;
                }
            }
        });
    }

    private $moveBack(layer: PageLayerModel) {
        ArrayUpdate(this.layers, function* (layers) {
            let tmp: PageLayerModel | null = null;
            for (const item of layers) {
                if (item === layer) {
                    tmp = item;
                } else {
                    yield item;
                    if (tmp) {
                        yield tmp;
                        tmp = null;
                    }
                }
            }
            if (tmp) {
                yield tmp;
            }
        });
    }

    private $moveForward(layer: PageLayerModel) {
        ArrayUpdate(this.layers, function* (layers) {
            let tmp: PageLayerModel | null = null;
            for (const item of layers) {
                if (item === layer) {
                    yield item;
                }
                if (tmp) {
                    yield tmp;
                    tmp = null;
                }
                if (item !== layer) {
                    tmp = item;
                }
            }
            if (tmp) {
                yield tmp;
            }
        });
    }

    addLayer(after: string = "", type: PageLayerType) {
        const layer = new (getLayerConstructor(type))(crypto.randomUUID());
        this.$insertLayer(layer, after);
        pushHistory({
            undo: () => {
                this.$removeLayer(layer);
            },
            redo: () => {
                this.$insertLayer(layer, after);
            }
        });
        return layer.uid;
    }

    removeLayer(id: string) {
        let pos = MARKER_FIRST;
        const layer = S(this.layers).find($ => (pos = $.uid) === id);
        if (!layer) {
            return;
        }
        this.$removeLayer(layer);
        pushHistory({
            undo: () => {
                this.$insertLayer(layer, pos);
            },
            redo: () => {
                this.$removeLayer(layer);
            }
        });
    }

    moveLayerBack(id: string) {
        const layer = S(this.layers).find($ => $.uid === id);
        if (!layer) {
            return;
        }
        this.$moveBack(layer);
        pushHistory({
            undo: () => {
                this.$moveForward(layer);
            },
            redo: () => {
                this.$moveBack(layer);
            }
        });
    }

    moveLayerForward(id: string) {
        const layer = S(this.layers).find($ => $.uid === id);
        if (!layer) {
            return;
        }
        this.$moveForward(layer);
        pushHistory({
            undo: () => {
                this.$moveBack(layer);
            },
            redo: () => {
                this.$moveForward(layer);
            }
        });
    }

    setPageSize(size: vec2) {
        const oldSize = S(this.size);
        if (oldSize[0] === size[0] && oldSize[1] === size[1]) {
            return;
        }
        this.size.value = size;

        pushHistory({
            undo: () => {
                this.size.value = oldSize;
            },
            redo: () => {
                this.size.value = size;
            },
        });
    }

    setLabel(label: string) {
        const oldLabel = S(this.label);
        if (oldLabel === label) {
            return;
        }

        Assign(this.label, label);

        pushHistory({
            undo: () => {
                Assign(this.label, oldLabel);
            },
            redo: () => {
                Assign(this.label, label);
            },
        });
    }
}

export class AssetModel {
    constructor(readonly id: string, data: Uint8Array, mime: string) {
        this.data = signal(data);
        this.mime = signal(mime);
    }
    data: Signal<Uint8Array>;
    mime: Signal<string>;
}

export class DocumentModel {
    pages = signal<PageModel[]>([]);
    assets = signal<AssetModel[]>([]);
    name = signal("Untitled");

    empty() {
        this.name.value = "untitled journal";
        this.pages.value = [new PageModel(crypto.randomUUID()), new PageModel(crypto.randomUUID())];
        this.assets.value = [];
        didChange();
        documentChanged.value = false;
        while (history.length) {
            history.pop();
        }
        historyPointer = -1;
        updateUndoRedoAvailable();
    }

    pack(): Document {
        return {
            lastEdit: S(lastChanged),
            pages: S(this.pages).map($ => $.pack()),
            assets: [],
        };
    }

    private $insertPage(newPage: PageModel, position: string) {
        const pages = this.pages;
        if (S(pages).length) {
            let inserted = false;
            ArrayUpdate(pages, function* (pages) {
                for (const existing of pages) {
                    if (inserted) {
                        yield existing;
                    } else {
                        if (position === MARKER_FIRST) {
                            yield newPage;
                            inserted = true;
                        }
                        yield existing;
                        if (existing.uid === position) {
                            yield newPage;
                            inserted = true;
                        }
                    }
                }
                if (!inserted) {
                    yield newPage;
                }
            });
        } else {
            Assign(pages, [newPage]);
        }
        return newPage;
    }

    private $removePage(page: PageModel) {
        ArrayUpdate(this.pages, function* (pages) {
            for (const item of pages) {
                if (item !== page) {
                    yield item;
                }
            }
        });
    }

    private $moveBack(page: PageModel) {
        ArrayUpdate(this.pages, function* (pages) {
            let tmp: PageModel | null = null;
            for (const item of pages) {
                if (item === page) {
                    tmp = item;
                } else {
                    yield item;
                    if (tmp) {
                        yield tmp;
                        tmp = null;
                    }
                }
            }
            if (tmp) {
                yield tmp;
            }
        });
    }

    private $moveForward(page: PageModel) {
        ArrayUpdate(this.pages, function* (pages) {
            let tmp: PageModel | null = null;
            for (const item of pages) {
                if (item === page) {
                    yield item;
                }
                if (tmp) {
                    yield tmp;
                    tmp = null;
                }
                if (item !== page) {
                    tmp = item;
                }
            }
            if (tmp) {
                yield tmp;
            }
        });
    }

    addPage(after: string = "") {
        const page = new PageModel(crypto.randomUUID());
        this.$insertPage(page, after);
        pushHistory({
            undo: () => {
                this.$removePage(page);
            },
            redo: () => {
                this.$insertPage(page, after);
            }
        });
        return page.uid;
    }

    removePage(id: string) {
        let pos = MARKER_FIRST;
        const page = S(this.pages).find($ => (pos = $.uid) === id);
        if (!page) {
            return;
        }
        this.$removePage(page);
        pushHistory({
            undo: () => {
                this.$insertPage(page, pos);
            },
            redo: () => {
                this.$removePage(page);
            }
        });
    }

    movePageBack(id: string) {
        const page = S(this.pages).find($ => $.uid === id);
        if (!page) {
            return;
        }
        this.$moveBack(page);
        pushHistory({
            undo: () => {
                this.$moveForward(page);
            },
            redo: () => {
                this.$moveBack(page);
            }
        });
    }

    movePageForward(id: string) {
        const page = S(this.pages).find($ => $.uid === id);
        if (!page) {
            return;
        }
        this.$moveForward(page);
        pushHistory({
            undo: () => {
                this.$moveBack(page);
            },
            redo: () => {
                this.$moveForward(page);
            }
        });
    }

    appendAsset(id: string, data: Uint8Array, mime: string): HistoryAction {
        this.assets.value = [...this.assets.value, new AssetModel(id, data, mime)];
        didChange();
        return {
            undo: () => {
                this.removeAsset(id);
            },
            redo: () => {
                this.appendAsset(id, data, mime);
            }
        };
    }

    removeAsset(id: string): HistoryAction | null {
        const toRemove = this.assets.value.find($ => $.id === id);
        if (!toRemove) {
            return null;
        }
        this.assets.value = [...this.assets.value.filter($ => $ !== toRemove)];
        didChange();
        return {
            undo: () => {
                this.appendAsset(id, toRemove.data.value, toRemove.mime.value);
            },
            redo: () => {
                this.removeAsset(id);
            }
        };
    }
}

export const journal = new DocumentModel();
journal.empty();
console.log("empty doc");
