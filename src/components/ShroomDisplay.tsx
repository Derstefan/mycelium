"use client";

import { useEffect, useRef, useState } from 'react';
import { decodeRuleSetCompact, encodeRuleSetCompact } from '../script/rules';
import { Viewer } from '../script/view';
import { Game } from '../script/game';
import { ElementConfig } from '../script/models';
import { useRouter } from 'next/navigation';
import { generateSeededColor } from '../script/utils';

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


const ShroomDisplay: React.FC<ShroomDisplayProps> = ({ index, ruleEncoded, shroomColor, eConfig, addSelectedShroom }) => {
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
    }, [isHovered]);

    // Rest of the component remains the same...
    const ruleGroups = ruleSet.reduce((acc: { [key: string]: number[][] }, rule) => {
        const key = rule.fromElement === rule.elementId ?
            `${rule.fromElement} keeps ${rule.elementId}` :
            `${rule.fromElement} to ${rule.elementId}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(rule.elementSums);
        return acc;
    }, {});

    return (
        <div
            className="relative flex items-center gap-3 mb-2 bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-700 "
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

            {/* Hover Card */}
            <div className={`
                absolute left-0 top-full mb-2
                bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-600
                min-w-[300px] z-50
                transition-all duration-300 ease-out
                ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
                `}>
                <div className="flex items-center mb-2">
                    <span className="text-sm font-mono cursor-pointer" style={{ color: shroomColor }}
                        onClick={() => {
                            navigator.clipboard.writeText(index + "");
                            setLog('Copied Id');
                            setTimeout(() => setLog(''), 1500);
                        }}>#{index}</span>
                    <span className="text-xs text-gray-400 ml-2">{log}</span>
                    <button className='position-right bg-gray-700 p-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors m-2'
                        onClick={() => addSelectedShroom ? addSelectedShroom(index) : null}>add</button>
                </div>
                <div className="space-y-3">
                    {Object.entries(ruleGroups).map(([transition, sums]) => (
                        <div key={transition} className="flex items-baseline bg-gray-700 p-3 rounded-lg">
                            <div className="flex items-baseline gap-2 mb-2 mr-2">
                                <span className="font-bold text-sm">{transition}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {(sums as number[][]).map((sumArray, i) => (
                                    <div
                                        key={i}
                                        className="text-xs font-mono p-1 bg-gray-600 rounded text-center"
                                    >
                                        [{sumArray.join(',')}]
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div >
    );
};

export default ShroomDisplay;