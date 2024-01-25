import { useEffect, useMemo, useRef } from "preact/hooks";
import { PageLayerModel, PageLayerType, PageModel, PagePatternLayerModel, journal } from "../controller/document";
import { pxPerMm } from "../lib/paper";
import { S } from "../lib/signal";
import { RenderStatus, WeakGridFormat, WebGPUBackgroundLayer, WebGPUGraphicsLayer, renderStatus } from "../render/webgpu";
import { defaultGridFormat } from "../render/grids";
import { Vec4 } from "../lib/vectors";

export function Pages() {
    return <>
        {S(journal.pages).map(page => <Page page={page} />)}
    </>;
}

function Page(p: {
    page: PageModel;
}) {
    const { page } = p;
    return <div class={`page`} style={{
        width: `${S(page.size)[0] * S(pxPerMm)}em`,
        height: `${S(page.size)[1] * S(pxPerMm)}em`,
    }}>
        {S(page.layers).map(layer => <Layer layer={layer} page={page} />)}
    </div>;
}


function Layer(p: {
    layer: PageLayerModel,
    page: PageModel,
}) {
    const { layer, page } = p;
    if (layer instanceof PagePatternLayerModel) {
        return <PatternLayer layer={layer} page={page} />;
    }
    return <p style={{
        fontSize: "1rem",
    }}>
        <div>{PageLayerType[layer.type]}</div>
        <div>{layer.uid}</div>
    </p>;
}

export const backgroundResize = new Set<VoidFunction>();

interface PatternGPUOptions {
    readonly backgroundColor: Vec4,
    readonly lineColor: Vec4,
    readonly grid: WeakGridFormat,
}

function useWebGPU<T extends WebGPUGraphicsLayer>(cls: {
    new(): T;
}, page: PageModel) {
    const rnd = useRef<T | null>(null);
    const container = useRef<HTMLDivElement>(null);
    const grid = useRef(defaultGridFormat());
    const backgroundColor = useRef(new Vec4(1, 1, 1, 1));
    const lineColor = useRef(new Vec4(.5, .5, .5, 1));

    function performRednerCycle() {
        // const visible = isInView(page)
        const renderer = rnd.current;
        if (renderer instanceof WebGPUBackgroundLayer)
            renderer.render(grid.current, backgroundColor.current, lineColor.current);
        else
            console.warn(`render`, renderer);
    }

    useEffect(() => {
        const rerender = () => {
            performRednerCycle();
        };
        backgroundResize.add(rerender);
        if (S(renderStatus) === RenderStatus.READY) {
            const renderer = new cls();
            rnd.current = renderer;
            container.current?.appendChild(renderer.canvas);
            console.log(`mounting renderer`);
            renderer.setPageDimensions(...S(page.size));
            performRednerCycle();
            return () => {
                backgroundResize.delete(rerender);
                renderer.dispose();
                container.current?.removeChild(renderer.canvas);
            };
        }
        return () => {
            backgroundResize.delete(rerender);
        };
    }, [S(renderStatus)]);

    useEffect(() => {
        const renderer = rnd.current;
        if (renderer) {
            renderer.setPageDimensions(...S(page.size));
            performRednerCycle();
        }
    }, [S(page.size)]);

    return {
        container,
        performRednerCycle,
        grid,
        backgroundColor,
        lineColor,
    };
}

function PatternLayer(p: {
    layer: PagePatternLayerModel,
    page: PageModel,
}) {
    const { layer, page } = p;

    const gpu = useWebGPU(WebGPUBackgroundLayer, page);

    useEffect(() => {
        gpu.grid.current = S(layer.pattern);
        gpu.performRednerCycle();
    }, [S(layer.pattern)]);

    useEffect(() => {
        gpu.backgroundColor.current = new Vec4(.1, .1, .1, 1);
        gpu.lineColor.current = new Vec4(.3, .3, .3, 1);
        gpu.performRednerCycle();
    }, []);


    return <div class={`layer layer-pattern`} style={{
        fontSize: "1rem",
    }} ref={gpu.container}>
        {S(renderStatus)}
    </div>;
}
