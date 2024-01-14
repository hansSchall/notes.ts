import EditorJS from "@editorjs/editorjs";
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import EJLaTeX from "editorjs-latex";
import { DocumentPage } from "../controller/document";
import { paperFormat, pxPerMm } from "../lib/paper";
import { WebGPUBackgroundLayer, WebGPUBackgroundStyle } from "../render/webgpu";

export const pages = new Set<Page>();

export class Page {
    constructor(readonly page: DocumentPage) {
        this.node = document.createElement("div");
        this.node.className = "page";

        // this.canvas = document.createElement("canvas");
        // this.node.appendChild(this.canvas);
        this.background = new WebGPUBackgroundLayer();
        this.background.canvas.className = `-canvas`;
        this.node.appendChild(this.background.canvas);

        this.editorNode = document.createElement("div");
        this.editorNode.className = `-editor`;
        // this.node.appendChild(this.editorNode);

        this.editor = new EditorJS({
            holder: this.editorNode,
            tools: {
                header: {
                    class: Header as any,
                    // inlineToolbar: ['link']
                },
                list: {
                    class: List,
                    inlineToolbar: true
                },
                latex: {
                    class: EJLaTeX
                }
            },
        });


        pages.add(this);
    }
    updateFormat() {
        const format = paperFormat.get(this.page.format);
        if (!format) {
            console.error(`Unknown paper format ${this.page.format}`);
            return;
        }
        this.node.style.width = `${format.width * pxPerMm}em`;
        this.node.style.height = `${format.height * pxPerMm}em`;
        this.background.setPageDimensions(format.width, format.height);
        this.background.render(WebGPUBackgroundStyle.GRID_BORDER, [1, 1, 1, 1], [.5, .5, .5, 1]);
    }
    readonly editor: EditorJS;
    readonly node: HTMLDivElement;
    readonly editorNode: HTMLDivElement;
    // readonly canvas: HTMLCanvasElement;
    readonly background: WebGPUBackgroundLayer;
    dispose() {
        this.node.remove();
        this.editor.destroy();
        pages.delete(this);
    }
}
