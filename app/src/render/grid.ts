import { vec2, vec4 } from "../lib/vec";
import { getDevice, getShaderModule, presentationFormat } from "./webgpu";

export interface GridFormat {
    border: vec4,
    bgColor: vec4,
    lineColor: vec4,
    grid: vec2,
    lineWidth: vec2,
    page: vec2,
}

export function gridFormat(f: GridFormat): Float32Array {
    const sizeU = f.page[0] - f.border[0] - f.border[2];
    const sizeV = f.page[1] - f.border[1] - f.border[3];
    const overU = f.grid[0] > f.page[0] ? 0 : (f.grid[0] - (sizeU % f.grid[0]) + f.lineWidth[0]) / 2;
    const overV = f.grid[1] > f.page[1] ? 0 : (f.grid[1] - (sizeV % f.grid[1]) + f.lineWidth[1]) / 2;
    // const over = 0;

    const arr = new Float32Array([
        f.border[0] - overU,
        f.border[1] - overV,
        f.border[2] - overU,
        f.border[3] - overV,
        ...f.grid,
        ...f.lineWidth,
        ...f.bgColor,
        ...f.lineColor,
    ]);
    return arr;
}

export let renderBackground: ((format: GridFormat, view: GPUTextureView) => void) | null = null;

export function initGrid() {
    const device = getDevice();
    const module = getShaderModule();

    const pipeline = device.createRenderPipeline({
        label: 'background grid',
        layout: 'auto',
        vertex: {
            module,
            entryPoint: 'full',
        },
        fragment: {
            module,
            entryPoint: 'fillGrid',
            targets: [{ format: presentationFormat }],
        },
    });

    const pageSize = device.createBuffer({
        size: 8,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const gridSettings = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: pageSize } },
            { binding: 1, resource: { buffer: gridSettings } },
        ],
    });


    renderBackground = (format, view) => {
        device.queue.writeBuffer(pageSize, 0, new Float32Array(format.page));
        const grid = gridFormat(format);
        // console.log(grid);
        // device.queue.writeBuffer(lbgSettings, 0, new Float32Array([15, 15, 15, 15, 100000, 10, .5, .5, 1, 1, 1, 1, .5, .5, .5, 1]));
        // device.queue.writeBuffer(lbgSettings, 0, new Float32Array([15, 15, 15, 15, 5, 5, .5, .5, 1, 1, 1, 1, .5, .5, .5, 1]));
        device.queue.writeBuffer(gridSettings, 0, grid);

        const encoder = device.createCommandEncoder();

        const pass = encoder.beginRenderPass({
            label: 'background grid',
            colorAttachments: [
                {
                    clearValue: [0.3, 0.3, 0.8, 1],
                    loadOp: 'clear',
                    storeOp: 'store',
                    view,
                },
            ],
        });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
        pass.end();

        device.queue.submit([encoder.finish()]);

    };
}
