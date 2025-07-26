"use client";

import { useEffect, useRef, useState } from 'react';
import { generateRuleSetByIndex } from '../script/rules';
import { Viewer } from '../script/view';
import { Game } from '../script/game';
import { ElementConfig } from '../script/models';
import { generateSeededColor } from '../script/utils';
import { mapNumberToMycelName, parseMycelName } from '../script/namegenerator';
import { ShroomHoverCard } from './mycel/ShroomHoverCard';
import { decimalToBinary16, binary16ToDecimal, isValidBinary16, formatBinary16 } from '../utils/binaryUtils';

interface ShroomConfig {
    index: number;
    x: number;
    y: number;
}

interface AdvancedBattleSimulatorProps {
    width: number;
    height: number;
    shrooms: ShroomConfig[];
    eConfig: ElementConfig;
}

type Position = { x: number; y: number };

const AdvancedBattleSimulator: React.FC<AdvancedBattleSimulatorProps> = ({
    width,
    height,
    shrooms,
    eConfig
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const viewerRef = useRef<Viewer | null>(null);

    const [counts, setCounts] = useState<number[]>([]);
    const [shroomConfigs, setShroomConfigs] = useState<ShroomConfig[]>(shrooms);
    const [shroomColors, setShroomColors] = useState<string[]>([]);
    const [shroomNames, setShroomNames] = useState<string[]>([]);
    const [shroomBinaryIds, setShroomBinaryIds] = useState<string[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [log, setLog] = useState<string>('');
    const [tempIndices, setTempIndices] = useState<number[]>([]);
    const [hoveredShroom, setHoveredShroom] = useState<number | null>(null);

    const [wasSimulatingBeforeHover, setWasSimulatingBeforeHover] = useState(false);
    const [wasSimulatingBeforeDrag, setWasSimulatingBeforeDrag] = useState(false);
    const [historySteps, setHistorySteps] = useState<string[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [draggedShroom, setDraggedShroom] = useState<number | null>(null);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
    const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number; element: number; shroom: number | null; age: number; triggerSum: number } | null>(null);

    const simulationInterval = useRef<NodeJS.Timeout | null>(null);
    const chartData = useRef<number[][]>([]);
    const maxDataPoints = 1000;
    const urlUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    // Keyboard event handler for space key
    useEffect(() => {
        if (typeof window === 'undefined') return; // Skip during SSR

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault(); // Prevent page scroll
                if (isSimulating) {
                    stopSimulation();
                } else {
                    startSimulation();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSimulating]);

    // Initialisiere Farben, Namen und Binär-IDs für alle Shrooms
    useEffect(() => {
        const colors = shroomConfigs.map(config => generateSeededColor(config.index));
        const names = shroomConfigs.map(config => mapNumberToMycelName(config.index) || "");
        const binaryIds = shroomConfigs.map(config => decimalToBinary16(config.index));
        const indices = shroomConfigs.map(config => config.index);

        setShroomColors(colors);
        setShroomNames(names);
        setShroomBinaryIds(binaryIds);
        setTempIndices(indices);
    }, [shroomConfigs]);

    // Event-Listener für Browser-Navigation
    useEffect(() => {
        if (typeof window === 'undefined') return; // Skip during SSR

        const handlePopState = () => {
            // Parse URL parameters when browser navigation occurs
            const urlParams = new URLSearchParams(window.location.search);
            const shroomsParam = urlParams.get('shrooms');

            if (shroomsParam) {
                try {
                    const newShrooms = shroomsParam.split(';').map(part => {
                        const [binaryIndex, x, y] = part.split(',');
                        const xNum = parseInt(x);
                        const yNum = parseInt(y);

                        if (isValidBinary16(binaryIndex)) {
                            const index = binary16ToDecimal(binaryIndex);
                            return { index, x: xNum, y: yNum };
                        } else {
                            const index = parseInt(binaryIndex);
                            return { index, x: xNum, y: yNum };
                        }
                    }).filter(shroom =>
                        !isNaN(shroom.index) &&
                        !isNaN(shroom.x) &&
                        !isNaN(shroom.y) &&
                        shroom.x >= 0 && shroom.x < width &&
                        shroom.y >= 0 && shroom.y < height
                    );

                    if (newShrooms.length >= 2) {
                        setShroomConfigs(newShrooms);
                    }
                } catch (error) {
                    console.error('Fehler beim Parsen der URL-Parameter:', error);
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [width, height]);

    // Initialize history with current URL
    useEffect(() => {
        const currentURL = `/?width=${width}&height=${height}&shrooms=${shroomConfigs.map(s => `${decimalToBinary16(s.index)},${s.x},${s.y}`).join(';')}`;
        if (historySteps.length === 0) {
            setHistorySteps([currentURL]);
            setCurrentStepIndex(0);
        }
    }, []);

    // Simulation Schritt
    const runSimulation = () => {
        if (!gameRef.current) return;
        gameRef.current.evolveAllShrooms(1);
        viewerRef.current?.render();
        gameRef.current.count();
        const currentCounts = gameRef.current.sCount;
        setCounts([...currentCounts]);

        // Chart-Daten aktualisieren
        chartData.current = [...chartData.current, [...currentCounts]].slice(-maxDataPoints);
        drawChart();

        // Entferne das automatische Stoppen, wenn nur noch ein Shroom übrig ist
        // const activeShrooms = currentCounts.filter(count => count > 0);
        // if (activeShrooms.length <= 1) {
        //     stopSimulation();
        // }
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

    const handleReset = () => {
        if (!gameRef.current) return;
        stopSimulation();
        gameRef.current.cleanData();

        const positions: Position[] = shroomConfigs.map(config => ({ x: config.x, y: config.y }));
        gameRef.current.shroomStartValues(positions);

        setCounts(new Array(shroomConfigs.length).fill(0));
        chartData.current = [];
        viewerRef.current?.render();
        gameRef.current.count();
    };

    const handleShroomUpdate = (shroomIndex: number, newIndex: number) => {
        const newConfigs = [...shroomConfigs];
        newConfigs[shroomIndex] = { ...newConfigs[shroomIndex], index: newIndex };
        setShroomConfigs(newConfigs);
        updateURL(newConfigs, false); // Kein History-Eintrag für einzelne Änderungen
    };

    const updateURL = (newConfigs: ShroomConfig[], addToHistory: boolean = false, immediate: boolean = false) => {
        const updateURLInternal = () => {
            if (typeof window === 'undefined') return; // Skip during SSR

            const shroomsParam = newConfigs.map(s => `${decimalToBinary16(s.index)},${s.x},${s.y}`).join(';');
            const newURL = `/?width=${width}&height=${height}&shrooms=${shroomsParam}`;

            if (addToHistory) {
                // Füge zur Browser-History hinzu (für Zurück-Navigation)
                window.history.pushState(null, '', newURL);

                // Update history steps
                const newSteps = [...historySteps.slice(0, currentStepIndex + 1), newURL];
                setHistorySteps(newSteps);
                setCurrentStepIndex(newSteps.length - 1);
            } else {
                // Ersetze aktuelle URL ohne History-Eintrag
                window.history.replaceState(null, '', newURL);
            }
        };

        if (immediate) {
            // Sofortige Ausführung ohne Debouncing
            updateURLInternal();
        } else {
            // Debounce URL updates to avoid too many navigation calls
            if (urlUpdateTimeout.current) {
                clearTimeout(urlUpdateTimeout.current);
            }
            urlUpdateTimeout.current = setTimeout(updateURLInternal, 300);
        }
    };

    const handleBinaryInputChange = (shroomIndex: number, binaryInput: string) => {
        // Entferne Leerzeichen und prüfe ob es eine gültige 16-Bit Binärzahl ist
        const cleanBinary = binaryInput.replace(/\s/g, '');

        if (isValidBinary16(cleanBinary)) {
            const newIndex = binary16ToDecimal(cleanBinary);
            handleShroomUpdate(shroomIndex, newIndex);
        }
    };





    // Canvas Interaktivität
    const rectSize = 5; // Aus view.js importiert

    const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const canvasX = Math.floor((event.clientX - rect.left) * (canvas.width / rect.width));
        const canvasY = Math.floor((event.clientY - rect.top) * (canvas.height / rect.height));

        // Berechne Offset (wie im Viewer)
        const offsetX = (canvas.width - width * rectSize) / 2;
        const offsetY = (canvas.height - height * rectSize) / 2;

        // Konvertiere Canvas-Koordinaten zu Game-Koordinaten
        // Viewer rendert data[y][x] aber Game verwendet data[x][y]
        // Also müssen wir die Koordinaten entsprechend anpassen
        const viewerX = Math.floor((canvasX - offsetX) / rectSize);
        const viewerY = Math.floor((canvasY - offsetY) / rectSize);

        // Konvertiere von Viewer-Koordinaten zu Game-Koordinaten
        const gameCoords = { x: viewerY, y: viewerX };

        // Debug-Ausgabe für Koordinaten-Konvertierung
        if (draggedShroom !== null) {
            console.log('=== COORDINATES DEBUG ===');
            console.log('Canvas Rect:', rect);
            console.log('Canvas Size:', { width: canvas.width, height: canvas.height });
            console.log('Game Size:', { width, height });
            console.log('RectSize:', rectSize);
            console.log('Offsets:', { offsetX, offsetY });
            console.log('Raw Canvas Coords:', { canvasX, canvasY });
            console.log('Viewer Coords:', { viewerX, viewerY });
            console.log('Game Coords:', gameCoords);
            console.log('=== COORDINATES DEBUG END ===');
        }

        return gameCoords;
    };

    const getPixelValue = (x: number, y: number) => {
        if (!gameRef.current || x < 0 || x >= width || y < 0 || y >= height) return null;
        const field = gameRef.current.data[x][y]; // data[x][y] wie im Game
        return {
            element: field?.element || 0,
            shroom: field?.shroom,
            age: field?.age || 0,
            triggerSum: field?.triggerSum || 0
        };
    };

    const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getCanvasCoordinates(event);
        if (!coords) return;


        setMousePosition(coords);

        // Get pixel value for hover info
        const pixelValue = getPixelValue(coords.x, coords.y);
        if (pixelValue !== null) {
            setHoveredPixel({
                x: coords.x,
                y: coords.y,
                element: pixelValue.element,
                shroom: pixelValue.shroom,
                age: pixelValue.age,
                triggerSum: pixelValue.triggerSum
            });
        } else {
            setHoveredPixel(null);
        }

        // Optional: Show visual feedback during drag
        if (draggedShroom !== null) {
            console.log('Dragging shroom', draggedShroom, 'at position', coords);
        }

        //if release mouse button, update url
    };

    const handleCanvasMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getCanvasCoordinates(event);

        console.log("mouse up", coords);
        if (draggedShroom !== null && coords) {
            console.log("Setting new position for shroom", draggedShroom, "to", coords);

            // Setze die neue Shroom-Startposition
            const newConfigs = [...shroomConfigs];
            newConfigs[draggedShroom] = {
                ...newConfigs[draggedShroom],
                x: coords.x,
                y: coords.y
            };

            // Update Shroom-Configs und URL
            setShroomConfigs(newConfigs);
            updateURL(newConfigs, true, true);

            // Reset
            setDraggedShroom(null);

            // Resume simulation if it was running before drag
            if (wasSimulatingBeforeDrag) {
                console.log("Resuming simulation after drag");
                startSimulation();
                setWasSimulatingBeforeDrag(false);
            }
        }
    };



    const handleCanvasMouseLeave = () => {
        setMousePosition(null);
        setHoveredPixel(null);
        if (draggedShroom !== null) {
            updateURL(shroomConfigs, true, true);
            setDraggedShroom(null);
        }
    };



    const handleRandomizeAll = () => {
        const newConfigs = shroomConfigs.map(config => ({
            ...config,
            index: Math.floor(Math.random() * 12188)
        }));

        // Prüfe ob sich die Konfiguration tatsächlich geändert hat
        const hasChanged = newConfigs.some((newConfig, index) =>
            newConfig.index !== shroomConfigs[index].index
        );

        if (hasChanged) {
            setShroomConfigs(newConfigs);
            updateURL(newConfigs, true, true); // History + sofortige Ausführung
        }
    };

    const addShroom = () => {
        const newShroom: ShroomConfig = {
            index: Math.floor(Math.random() * 12188),
            x: Math.floor(Math.random() * (width - 60)) + 30,
            y: Math.floor(Math.random() * (height - 60)) + 30
        };
        const newConfigs = [...shroomConfigs, newShroom];
        setShroomConfigs(newConfigs);
        updateURL(newConfigs, true, true); // History + sofortige Ausführung
    };

    const removeShroom = (index: number) => {
        if (shroomConfigs.length > 2) {
            const newConfigs = shroomConfigs.filter((_, i) => i !== index);
            setShroomConfigs(newConfigs);
            updateURL(newConfigs, true, true); // History + sofortige Ausführung
        }
    };

    // Handler für diagonale Anordnung
    const arrangeDiagonal = () => {
        const n = shroomConfigs.length;
        const minX = 1, maxX = width - 2;
        const minY = 1, maxY = height - 2;
        const newConfigs = shroomConfigs.map((config, i) => ({
            ...config,
            x: Math.max(minX, Math.min(maxX, Math.round((maxX - minX) * (i / (n - 1)) + minX))),
            y: Math.max(minY, Math.min(maxY, Math.round((maxY - minY) * (i / (n - 1)) + minY)))
        }));
        setShroomConfigs(newConfigs);
        updateURL(newConfigs, true, true);
    };

    // Handler für kreisförmige Anordnung
    const arrangeCircle = () => {
        const n = shroomConfigs.length;
        const minX = 1, maxX = width - 2;
        const minY = 1, maxY = height - 2;
        const centerX = Math.floor((minX + maxX) / 2);
        const centerY = Math.floor((minY + maxY) / 2);
        const radius = Math.floor(Math.min(maxX - minX, maxY - minY) * 0.45);
        const newConfigs = shroomConfigs.map((config, i) => {
            const angle = (2 * Math.PI * i) / n;
            const x = Math.round(centerX + radius * Math.cos(angle));
            const y = Math.round(centerY + radius * Math.sin(angle));
            return {
                ...config,
                x: Math.max(minX, Math.min(maxX, x)),
                y: Math.max(minY, Math.min(maxY, y))
            };
        });
        setShroomConfigs(newConfigs);
        updateURL(newConfigs, true, true);
    };

    // Beim Initialisieren oder bei Änderungen neu aufsetzen
    useEffect(() => {
        stopSimulation();
        const initGame = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ruleSets = shroomConfigs.map(config => generateRuleSetByIndex(config.index));
            const colors = shroomConfigs.map(config => generateSeededColor(config.index));

            const newGame = new Game(
                eConfig,
                {
                    shrooms: ruleSets,
                    shroomColors: colors
                },
                width,
                height
            );

            const positions: Position[] = shroomConfigs.map(config => ({ x: config.x, y: config.y }));
            newGame.shroomStartValues(positions);

            const newViewer = new Viewer(newGame, canvas);
            gameRef.current = newGame;
            viewerRef.current = newViewer;
            chartData.current = [];
            setCounts(new Array(shroomConfigs.length).fill(0));
        };

        initGame();
        startSimulation();

        return () => {
            gameRef.current = null;
            if (simulationInterval.current) {
                clearInterval(simulationInterval.current);
            }
            if (urlUpdateTimeout.current) {
                clearTimeout(urlUpdateTimeout.current);
            }
            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current);
            }
        };
    }, [eConfig, width, height]); // Entferne shroomConfigs aus den Dependencies

    // Separates useEffect für Shroom-Konfigurationsänderungen
    useEffect(() => {
        if (gameRef.current) {
            stopSimulation();

            // Erstelle ein neues Game mit den aktualisierten Shrooms
            const ruleSets = shroomConfigs.map(config => generateRuleSetByIndex(config.index));
            const colors = shroomConfigs.map(config => generateSeededColor(config.index));

            const newGame = new Game(
                eConfig,
                {
                    shrooms: ruleSets,
                    shroomColors: colors
                },
                width,
                height
            );

            const positions: Position[] = shroomConfigs.map(config => ({ x: config.x, y: config.y }));
            newGame.shroomStartValues(positions);

            gameRef.current = newGame;
            viewerRef.current = new Viewer(newGame, canvasRef.current!);
            viewerRef.current.render();
            gameRef.current.count();
            setCounts(new Array(shroomConfigs.length).fill(0));
            chartData.current = [];

            startSimulation();
        }
    }, [shroomConfigs, eConfig, width, height]);

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

        if (dataLength === 0) return;

        // Zeichne Bereiche für jeden Shroom
        shroomColors.forEach((color, shroomIndex) => {
            ctx.beginPath();
            ctx.moveTo(margin, margin + chartHeight);

            chartData.current.forEach((dataPoint, index) => {
                const x = margin + index * stepX;
                const total = dataPoint.reduce((sum, count) => sum + count, 0);
                const ratio = total > 0 ? dataPoint[shroomIndex] / total : 0;
                const y = margin + chartHeight - (ratio * chartHeight);
                ctx.lineTo(x, y);
            });

            ctx.lineTo(margin + dataLength * stepX, margin + chartHeight);
            ctx.closePath();
            ctx.fillStyle = `${color}60`;
            ctx.fill();
        });

        // Raster
        ctx.strokeStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, margin + chartHeight);
        ctx.lineTo(margin + chartWidth, margin + chartHeight);
        ctx.stroke();

        // Aktuelle Verhältnisse als Text
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        const currentData = chartData.current[chartData.current.length - 1] || [];
        const total = currentData.reduce((sum, count) => sum + count, 0);

        let yOffset = margin + 15;
        currentData.forEach((count, index) => {
            const percentage = total > 0 ? (count / total * 100).toFixed(1) : '0.0';
            ctx.fillStyle = shroomColors[index];
            ctx.fillText(`${shroomNames[index]}: ${count} (${percentage}%)`, margin + 10, yOffset);
            yOffset += 15;
        });
    };

    return (
        <div className="flex flex-col items-center p-2 sm:p-4 bg-gray-900 min-h-screen">
            {/* Shroom-Konfiguration */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4 w-full max-w-4xl">
                {shroomConfigs.map((config, index) => (
                    <div key={index} className="relative w-full sm:w-56">
                        <div
                            className="flex items-center p-2 rounded cursor-pointer"
                            style={{ backgroundColor: shroomColors[index] + '20' }} // 20 = 12% opacity
                            onMouseEnter={() => {
                                if (hoverTimeout.current) {
                                    clearTimeout(hoverTimeout.current);
                                }
                                setHoveredShroom(index);
                                // Pause simulation when popup opens
                                if (isSimulating) {
                                    setWasSimulatingBeforeHover(true);
                                    stopSimulation();
                                } else {
                                    setWasSimulatingBeforeHover(false);
                                }
                            }}
                            onMouseLeave={() => {
                                hoverTimeout.current = setTimeout(() => {
                                    setHoveredShroom(null);
                                    // Resume simulation if it was running before
                                    if (wasSimulatingBeforeHover) {
                                        startSimulation();
                                        setWasSimulatingBeforeHover(false);
                                    }
                                }, 300); // 300ms Verzögerung
                            }}
                        >
                            <span className="text-white mr-2">#{index + 1}</span>
                            <div className="flex flex-col">
                                <input
                                    type="text"
                                    value={shroomNames[index] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const parsed = parseMycelName(value);
                                        if (parsed !== null) {
                                            handleShroomUpdate(index, parsed);
                                        }
                                    }}
                                    placeholder="Name"
                                    className="bg-gray-700 text-white p-1 rounded text-xs w-24 mb-1"
                                />
                                <input
                                    type="text"
                                    value={formatBinary16(shroomBinaryIds[index] || "0000000000000000")}
                                    onChange={(e) => handleBinaryInputChange(index, e.target.value)}
                                    placeholder="0000 0000 0000 0000"
                                    className="bg-gray-700 text-green-400 p-1 rounded text-xs w-32 font-mono"
                                />
                            </div>
                            <div className="flex flex-col ml-2 min-w-0">
                                <div className="text-white text-xs truncate">{config.x}, {config.y}</div>
                            </div>
                            {shroomConfigs.length > 2 && (
                                <button
                                    onClick={() => removeShroom(index)}
                                    className="ml-2 text-red-400 hover:text-red-200"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {hoveredShroom === index && (
                            <div
                                className="absolute top-full left-0 z-10 bg-gray-800 p-4 rounded shadow-lg flex flex-col gap-2"
                                onMouseEnter={() => {
                                    if (hoverTimeout.current) {
                                        clearTimeout(hoverTimeout.current);
                                    }
                                    setHoveredShroom(index);
                                    if (isSimulating) {
                                        setWasSimulatingBeforeHover(true);
                                        stopSimulation();
                                    } else {
                                        setWasSimulatingBeforeHover(false);
                                    }
                                }}
                                onMouseLeave={() => {
                                    hoverTimeout.current = setTimeout(() => {
                                        setHoveredShroom(null);
                                        if (wasSimulatingBeforeHover) {
                                            startSimulation();
                                            setWasSimulatingBeforeHover(false);
                                        }
                                    }, 300);
                                }}
                            >
                                <div className="flex gap-2 items-center">
                                    <label className="text-white text-xs">X:</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={width - 1}
                                        value={config.x}
                                        onChange={e => {
                                            const newX = Math.max(0, Math.min(width - 1, parseInt(e.target.value) || 0));
                                            const newConfigs = [...shroomConfigs];
                                            newConfigs[index] = { ...newConfigs[index], x: newX };
                                            setShroomConfigs(newConfigs);
                                            updateURL(newConfigs, false, true);
                                        }}
                                        className="bg-gray-700 text-white p-1 rounded text-xs w-12"
                                    />
                                    <label className="text-white text-xs">Y:</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={height - 1}
                                        value={config.y}
                                        onChange={e => {
                                            const newY = Math.max(0, Math.min(height - 1, parseInt(e.target.value) || 0));
                                            const newConfigs = [...shroomConfigs];
                                            newConfigs[index] = { ...newConfigs[index], y: newY };
                                            setShroomConfigs(newConfigs);
                                            updateURL(newConfigs, false, true);
                                        }}
                                        className="bg-gray-700 text-white p-1 rounded text-xs w-12"
                                    />
                                </div>
                                <ShroomHoverCard
                                    id={config.index}
                                    shroomColor={shroomColors[index]}
                                    log={log}
                                    setLog={setLog}
                                    setIndex={(newIndex) => {
                                        const newIndices = [...tempIndices];
                                        newIndices[index] = newIndex;
                                        setTempIndices(newIndices);
                                    }}
                                    go={(newIndex) => {
                                        const newConfigs = [...shroomConfigs];
                                        newConfigs[index] = { ...newConfigs[index], index: newIndex };
                                        setShroomConfigs(newConfigs);
                                        updateURL(newConfigs, true, true);
                                    }}
                                    goAndReset={(newIndex) => {
                                        const newConfigs = [...shroomConfigs];
                                        newConfigs[index] = { ...newConfigs[index], index: newIndex };
                                        setShroomConfigs(newConfigs);
                                        updateURL(newConfigs, true, true);
                                        handleReset();
                                    }}

                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Steuerung */}
            <div className="flex flex-col items-center mb-4 gap-2 w-full">


                <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                    <button
                        className="px-4 py-2 text-white bg-green-800 rounded-lg hover:bg-green-600 transition-colors w-full sm:w-auto"
                        onClick={addShroom}
                    >
                        +
                    </button>
                    <button
                        className="px-3 py-2 text-white bg-blue-800 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        onClick={arrangeDiagonal}
                    >
                        Diagonal
                    </button>
                    <button
                        className="px-3 py-2 text-white bg-purple-800 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                        onClick={arrangeCircle}
                    >
                        Kreis
                    </button>
                    <button
                        className="px-3 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                    <button
                        className="px-3 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        onClick={isSimulating ? stopSimulation : startSimulation}
                    >
                        {isSimulating ? '⏸' : '⏵'}
                    </button>
                    <button
                        className="px-3 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        onClick={stepSimulation}
                        disabled={isSimulating}
                    >
                        ⏯
                    </button>
                    <button
                        className="px-3 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        onClick={handleRandomizeAll}
                    >
                        🎲
                    </button>

                </div>
            </div>

            {/* Canvas */}
            <div className="relative mb-4 w-full flex justify-center">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="border-2 border-gray-700 rounded-lg cursor-crosshair max-w-full h-auto"
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseLeave}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        const event = { clientX: x, clientY: y } as React.MouseEvent<HTMLCanvasElement>;
                        handleCanvasMouseUp(event);
                    }}
                    onTouchMove={(e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        const event = { clientX: x, clientY: y } as React.MouseEvent<HTMLCanvasElement>;
                        handleCanvasMouseMove(event);
                    }}
                    onTouchEnd={(e) => {
                        e.preventDefault();
                        const touch = e.changedTouches[0];
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        const event = { clientX: x, clientY: y } as React.MouseEvent<HTMLCanvasElement>;
                        handleCanvasMouseUp(event);
                    }}
                />

                {/* Pixel Info Overlay */}
                {hoveredPixel && (
                    <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
                        <div>Pixel: ({hoveredPixel.x}, {hoveredPixel.y})</div>
                        <div>Element: {hoveredPixel.element}</div>
                        <div>Shroom: {hoveredPixel.shroom !== null ? `#${hoveredPixel.shroom + 1}` : 'None'}</div>
                        <div>Age: {hoveredPixel.age}</div>
                        <div>Trigger: {hoveredPixel.triggerSum}</div>
                    </div>
                )}

                {/* Shroom Position Indicators - Entfernt */}

                {/* Count-Bereich entfernt */}

            </div>

            {/* Chart */}
            <div className="w-full flex justify-center">
                <canvas
                    ref={chartRef}
                    width={800}
                    height={200}
                    className="border-2 border-gray-700 rounded-lg max-w-full h-auto"
                />
            </div>


        </div>
    );
};

export default AdvancedBattleSimulator; 