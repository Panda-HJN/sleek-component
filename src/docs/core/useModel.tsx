import { useEffect, useState } from 'react';
import type { Model } from './model.ts';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import {isEqual} from 'lodash';

function pickModelState<M, K extends keyof M>(model: Model<M>, keys: K[]): Pick<M, K> {
    const val = {} as Pick<M, K>;
    keys.forEach(k => {
        val[k] = model.state[k];
    });
    return val;
}

function isSelector(args: any): args is [(...rest: any[]) => any] {
    return typeof args[0] === 'function';
}

// 将 model 中的值转换为 react state
// model的输入输出有多种形态
export function useModel<Value, K extends keyof Value>(model: Model<Value>, ...keys: K[]): Pick<Value, K>;
export function useModel<Value, Slice>(model: Model<Value>, selector: (state: Value) => Slice,): Slice;
export function useModel<Value, K extends keyof Value, Slice>(model: Model<Value>, ...args: K[] | [(state: Value) => Slice]): Pick<Value, K> | Slice {
    const selector = isSelector(args) ? args[0] : undefined;
    const keys = !isSelector(args) ? args : undefined;
    // 在这里获取初始值，useEffect 中获取有延迟
    const [state, setState] = useState(() =>
        selector ? selector!(model.state) : pickModelState(model, keys!),
    );

    useEffect(() => {
        const subs = new Subscription();
        if (selector) {
            // TODO: 允许用户自己传入 comparer
            subs.add(
                model.state$.pipe(map(selector), distinctUntilChanged(isEqual)).subscribe(s => {
                    setState(s);
                }),
            );
        } else {
            keys!.forEach(k => {
                subs.add(
                    model
                        .select(s => s[k])
                        .subscribe(v => {
                            setState(old => ({ ...old, [k]: v }));
                        }),
                );
            });
        }
        return () => subs.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return state;
}
