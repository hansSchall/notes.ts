export class Vec2 {
    constructor(readonly $1: number, readonly $2: number = $1) {
    }
    get u() {
        return this.$1;
    }
    get v() {
        return this.$2;
    }
    get x() {
        return this.$1;
    }
    get y() {
        return this.$2;
    }
    get xy() {
        return [this.$1, this.$2] as const;
    }
    get uv() {
        return [this.$1, this.$2] as const;
    }
    static add(a: Vec2, b: Vec2) {
        return new Vec2(a.$1 + b.$1, a.$2 + b.$2);
    }
    static sub(a: Vec2, b: Vec2) {
        return new Vec2(a.$1 - b.$1, a.$2 - b.$2);
    }
    static mul(a: Vec2, b: Vec2 | number) {
        if (typeof b === "number") {
            return new Vec2(a.$1 * b, a.$2 * b);
        } else {
            return new Vec2(a.$1 * b.$1, a.$2 * b.$2);
        }
    }
    static div(a: Vec2, b: Vec2 | number) {
        if (typeof b === "number") {
            return new Vec2(a.$1 / b, a.$2 / b);
        } else {
            return new Vec2(a.$1 / b.$1, a.$2 / b.$2);
        }
    }
    static eq(a: Vec2, b: Vec2) {
        return a.$1 === b.$1 && a.$2 === b.$2;
    }
}

export class Vec3 {
    constructor(a: number);
    constructor(a: number, b: number, c: number);
    constructor(readonly $1: number, readonly $2: number = $1, readonly $3: number = $1) {
    }
    get u() {
        return this.$1;
    }
    get v() {
        return this.$2;
    }
    get w() {
        return this.$3;
    }
    get x() {
        return this.$1;
    }
    get y() {
        return this.$2;
    }
    get z() {
        return this.$3;
    }
    get xyz() {
        return [this.$1, this.$2, this.$3] as const;
    }
    get uvw() {
        return [this.$1, this.$2, this.$3] as const;
    }
    get rgb() {
        return [this.$1, this.$2, this.$3] as const;
    }
    static add(a: Vec3, b: Vec3) {
        return new Vec3(a.$1 + b.$1, a.$2 + b.$2, a.$3 + b.$3);
    }
    static sub(a: Vec3, b: Vec3) {
        return new Vec3(a.$1 - b.$1, a.$2 - b.$2, a.$3 - b.$3);
    }
    static mul(a: Vec3, b: Vec3 | number) {
        if (typeof b === "number") {
            return new Vec3(a.$1 * b, a.$2 * b, a.$3 * b);
        } else {
            return new Vec3(a.$1 * b.$1, a.$2 * b.$2, a.$3 * b.$3);
        }
    }
    static div(a: Vec3, b: Vec3 | number) {
        if (typeof b === "number") {
            return new Vec3(a.$1 / b, a.$2 / b, a.$3 / b);
        } else {
            return new Vec3(a.$1 / b.$1, a.$2 / b.$2, a.$3 / b.$3);
        }
    }
    static eq(a: Vec3, b: Vec3) {
        return a.$1 === b.$1 && a.$2 === b.$2 && a.$3 === b.$3;
    }
}

export class Vec4 {
    constructor(a: number);
    constructor(a: number, b: number, c: number, d: number);
    constructor(readonly $1: number, readonly $2: number = $1, readonly $3: number = $1, readonly $4: number = $1) {
    }
    get u() {
        return this.$1;
    }
    get v() {
        return this.$2;
    }
    get x() {
        return this.$1;
    }
    get y() {
        return this.$2;
    }
    get z() {
        return this.$3;
    }
    get rgb() {
        return [this.$1, this.$2, this.$3] as const;
    }
    get rgba() {
        return [this.$1, this.$2, this.$3, this.$4] as const;
    }
    static add(a: Vec4, b: Vec4) {
        return new Vec4(a.$1 + b.$1, a.$2 + b.$2, a.$3 + b.$3, a.$4 + b.$4);
    }
    static sub(a: Vec4, b: Vec4) {
        return new Vec4(a.$1 - b.$1, a.$2 - b.$2, a.$3 - b.$3, a.$4 - b.$4);
    }
    static mul(a: Vec4, b: Vec4 | number) {
        if (typeof b === "number") {
            return new Vec4(a.$1 * b, a.$2 * b, a.$3 * b, a.$4 * b);
        } else {
            return new Vec4(a.$1 * b.$1, a.$2 * b.$2, a.$3 * b.$3, a.$4 * b.$4);
        }
    }
    static div(a: Vec4, b: Vec4 | number) {
        if (typeof b === "number") {
            return new Vec4(a.$1 / b, a.$2 / b, a.$3 / b, a.$4 / b);
        } else {
            return new Vec4(a.$1 / b.$1, a.$2 / b.$2, a.$3 / b.$3, a.$4 / b.$4);
        }
    }
    static eq(a: Vec4, b: Vec4) {
        return a.$1 === b.$1 && a.$2 === b.$2 && a.$3 === b.$3 && a.$4 === b.$4;
    }
}
