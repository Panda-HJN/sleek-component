import React, {useState, useEffect, useRef} from 'react';
import './rd.css';

type Position = {
    x: number;
    y: number;
}
type RdProps = {
    position?: Position
    size?: { width: number; height: number };
    initialPosition?: Position
    onDrag?: (position: Position) => void;
    onDragStop?: (position: Position) => void;
    children?: React.ReactNode;
};

const Rd: React.FC<RdProps> = ({ position, initialPosition, onDrag, onDragStop, children }) => {
    const [internalPosition, setInternalPosition] = useState(initialPosition || { x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const rdRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const upDateMouseOffset = (e: React.MouseEvent<HTMLDivElement> |MouseEvent) => {
        if (rdRef.current) {
            const rect = rdRef.current.getBoundingClientRect();
           const offset={
               x: e.clientX - rect.left,
               y: e.clientY - rect.top
           }
            setOffset(offset)
            return offset
        }
    }
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        upDateMouseOffset(e);
        setDragging(true);
        if (onDrag) {
            onDrag(internalPosition);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragging || !rdRef.current || !rdRef.current.parentNode) return;
        const rdElement = rdRef.current;
        const parentElement = rdElement.parentNode as HTMLElement; // 更明确地断言父元素类型
        const parentRect = parentElement.getBoundingClientRect();
        const newPosition = {
            x: e.clientX - parentRect.left - offset.x,
            y: e.clientY - parentRect.top - offset.y
        };
        if (!position) {
            setInternalPosition(newPosition);
        }
        if (onDrag) {
            onDrag(newPosition);
        }
    };

    const handleMouseUp = () => {
        setDragging(false);
        setOffset({ x: 0, y: 0 })
        if (onDragStop) {
            onDragStop(position ?? internalPosition);
        }
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, internalPosition, position]);

    const currentPosition = position ?? internalPosition;

    return (
        <div
            ref={rdRef}
            className="sleek-rd"
            style={{
                boxSizing:"border-box",
                position: 'absolute',
                top: currentPosition.y,
                left: currentPosition.x,
                width: '100px',
                height: '100px',
                cursor: 'pointer',
            }}
            onMouseDown={handleMouseDown}
        >
            {children}
            <div className="contral-cover"></div>

        </div>
    );
};

export { Rd };
