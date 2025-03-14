// pages/random-shrooms.tsx
"use client";

import SimulationMatrix from "@/src/components/SimulatedMatrix";


export default function Page() {
    // Erzeuge ein ElementConfig‑Objekt – ggf. musst du hier die Initialisierung anpassen


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">BigMatrix</h1>
            <SimulationMatrix />
        </div>
    );
}
