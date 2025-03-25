// pages/random-shrooms.tsx
"use client";

import { useEffect, useState } from "react";
import BattleSimulator from "@/src/components/BattleSimulator";
import { ElementConfig } from "@/src/script/models";
import { mapNumberToMycelName, parseMycelName } from "@/src/script/namegenerator";

export default function RandomShroomsPage() {
    const [indices, setIndices] = useState<[number, number] | null>(null);
    const eConfig = new ElementConfig(1, "dyrk");

    useEffect(() => {
        // Wird nur client-seitig ausgeführt
        setIndices([
            Math.floor(Math.random() * 12187),
            Math.floor(Math.random() * 12187)
        ]);


    }, []);

    if (!indices) {
        // Optional: Ladezustand anzeigen während initialisiert wird
        return <div className="min-h-screen flex items-center justify-center">
            Loading...
        </div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Simulator</h1>
            <BattleSimulator
                shroomIndex1={indices[0]}
                shroomIndex2={indices[1]}
                eConfig={eConfig}
            />
        </div>
    );
}