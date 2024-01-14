import { Component } from "preact";
import { signal } from "@preact/signals";
import { webgpuReady } from "../render/webgpu";
import Hammer from "hammerjs";
import { Pages } from "./Pages";

export function reloadDocument() {
    rebuild();
}

export const updateContentView = signal(0);

let rebuild: VoidFunction = () => { };

export class ContentView extends Component {
    constructor() {
        super();
        if (import.meta.hot) {
            import.meta.hot.on("vite:afterUpdate", ev => {
                // this.forceUpdate();
                // console.log(ev);

                if (this.node && ev.updates.find($ => $.path === "/src/components/ContentView.tsx")) {
                    console.log("rebuild document");
                    buildDocument(this.node);
                }
            });
        }
    }
    node: HTMLDivElement | null = null;

    update = (node: HTMLDivElement | null) => {
        webgpuReady().then(() => {
            if (this.node !== node) {
                rebuild = () => {
                    if (this.node) {
                        disposeDocument(this.node);
                        buildDocument(this.node);
                    }
                };
                if (this.node) {
                    disposeDocument(this.node);
                }
                this.node = node;
                if (this.node) {
                    buildDocument(this.node);
                }
            }
        });
    };

    render() {
        return <div ref={this.update} id={`content-view`}>
            <Pages />
        </div>;
    }
}

export let documentNode: HTMLDivElement | null = null;

let removeListener: VoidFunction | null = null;

function buildDocument(node: HTMLDivElement) {
    if (documentNode) {
        disposeDocument(documentNode);
    }
    documentNode = node;
    const host = node.parentElement!;
    // console.log("build", node);

    let posX = 0;
    let posY = 0;
    let scale = 1;

    let lastEventX = 0;
    let lastEventY = 0;
    let lastEventScale = 1;

    function applyZoom(cX: number, cY: number, value: number) {
        const rect = host.getBoundingClientRect();
        cX -= rect.x;
        cY -= rect.y;
        posX = cX - ((cX - posX) / scale) * value;
        posY = cY - ((cY - posY) / scale) * value;
        scale = value;
    }

    function updateDocTransform() {
        node.style.left = `${posX}px`;
        node.style.top = `${posY}px`;
        node.style.fontSize = `${scale}px`;
    }

    updateDocTransform();

    const hammer = new Hammer(host, {

    });
    hammer.on("panstart", ev => {
        lastEventX = 0;
        lastEventY = 0;
    });
    hammer.on("pan", ev => {
        posX += ev.deltaX - lastEventX;
        posY += ev.deltaY - lastEventY;
        lastEventX = ev.deltaX;
        lastEventY = ev.deltaY;
        updateDocTransform();
    });
    hammer.on("pinchstart", ev => {
        lastEventX = 0;
        lastEventY = 0;
        lastEventScale = 1;
    });
    hammer.on("pinchmove", ev => {
        const deltaScale = 1 + (ev.scale - lastEventScale);
        applyZoom(ev.center.x, ev.center.y, scale * deltaScale);
        posX += ev.deltaX - lastEventX;
        posY += ev.deltaY - lastEventY;
        lastEventX = ev.deltaX;
        lastEventY = ev.deltaY;
        lastEventScale = ev.scale;
        updateDocTransform();
    });
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    hammer.get('pinch').set({ enable: true });

    function onWheel(ev: WheelEvent) {
        // console.log(ev);
        if (ev.ctrlKey) {
            applyZoom(ev.clientX, ev.clientY, (1 - Math.max(-10, Math.min(10, ev.deltaY)) / 100) * scale);
        } else {
            posX -= ev.deltaX;
            posY -= ev.deltaY;
        }
        updateDocTransform();
        ev.preventDefault();
    }
    host.addEventListener("wheel", onWheel);

    removeListener = () => {
        hammer.destroy();
        host.removeEventListener("wheel", onWheel);
    };
}


function disposeDocument(node: HTMLDivElement) {
    removeListener?.();
    documentNode = null;
}
