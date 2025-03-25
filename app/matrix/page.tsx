"use client";

import React, { useState } from 'react';
import BattleMatrix from '@/src/components/BattleMatrix';
import { ElementConfig } from '@/src/script/models';

export default function Page() {
    // Standardwerte für die Parameter
    const [minShroom, setMinShroom] = useState<number>(0);
    const [numberOfShrooms, setNumberOfShrooms] = useState<number>(20);
    const [evolveSteps, setEvolveSteps] = useState<number>(100);
    const [start, setStart] = useState<boolean>(false);

    // Erzeuge ein ElementConfig‑Objekt – ggf. anpassen
    const eConfig = new ElementConfig(1, "dyrk");

    const handleStart = () => {
        setStart(true);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
            <h1 className="text-2xl font-bold">Simulator</h1>

            {/* Formular zur Eingabe der Parameter */}
            <div className="flex flex-col space-y-2">
                <label>
                    Min Shroom Index:
                    <input
                        type="number"
                        value={minShroom}
                        onChange={(e) => setMinShroom(Number(e.target.value))}
                        className="ml-2 border rounded p-1"
                    />
                </label>
                <label>
                    Max Shroom Index:
                    <input
                        type="number"
                        value={numberOfShrooms}
                        onChange={(e) => setNumberOfShrooms(Number(e.target.value))}
                        className="ml-2 border rounded p-1"
                    />
                </label>
                <label>
                    Evolutionsschritte (evolveEnd):
                    <input
                        type="number"
                        value={evolveSteps}
                        onChange={(e) => setEvolveSteps(Number(e.target.value))}
                        className="ml-2 border rounded p-1"
                    />
                </label>
            </div>

            <button
                onClick={handleStart}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Start Generation
            </button>

            {/* Nur rendern, wenn der Benutzer auf "Start Generation" klickt */}
            {start && (
                <BattleMatrix
                    eConfig={eConfig}
                    minShroomIndex={minShroom}
                    numberOfShrooms={numberOfShrooms}
                    evolveEnd={evolveSteps}
                />
            )}
        </div>
    );
}
