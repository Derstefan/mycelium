"use client";

import React, { useState, useEffect } from 'react';
import { generateRuleSetByIndex } from '../script/rules';
import { Game } from '../script/game';
import { ElementConfig, Rule } from '../script/models';
import { generateSeededColor } from '../script/utils';
import { neo4jService } from '../lib/neo4j';

const gridSize = 41;
const offset = 10;


type Position = { x: number; y: number };

const getStartPositions = (): [Position, Position] => [
    { x: offset, y: offset },
    { x: gridSize - offset, y: gridSize - offset },
];

export interface SimulationResult {
    ratio: number;
    winnerColor: string;
    genome1: string;  // Binärstring des ersten Shrooms
    genome2: string;  // Binärstring des zweiten Shrooms
}

export interface BattleResult {
    id1: number;
    id2: number;
    ratio: number;
    winnerId: number | null;
    evolveCount: number;
    genome1: string;  // Binärstring des ersten Shrooms
    genome2: string;  // Binärstring des zweiten Shrooms
}

interface BattleMatrixProps {
    eConfig: ElementConfig;
    minShroomIndex: number;
    numberOfShrooms: number;
    evolveEnd: number;
}

const BattleMatrix: React.FC<BattleMatrixProps> = ({
    eConfig,
    minShroomIndex,
    numberOfShrooms,
    evolveEnd,
}) => {
    // Anzahl der Shrooms entspricht dem Intervall [min, max]

    // Shroom-IDs: Werden innerhalb des definierten Intervalls generiert und anschließend sortiert
    const [shroomIndexes, setShroomIndexes] = useState<number[]>([]);
    const [matrix, setMatrix] = useState<SimulationResult[][]>(
        Array.from({ length: numberOfShrooms }, () =>
            Array.from({ length: numberOfShrooms }, () => ({
                ratio: 0,
                winnerColor: "#555555",
                genome1: "0000000000000000",  // 8 Bits für expansion + 8 Bits für dissolve
                genome2: "0000000000000000"   // 8 Bits für expansion + 8 Bits für dissolve
            }))
        )
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [progress, setProgress] = useState<number>(0);


    useEffect(() => {
        // Erstelle ein Array mit allen Indexen von min bis max
        const indexes = Array.from(
            { length: numberOfShrooms },
            (_, i) => minShroomIndex + i
        );
        setShroomIndexes(indexes);
    }, [minShroomIndex, numberOfShrooms]);

    // Funktion zum partiellen Speichern der Ergebnisse (nach jeweils 20 Simulationen)
    const saveResultsToDBPartial = async (results: BattleResult[]) => {
        try {
            // Speichere in Neo4j
            for (const result of results) {
                await neo4jService.createBattle(
                    result.genome1,
                    result.genome2,
                    result.ratio
                );
            }

            // Speichere auch in der alten API (für Kompatibilität)
            const res = await fetch('/api/battleresults', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(results),
            });
            if (!res.ok) {
                console.error('Fehler beim Speichern der Ergebnisse:', res.statusText);
            } else {
                console.log('Partielle BattleResults erfolgreich gespeichert:', results.length);
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Ergebnisse:', error);
        }
    };

    // Hilfsfunktion: spiegelt ein SimulationResult (umgekehrtes Verhältnis)
    const mirrorResult = (original: SimulationResult): SimulationResult => ({
        ratio: 1 - original.ratio,
        winnerColor: original.winnerColor,
        genome1: original.genome2,
        genome2: original.genome1
    });

    // Hilfsfunktion: Extrahiert die expansion und dissolve Werte aus einem RuleSet
    const extractGenomeFromRuleSet = (ruleSet: Rule[]): string => {
        const expansion = ruleSet
            .filter((r: Rule) => r.fromElement === 0 && r.elementId === 1)
            .map((r: Rule) => r.elementSums[0]);
        const dissolve = ruleSet
            .filter((r: Rule) => r.fromElement === 1 && r.elementId === 0)
            .map((r: Rule) => r.elementSums[0]);

        // Konvertiere die Werte in einen Binärstring
        let genome = '';
        for (let i = 1; i <= 8; i++) {
            genome += expansion.includes(i) ? '1' : '0';
        }
        for (let i = 1; i <= 8; i++) {
            genome += dissolve.includes(i) ? '1' : '0';
        }
        return genome;
    };

    // Simuliert einen Kampf zwischen zwei Shrooms
    const simulateBattle = (
        shroomIndex1: number,
        shroomIndex2: number
    ): SimulationResult => {
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

        for (let step = 0; step < evolveEnd; step++) {
            game.evolveAllShrooms(1);
        }
        game.count();
        const counts = game.sCount;
        const total = counts[0] + counts[1];
        const ratio = total === 0 ? 0.5 : counts[0] / total;
        const winnerColor =
            ratio > 0.7 ? shroomColor1 : ratio < 0.7 ? shroomColor2 : '#808080';

        return {
            ratio,
            winnerColor,
            genome1: extractGenomeFromRuleSet(ruleSet1),
            genome2: extractGenomeFromRuleSet(ruleSet2)
        };
    };

    // Führe alle Simulationen aus und speichere sukzessive nach je 20 Spielen
    useEffect(() => {
        if (shroomIndexes.length === 0) return;
        setLoading(true);
        const n = shroomIndexes.length;
        const totalUniqueSimulations = (n * (n - 1)) / 2;
        let done = 0;
        // Erzeuge ein leeres 2D-Array für die Matrix
        const newMatrix: SimulationResult[][] = Array.from({ length: n }, () => new Array(n));
        let accumulatedResults: BattleResult[] = [];

        const simulateAll = async () => {
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const result = simulateBattle(shroomIndexes[i], shroomIndexes[j]);
                    newMatrix[i][j] = result;
                    newMatrix[j][i] = mirrorResult(result);

                    const winnerId =
                        result.ratio > 0.5 ? shroomIndexes[i] : result.ratio < 0.5 ? shroomIndexes[j] : null;

                    console.log(result.genome1, result.genome2)
                    accumulatedResults.push({
                        id1: shroomIndexes[i],
                        id2: shroomIndexes[j],
                        ratio: result.ratio,
                        winnerId,
                        evolveCount: evolveEnd,
                        genome1: result.genome1,
                        genome2: result.genome2
                    });

                    done++;
                    setProgress(Math.round((done / totalUniqueSimulations) * 100));

                    // Nach je 20 simulierten Spielen in die DB speichern
                    if (accumulatedResults.length >= 20) {
                        await saveResultsToDBPartial(accumulatedResults);
                        accumulatedResults = [];
                    }
                    await new Promise((resolve) => setTimeout(resolve, 0));
                }
            }
            // Falls noch Restdaten vorhanden sind, diese speichern
            if (accumulatedResults.length > 0) {
                await saveResultsToDBPartial(accumulatedResults);
            }
            setMatrix(newMatrix);
            setLoading(false);
        };

        simulateAll();
    }, [shroomIndexes, eConfig, evolveEnd]);

    // Initialisiere Neo4j beim Start der Komponente
    useEffect(() => {
        const initNeo4j = async () => {
            try {
                await neo4jService.initialize();
                console.log('Neo4j wurde erfolgreich initialisiert');
            } catch (error) {
                console.error('Fehler beim Initialisieren von Neo4j:', error);
            }
        };
        initNeo4j();
    }, []);

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
                                                    i === j || ((cell.ratio * 100) < 70 && (cell.ratio * 100) > 30)
                                                        ? '#777777'
                                                        : cell.winnerColor,
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
                </>
            )}
        </div>
    );
};

export default BattleMatrix;
