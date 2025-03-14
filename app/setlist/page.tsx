// pages/random-shrooms.tsx
"use client";

import BattleSimulator from "@/src/components/BattleSimulator";
import SetlistPlanner from "@/src/components/setlist/SetListPlaner";
import { ElementConfig } from "@/src/script/models";


export default function RandomShroomsPage() {
    // Erzeuge ein ElementConfig‑Objekt – ggf. musst du hier die Initialisierung anpassen
    const eConfig = new ElementConfig(1, "dyrk");


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Simulator</h1>
            <SetlistPlanner />
        </div>
    );
}
