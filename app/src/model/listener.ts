export type Callback<T> = (arg: T) => void;

export class Listener<T = void>{
    private listeners = new Set<Callback<T>>();
    on(cb: Callback<T>) {
        this.listeners.add(cb);
    }
    off(cb: Callback<T>) {
        this.listeners.delete(cb);
    }
    emit(arg: T) {
        for (const cb of this.listeners) {
            cb(arg);
        }
    }
}
