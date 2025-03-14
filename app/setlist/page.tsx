// pages/random-shrooms.tsx
"use client";

import SetlistPlanner from "@/src/components/setlist/SetListPlaner";


export default function RandomShroomsPage() {
    // Erzeuge ein ElementConfig‑Objekt – ggf. musst du hier die Initialisierung anpassen


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Simulator</h1>
            <SetlistPlanner />
        </div>
    );
}
