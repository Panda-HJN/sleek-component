import React, {useEffect, useRef, useState} from 'react';
import './rd.css';

type Position = {
    x: number;
    y: number;
};

type RdProps = {
    position?: Position;
    size?: { width: number; height: number };
    initialPosition?: Position;
    onDrag?: (position: Position) => void;
    onDragStop?: (position: Position) => void;
    children?: React.ReactNode;
};

const Rd: React.FC<RdProps> = ({
                                   position,
                                   initialPosition,
                                   onDrag,
                                   onDragStop,
                                   children,
                               }) => {
    const [internalPosition, setInternalPosition] = useState(initialPosition || {x: 0, y: 0});
    const [dragging, setDragging] = useState(false);
    const rdRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState({x: 0, y: 0});

    const updateMouseOffset = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (rdRef.current) {
            const rect = rdRef.current.getBoundingClientRect();
            const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
            const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
            const offset = {
                x: clientX - rect.left,
                y: clientY - rect.top,
            };
            setOffset(offset);
            return offset;
        }
    };

    const dragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        updateMouseOffset(e);
        setDragging(true);
        if (onDrag) {
            onDrag(internalPosition);
        }
    };

    const move = (e: MouseEvent | TouchEvent) => {
        if (!dragging || !rdRef.current || !rdRef.current.parentNode) return;
        const rdElement = rdRef.current;
        const parentElement = rdElement.parentNode as HTMLElement;
        const parentRect = parentElement.getBoundingClientRect();
        const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
        const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
        const newPosition = {
            x: clientX - parentRect.left - offset.x,
            y: clientY - parentRect.top - offset.y,
        };
        if (!position) {
            setInternalPosition(newPosition);
        }
        if (onDrag) {
            onDrag(newPosition);
        }
    };

    const dragEnd = () => {
        setDragging(false);
        setOffset({x: 0, y: 0});
        if (onDragStop) {
            onDragStop(position ?? internalPosition);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => move(e);
        const handleMouseUp = () => dragEnd();
        const handleTouchMove = (e: TouchEvent) => move(e);
        const handleTouchEnd = () => dragEnd();

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, {passive: false});
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [dragging, internalPosition, position]);

    const currentPosition = position ?? internalPosition;

    return (
        <div
            ref={rdRef}
            className="sleek-rd"
            style={{
                boxSizing: "border-box",
                position: 'absolute',
                top: currentPosition.y,
                left: currentPosition.x,
                width: '100px',
                height: '100px',
                cursor: 'pointer',
            }}
            onMouseDown={(e) => dragStart(e)}
            onTouchStart={(e) => dragStart(e)}
        >
            {children}
            <div className="contral-cover"></div>
        </div>
    );
};

export {Rd};
