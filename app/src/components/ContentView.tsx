import { Component } from "preact";
import { signal } from "@preact/signals";
import { webgpuReady } from "../render/webgpu";
import Hammer from "hammerjs";
import { Pages, backgroundResize } from "./Pages";
import { add2, div2, div2s, sub2, vec2 } from "../lib/vec";
import { Vec2 } from "../lib/vectors";

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

let posX = 0;
let posY = 0;
let scale = 1;

function updateDocTransform() {
    if (documentNode) {
        documentNode.style.left = `${posX}px`;
        documentNode.style.top = `${posY}px`;
        documentNode.style.fontSize = `${scale}px`;
        zoomLevel.value = scale;
    }
}

function applyZoom(c: Vec2, value: number) {
    if (hostRect) {
        c = Vec2.sub(c, hostRectXY);
        posX = c.x - ((c.x - posX) / scale) * value;
        posY = c.y - ((c.y - posY) / scale) * value;
        scale = value;
    }
}

let hostRect: DOMRect = {
    height: 0,
    width: 0,
    x: 0,
    y: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    toJSON: function () {
        throw new Error("FakeDOMRect: toJSON Function not implemented.");
    }
};

let hostRectXY = new Vec2(0, 0);
let hostRectWH = new Vec2(0, 0);

let hostResizeObserver = new ResizeObserver(() => {
    if (documentNode?.parentElement) {
        hostRect = documentNode.parentElement.getBoundingClientRect();
        hostRectXY = new Vec2(hostRect.x, hostRect.y);
        hostRectWH = new Vec2(hostRect.width, hostRect.height);
    }
});

let debounceTimeout: number | null = null;

function handleDebounce() {
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => {
        backgroundResize.forEach($ => $());
    }, 500);
}

function buildDocument(node: HTMLDivElement) {
    if (documentNode) {
        disposeDocument(documentNode);
    }
    documentNode = node;
    const host = node.parentElement!;
    hostResizeObserver.disconnect();
    hostResizeObserver.observe(host);

    posX = 0;
    posY = 0;
    scale = 1;

    let lastEventX = 0;
    let lastEventY = 0;
    let lastEventScale = 1;



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
    hammer.on("panend", handleDebounce);
    hammer.on("pinchstart", ev => {
        lastEventX = 0;
        lastEventY = 0;
        lastEventScale = 1;
    });
    hammer.on("pinchmove", ev => {
        const deltaScale = 1 + (ev.scale - lastEventScale);
        applyZoom(new Vec2(ev.center.x, ev.center.y), scale * deltaScale);
        posX += ev.deltaX - lastEventX;
        posY += ev.deltaY - lastEventY;
        lastEventX = ev.deltaX;
        lastEventY = ev.deltaY;
        lastEventScale = ev.scale;
        updateDocTransform();
    });
    hammer.on("pinchend", handleDebounce);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    hammer.get('pinch').set({ enable: true });

    function onWheel(ev: WheelEvent) {
        // console.log(ev);
        if (ev.ctrlKey) {
            applyZoom(new Vec2(ev.clientX, ev.clientY), (1 - Math.max(-10, Math.min(10, ev.deltaY)) / 100) * scale);
        } else {
            posX -= ev.deltaX;
            posY -= ev.deltaY;
        }
        updateDocTransform();
        ev.preventDefault();
        handleDebounce();
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

export const zoomLevel = signal(1);

export function zoomIn() {
    applyZoom(new Vec2(window.innerWidth / 2, window.innerHeight / 2), scale * 1.1);
    updateDocTransform();
}

export function zoomOut() {
    scale *= .9;
    updateDocTransform();
}

export function zoomSet(value: number) {
    applyZoom(new Vec2(window.innerWidth / 2, window.innerHeight / 2), value);
    updateDocTransform();
}

export function isInView(pos: Vec2, size: Vec2) {
    if (pointInsideView(pos)) {
        return true;
    }
    if (pointInsideView(Vec2.add(pos, size))) {
        return true;
    }
    const viewXY = getDocumentPos(hostRectXY);
    const viewBR = getDocumentPos(Vec2.add(hostRectXY, hostRectWH));
    if ((pos.x < viewXY.x && pos.y < viewXY.y) && ((pos.x + size.x) > viewBR.x && (pos.y + size.y) > viewBR.y)) {
        return true;
    }
    return false;
}

function pointInsideView(pos: Vec2) {
    const viewXY = getDocumentPos(hostRectXY);
    const viewBR = getDocumentPos(Vec2.add(hostRectXY, hostRectWH));
    return !((pos.x < viewXY.x && pos.y < viewXY.y) || (pos.x > viewBR.x && pos.y > viewBR.y));
}

export function getDocumentPos(xy: Vec2) {
    return Vec2.div(Vec2.sub(Vec2.sub(xy, hostRectXY), new Vec2(posX, posY)), scale);
}

export function scrollRectIntoView(pos: Vec2, size = vec2(0, 0)) {

    // function isDisplayed(pos: vec2) {
    //     return !((pos[0] < viewXY[0] && pos[1] < viewXY[1]) || (pos[0] > viewBR[0] && pos[1] > viewBR[1]));
    // }
    // TODO
}
