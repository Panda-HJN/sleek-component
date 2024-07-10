import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import {isEqual} from 'lodash';
import type { RxImmer } from './rximmer.ts';

function pickModelState<M, K extends keyof M>(model: RxImmer<M>, keys: K[]): Pick<M, K> {
    const val = {} as Pick<M, K>;
    keys.forEach(k => {
        val[k] = model.state[k];
    });
    return val;
}



function isSelector<Value, K extends keyof Value, Slice>(args: K[] | [(state: Value) => Slice]): args is [(state: Value) => Slice] {
    return typeof args[0] === 'function';
}

export function useModel<Value, K extends keyof Value>(model: RxImmer<Value>, ...keys: K[]): Pick<Value, K>;
export function useModel<Value, Slice>(model: RxImmer<Value>, selector: (state: Value) => Slice,): Slice;
export function useModel<Value, K extends keyof Value, Slice>(model: RxImmer<Value>, ...args: K[] | [(state: Value) => Slice]): Pick<Value, K> | Slice {

    const selector = isSelector(args) ? args[0] : undefined;
    const keys = !isSelector(args) ? args : undefined;
    const [state, setState] = useState(() =>
        selector ? selector!(model.state) : pickModelState(model, keys!),
    );

    useEffect(() => {
        const subs = new Subscription();
        if (selector) {
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
