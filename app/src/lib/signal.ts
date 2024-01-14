import { Signal } from "@preact/signals";

export function S<T>(s: Signal<T>): T {
    return s.value;
}

export function Toggle(s: Signal<boolean>) {
    s.value = !s.value;
}

export function ToggleON(s: Signal<boolean>) {
    return () => { s.value = !s.value; };
}

export function Assign<T>(s: Signal<T>, value: T) {
    s.value = value;
}

export function AssignON<T>(s: Signal<T>, value: T) {
    return () => { s.value = value; };
}

export function ArrayUpdate<T>(signal: Signal<T[]>, factory: (old: T[]) => Generator<T>) {
    Assign(signal, [...factory(S(signal))]);
}
