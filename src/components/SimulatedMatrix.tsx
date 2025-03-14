import React, { useEffect, useRef, useState, MouseEvent } from 'react';
import { simulationData } from '../data/data';
import { generateSeededColor } from '../script/utils';

//const evolveEnd = 100;
const scale = 3; // 3px per unit
const maxCoord = 2187; // 0 to 12187 => 12188 units
const canvasSize = maxCoord * scale; // total pixel size

interface TooltipData {
    visible: boolean;
    x: number;
    y: number;
    content: string;
}

const SimulationMatrix: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tooltip, setTooltip] = useState<TooltipData>({
        visible: false,
        x: 0,
        y: 0,
        content: ''
    });

    // Pre-calculate canvas points from simulationData
    const points = simulationData.map((data, index) => {
        const { id1, id2, winnerId } = data;
        let color = '#808080'; // default for tie
        if (winnerId === id1) {
            color = generateSeededColor(id1);
        } else if (winnerId === id2) {
            color = generateSeededColor(id2);
        }
        console.log(index + "/" + simulationData.length);
        return {
            x: id1 * scale,
            y: id2 * scale,
            width: scale,
            height: scale,
            data,
            color
        };
    });

    // Draw all points on the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw each point as a filled rectangle
        points.forEach((pt) => {
            ctx.fillStyle = pt.color;
            ctx.fillRect(pt.x, pt.y, pt.width, pt.height);
        });
    }, [points]);

    // Helper to check if the mouse is over a point
    const getPointAt = (x: number, y: number) => {
        // You could optimize this further with spatial indexing if needed.
        return points.find(
            (pt) =>
                x >= pt.x &&
                x <= pt.x + pt.width &&
                y >= pt.y &&
                y <= pt.y + pt.height
        );
    };

    // Handle mouse movement over the canvas
    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        // Convert mouse position to canvas coordinate system
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const found = getPointAt(x, y);
        if (found) {
            const { id1, id2, ratio, evolveCount } = found.data;
            setTooltip({
                visible: true,
                // position tooltip relative to the container
                x: e.clientX + 10,
                y: e.clientY + 10,
                content: `id1: ${id1}, id2: ${id2}, ratio: ${(ratio * 100).toFixed(1)}%, evolve: ${evolveCount}`
            });
        } else {
            setTooltip((prev) => ({ ...prev, visible: false }));
        }
    };

    const handleMouseLeave = () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
    };

    return (
        <div
            style={{
                overflow: 'auto',
                width: '100vw',
                height: '100vh',
                position: 'relative',
                backgroundColor: '#000' // black background for empty cells
            }}
        >
            <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{ display: 'block' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />
            {tooltip.visible && (
                <div
                    style={{
                        position: 'absolute',
                        left: tooltip.x,
                        top: tooltip.y,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#fff',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        pointerEvents: 'none',
                        zIndex: 10,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};

export default SimulationMatrix;
