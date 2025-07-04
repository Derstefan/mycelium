"use client";

import { useEffect, useRef, useState } from 'react';
import { generateRuleSetByIndex } from '../script/rules';
import { Viewer } from '../script/view';
import { Game } from '../script/game';
import { ElementConfig } from '../script/models';
import { generateSeededColor } from '../script/utils';
import { mapNumberToMycelName, parseMycelName } from '../script/namegenerator';
import { ShroomHoverCard } from './mycel/ShroomHoverCard';


/* --- Ende der Umrechnungsfunktionen --- */

interface BattleSimulatorProps {
    shroomIndex1: number;
    shroomIndex2: number;
    eConfig: ElementConfig;
}

const gridSize = 121;
const offset = 30;

type Position = { x: number; y: number };

const BattleSimulator: React.FC<BattleSimulatorProps> = ({ shroomIndex1, shroomIndex2, eConfig }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const [counts, setCounts] = useState<{ shroom1: number[]; shroom2: number[] }>({
        shroom1: [],
        shroom2: []
    });

    // Statt nur der Zahl führen wir hier zusätzlich den zugehörigen Namen als Text
    const [sliderIndex1, setSliderIndex1] = useState(shroomIndex1);
    const [sliderIndex2, setSliderIndex2] = useState(shroomIndex2);
    const [inputText1, setInputText1] = useState<string>(mapNumberToMycelName(shroomIndex1) || "");
    const [inputText2, setInputText2] = useState<string>(mapNumberToMycelName(shroomIndex2) || "");

    // State für aktuelle Simulationseinstellungen
    const [index1, setIndex1] = useState(shroomIndex1);
    const [index2, setIndex2] = useState(shroomIndex2);
    const [shroomColor1, setShroomColor1] = useState(generateSeededColor(shroomIndex1));
    const [shroomColor2, setShroomColor2] = useState(generateSeededColor(shroomIndex2));
    const simulationInterval = useRef<NodeJS.Timeout | null>(null);
    const chartData = useRef<number[]>([]);
    const maxDataPoints = 1000;
    const [isSimulating, setIsSimulating] = useState(false);

    // Refs für Input-Felder (falls weitere Steuerung nötig ist)
    const sliderInput1Ref = useRef<HTMLInputElement>(null);
    const sliderInput2Ref = useRef<HTMLInputElement>(null);

    // Neue State-Variable für Startposition
    const [positionType, setPositionType] = useState<'diagonal' | 'stacked' | 'random'>('diagonal');

    const [isHovering1, setIsHovering1] = useState(false);
    const [isHovering2, setIsHovering2] = useState(false);

    const [tempIndex1, setTempIndex1] = useState(shroomIndex1);
    const [tempIndex2, setTempIndex2] = useState(shroomIndex2);
    const [log, setLog] = useState<string>('');


    // Hilfsfunktion: Bestimme Startpositionen
    const getStartPositions = (): [Position, Position] => {
        if (positionType === 'diagonal') {
            return [
                { x: offset, y: offset },
                { x: gridSize - offset, y: gridSize - offset }
            ];
        } else if (positionType === 'stacked') {
            const center = Math.floor(gridSize / 2);
            return [
                { x: center, y: center - offset },
                { x: center, y: center + offset }
            ];
        } else if (positionType === 'random') {
            const randomPos = (): Position => ({
                x: Math.floor(Math.random() * (gridSize - 2 * offset)) + offset,
                y: Math.floor(Math.random() * (gridSize - 2 * offset)) + offset
            });
            return [randomPos(), randomPos()];
        }
        return [
            { x: offset, y: offset },
            { x: gridSize - offset, y: gridSize - offset }
        ];
    };

    // Simulation Schritt
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

        if ((ratio === 0 || ratio === 1)) {
            stopSimulation();
        }
    };

    const startSimulation = () => {
        if (simulationInterval.current) return;
        simulationInterval.current = setInterval(runSimulation, 50);
        setIsSimulating(true);
    };

    const stopSimulation = () => {
        if (simulationInterval.current) {
            clearInterval(simulationInterval.current);
            simulationInterval.current = null;
        }
        setIsSimulating(false);
    };

    const stepSimulation = () => {
        runSimulation();
    };

    // Bei Reset werden Index, Farben und Input-Texte aktualisiert.
    const handleReset = (newIndex1?: number, newIndex2?: number) => {
        if (!gameRef.current) {
            console.warn('Game not initialized yet!');
            return;
        }
        stopSimulation();
        if (newIndex1 !== undefined && newIndex2 !== undefined) {
            setShroomColor1(generateSeededColor(newIndex1));
            setShroomColor2(generateSeededColor(newIndex2));
            setIndex1(newIndex1);
            setIndex2(newIndex2);
            setSliderIndex1(newIndex1);
            setSliderIndex2(newIndex2);
            setInputText1(mapNumberToMycelName(newIndex1) || "");
            setInputText2(mapNumberToMycelName(newIndex2) || "");
        } else {
            setShroomColor1(generateSeededColor(sliderIndex1));
            setShroomColor2(generateSeededColor(sliderIndex2));
            setIndex1(sliderIndex1);
            setIndex2(sliderIndex2);
            setInputText1(mapNumberToMycelName(sliderIndex1) || "");
            setInputText2(mapNumberToMycelName(sliderIndex2) || "");
        }
        gameRef.current.cleanData();
        gameRef.current.shroomStartValues(getStartPositions());
        setCounts({ shroom1: [], shroom2: [] });
        chartData.current = [];
        viewerRef.current?.render();
        gameRef.current.count();
    };

    // Zufällige Index-Wahl via Würfel-Button
    const handleRandomizeIndexes = () => {
        const random1 = Math.floor(Math.random() * 65536);
        const random2 = Math.floor(Math.random() * 65536);
        setSliderIndex1(random1);
        setSliderIndex2(random2);
        setInputText1(mapNumberToMycelName(random1) || "");
        setInputText2(mapNumberToMycelName(random2) || "");
        handleReset(random1, random2);
    };

    const handleInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        field: 'slider1' | 'slider2'
    ) => {
        if (e.key === 'Enter') {
            stopSimulation();
            const value = field === 'slider1' ? inputText1 : inputText2;
            let parsed: number | null = null;
            if (!isNaN(Number(value))) {
                parsed = parseInt(value, 10);
                console.log(parsed);
            } else {
                parsed = parseMycelName(value);
                console.log(parsed);
            }
            if (parsed !== null && parsed >= 0 && parsed <= 65536) {
                if (field === 'slider1') {
                    setSliderIndex1(parsed);
                    const standardized = mapNumberToMycelName(parsed);
                    setInputText1(standardized || value);
                } else {
                    setSliderIndex2(parsed);
                    const standardized = mapNumberToMycelName(parsed);
                    setInputText2(standardized || value);
                }
            }
        } else if (field === 'slider1' && e.key === 'ArrowDown') {
            sliderInput2Ref.current?.focus();
        } else if (field === 'slider2' && e.key === 'ArrowUp') {
            sliderInput1Ref.current?.focus();
        }
    };

    const handlePositionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPositionType(e.target.value as 'diagonal' | 'stacked' | 'random');
        handleReset();
    };

    // Beim Initialisieren oder bei Änderungen neu aufsetzen
    useEffect(() => {
        stopSimulation();
        const initGame = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

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


            newGame.shroomStartValues(getStartPositions());
            //newGame.putWall(10, 10, 80, 10);
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
    }, [index1, index2, eConfig, shroomColor1, shroomColor2, positionType]);

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

        // Bereich Shroom1
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

        // Bereich Shroom2
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

        // Raster
        ctx.strokeStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, margin + chartHeight);
        ctx.lineTo(margin + chartWidth, margin + chartHeight);
        ctx.stroke();

        // Verhältnis-Linie
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

        // Aktuelles Verhältnis als Text
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        const currentRatio = visibleData[visibleData.length - 1] || 0;
        ctx.fillText(
            `${(currentRatio * 100).toFixed(1)}% vs ${(100 - currentRatio * 100).toFixed(1)}%`,
            margin + 10,
            margin + 20
        );
    };

    // Handler für die Textfelder: Wenn der Benutzer etwas eingibt (entweder Zahl oder Name),
    // wird versucht, diesen Input in einen gültigen Index zu konvertieren und der standardisierte Name
    // angezeigt.
    const handleInputChange1 = (value: string) => {
        stopSimulation();
        setInputText1(value);

    };

    const handleInputChange2 = (value: string) => {
        stopSimulation();
        setInputText2(value);

    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-900">
            <div className="flex items-center mb-2">
                <div className="flex items-center mb-2">

                    <div className="flex items-center mb-2">
                        {/* Input 1 mit Hover Card */}
                        <div className="relative" onMouseLeave={() => {
                            setIsHovering1(false)
                        }}>
                            <input
                                ref={sliderInput1Ref}
                                type="text"
                                value={inputText1}
                                onChange={e => handleInputChange1(e.target.value)}
                                placeholder="#id or name"
                                className="bg-gray-800 text-white p-1 rounded mr-4"
                                onKeyDown={e => handleInputKeyDown(e, 'slider1')}
                                onMouseEnter={() => {
                                    setIsHovering1(true)
                                    stopSimulation()
                                }}
                            />
                            {isHovering1 && (
                                <div className="absolute top-full left-0">
                                    <ShroomHoverCard
                                        id={index1}
                                        shroomColor={shroomColor1}
                                        log={log}
                                        setLog={setLog}
                                        setIndex={setTempIndex1}
                                        go={(index: number) => {
                                            setIndex1(index)
                                        }}
                                        goAndReset={(index: number) => {
                                            console.log("goAndReset", index, index2)
                                            console.log("log", tempIndex1, tempIndex2)
                                            setIndex1(index)
                                            handleReset(index, index2)
                                            setIsHovering1(false)

                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <span className="mx-4 text-gray-500">vs</span>

                        {/* Input 2 mit Hover Card */}
                        <div className="relative" onMouseLeave={() => {
                            setIsHovering2(false)

                        }}>
                            <input
                                ref={sliderInput2Ref}
                                type="text"
                                value={inputText2}
                                onChange={e => handleInputChange2(e.target.value)}
                                placeholder="#id or name"
                                className="bg-gray-800 text-white p-1 rounded ml-4"
                                onKeyDown={e => handleInputKeyDown(e, 'slider2')}
                                onMouseEnter={() => {
                                    setIsHovering2(true)
                                    stopSimulation()
                                }}
                            />
                            {isHovering2 && (
                                <div className="absolute top-full left-0">
                                    <ShroomHoverCard
                                        id={index2}
                                        shroomColor={shroomColor2}
                                        log={log}
                                        setLog={setLog}
                                        setIndex={setTempIndex2}
                                        go={(index: number) => {
                                            setIndex2(index)
                                        }}
                                        goAndReset={(index: number) => {
                                            console.log("goAndReset", index1, index)
                                            setIndex2(index)
                                            handleReset(index1, index)
                                            setIsHovering2(false)

                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center mb-2">
                <button
                    className="px-4 py-2 ml-4 text-white bg-gray-800 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => handleReset()}
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
                    width={gridSize}
                    height={gridSize}
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

            <div className="mt-4 flex items-center">
                <label htmlFor="positionType" className="text-white mr-2">
                    start position:
                </label>
                <select
                    id="positionType"
                    value={positionType}
                    onChange={handlePositionTypeChange}
                    className="bg-gray-800 text-white p-1 rounded"
                >
                    <option value="diagonal">diagonal</option>
                    <option value="stacked">horizontal</option>
                    <option value="random">random</option>
                </select>
                <button
                    title="Randomize Shroom Indexes"
                    className="ml-4 text-white text-2xl hover:text-gray-400 cursor-pointer"
                    onClick={handleRandomizeIndexes}
                >
                    🎲
                </button>
            </div>
        </div >
    );
};

export default BattleSimulator;
