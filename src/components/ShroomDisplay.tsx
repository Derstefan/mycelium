"use client";

import { useEffect, useRef, useState } from 'react';
import { decodeRuleSetCompact } from '../script/rules';
import { Viewer } from '../script/view';
import { Game } from '../script/game';
import { ElementConfig } from '../script/models';
import { generateSeededColor } from '../script/utils';
import { ShroomHoverCard } from './mycel/ShroomHoverCard';

interface ShroomDisplayProps {
    index: number;
    ruleEncoded: string;
    shroomColor: string;
    eConfig: ElementConfig;
    addSelectedShroom?: (index: number) => void;
}

const gridSize = 27;
const midX = (gridSize - 1) / 2;
const midY = (gridSize - 1) / 2;
const maxEvolve = 9;


const ShroomDisplay: React.FC<ShroomDisplayProps> = ({ index, ruleEncoded, shroomColor, eConfig }) => {
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const ruleSet = decodeRuleSetCompact(ruleEncoded);
    const [log, setLog] = useState<string>('');

    const gameRef = useRef<Game | null>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize game and viewer
    useEffect(() => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;

        // Cleanup previous instances
        if (viewerRef.current) {
            gameRef.current = null;
        }

        const newGame = new Game(
            eConfig,
            { shrooms: [ruleSet], shroomColors: [generateSeededColor(ruleEncoded)] },
            gridSize,
            gridSize
        );
        newGame.shroomStartValues([{ x: midX, y: midY }]);
        const newViewer = new Viewer(newGame, canvas);

        gameRef.current = newGame;
        viewerRef.current = newViewer;

        // Initial render for non-hovered state (level maxEvolve)
        if (!isHovered) {
            newGame.evolveAllShrooms(maxEvolve);
            newViewer.render();
        }

        return () => {
            gameRef.current = null;
        };
    }, [ruleEncoded, shroomColor, eConfig]);

    // Handle animation when hovered
    useEffect(() => {
        if (!isHovered) {
            // Reset to level maxEvolve when not hovered
            if (gameRef.current) {
                gameRef.current.cleanData();
                gameRef.current.shroomStartValues([{ x: midX, y: midY }]);
                gameRef.current.evolveAllShrooms(maxEvolve);
                viewerRef.current?.render();
            }
            return;
        }

        // Start animation when hovered
        let currentStep = 0;
        gameRef.current?.cleanData();
        gameRef.current?.shroomStartValues([{ x: midX, y: midY }]);
        viewerRef.current?.render();

        intervalRef.current = setInterval(() => {
            if (currentStep >= maxEvolve + 2) {
                // Reset animation
                currentStep = 0;
                gameRef.current?.cleanData();
                gameRef.current?.shroomStartValues([{ x: midX, y: midY }]);
            } else {
                gameRef.current?.evolveAllShrooms(1);
                currentStep++;
            }
            viewerRef.current?.render();
        }, 200);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isHovered, ruleSet]);



    return (
        <div
            className="relative flex items-center gap-3 mb-2 bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-700"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <canvas
                ref={previewCanvasRef}
                id={`previewCanvasDisplay${index}`}
                width={gridSize * 5}
                height={gridSize * 5}
                className="border rounded-md"
                suppressHydrationWarning
            />

            {isHovered && (
                <ShroomHoverCard
                    id={index}
                    shroomColor={shroomColor}
                    log={log}
                    setLog={setLog}
                />
            )}
        </div>
    );
}


export default ShroomDisplay;