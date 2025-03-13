// pages/random-shrooms.tsx
"use client";

import RandomShroomsList from "@/src/components/RandomShroomList";
import { ElementConfig } from "@/src/script/models";


export default function RandomShroomsPage() {
    // Erzeuge ein ElementConfig‑Objekt – ggf. musst du hier die Initialisierung anpassen
    const eConfig = new ElementConfig(1, "dyrk");


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Shrooms</h1>
            <RandomShroomsList count={242} eConfig={eConfig} />
        </div>
    );
}
