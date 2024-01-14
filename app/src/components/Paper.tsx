import { Signal, useSignal } from "@preact/signals";
import { defaultPaper, paperFormat } from "../lib/paper";
import { S } from "../lib/signal";
import { useMemo } from "preact/hooks";
import { vec2 } from "../lib/vec";

export function PaperFormat(p: {
    size: Signal<vec2>,
    update?: (value: vec2) => void,
}) {
    const width = S(p.size)[0];
    const height = S(p.size)[1];
    const update = p.update || ((value: vec2) => p.size.value = value);
    function matchFormat(fW: number, fH: number) {
        return ((fW === width && fH === height) || (fH === width && fW === height));
    }
    const landscape = useMemo(() => width > height, [width, height]);

    return <>
        <div class={`di-option`}>
            <div class={`-label`}>Format</div>
            <div class={`tk-b-box`}>
                {[...paperFormat.entries()].map(([id, { width, height, label }]) => <div class={`tk-b-button ${matchFormat(width, height) ? "-active" : "-inactive"}`} onClick={() => {
                    if (landscape) {
                        update(vec2(height, width));
                    } else {
                        update(vec2(width, height));
                    }
                }} key={id}>{label}</div>)}
            </div>
        </div>
        <div class={`di-option`}>
            <div class={`-label`}>Ausrichtung</div>
            <div class={`tk-b-box`}>
                <div class={`tk-b-button ${landscape ? "-inactive" : "-active"}`} onClick={() => {
                    if (width > height) {
                        update(vec2(height, width));
                    }
                }}><i class={`bi-phone`} /></div>
                <div class={`tk-b-button ${landscape ? "-active" : "-inactive"}`} onClick={() => {
                    if (width < height) {
                        update(vec2(height, width));
                    }
                }}><i class={`bi-phone-landscape`} /></div>
            </div>
        </div>
        <div class={`di-option`}>
            <div class={`-label`}>Höhe (mm)</div>
            <div class={`tk-b-box`}>
                <input type={`number`} value={height} onInput={ev => update(vec2(width, parseFloat((ev.target as HTMLInputElement).value)))} />
            </div>
        </div>
        <div class={`di-option`}>
            <div class={`-label`}>Breite (mm)</div>
            <div class={`tk-b-box`}>
                <input type={`number`} value={width} onInput={ev => update(vec2(parseFloat((ev.target as HTMLInputElement).value), height))} />
            </div>
        </div>
    </>;
}

export function usePaper(): [Signal<number>, Signal<number>] {
    return [
        useSignal(defaultPaper.width),
        useSignal(defaultPaper.height),
    ];
}
