import { Panic } from "../lib/panic";
import { vec2 } from "../lib/vec";
import { getDevice, getShaderModule, presentationFormat } from "./webgpu";

export interface ImportFormat {
    frame: [vec2, vec2, vec2, vec2],
    mode: number,
}

export function importFormat(f: ImportFormat): Float32Array {
    const arr = new Float32Array([
        ...f.frame.flat(),
        f.mode,
    ]);
    return arr;
}

export let renderImport: ((format: ImportFormat, view: GPUTextureView) => void) | null = null;

export class GPUImporter {
    constructor(readonly canvas: HTMLCanvasElement, readonly source: ImageBitmap) {
        const device = getDevice();
        const module = getShaderModule();

        this.texture = device.createTexture({
            label: "Imported image",
            format: 'rgba8unorm',
            size: [source.width, source.height],
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.dataBuffer = new OffscreenCanvas(source.width, source.height);
        const b = this.dataBuffer.getContext("2d");
        b?.drawImage(source, 0, 0);

        device.queue.copyExternalImageToTexture(
            { source: this.dataBuffer, flipY: false },
            { texture: this.texture },
            { width: source.width, height: source.height },
        );

        const context = canvas.getContext("webgpu");
        if (!context) {
            throw new Panic(`WebGPU is not supported`);
        }
        this.context = context;
        context.configure({
            device: device,
            format: presentationFormat,
        });
        // this.view = context.getCurrentTexture().createView();
        // console.log(context);

        this.pipeline = device.createRenderPipeline({
            label: 'import',
            layout: 'auto',
            vertex: {
                module,
                entryPoint: 'full',
            },
            fragment: {
                module,
                entryPoint: 'importShader',
                targets: [{ format: presentationFormat }],
            },
        });


        console.log(source, this.texture, canvas);


        const sampler = device.createSampler();

        this.importSettings = device.createBuffer({
            size: 40,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.pageSize = device.createBuffer({
            size: 8,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });


        this.bindGroup = device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                // { binding: 0, resource: { buffer: this.pageSize } },
                { binding: 2, resource: { buffer: this.importSettings } },
                { binding: 3, resource: sampler },
                { binding: 4, resource: this.texture.createView() },
            ],
        });
    }
    readonly dataBuffer: OffscreenCanvas;
    readonly bindGroup: GPUBindGroup;
    readonly importSettings: GPUBuffer;
    readonly pageSize: GPUBuffer;
    readonly texture: GPUTexture;
    readonly pipeline: GPURenderPipeline;
    // readonly view: GPUTextureView;
    readonly context: GPUCanvasContext;

    render(format: ImportFormat) {
        const device = getDevice();
        const settings = importFormat(format);
        device.queue.writeBuffer(this.importSettings, 0, settings);

        const encoder = device.createCommandEncoder();

        const pass = encoder.beginRenderPass({
            label: 'import',
            colorAttachments: [
                {
                    clearValue: [0, 0, 0, 1],
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: this.context.getCurrentTexture().createView(),
                },
            ],
        });

        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        pass.draw(3);
        pass.end();

        device.queue.submit([encoder.finish()]);
    }

    destroy() {
        console.log(`destroying importer`);
        this.texture.destroy();
        this.pageSize.destroy();
        this.importSettings.destroy();
    }
}
