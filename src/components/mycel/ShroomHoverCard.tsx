import React, { useState, useEffect } from "react";
import { Rule } from "@/src/script/models";
import { mapNumberToMycelName } from "@/src/script/namegenerator";
import { generateRuleSetByIndex, getIndexFromRuleSet } from "@/src/script/rules";

// Helper function to compare arrays regardless of order
function arraysEqual(a: number[], b: number[]): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
}

interface ShroomHoverCardProps {
    id: number;
    shroomColor: string;
    log: string;
    setLog: (msg: string) => void;
    setIndex?: (index: number) => void;
    go?: (index: number) => void;
    goAndReset?: (index: number) => void;
}

export const ShroomHoverCard: React.FC<ShroomHoverCardProps> = ({
    id,
    shroomColor,
    log,
    setLog,
    setIndex,
    go,
    goAndReset,
}) => {
    const [initialExpansion, setInitialExpansion] = useState<number[]>([]);
    const [initialDissolve, setInitialDissolve] = useState<number[]>([]);
    const [expansionValues, setExpansionValues] = useState<number[]>([]);
    const [dissolveValues, setDissolveValues] = useState<number[]>([]);

    useEffect(() => {
        const initialRuleSet = generateRuleSetByIndex(id);
        const newInitialExpansion = initialRuleSet
            .filter((r: Rule) => r.fromElement === 0 && r.elementId === 1)
            .map((r: Rule) => r.elementSums[0]);
        const newInitialDissolve = initialRuleSet
            .filter((r: Rule) => r.fromElement === 1 && r.elementId === 0)
            .map((r: Rule) => r.elementSums[0]);

        setInitialExpansion(newInitialExpansion);
        setInitialDissolve(newInitialDissolve);
        setExpansionValues(newInitialExpansion);
        setDissolveValues(newInitialDissolve);
    }, [id]);

    const updateIndex = (ev: number[], dv: number[]) => {
        const newRules: Rule[] = [];
        ev.forEach((value) => {
            newRules.push(new Rule(0, [value], 1));
        });
        dv.forEach((value) => {
            newRules.push(new Rule(1, [value], 0));
        });
        const newIndex = getIndexFromRuleSet(newRules);
        setIndex?.(newIndex);
        return newIndex;
    };

    const hasChanges =
        !arraysEqual(expansionValues, initialExpansion) ||
        !arraysEqual(dissolveValues, initialDissolve);

    const InteractiveStrengthBoxes: React.FC<{
        values: number[];
        color: string;
        onToggle: (i: number) => void;
    }> = ({ values, color, onToggle }) => {
        const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        return (
            <div className="flex flex-wrap gap-1">
                {Array.from({ length: 8 }, (_, i) => i + 1).map((i) => (
                    <div
                        key={i}
                        onClick={() => onToggle(i)}
                        style={{
                            borderColor: values.includes(i) ? color : '#6B7280',
                            backgroundColor: values.includes(i)
                                ? hexToRgba(color, 0.2)
                                : '#374151'
                        }}
                        className="w-6 h-6 border-2 flex items-center justify-center text-xs cursor-pointer rounded-sm"
                    >
                        {i}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="absolute left-0 top-full mb-2 bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-600 min-w-[300px] transition-all duration-300 ease-out z-[999]">
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <span
                        className="text-sm font-mono cursor-pointer"
                        onClick={() => {
                            navigator.clipboard.writeText(id.toString());
                            setLog("Copied Id");
                            setTimeout(() => setLog(""), 1500);
                        }}
                    >
                        #{mapNumberToMycelName(id) + " - " + id || `Unknown (${id})`}
                    </span>
                    <span className="text-xs text-gray-400">{log}</span>
                </div>

                <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1">Expansion (0→1)</div>
                    <InteractiveStrengthBoxes
                        values={expansionValues}
                        color="#00ff00"
                        onToggle={(i: number) => {
                            const newValues = expansionValues.includes(i)
                                ? expansionValues.filter(num => num !== i)
                                : [...expansionValues, i];
                            setExpansionValues(newValues);
                        }}
                    />
                </div>

                <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1">Dissolve (1→0)</div>
                    <InteractiveStrengthBoxes
                        values={dissolveValues}
                        color="#ff0000"
                        onToggle={(i: number) => {
                            const newValues = dissolveValues.includes(i)
                                ? dissolveValues.filter(num => num !== i)
                                : [...dissolveValues, i];
                            setDissolveValues(newValues);
                        }}
                    />
                </div>

                {hasChanges && (
                    <div className="flex gap-2 mt-4">
                        {/*<button
                            onClick={() => {
                                const newIndex = updateIndex(expansionValues, dissolveValues);
                                go?.(newIndex);
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white"
                        >
                            Go
                        </button>*/}
                        <button
                            onClick={() => {
                                const newIndex = updateIndex(expansionValues, dissolveValues);
                                goAndReset?.(newIndex);
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
                        >
                            Go & Reset
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};