"use client";

import React, { useState, useEffect } from 'react';
import { generateRuleSetByIndex } from '../script/rules';
import { Game } from '../script/game';
import { ElementConfig } from '../script/models';
import { generateSeededColor } from '../script/utils';
import { simulationData } from '../data/data';

const gridSize = 41;
const offset = 10;
const evolveEnd = 100;
const numberOfShrooms = 67;

type Position = { x: number; y: number };

const getStartPositions = (): [Position, Position] => [
    { x: offset, y: offset },
    { x: gridSize - offset, y: gridSize - offset }
];

interface SimulationResult {
    ratio: number;
    winnerColor: string;
}

interface BattleMatrixProps {
    eConfig: ElementConfig;
}

export interface BattleResult {
    id1: number;
    id2: number;
    ratio: number;
    winnerId: number | null;
    evolveCount: number;
}

const BattleMatrix: React.FC<BattleMatrixProps> = ({ eConfig }) => {
    const [shroomIndexes, setShroomIndexes] = useState<number[]>([]);
    const [matrix, setMatrix] = useState<SimulationResult[][]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<number>(0);
    const [copyFeedback, setCopyFeedback] = useState<string>('');

    // Generates the array of battle results (to be copied)
    const generateResultsArray = (): BattleResult[] => {
        const results: BattleResult[] = [];

        shroomIndexes.forEach((id1, i) => {
            shroomIndexes.forEach((id2, j) => {
                if (i === j) return; // skip same shroom battles

                const cell = matrix[i][j];
                const winnerId = cell.ratio > 0.5 ? id1 : cell.ratio < 0.5 ? id2 : null;

                results.push({
                    id1,
                    id2,
                    ratio: cell.ratio,
                    winnerId,
                    evolveCount: evolveEnd
                });
            });
        });

        return results;
    };

    // Copy function
    const copyResults = async () => {
        try {
            const results = generateResultsArray().concat(simulationData);
            results.sort((a, b) => a.id1 - b.id1 || a.id2 - b.id2);

            await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
            setCopyFeedback('Ergebnisse in Zwischenablage kopiert!');
        } catch (err) {
            setCopyFeedback('Fehler beim Kopieren!');
        }
        setTimeout(() => setCopyFeedback(''), 2000);
    };

    // Initialize shroom indexes on mount
    useEffect(() => {
        const indexes = Array.from({ length: numberOfShrooms }, () =>
            Math.floor(Math.random() * 12188)
        );
        setShroomIndexes(indexes);
    }, []);

    // Helper: mirror a SimulationResult (flip the ratio)
    const mirrorResult = (original: SimulationResult): SimulationResult => ({
        ratio: 1 - original.ratio,
        winnerColor: original.winnerColor
    });

    // Helper: convert a cached BattleResult to a SimulationResult from the perspective of rowId vs. colId.
    const convertCachedResult = (
        cached: BattleResult,
        rowId: number,
        colId: number
    ): SimulationResult => {
        if (cached.id1 === rowId) {
            return {
                ratio: cached.ratio,
                winnerColor:
                    cached.winnerId === rowId
                        ? generateSeededColor(rowId)
                        : cached.winnerId === null
                            ? '#808080'
                            : generateSeededColor(colId)
            };
        } else {
            return {
                ratio: 1 - cached.ratio,
                winnerColor:
                    cached.winnerId === colId
                        ? generateSeededColor(colId)
                        : cached.winnerId === null
                            ? '#808080'
                            : generateSeededColor(rowId)
            };
        }
    };

    useEffect(() => {
        if (shroomIndexes.length === 0) return;
        setLoading(true);
        const n = shroomIndexes.length;
        const totalUniqueSimulations = (n * (n - 1)) / 2;
        let done = 0;
        const newMatrix: SimulationResult[][] = Array.from({ length: n }, () => new Array(n));

        // Function to simulate a battle between two shrooms
        const simulateBattle = (shroomIndex1: number, shroomIndex2: number): SimulationResult => {
            const ruleSet1 = generateRuleSetByIndex(shroomIndex1);
            const ruleSet2 = generateRuleSetByIndex(shroomIndex2);
            const shroomColor1 = generateSeededColor(shroomIndex1);
            const shroomColor2 = generateSeededColor(shroomIndex2);

            const game = new Game(
                eConfig,
                { shrooms: [ruleSet1, ruleSet2], shroomColors: [shroomColor1, shroomColor2] },
                gridSize,
                gridSize
            );
            game.shroomStartValues(getStartPositions());

            for (let step = 0; step < evolveEnd; step++) game.evolveAllShrooms(1);
            game.count();
            const counts = game.sCount;
            const total = counts[0] + counts[1];
            const ratio = total === 0 ? 0.5 : counts[0] / total;
            const winnerColor =
                ratio > 0.7 ? shroomColor1 : ratio < 0.7 ? shroomColor2 : '#808080';

            return { ratio, winnerColor };
        };

        // Run all simulations
        const simulateAll = async () => {
            for (let i = 0; i < n; i++) {
                // Diagonal cell: same shroom, no battle.
                newMatrix[i][i] = { ratio: 0, winnerColor: '#555555' };
                for (let j = i + 1; j < n; j++) {
                    // Check if we have cached data for this battle (in any order)
                    const cachedResult = simulationData.find(
                        (r) =>
                            ((r.id1 === shroomIndexes[i] && r.id2 === shroomIndexes[j]) ||
                                (r.id1 === shroomIndexes[j] && r.id2 === shroomIndexes[i])) &&
                            r.evolveCount === evolveEnd
                    );

                    if (cachedResult) {
                        console.log(`Using cached result for ${shroomIndexes[i]} vs ${shroomIndexes[j]}`);
                        newMatrix[i][j] = convertCachedResult(cachedResult, shroomIndexes[i], shroomIndexes[j]);
                        newMatrix[j][i] = mirrorResult(newMatrix[i][j]);
                    } else {
                        const result = simulateBattle(shroomIndexes[i], shroomIndexes[j]);
                        newMatrix[i][j] = result;
                        newMatrix[j][i] = mirrorResult(result);
                    }
                    done++;
                    setProgress(Math.round((done / totalUniqueSimulations) * 100));
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
            setMatrix(newMatrix);
            setLoading(false);
        };

        simulateAll();
    }, [shroomIndexes, eConfig]);

    return (
        <div className="p-4 bg-gray-900 text-white overflow-auto">
            <h2 className="text-xl mb-4">Battle Matrix ({evolveEnd} Evolutionsschritte)</h2>
            {loading ? (
                <div className="w-full">
                    <div className="mb-2">Lade Simulation... ({progress}%)</div>
                    <div className="w-full bg-gray-700 rounded h-4">
                        <div className="bg-green-500 h-4 rounded" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            ) : (
                <>
                    <table className="table-auto border-collapse border border-gray-700">
                        <thead>
                            <tr>
                                <th className="border border-gray-700 px-2 py-1">Index</th>
                                {shroomIndexes.map((index, col) => (
                                    <th
                                        key={col}
                                        className="border border-gray-700 px-2 py-1"
                                        style={{ backgroundColor: generateSeededColor(index) }}
                                    >
                                        {index}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {shroomIndexes.map((rowIndex, i) => (
                                <tr key={i}>
                                    <td
                                        className="border border-gray-700 px-2 py-1"
                                        style={{ backgroundColor: generateSeededColor(rowIndex) }}
                                    >
                                        {rowIndex}
                                    </td>
                                    {matrix[i]?.map((cell, j) => (
                                        <td
                                            key={j}
                                            className="border border-gray-700 px-2 py-1 text-center"
                                            style={{
                                                backgroundColor:
                                                    i === j ||
                                                        ((cell.ratio * 100) < 70 && (cell.ratio * 100) > 30)
                                                        ? '#777777'
                                                        : cell.winnerColor
                                            }}
                                            title={
                                                i === j
                                                    ? 'Gleiche Shrooms - kein Kampf'
                                                    : `Sieger: ${cell.winnerColor}`
                                            }
                                        >
                                            {i === j ? '' : `${(cell.ratio * 100).toFixed(1)}%`}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        onClick={copyResults}
                        disabled={loading}
                        className={`px-4 mt-2 py-2 rounded ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                    >
                        copy
                    </button>
                    {copyFeedback && <div className="mt-2">{copyFeedback}</div>}
                </>
            )}
        </div>
    );
};

export default BattleMatrix;
