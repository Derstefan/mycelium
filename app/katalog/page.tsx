// pages/random-shrooms.tsx
"use client";

import ShroomsList from "@/src/components/ShroomList";
import { ElementConfig } from "@/src/script/models";
import { useState } from 'react';

const ITEMS_PER_PAGE = 100 as const;
const TOTAL_ITEMS = 12188;

export default function RandomShroomsPage() {
    const [startIndex, setStartIndex] = useState(400);
    const eConfig = new ElementConfig(1, "5");

    const handleEndJump = () => {
        setStartIndex(TOTAL_ITEMS - ITEMS_PER_PAGE);
    };

    const handleStartJump = () => {
        setStartIndex(0);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Top Navigation */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={handleStartJump}
                    className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-600"
                >
                    ← ←
                </button>
                <button
                    onClick={() => setStartIndex(prev => Math.max(0, prev - ITEMS_PER_PAGE))}
                    disabled={startIndex === 0}
                    className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ←
                </button>
                <h1 className="text-2xl font-bold">from {startIndex} to {startIndex + ITEMS_PER_PAGE}</h1>
                <button
                    onClick={() => setStartIndex(prev =>
                        prev + ITEMS_PER_PAGE < TOTAL_ITEMS ? prev + ITEMS_PER_PAGE : TOTAL_ITEMS - 1)}
                    className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-600"
                >
                    →
                </button>
                <button
                    onClick={handleEndJump}
                    className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-600"
                >
                    → →
                </button>
            </div>

            <ShroomsList
                count={ITEMS_PER_PAGE}
                startIndex={startIndex}
                eConfig={eConfig}
            />

            {/* Bottom Navigation */}
            <div className="flex items-center gap-4 mt-4">
                <button
                    onClick={handleStartJump}
                    className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-600"
                >
                    ← ←
                </button>
                <button
                    onClick={() => setStartIndex(prev => Math.max(0, prev - ITEMS_PER_PAGE))}
                    disabled={startIndex === 0}
                    className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ←
                </button>
                <h1 className="text-2xl font-bold">from {startIndex} to {startIndex + ITEMS_PER_PAGE}</h1>
                <button
                    onClick={() => setStartIndex(prev =>
                        prev + ITEMS_PER_PAGE < TOTAL_ITEMS ? prev + ITEMS_PER_PAGE : TOTAL_ITEMS - 1)}
                    className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-600"
                >
                    →
                </button>
                <button
                    onClick={handleEndJump}
                    className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-600"
                >
                    → →
                </button>
            </div>
        </div>
    );
}