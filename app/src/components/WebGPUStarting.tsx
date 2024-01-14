export function WebGPUStarting() {
    return <div class={`webgpu-starting`}>
        <div class={`-label`}>Lade WebGPU ...</div>
    </div>;
}

export function WebGPUError() {
    return <div class={`webgpu-starting`}>
        <div class={`-label`}>Fehler: WebGPU nicht unterstützt</div>
    </div>;
}
