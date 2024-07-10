import type {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {distinctUntilChanged, map,auditTime} from 'rxjs/operators';
import {produce} from 'immer';
import { Stack } from './stack.ts';

// 可以对请求获取的东西先unknown类型
// 通过类型守卫判断后再给予类型
// unknown类似于把类型盖住 不让推断系统知道


// type A  = string & number A就是never
const assign = produce((draft, part) => {
    Object.assign(draft || {}, part);
});


class RxImmer<T> {
    readonly state$ = new BehaviorSubject<T>({} as T);
    private readonly initialState: T | undefined = this.state$.value;
    private stateHistory = new Stack<T>();
    private forwardHistory = new Stack<T>();
    constructor(state?: T, options?: { auditTime?: number }) {

        if (state) {
            this.setState(state);
        }
        this.state$.pipe(
            distinctUntilChanged(),
            auditTime(options?.auditTime || 300),
        ).subscribe((newState) => {
            if (this.stateHistory.size() === 0 || this.stateHistory.peek() !== newState) {
                this.stateHistory.push(newState);
                this.forwardHistory.clear(); // 清空前进历史，因为新的状态已经产生
            }
        });
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

    undo = () => {
        if (this.stateHistory.size() > 1) {
            const currentState = this.state$.value;
            this.forwardHistory.push(currentState); // 将当前状态推入前进栈
            this.stateHistory.pop(); // 移除当前状态
            const previousState = this.stateHistory.peek();
            if (previousState) {
                this.state$.next(previousState);
            }
        }
    }

    redo = () => {
        if (this.forwardHistory.size() > 0) {
            const nextState = this.forwardHistory.pop(); // 从前进栈中获取下一个状态
            if (nextState) {
                this.state$.next(nextState);
                this.stateHistory.push(nextState); // 将状态推入历史栈
            }
        }
    }

    reset() {
        this.state$.next(this.initialState as T);
        this.stateHistory.clear(); // 清空历史记录
        this.stateHistory.push(this.initialState as T); // 重新添加初始状态
        this.forwardHistory.clear(); // 同时清空前进历史
    }

    private getState(): T {
        return this.state$.value;
    }
}

export {RxImmer};
