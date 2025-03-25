import React, { useEffect, useRef, useState, MouseEvent } from 'react';
import { generateSeededColor } from '../script/utils';

const scale = 3; // 3px pro Einheit
const maxCoord = 2187; // Beispielwert: maximaler Wert der Koordinaten
const canvasSize = maxCoord * scale; // Gesamtgröße in Pixel

// Schnittstelle für einen BattleResult-Eintrag
interface BattleResult {
    id1: number;
    id2: number;
    ratio: number;
    winnerId: number | null;
    evolveCount: number;
}

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
    // Zustand für die aus der DB geladenen Daten
    const [simulationResults, setSimulationResults] = useState<BattleResult[]>([]);

    // Funktion zum Laden der Daten aus der Datenbank via API-Route (GET)
    const fetchSimulationResults = async () => {
        try {
            const response = await fetch('/api/battleresults');
            if (response.ok) {
                const data = await response.json();
                // Hier gehen wir davon aus, dass die API { success, data } liefert oder direkt ein Array
                setSimulationResults(data.data || data);
            } else {
                console.error('Fehler beim Laden der Daten:', response.statusText);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    };

    // Daten einmalig beim Start laden
    useEffect(() => {
        fetchSimulationResults();
    }, []);
    // Berechne die Canvas-Punkte inklusive gespiegelter Kopien
    const points = simulationResults.flatMap((data) => {
        const { id1, id2, ratio, winnerId, evolveCount } = data;

        // Originaler Punkt (id1 vs id2)
        const originalColor = winnerId === id1
            ? generateSeededColor(id1)
            : winnerId === id2
                ? generateSeededColor(id2)
                : '#808080';

        // Gespiegelter Punkt (id2 vs id1)
        const mirroredRatio = 1 - ratio;
        const mirroredWinnerId = winnerId === id1 ? id2 : winnerId === id2 ? id1 : null;


        return [
            // Originaler Punkt
            {
                x: id1 * scale,
                y: id2 * scale,
                width: scale,
                height: scale,
                data,
                color: originalColor
            },
            // Gespiegelter Punkt (nur wenn id1 != id2)
            ...(id1 !== id2 ? [{
                x: id2 * scale,
                y: id1 * scale,
                width: scale,
                height: scale,
                data: {
                    id1: id2,
                    id2: id1,
                    ratio: mirroredRatio,
                    winnerId: mirroredWinnerId,
                    evolveCount
                },
                color: originalColor
            }] : [])
        ];
    });

    // Zeichne alle Punkte in den Canvas, wenn sich die Daten ändern
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points.forEach((pt) => {
            ctx.fillStyle = `${pt.data.ratio > 0.7 || pt.data.ratio < 0.3 ? pt.color : pt.data.ratio > 0.55 || pt.data.ratio < 0.45 ? pt.color + '80' : '#505050'}`;
            ctx.fillRect(pt.x, pt.y, pt.width, pt.height);
        });
    }, [points]);

    // Hilfsfunktion: Liefert den Punkt, über dem sich die Maus befindet
    const getPointAt = (x: number, y: number) => {
        return points.find(
            (pt) =>
                x >= pt.x &&
                x <= pt.x + pt.width &&
                y >= pt.y &&
                y <= pt.y + pt.height
        );
    };

    // Zeige den Tooltip, falls die Maus über einem Punkt schwebt
    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const found = getPointAt(x, y);
        if (found) {
            const { id1, id2, ratio, evolveCount } = found.data;
            setTooltip({
                visible: true,
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
                backgroundColor: '#000'
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
