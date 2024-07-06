import {Model} from "./model.ts";
import {EdgeType, FlowNodeType} from "../App.tsx";

export interface FlowState {
    nodes: FlowNodeType[]
    edges: EdgeType[]
}

const initialNodes: FlowNodeType[] = [
    {
        id: 1,
        nextNode: [2, 3],
        position: {x: 100, y: 100},
        width: 100,
        height: 100,
        style: {backgroundColor: 'blueviolet'}
    },
    {
        id: 2,
        nextNode: [4],
        position: {x: 300, y: 100},
        width: 100,
        height: 100,
        style: {backgroundColor: 'green'}
    },
    {
        id: 3,
        nextNode: [4],
        position: {x: 100, y: 300},
        width: 100,
        height: 100,
        style: {backgroundColor: 'red'}
    },
    {
        id: 4,
        nextNode: [1],
        position: {x: 300, y: 300},
        width: 100,
        height: 100,
        style: {backgroundColor: 'purple'}
    },
    {
        id: 5,
        nextNode: [6],
        position: {x: 500, y: 400},
        width: 100,
        height: 100,
        style: {backgroundColor: 'gold'}
    },
    {
        id: 6,
        nextNode: [5],
        position: {x: 300, y: 600},
        width: 100,
        height: 100,
        style: {backgroundColor: 'green'}
    }
];
const initialEdges: EdgeType[] = [
    {
        sourceNode: 1,
        targetNode: 2,
        sourceAnchorType: "right",
        targetAnchorType: "left",
    },
    {
        sourceNode: 1,
        targetNode: 3,
        sourceAnchorType: "bottom",
        targetAnchorType: "top",
    },
    {
        sourceNode: 2,
        targetNode: 4,
        sourceAnchorType: "bottom",
        targetAnchorType: "top",
    },
    {
        sourceNode: 3,
        targetNode: 4,
        sourceAnchorType: "left",
        targetAnchorType: "right",
    },
    {
        sourceNode: 4,
        targetNode: 1,
        sourceAnchorType: "bottom",
        targetAnchorType: "left",
    },
    {
        sourceNode: 5,
        targetNode: 6,
        sourceAnchorType: "left",
        targetAnchorType: "left",
    },
    {
        sourceNode: 6,
        targetNode: 5,
        sourceAnchorType: "right",
        targetAnchorType: "right",
    }
];

const INITIAL_STATE: FlowState = {
    nodes: initialNodes,
    edges: initialEdges,
};

export class FlowModel extends Model<FlowState> {
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
