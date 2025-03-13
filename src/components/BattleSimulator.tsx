"use client";

import { useEffect, useRef, useState } from 'react';
import { decodeRuleSetCompact, generateRuleSetByIndex } from '../script/rules';
import { Viewer } from '../script/view';
import { Game } from '../script/game';
import { ElementConfig } from '../script/models';
import { generateSeededColor } from '../script/utils';

interface BattleSimulatorProps {
    shroomIndex1: number;
    shroomIndex2: number;
    eConfig: ElementConfig;
}

const BattleSimulator: React.FC<BattleSimulatorProps> = ({ shroomIndex1, shroomIndex2, eConfig }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const [counts, setCounts] = useState<{ shroom1: number[]; shroom2: number[] }>({
        shroom1: [],
        shroom2: []
    });
    const [sliderIndex1, setSliderIndex1] = useState(shroomIndex1);
    const [sliderIndex2, setSliderIndex2] = useState(shroomIndex2);
    // State for current simulation indexes (used to generate new rules/colors)
    const [index1, setIndex1] = useState(shroomIndex1);
    const [index2, setIndex2] = useState(shroomIndex2);

    // Compute colors based on current indexes
    const [shroomColor1, setShroomColor1] = useState(generateSeededColor(shroomIndex1));
    const [shroomColor2, setShroomColor2] = useState(generateSeededColor(shroomIndex2));

    const simulationInterval = useRef<NodeJS.Timeout | null>(null);
    const chartData = useRef<number[]>([]);
    const maxDataPoints = 1000;
    const [isSimulating, setIsSimulating] = useState(false);

    // Refs for input fields
    const sliderInput1Ref = useRef<HTMLInputElement>(null);
    const sliderInput2Ref = useRef<HTMLInputElement>(null);

    // Function to run one simulation step
    const runSimulation = () => {
        if (!gameRef.current) return;

        gameRef.current.evolveAllShrooms(1);
        viewerRef.current?.render();

        gameRef.current.count();
        const currentCounts = gameRef.current.sCount;
        setCounts(prev => ({
            shroom1: [...prev.shroom1, currentCounts[0]],
            shroom2: [...prev.shroom2, currentCounts[1]]
        }));
        const ratio = currentCounts[0] / ((currentCounts[0] + currentCounts[1]) || 1);
        chartData.current = [...chartData.current, ratio].slice(-maxDataPoints);
        drawChart();

        // Automatically stop if one shroom takes over (0% or 100%)
        if (ratio === 0 || ratio === 1) {
            stopSimulation();
        }
    };

    // Start automatic simulation (runs a step every 50ms)
    const startSimulation = () => {
        if (simulationInterval.current) return; // already running
        simulationInterval.current = setInterval(runSimulation, 50);
        setIsSimulating(true);
    };

    // Stop the automatic simulation
    const stopSimulation = () => {
        if (simulationInterval.current) {
            clearInterval(simulationInterval.current);
            simulationInterval.current = null;
        }
        setIsSimulating(false);
    };

    // Manually run one simulation step (only when simulation is stopped)
    const stepSimulation = () => {
        runSimulation();
    };

    // Reset simulation logic to update indexes/colors and clear data.
    const handleReset = () => {
        if (!gameRef.current) {
            console.warn('Game not initialized yet!');
            return;
        }
        // Reset: stop simulation, update colors and indexes, clear counts/chartData.
        stopSimulation();
        gameRef.current.cleanData();
        gameRef.current.shroomStartValues([{ x: 10, y: 10 }, { x: 109, y: 109 }]);
        setShroomColor1(generateSeededColor(sliderIndex1));
        setShroomColor2(generateSeededColor(sliderIndex2));
        setIndex1(sliderIndex1);
        setIndex2(sliderIndex2);
        setCounts({ shroom1: [], shroom2: [] });
        chartData.current = [];
        viewerRef.current?.render();

        gameRef.current.count();
    };

    const handleInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        field: 'slider1' | 'slider2'
    ) => {
        if (e.key === 'Enter') {
            handleReset();
        } else if (field === 'slider1' && (e.key === 'ArrowDown')) {
            sliderInput2Ref.current?.focus();
        } else if (field === 'slider2' && (e.key === 'ArrowUp')) {
            sliderInput1Ref.current?.focus();
        }
    };

    // Initialize game and viewer when indexes, colors, or config change.
    useEffect(() => {
        // Stop any running simulation before reinitializing
        stopSimulation();
        const initGame = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const gridSize = 121;
            const ruleSet1 = generateRuleSetByIndex(index1);
            const ruleSet2 = generateRuleSetByIndex(index2);

            const newGame = new Game(
                eConfig,
                {
                    shrooms: [ruleSet1, ruleSet2],
                    shroomColors: [shroomColor1, shroomColor2]
                },
                gridSize,
                gridSize
            );

            newGame.shroomStartValues([
                { x: 10, y: 10 },
                { x: 109, y: 109 }
            ]);

            const newViewer = new Viewer(newGame, canvas);
            gameRef.current = newGame;
            viewerRef.current = newViewer;
            chartData.current = [];
            setCounts({ shroom1: [], shroom2: [] });
        };

        initGame();
        startSimulation();

        return () => {
            gameRef.current = null;
            if (simulationInterval.current) {
                clearInterval(simulationInterval.current);
            }
        };
    }, [index1, index2, eConfig, shroomColor1, shroomColor2]);

    // Chart drawing function
    const drawChart = () => {
        const canvas = chartRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const margin = 20;
        const chartWidth = canvas.width - margin * 2;
        const chartHeight = canvas.height - margin * 2;
        const dataLength = chartData.current.length;
        const stepX = chartWidth / Math.max(dataLength - 1, 1);

        const visibleData = chartData.current;

        // Shroom1 filled area (below the line)
        ctx.beginPath();
        ctx.moveTo(margin, margin + chartHeight);
        visibleData.forEach((ratio, index) => {
            const x = margin + index * stepX;
            const y = margin + chartHeight - (ratio * chartHeight);
            ctx.lineTo(x, y);
        });
        ctx.lineTo(margin + visibleData.length * stepX, margin + chartHeight);
        ctx.closePath();
        ctx.fillStyle = `${shroomColor1}60`;
        ctx.fill();

        // Shroom2 filled area (above the line)
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        visibleData.forEach((ratio, index) => {
            const x = margin + index * stepX;
            const y = margin + chartHeight - (ratio * chartHeight);
            ctx.lineTo(x, y);
        });
        ctx.lineTo(margin + visibleData.length * stepX, margin);
        ctx.closePath();
        ctx.fillStyle = `${shroomColor2}60`;
        ctx.fill();

        // Draw grid
        ctx.strokeStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, margin + chartHeight);
        ctx.lineTo(margin + chartWidth, margin + chartHeight);
        ctx.stroke();

        // Draw ratio line
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        visibleData.forEach((ratio, index) => {
            const x = margin + index * stepX;
            const y = margin + chartHeight - (ratio * chartHeight);
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw current ratio text
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        const currentRatio = visibleData[visibleData.length - 1] || 0;
        ctx.fillText(
            `${(currentRatio * 100).toFixed(1)}% vs ${(100 - currentRatio * 100).toFixed(1)}%`,
            margin + 10,
            margin + 20
        );
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-900">
            <div className="flex items-center mb-2">
                <span className="text-gray-500 mr-2">#</span>
                <input
                    ref={sliderInput1Ref}
                    type="text"
                    value={sliderIndex1}
                    onChange={e => {
                        if (e.target.value === "") setSliderIndex1(0);
                        if (isNaN(parseInt(e.target.value))) return;
                        let value = Math.floor(parseInt(e.target.value));
                        if (value < 0) value = 0;
                        if (value > 12187) value = 12187;
                        setSliderIndex1(value);
                    }}
                    className="bg-gray-800 text-white p-1 rounded"
                    onKeyDown={e => handleInputKeyDown(e, 'slider1')}
                />
                <span className="mx-4 text-gray-500">vs</span>
                <span className="text-gray-500 mr-2">#</span>
                <input
                    ref={sliderInput2Ref}
                    type="text"
                    value={sliderIndex2}
                    onChange={e => {
                        if (e.target.value === "") setSliderIndex2(0);
                        if (isNaN(parseInt(e.target.value))) return;
                        let value = Math.floor(parseInt(e.target.value));
                        if (value < 0) value = 0;
                        if (value > 12187) value = 12187;
                        setSliderIndex2(value);
                    }}
                    className="bg-gray-800 text-white p-1 rounded"
                    onKeyDown={e => handleInputKeyDown(e, 'slider2')}
                />
            </div>
            <div className="flex items-center mb-2">

                <button
                    className="px-4 py-2 ml-4 text-white bg-gray-800 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={handleReset}
                >
                    reset
                </button>

                <button
                    className="px-4 py-2 ml-4 text-white bg-gray-800 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={stopSimulation}
                    disabled={!isSimulating}
                >
                    ⏸
                </button>
                <button
                    className="px-4 py-2 ml-4 text-white bg-gray-800 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={stepSimulation}
                    disabled={isSimulating}
                >
                    ⏯
                </button>
                <button
                    className="px-4 py-2 ml-4 text-white bg-gray-800 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => {
                        // Run simulation only if it's not running.
                        if (!isSimulating) {
                            startSimulation();
                        }
                    }}
                >
                    ⏵
                </button>
            </div>
            <div className="relative mb-4">
                <canvas
                    ref={canvasRef}
                    width={121}
                    height={121}
                    className="border-2 border-gray-700 rounded-lg"
                />
                <div className="bottom-2 left-2 right-2 flex justify-between text-sm">
                    <span style={{ color: shroomColor1 }}>
                        {counts.shroom1[counts.shroom1.length - 1] || 0}
                    </span>
                    <span style={{ color: shroomColor2 }}>
                        {counts.shroom2[counts.shroom2.length - 1] || 0}
                    </span>
                </div>
            </div>

            <canvas
                ref={chartRef}
                width={800}
                height={200}
                className="border-2 border-gray-700 rounded-lg"
            />
        </div>
    );
};

export default BattleSimulator;
