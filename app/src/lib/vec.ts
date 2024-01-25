export type vec2 = [number, number];
export function vec2(a: number, b: number): vec2 {
    return [a, b];
}
export function sub2(a: vec2, b: vec2): vec2 {
    return vec2(a[0] - b[0], a[1] - b[1]);
}
export function add2(a: vec2, b: vec2): vec2 {
    return vec2(a[0] + b[0], a[1] + b[1]);
}
export function mul2(a: vec2, b: vec2): vec2 {
    return vec2(a[0] * b[0], a[1] * b[1]);
}
export function div2(a: vec2, b: vec2): vec2 {
    return vec2(a[0] / b[0], a[1] / b[1]);
}
export function mul2s(a: vec2, f: number): vec2 {
    return vec2(a[0] * f, a[1] * f);
}
export function div2s(a: vec2, f: number): vec2 {
    return vec2(a[0] / f, a[1] / f);
}

export type vec3 = [number, number, number];
export function vec3(a: number, b: number, c: number): vec3 {
    return [a, b, c];
}

export type vec4 = [number, number, number, number];
export function vec4(a: number, b: number, c: number, d: number): vec4 {
    return [a, b, c, d];
}
