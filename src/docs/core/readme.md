# RxImmer

基于 RxJS 和 Immer 实现了状态管理工具 `rximmer.ts`。它提供了一种灵活且高效的方式来管理应用状态，并且可以轻松地与 React 集成。

## 主要功能

1. **状态读取**：通过 `model.state` 直接读取当前的状态。
2. **状态更新**：为 `model` 添加自定义方法来更新状态。
3. **状态回退**：为 `model` 使用undo或者自定义方法来回退状态。
4. **状态订阅**：通过 `model.state$` 使用 RxJS 订阅状态的更新。

## 代码示例

### 1. 创建和使用 `Rximmer`

```typescript
import { Rximmer } from 'model';

interface FlowState {
    nodes: Array<{ id: number, position: { x: number, y: number } }>;
    edges: Array<{ id: number, source: number, target: number }>;
}

const initialNodes = [];
const initialEdges = [];

const INITIAL_STATE: FlowState = {
    nodes: initialNodes,
    edges: initialEdges,
};

export class FlowModel extends Rximmer<FlowState> {
    constructor() {
        super(INITIAL_STATE);
    }

    updateNodePosition(nodeId: number, position: { x: number, y: number }) {
        this.setState(state => {
            const nodes = state.nodes.map(node => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        position,
                    };
                }
                return node;
            });
            return {
                ...state,
                nodes,
            };
        });
    }
}

export const flowModel = new FlowModel();
```

### 2. 通过 model.state 读取状态
```typescript
console.log(flowModel.state.nodes); // 输出: []

```
### 3. 通过自定义方法更新状态
```typescript
flowModel.updateNodePosition(1, { x: 100, y: 200 });
console.log(flowModel.state.nodes); // 输出: 更新后的节点位置
```
### 4. 通过 model.state$ 订阅状态更新
```typescript
import { Subscription } from 'rxjs';

const subscription: Subscription = flowModel.state$.subscribe(state => {
    console.log('State updated:', state);
});

flowModel.updateNodePosition(1, { x: 100, y: 200 }); // 输出: State updated: { nodes: [...], edges: [...] }
```
 取消订阅
```typescript
subscription.unsubscribe();
```


## 在 React 中使用 useModel Hook
为了让 rximmer.ts 可以在 React 中使用，提供了 useModel 这个自定义 Hook。

### 代码示例
 
方式一：通过键数组获取对应状态
```tsx
import React from 'react';
import { useModel } from 'useModel';
import { flowModel } from './flow.model';

const FlowComponent = () => {
    const { nodes, edges } = useModel(flowModel, 'nodes', 'edges');

    return (
        <div>
            <p>Nodes: {JSON.stringify(nodes)}</p>
            <p>Edges: {JSON.stringify(edges)}</p>
            <button onClick={() => flowModel.updateNodePosition(1, { x: 100, y: 200 })}>Update Node Position</button>
        </div>
    );
};

export default FlowComponent;
```

方式二：通过选择器函数选择状态
```tsx
import React from 'react';
import { useModel } from 'useModel';
import { flowModel } from './flow.model';

const FlowComponent = () => {
    const nodes = useModel(flowModel, state => state.nodes);

    return (
        <div>
            <p>Nodes: {JSON.stringify(nodes)}</p>
            <button onClick={() => flowModel.updateNodePosition(1, { x: 100, y: 200 })}>Update Node Position</button>
        </div>
    );
};

export default FlowComponent;
```
方式二： 直接在 React 中订阅 model.state$ 的更新
```tsx
import React, { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { flowModel } from './flow.model';

const FlowComponent = () => {
    const [nodes, setNodes] = useState(flowModel.state.nodes);

    useEffect(() => {
        const subscription: Subscription = flowModel.state$.subscribe(state => {
            setNodes(state.nodes);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div>
            <p>Nodes: {JSON.stringify(nodes)}</p>
            <button onClick={() => flowModel.updateNodePosition(1, { x: 100, y: 200 })}>Update Node Position</button>
        </div>
    );
};

export default FlowComponent;
```
