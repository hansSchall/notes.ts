// main shader

struct VSOut {
    @builtin(position) position: vec4f,
    // @location(0) uv_mm: vec2f,
    @location(0) uv: vec2f,
};

@vertex fn full(
    @builtin(vertex_index) vertexIndex : u32
) -> VSOut {
    var pos = array<vec2<f32>, 3>(
        vec2f( -1.0, -1.0),
        vec2f( 3.0, -1.0), 
        vec2f( -1.0, 3.0),
    );

    var vsOutput: VSOut;
    vsOutput.position = vec4f(pos[vertexIndex], 0.0, 1.0);
    // vsOutput.uv_mm = cs2mm(pos[vertexIndex]);
    vsOutput.uv = pos[vertexIndex];
    return vsOutput;
}

@group(0) @binding(0) var<uniform> dimensions: vec2f;

struct Grid{
    border: vec4f,
    raster: vec2f,
    lineWidth: vec2f,
    background: vec4f,
    lines: vec4f,
}

@group(0) @binding(1) var<uniform> grid: Grid;

struct Importer{
    a: vec2f,
    b: vec2f,
    c: vec2f,
    d: vec2f,
    mode: f32,
}

@group(0) @binding(2) var<uniform> importer: Importer;
@group(0) @binding(3) var smpl: sampler;
@group(0) @binding(4) var importTex: texture_2d<f32>;

fn belowLine(a: vec2f, b: vec2f, p: vec2f) -> bool{
    let d = b - a;
    let m = d.y / d.x;
    let t = a.y - m * a.x;
    let p_v = m * p.x + t;
    return p_v < p.y;
}

@fragment fn importShader(@location(0) cs: vec2f) -> @location(0) vec4f{

    let uv = cs2uv(cs);
    var smpPos = uv;
    // if((
    //     // belowLine(importer.a, importer.b, uv) && 
    //     // belowLine(importer.b, importer.c, uv) && 
    //     // belowLine(importer.c, importer.d, uv) && 
    //     belowLine(importer.d, importer.a, uv)
    //     ) || importer.mode == 658){
    // // return vec4f(1,0,0,1);
    // }
    // return vec4f(0,1,0,1);
    // let a = importer.mode;
    // smp

    if(importer.mode == 0){
        smpPos = inverseBilinear(uv, importer.a, importer.b, importer.c, importer.d);
    }

    return textureSample(importTex, smpl, smpPos);
}

// adapted from https://iquilezles.org/articles/ibilinear/
fn cross2d(a: vec2f, b: vec2f) -> f32{
    return (a.x * b.y) - (a.y * b.x);
}

fn inverseBilinear(p: vec2f, a: vec2f, b: vec2f, c: vec2f, d: vec2f) -> vec2f{
    let e = b - a;
    let f = d - a;
    let g = a - b + c - d;
    let h = p - a;

    let k2 = cross2d(g, f);
    let k1 = cross2d(e, f) + cross2d(h, g);
    let k0 = cross2d(h, e);

    if (abs(k2) < .001) { // Edges are likely parallel, so this is a linear equation.
        return vec2(
            (h.x * k1 + f.x * k0) / (e.x * k1 - g.x * k0),
            -k0 / k1
        );
    } else { // It's a quadratic equation.
        var w = k1 * k1 - 4.0 * k0 * k2;
        if (w < 0.0) { // Prevent GPUs from going insane.
            return vec2f(-1,-1);
        }
        w = sqrt(w);

        let ik2 = 0.5 / k2;
        var v = (-k1 - w) * ik2;
        var u = (h.x - f.x * v) / (e.x + g.x * v);

        if (u < 0.0 || u > 1.0 || v < 0.0 || v > 1.0) {
            v = (-k1 + w) * ik2;
            u = (h.x - f.x * v) / (e.x + g.x * v);
        }

        return vec2f(u, v);
    }
}
// @fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
//     let mapUV = map[u32(pos.y)][u32(pos.x)];
//     return vec4f(textureSample(texD, smp, mapUV.xy).rgb * mapUV.b, mapUV.a);
// }

// @fragment fn checker(@builtin(position) pos: vec4f) -> @location(0) vec4f {
//     let a = vec4f(1,1,1, 1);
//     let b = vec4f(0.6,.6,.6, 1);

//     let grid = vec2u(pos.xy) / 20;
//     let checker = (grid.x + grid.y) % 2 == 1;

//     return select(a, b, checker);
// }

fn cs2uv(cs: vec2f) -> vec2f{
    return (cs + vec2f(1,-1)) / vec2f(2,-2);
}

fn uv2cs(uv: vec2f) -> vec2f{
    return uv * vec2f(2,-2) - vec2f(1,-1);
}

fn mm2cs(mm: vec2f) -> vec2f{
    return uv2cs(mm / dimensions);
}

fn cs2mm(cs: vec2f) -> vec2f{
    return dimensions * cs2uv(cs);
}

@fragment fn fillGrid(@location(0) uv: vec2f) -> @location(0) vec4f{
    // if(mm.x < grid.border.r || mm.y < grid.border.g || mm.x > (dimensions.x - grid.border.b)  || mm.y > (dimensions.y - grid.border.a)){
    //     return grid.background;
    // }
    let mm = cs2mm(uv);

    if(
        mm.x < grid.border.r ||
        mm.y < grid.border.g ||
        mm.x > (dimensions.x - grid.border.b) || 
        mm.y > (dimensions.y - grid.border.a) || 
        (
            ((mm.x - grid.border.x) % grid.raster.x > grid.lineWidth.x) &&
            ((mm.y - grid.border.y) % grid.raster.y > grid.lineWidth.y)
        )
    ){
        return grid.background;
    }else{
        return grid.lines;
    }
}
