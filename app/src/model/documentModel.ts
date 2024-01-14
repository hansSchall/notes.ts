import { Signal, signal } from "@preact/signals";
import { z } from "zod";
import { Listener } from "./listener";

// export abstract class ModelLayer<T extends z.ZodType>{
//     // constructor(readonly validator: T) {

//     // }
//     abstract pack(): z.infer<T>;
//     readonly onDrop = new Listener();
// }

// export class ArrayLayer<T extends ModelLayer<I>, I extends z.ZodType> extends ModelLayer<z.ZodArray<I>>{
//     constructor(data: z.infer<z.ZodArray<I>>, factory: (data: z.infer<I>) => T) {
//         super();
//         this.items = signal(data.map(factory));
//     }
//     readonly items: Signal<T[]>;
//     readonly onAdd = new Listener<T>();
//     pack(): z.infer<z.ZodArray<I>> {
//         return this.items.value.map($ => $.pack());
//     }
//     push(el: T) {
//         this.items.value = [...this.items.value, el];
//         this.onAdd.emit(el);
//     }
//     remove(el: T) {
//         this.items.value = [...this.items.value.filter($ => $ !== el)];
//         el.onDrop.emit();
//     }
//     update(updater: (old: T[]) => T[]) {
//         this.items.value = [...updater(this.items.value)];
//     }
// }

// export class PrimitiveLayer<T extends z.ZodType> extends ModelLayer<T> {
//     constructor(data: z.infer<T>) {
//         super();
//         this.value = signal(data);
//     }
//     public value: Signal<z.infer<T>>;
//     pack(): z.TypeOf<T> {
//         return this.value;
//     }
//     unpack(data: z.TypeOf<T>): void {
//         this.value = data;
//     }

// }

export abstract class ModelLayer<T extends z.ZodType>{
    abstract make(data: z.infer<T>): ModelLayerInstance<T>;
}

export abstract class ModelLayerInstance<T extends z.ZodType>{
    // abstract make(data: z.infer<T>);
}

// export function arrayLayer<T extends z.ZodType>(children: ModelLayer<T>): ModelLayer<z.ZodArray<T>>{

// }

export class ArrayLayer<T extends z.ZodType> extends ModelLayer<T>{
    make(data: z.TypeOf<T>): ArrayLayerInstance<T> {
        return new ArrayLayerInstance(data, data => this.children.make(data));
        // throw new Error("Method not implemented.");
    }
    constructor(readonly children: ModelLayer<T>) {
        super();
    }
}

export class ArrayLayerInstance<T extends ModelLayer<I>, I extends z.ZodType> extends ModelLayer<z.ZodArray<I>>{
    constructor(data: z.infer<z.ZodArray<I>>, factory: (data: z.infer<I>) => T) {
        super();
        this.items = signal(data.map(factory));
    }
    readonly items: Signal<T[]>;
    readonly onAdd = new Listener<T>();
    pack(): z.infer<z.ZodArray<I>> {
        return this.items.value.map($ => $.pack());
    }
    push(el: T) {
        this.items.value = [...this.items.value, el];
        this.onAdd.emit(el);
    }
    remove(el: T) {
        this.items.value = [...this.items.value.filter($ => $ !== el)];
        el.onDrop.emit();
    }
    update(updater: (old: T[]) => T[]) {
        this.items.value = [...updater(this.items.value)];
    }
}

const a = new ArrayLayer();
