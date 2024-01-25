import { Vec2, Vec4 } from "../lib/vectors";
import { getDevice, getShaderModule, presentationFormat } from "./webgpu";

export interface GridFormat {
    border: Vec4,
    bgColor: Vec4,
    lineColor: Vec4,
    grid: Vec2,
    lineWidth: Vec2,
    page: Vec2,
}

function mm2px(page: Vec2, obj: Vec2) {

}

export function gridFormat(f: GridFormat): Float32Array {
    const sizeU = f.page.x - f.border.$1 - f.border.$3;
    const sizeV = f.page.y - f.border.$2 - f.border.$4;
    const overU = f.grid.x > f.page.x ? 0 : (f.grid.x - (sizeU % f.grid.x) + f.lineWidth.x) / 2;
    const overV = f.grid.y > f.page.y ? 0 : (f.grid.y - (sizeV % f.grid.y) + f.lineWidth.y) / 2;
    // const over = 0;

    const arr = new Float32Array([
        f.border.$1 - overU,
        f.border.$2 - overV,
        f.border.$3 - overU,
        f.border.$4 - overV,
        ...f.grid.xy,
        ...f.lineWidth.xy,
        ...f.bgColor.rgba,
        ...f.lineColor.rgba,
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
        device.queue.writeBuffer(pageSize, 0, new Float32Array(format.page.xy));
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
