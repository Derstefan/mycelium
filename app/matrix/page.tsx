// pages/random-shrooms.tsx
"use client";

import BattleMatrix from "@/src/components/BattleMatrix";
import { ElementConfig } from "@/src/script/models";


export default function Page() {
    // Erzeuge ein ElementConfig‑Objekt – ggf. musst du hier die Initialisierung anpassen
    const eConfig = new ElementConfig(1, "dyrk");


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Simulator</h1>
            <BattleMatrix
                eConfig={eConfig}
                useRandom={false}
                startId={300}
                endId={350}
            />
        </div>
    );
}
