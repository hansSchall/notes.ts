/// <reference types="@webgpu/types" />

import lock from "simple-promise-locks";
import { Panic } from "../lib/panic";
import { signal } from "@preact/signals";
import { GridFormat, initGrid, renderBackground } from "./grid";
import { vec2, vec4 } from "../lib/vec";

export async function loadShader(id: string): Promise<GPUShaderModuleDescriptor> {
    const response = await fetch(new URL(`/shaders/${id}.wgsl`, location.href));
    let code = await response.text();
    const label = code.substring(code.startsWith("//") ? 2 : 0, code.indexOf("\n")).trim();
    return {
        label,
        code,
    };
}

export async function loadTexture(id: URL): Promise<ImageBitmap> {
    const response = await fetch(id);
    const blob = await response.blob();
    return await createImageBitmap(blob, { colorSpaceConversion: 'none' });
}

let gpuDevice: GPUDevice | null = null;

export function getDevice(): GPUDevice {
    if (gpuDevice) {
        return gpuDevice;
    } else {
        throw new Panic(`GPUDevice is null`);
    }
}

let shaderModule: GPUShaderModule | null = null;

export function getShaderModule(): GPUShaderModule {
    if (shaderModule) {
        return shaderModule;
    } else {
        throw new Panic(`shaderModule is null`);
    }
}

export const presentationFormat = navigator.gpu?.getPreferredCanvasFormat();

export enum RenderStatus {
    STARTING,
    READY,
    FAILURE,
}

export const renderStatus = signal(RenderStatus.STARTING);

export const webgpuReady = lock(true);

export async function initWebGPU() {
    if (!navigator.gpu) {
        renderStatus.value = RenderStatus.FAILURE;
        throw new Panic(`Browser does not support WebGPU`);
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        renderStatus.value = RenderStatus.FAILURE;
        throw new Panic(`No adapter found`);
    }
    gpuDevice = await adapter.requestDevice();
    const device = getDevice();

    shaderModule = device.createShaderModule(await loadShader("main"));

    initGrid();

    webgpuReady.unlock();
    console.log("webgpu ready");
    renderStatus.value = RenderStatus.READY;
}

// function render() {
//     const device = getDevice();
//     const encoder = device.createCommandEncoder();
//     // const pass = encoder.beginRenderPass({
//     //     label: 'main renderPass',
//     //     colorAttachments: [
//     //         {
//     //             clearValue: [0.3, 0.3, 0.3, 1],
//     //             loadOp: 'clear',
//     //             storeOp: 'store',
//     //             view: context.getCurrentTexture().createView(),
//     //         },
//     //     ],
//     // });
//     // pass.setPipeline(pipeline);
//     // pass.setBindGroup(0, bindGroup);
//     // pass.draw(3);
//     // pass.end();


//     const commandBuffer = encoder.finish();
//     device.queue.submit([commandBuffer]);
// }

export class WebGPUGraphicsLayer {
    constructor() {
        const context = this.canvas.getContext("webgpu");
        if (!context) {
            throw new Panic(`WebGPU is not supported`);
        }
        this.context = context;
        this.context.configure({
            device: this.device,
            format: presentationFormat,
        });
    }
    readonly device = getDevice();
    readonly canvas = document.createElement("canvas");
    readonly context: GPUCanvasContext;
    public page = vec2(0, 0);
    public setPageDimensions(u: number, v: number) {
        this.page = vec2(u, v);
    }
    protected updateCanvasSize() {
        const rect = this.canvas.getBoundingClientRect();
        // console.log(this.canvas);
        this.canvas.width = rect.width * 2;
        this.canvas.height = rect.height * 2;
    }
}

export type WeakGridFormat = Omit<GridFormat, "bgColor" | "lineColor" | "page">;

export class WebGPUBackgroundLayer extends WebGPUGraphicsLayer {
    render(style: WeakGridFormat, bgColor: vec4, lineColor: vec4) {
        this.updateCanvasSize();
        let format: GridFormat = {
            bgColor,
            lineColor,
            page: this.page,
            ...style,
        };

        renderBackground?.(format, this.context.getCurrentTexture().createView());
        // console.log("render", style);
        // const device = getDevice();
        // const module = getShaderModule();

        // const pipeline = device.createRenderPipeline({
        //     label: 'our hardcoded red triangle pipeline',
        //     layout: 'auto',
        //     vertex: {
        //         module,
        //         entryPoint: 'vs',
        //     },
        //     fragment: {
        //         module,
        //         entryPoint: 'fillGrid',
        //         targets: [{ format: presentationFormat }],
        //     },
        // });

        // const pageDimensions = device.createBuffer({
        //     size: 8,
        //     usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        // });
        // const lbgSettings = device.createBuffer({
        //     size: 64,
        //     usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        // });

        // const bindGroup = device.createBindGroup({
        //     layout: pipeline.getBindGroupLayout(0),
        //     entries: [
        //         { binding: 0, resource: { buffer: pageDimensions } },
        //         { binding: 1, resource: { buffer: lbgSettings } },
        //     ],
        // });

        // device.queue.writeBuffer(pageDimensions, 0, new Float32Array(this.page));
        // const grid = gridFormat({
        //     border: [15, 15, 15, 15],
        //     bgColor: [1, 1, 1, 1],
        //     lineColor: [.5, .5, .5, 1],
        //     grid: [5, 5],
        //     lineWidth: [.5, .5],
        //     page: this.page,
        // });
        // console.log(grid);
        // // device.queue.writeBuffer(lbgSettings, 0, new Float32Array([15, 15, 15, 15, 100000, 10, .5, .5, 1, 1, 1, 1, .5, .5, .5, 1]));
        // // device.queue.writeBuffer(lbgSettings, 0, new Float32Array([15, 15, 15, 15, 5, 5, .5, .5, 1, 1, 1, 1, .5, .5, .5, 1]));
        // device.queue.writeBuffer(lbgSettings, 0, grid);

        // const encoder = device.createCommandEncoder();
        // const pass = encoder.beginRenderPass({
        //     label: 'background',
        //     colorAttachments: [
        //         {
        //             clearValue: [0.3, 0.3, 0.8, 1],
        //             loadOp: 'clear',
        //             storeOp: 'store',
        //             view: this.context.getCurrentTexture().createView(),
        //         },
        //     ],
        // });
        // pass.setPipeline(pipeline);
        // pass.setBindGroup(0, bindGroup);
        // pass.draw(3);
        // pass.end();

        // device.queue.submit([encoder.finish()]);
    }
}

