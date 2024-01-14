import { useEffect, useMemo, useReducer, useRef, useState } from "preact/hooks";
import { loadOpenCV } from "../../controller/loader/opencv";
import { paperFormat } from "../../lib/paper";
import { vec2 } from "../../lib/vec";
import { GPUImporter } from "../../render/importer";
import useResizeObserver from "use-resize-observer";

// @ts-ignore
const scanner = new jscanify();

enum Corner {
    A, B, C, D
}

export function DocumentImport(p: {
    srcImg: URL,
    close: VoidFunction,
}) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const gpu = useRef<GPUImporter | null>(null);
    const container = useRef<HTMLDivElement>(null);
    const img = useRef<HTMLImageElement>(null);

    const [width, setWidth] = useState(paperFormat.get("a4")!.width);
    const [height, setHeight] = useState(paperFormat.get("a4")!.height);
    const landscape = useMemo(() => width > height, [width, height]);
    const [rotation, rotate] = useReducer<number, number>((prev, rotation) => (prev + rotation) % 360, 0);
    const { height: canvasHeight, width: canvasWidth } = useResizeObserver({ ref: canvas });




    const corners = [
        useState(vec2(.0, .1)),
        useState(vec2(1, .3)),
        useState(vec2(1, 1)),
        useState(vec2(0, 1)),
    ] as const;
    const active = useRef<Corner | null>(null);

    function matchFormat(fW: number, fH: number) {
        return ((fW === width && fH === height) || (fH === width && fW === height));
    }
    useEffect(() => {
        loadOpenCV();
        return () => {
            // gpu.current?.destroy();
        };
    }, []);

    useEffect(() => {
        // (async () => {
        //     console.warn("A");
        //     const data = await loadTexture(p.srcImg);
        //     console.log(data);

        //     // canvas.current!.width = data.width;
        //     // canvas.current!.height = data.height;

        //     await webgpuReady();
        //     console.log("B", gpu.current);
        //     gpu.current?.destroy();
        //     gpu.current = new GPUImporter(canvas.current!, data);
        //     render();
        // })();
        return () => {
            // gpu.current?.destroy();
        };
    }, []);

    useEffect(() => {
        // canvas.current!.width = canvasWidth || 100;
        // canvas.current!.height = canvasHeight || 100;
        render();
    }, [...corners.map($ => $[0]), canvasWidth, canvasHeight]);

    const pending = useRef(false);

    function render() {
        if (pending.current) {
            return;
        }
        pending.current = true;
        requestAnimationFrame(() => {
            gpu.current?.render({
                frame: [corners[0][0], corners[1][0], corners[2][0], corners[3][0]],
                mode: 0,
            });
            pending.current = false;
        });
    }

    function point(id: Corner) {
        return <div class={`-point`} style={{
            left: `${corners[id][0][0] * 100}%`,
            top: `${corners[id][0][1] * 100}%`,
            // pointerEvents: active.current === id ? "unset" : "none"
        }} onPointerDown={ev => {
            active.current = id;
            console.log(`pointerdown ${id}`, ev);
        }}></div>;
    }

    return <div class={`document-import`}>
        <div class={`di-wrapper`}>
            {/* <div class={`-header`}>
                <div class={`-icon`}><i class={`bi-x-lg`} /></div>
            </div> */}
            <div
                class={`-content`}
                ref={container}
                onPointerUp={ev => {
                    active.current = null;
                    console.log(`pointer up`);
                    ev.stopPropagation();
                    ev.preventDefault();
                }}
                onPointerLeave={ev => {
                    if (ev.target !== container.current) {
                        // return;
                    }
                    active.current = null;
                    console.log(`pointer LEAVE`, ev);
                }}
                onPointerMove={ev => {
                    if (active.current !== null && img.current) {
                        const rect = img.current.getBoundingClientRect();
                        function toUV(x: number, y: number) {
                            return vec2((x - rect.x) / rect.width, (y - rect.y) / rect.height);
                        }
                        corners[active.current][1](toUV(ev.clientX, ev.clientY));
                        // corners[active.current][1](vec2())
                    }
                }}
            >
                {/* <img src={p.srcImg.href} alt={`scanned`} /> */}
                <img ref={img} src={p.srcImg.href} alt={`scanned`} onLoad={() => {
                    loadOpenCV().then(() => {
                        // if (highlichtCanvas.current && img.current) {
                        //     const ctx = highlichtCanvas.current.getContext("2d");
                        //     if (!ctx) {
                        //         return;
                        //     }
                        //     console.log(img.current);
                        //     const resultCanvas = scanner.extractPaper(img.current, img.current.width, img.current.height);
                        //     console.log(resultCanvas);
                        //     ctx.canvas.width = img.current.width;
                        //     ctx.canvas.height = img.current.height;
                        //     ctx.drawImage(resultCanvas, 0, 0);
                        // }
                        console.log(img);
                        //@ts-ignore
                        const corner = (scanner.getCornerPoints(scanner.findPaperContour(cv.imread(img.current))));
                        const w = img.current?.width || 0;
                        const h = img.current?.height || 0;
                        corners[Corner.A][1](vec2(corner.topLeftCorner.x / w, corner.topLeftCorner.y / h));
                        corners[Corner.B][1](vec2(corner.topRightCorner.x / w, corner.topRightCorner.y / h));
                        corners[Corner.C][1](vec2(corner.bottomRightCorner.x / w, corner.bottomRightCorner.y / h));
                        corners[Corner.D][1](vec2(corner.bottomLeftCorner.x / w, corner.bottomLeftCorner.y / h));
                    });
                }} style={{
                    transform: `rotate(${rotation}deg)`,
                }}></img>
                {/* <canvas ref={canvas}></canvas> */}
                <div class={`-overlay`}>
                    {point(Corner.A)}
                    {point(Corner.B)}
                    {point(Corner.C)}
                    {point(Corner.D)}
                </div>
                {/* <canvas ref={highlichtCanvas}></canvas> */}
            </div>
            <div class={`-sidebar`}>
                <div class={`di-option`}>
                    <div class={`-label`}>Format</div>
                    <div class={`-box`}>
                        {[...paperFormat.entries()].map(([id, { width, height, label }]) => <div class={`-button ${matchFormat(width, height) ? "-active" : "-inactive"}`} onClick={() => {
                            if (landscape) {
                                setHeight(width);
                                setWidth(height);
                            } else {
                                setHeight(height);
                                setWidth(width);
                            }
                        }} key={id}>{label}</div>)}
                        {/* <div class={`-button`}>A3</div>
                        <div class={`-button`}>A4</div>
                        <div class={`-button`}>A5</div>
                        <div class={`-button`}>A6</div> */}
                    </div>
                </div>
                <div class={`di-option`}>
                    <div class={`-label`}>Ausrichtung</div>
                    <div class={`-box`}>
                        <div class={`-button ${landscape ? "-inactive" : "-active"}`} onClick={() => {
                            if (width > height) {
                                setHeight(width);
                                setWidth(height);
                            }
                        }}><i class={`bi-phone`} /></div>
                        <div class={`-button ${landscape ? "-active" : "-inactive"}`} onClick={() => {
                            if (width < height) {
                                setHeight(width);
                                setWidth(height);
                            }
                        }}><i class={`bi-phone-landscape`} /></div>
                    </div>
                </div>
                <div class={`di-option`}>
                    <div class={`-label`}>Höhe (mm)</div>
                    <div class={`-box`}>
                        <input type={`number`} value={height} onInput={ev => setHeight(parseFloat((ev.target as HTMLInputElement).value))} />
                    </div>
                </div>
                <div class={`di-option`}>
                    <div class={`-label`}>Breite (mm)</div>
                    <div class={`-box`}>
                        <input type={`number`} value={width} onInput={ev => setWidth(parseFloat((ev.target as HTMLInputElement).value))} />
                    </div>
                </div>
                <div class={`di-option`}>
                    <div class={`-label`}>Drehen</div>
                    <div class={`-box`}>
                        <div class={`-button`} onClick={() => rotate(90)}><i class={`bi-arrow-clockwise`} /></div>
                        <div class={`-button`} onClick={() => rotate(-90)}><i class={`bi-arrow-counterclockwise`} /></div>
                    </div>
                </div>
                <div class={`di-option`}>
                    <div class={`-label`}>Filter</div>
                    <div class={`-box`}>
                        <div class={`-button`}><i class={`bi-image`} /></div>
                        <div class={`-button`}><i class={`bi-file-earmark-break`} /></div>
                        <div class={`-button`}><i class={`bi-circle-half`} /></div>
                    </div>
                </div>
                <div class={`di-option -buttons`}>
                    <div class={`-button -ok`} onClick={p.close}>OK</div>
                    <div class={`-button -cancel`} onClick={p.close}>Abbrechen</div>
                </div>
            </div>
        </div>
    </div>;
}
