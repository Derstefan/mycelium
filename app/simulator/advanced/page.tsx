"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ElementConfig } from "@/src/script/models";
import AdvancedBattleSimulator from "@/src/components/AdvancedBattleSimulator";
import { binary16ToDecimal, isValidBinary16, decimalToBinary16 } from "@/src/utils/binaryUtils";

export default function AdvancedSimulatorPage() {
    const searchParams = useSearchParams();
    const [config, setConfig] = useState<{
        width: number;
        height: number;
        shrooms: Array<{ index: number; x: number; y: number }>;
        eConfig: ElementConfig;
    } | null>(null);
    const [forceUpdate, setForceUpdate] = useState(0);

    useEffect(() => {
        // URL-Parameter auslesen (auch bei Browser-Navigation)
        const urlParams = new URLSearchParams(window.location.search);
        const width = parseInt(urlParams.get('width') || searchParams.get('width') || '121');
        const height = parseInt(urlParams.get('height') || searchParams.get('height') || '121');
        const shroomsParam = urlParams.get('shrooms') || searchParams.get('shrooms');

        let shrooms: Array<{ index: number; x: number; y: number }> = [];

        if (shroomsParam) {
            try {
                // Format: "binaryIndex1,x1,y1;binaryIndex2,x2,y2;..."
                shrooms = shroomsParam.split(';').map(part => {
                    const [binaryIndex, x, y] = part.split(',');
                    const xNum = parseInt(x);
                    const yNum = parseInt(y);

                    // Prüfe ob der Index eine Binärzahl ist
                    if (isValidBinary16(binaryIndex)) {
                        const index = binary16ToDecimal(binaryIndex);
                        return { index, x: xNum, y: yNum };
                    } else {
                        // Fallback: Versuche als Dezimalzahl zu parsen
                        const index = parseInt(binaryIndex);
                        return { index, x: xNum, y: yNum };
                    }
                }).filter(shroom =>
                    !isNaN(shroom.index) &&
                    !isNaN(shroom.x) &&
                    !isNaN(shroom.y) &&
                    shroom.x >= 0 && shroom.x < width &&
                    shroom.y >= 0 && shroom.y < height
                );
            } catch (error) {
                console.error('Fehler beim Parsen der Shroom-Parameter:', error);
            }
        }

        // Fallback: Mindestens 2 Shrooms mit Standard-Positionen
        if (shrooms.length < 2) {
            const offset = 30;
            const randomIndex1 = Math.floor(Math.random() * 12188);
            const randomIndex2 = Math.floor(Math.random() * 12188);
            shrooms = [
                { index: randomIndex1, x: offset, y: offset },
                { index: randomIndex2, x: width - offset, y: height - offset }
            ];

            // Wenn keine Shrooms in der URL waren, erstelle eine neue URL mit den random Shrooms
            if (!shroomsParam) {
                const shroomsParamNew = shrooms.map(s => `${decimalToBinary16(s.index)},${s.x},${s.y}`).join(';');
                const newURL = `/simulator/advanced?width=${width}&height=${height}&shrooms=${shroomsParamNew}`;
                // Verwende replace statt push, damit der erste Eintrag in der History die random Shrooms sind
                window.history.replaceState(null, '', newURL);
            }
        }

        const eConfig = new ElementConfig(1, "dyrk");

        setConfig({
            width,
            height,
            shrooms,
            eConfig
        });
    }, [searchParams, forceUpdate]);

    // Event-Listener für Browser-Navigation (popstate)
    useEffect(() => {
        const handlePopState = () => {
            // Force re-render when browser navigation occurs
            setForceUpdate(prev => prev + 1);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Lade erweiterten Simulator...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
            <h1 className="text-2xl font-bold mb-4 text-white">Erweiterter Battle Simulator</h1>
            <div className="text-sm text-gray-400 mb-4 text-center">
                <p>URL-Parameter: width={config.width}, height={config.height}</p>
                <p>Shrooms: {config.shrooms.length}</p>
            </div>
            <AdvancedBattleSimulator
                width={config.width}
                height={config.height}
                shrooms={config.shrooms}
                eConfig={config.eConfig}
            />
        </div>
    );
} 