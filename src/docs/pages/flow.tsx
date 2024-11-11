import React, {CSSProperties, Fragment, useEffect} from 'react';
import {useModel} from "../core/useModel.tsx";
import {flowModel} from "../core/flow.model.ts";
import {Rd} from "../../components/rd"
import {chatModel} from "../core/chat.model.ts";

type NodeNumber = number
/**
 * 连接点种类
 * 位于节点四个边的中点，类型是上下左右
 * */
type AnchorType = 'left' | 'top' | 'right' | 'bottom';

/**
 * 工作流节点
 * id :全局唯一的id
 * nextNode:前往的节点id，可以是多个
 * position:节点的位置,是相对于父容器的坐标
 * width:节点的宽度
 * height:节点的高度
 * style:节点的样式
 * */
export interface FlowNodeType {
    id: NodeNumber
    nextNode: NodeNumber[]
    position: { x: number, y: number }
    width: number
    height: number
    style?: CSSProperties
}

/**
 * 工作流连接线,从一个节点的某个连接点到另一个节点的某个连接点
 * sourceNode:起点节点id
 * targetNode:终点节点id
 * sourceAnchorType:起点连接点的类型 分上下左右
 * targetAnchorType:终点连接点的类型 分上下左右
 * style:线的样式
 * 通过sourceNode找到起始节点的坐标，通过sourceAnchorType进而算出连接线起始点的坐标
 * 通过targetNode找到终点节点的坐标，通过targetAnchorType进而算出连接线终点点的坐标
 * */
export interface EdgeType {
    sourceNode: number
    targetNode: number
    sourceAnchorType: AnchorType,
    targetAnchorType: AnchorType,
    style?: CSSProperties
}


const FlowNode = (props: {
    flowNode: FlowNodeType,
    onMove: (id: number, x: number, y: number) => void,
    children?: React.ReactNode
}) => {

    const style = {
        border: '1px solid black',
        backgroundColor: 'lightgrey',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'move',
        opacity: 0.6,
        overflow:"hidden"
    };

    return (
        <Rd
            // bounds="parent"
            initialPosition={props.flowNode.position}
            size={{width: props.flowNode.width, height: props.flowNode.height}}
            onDragStop={( d) => props.onMove(props.flowNode.id, d.x, d.y)}
            onDrag={( d) => props.onMove(props.flowNode.id, d.x, d.y)}
        >
            <div style={{
                ...style, ...props.flowNode.style,
                width: props.flowNode.width,
                height: props.flowNode.height
            }}>{props.children}</div>
        </Rd>
    );
};

// 计算贝塞尔曲线的控制点
const calculateControlPoint = (source: { x: number, y: number }, target: { x: number, y: number }, offset?: number) => {
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    // 控制点偏移量，可以根据需要调整
    const offsetX = ((source.x - target.x) / 4) + (offset || 50);
    const offsetY = ((source.y - target.y) / 4) + (offset || 50);
    return {
        x: midX + offsetX,
        y: midY + offsetY
    };
};
// 改进后的贝塞尔曲线控制点计算函数
const calculateImprovedControlPoints = (source: { x: number, y: number }, target: { x: number, y: number }) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 控制点距离源点和目标点的距离，可以根据需要调整
    const controlPointDistance = distance * 0.5;
    
    // 计算控制点的偏移量
    const offsetX = controlPointDistance * (dy / distance);
    const offsetY = controlPointDistance * (dx / distance);
    
    return {
        cp1: { x: source.x + offsetX, y: source.y - offsetY },
        cp2: { x: target.x + offsetX, y: target.y - offsetY }
    };
};

// 改进后的渲染连接线函数
const renderImprovedEdgesByPointsPosition = (sourcePointPosition: { x: number, y: number }, targetPointPosition: { x: number, y: number }) => {
    const { cp1, cp2 } = calculateImprovedControlPoints(sourcePointPosition, targetPointPosition);
    const path = `M ${sourcePointPosition.x},${sourcePointPosition.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${targetPointPosition.x},${targetPointPosition.y}`;
    
    return (
        <Fragment>
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="white"/>
                </marker>
            </defs>
            <path d={path} stroke="white" strokeWidth="2" fill="transparent" markerEnd="url(#arrowhead)"/>
            <circle cx={sourcePointPosition.x} cy={sourcePointPosition.y} r="4" fill="white"/>
            <circle cx={targetPointPosition.x} cy={targetPointPosition.y} r="4" fill="white"/>
        </Fragment>
    );
};

// 使用贝塞尔曲线渲染连接线
const renderEdgesByPointsPosition = (sourcePointPosition: { x: number, y: number }, targetPointPosition: {
    x: number,
    y: number
}) => {
    const controlPointA = calculateControlPoint(sourcePointPosition, targetPointPosition, -50);
    const controlPointB = calculateControlPoint(targetPointPosition, sourcePointPosition, 50);
    const path = `M ${sourcePointPosition.x},${sourcePointPosition.y} C ${controlPointA.x},${controlPointA.y} ${controlPointB.x},${controlPointB.y} ${targetPointPosition.x},${targetPointPosition.y}`;
    return (
        <Fragment>
            {/* 定义箭头标记 */}
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="white"/>
                </marker>
            </defs>
            {/* 在路径的末端应用箭头标记 */}
            <path d={path} stroke="white" fill="transparent" markerEnd="url(#arrowhead)"/>
            <circle cx={`${controlPointA.x}`} cy={`${controlPointA.y}`} r="1" fill="pink"/>
            <circle cx={`${controlPointB.x}`} cy={`${controlPointB.y}`} r="1" fill="pink"/>
            <circle cx={`${sourcePointPosition.x}`} cy={`${sourcePointPosition.y}`} r="5" fill="white"/>
            <circle cx={`${targetPointPosition.x}`} cy={`${targetPointPosition.y}`} r="5" fill="white"/>
        </Fragment>
    );
};


const getPointPosition = (node: FlowNodeType, anchorType: AnchorType) => {

    switch (anchorType) {
        case 'left':
            return {x: node.position.x, y: node.position.y + node.height / 2}
        case 'top':
            return {x: node.position.x + node.width / 2, y: node.position.y}
        case 'right':
            return {x: node.position.x + node.width, y: node.position.y + node.height / 2}
        case 'bottom':
            return {x: node.position.x + node.width / 2, y: node.position.y}
    }
}
const Edge = (props: { edge: EdgeType, nodes: FlowNodeType[] }) => {
    const sourceNode = props.nodes.find(node => node.id === props.edge.sourceNode)
    const targetNode = props.nodes.find(node => node.id === props.edge.targetNode)
    if (sourceNode && targetNode) {

        const sourcePointPosition = getPointPosition(sourceNode, props.edge.sourceAnchorType)
        const targetPointPosition = getPointPosition(targetNode, props.edge.targetAnchorType)
        return renderImprovedEdgesByPointsPosition(sourcePointPosition, targetPointPosition)
    }
    return <></>
};

const Flow = () => {
    const {nodes, edges} = useModel(flowModel, 'nodes', 'edges')
     const {highestFrequencyText,textList} = useModel(chatModel,"highestFrequencyText","textList")
    useEffect(() => {
        // 因为还没有修该edges数据的交互，这里暂时空缺

    }, [nodes])
    const handleDragStop = (id: number, x: number, y: number) => {
        flowModel.updateNodePosition(id,
            {
                x, y
            })
    };

    return (
        <div
            style={{
                position: 'relative',
                width: '60%',
                height: '50vh',
                border: '1px solid grey',
                margin:"20em"
            }}
        >
            {nodes.map((node) => (
                <FlowNode key={node.id} flowNode={node} onMove={handleDragStop}>
                    <div style={{width:300,height:399}}>{node.id}</div>
                    </FlowNode>
            ))}
            <svg style={{width: '100%', height: '100%'}}>
                {edges.map((edge, index) => (
                    <Edge key={index} edge={edge} nodes={nodes}/>
                ))}
            </svg>
            <div style={{
                position: "absolute",
                zIndex: -1,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0.5
            }}>
                <div>{
                    `${JSON.stringify(nodes)}`
                }</div>
                <br/>
                <div>{
                    `${JSON.stringify(edges)}`
                }</div>
                <div style={{color:"#fff",position:"fixed",top:0,right:0,width:300,maxHeight:"90vh",overflowY:"auto"}}>
                    <div>{!!highestFrequencyText&&<h1>{highestFrequencyText}+1</h1>}</div>
                    <div>{
                        textList.map((t,k)=><div key={k}>{t}</div>)
                    }</div>
                </div>
                <div style={{position:"fixed",bottom:0,fontSize:"4em",display:"flex"}}>
                    <button  onClick={flowModel.undo}>Back!</button>
                    <button  onClick={flowModel.redo}>Forward!</button>
                </div>

            </div>
        </div>
    );
};

export default Flow;