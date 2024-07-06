import type {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {produce} from 'immer';

const assign = produce((draft, part) => {
    Object.assign(draft || {}, part);
});


class Model<T> {
    readonly state$ = new BehaviorSubject<T>({} as T);
    private readonly initialState: T | undefined = this.state$.value;

    constructor(state?: T,) {
        if (state) {
            this.setState(state);
        }
        this.initialState = state;
    }

    get state() {
        return this.getState();
    }

    public select<V>(selectFn: (state: T) => V): Observable<V> {
        return this.state$.pipe(map(selectFn), distinctUntilChanged());
    }

    setState(state: Partial<T> | ((state: T) => void)): void {
        const original = this.getState();

        if (original === state) {
            return;
        }

        const newState =
            typeof state === 'function'
                ? produce(original, state)
                : assign(original, state);

        this.state$.next(newState);
    }

    reset() {
        this.state$.next(this.initialState as T);
    }

    private getState(): T {
        return this.state$.value;
    }
}

export {Model};
