"use client"
// components/ShroomEditor.tsx
import { useEffect, useRef, useState } from 'react';
import { decodeRuleSetCompact, encodeRuleSetCompact } from '../script/rules';
import { generateSeededColor } from '../script/utils';
import { Viewer } from '../script/view';
import { Game } from '../script/game';
import { ElementConfig } from '../script/models';


interface ShroomEditorProps {
    index: number;
    game: any;
    eConfig: ElementConfig;
    updateGame: () => void;
}

const ShroomEditor: React.FC<ShroomEditorProps> = ({ index, game, eConfig, updateGame }) => {
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const initialRuleText = encodeRuleSetCompact(game.shroomsConfig.shrooms[index]);
    const [ruleText, setRuleText] = useState<string>(initialRuleText);
    const [color, setColor] = useState<string>(game.shroomsConfig.shroomColors[index]);

    // Aktualisiert den Rule-Set eines Shrooms anhand eines neuen kodierten Strings.
    const updateShroom = (newEncoded: string) => {
        try {
            const newRules = decodeRuleSetCompact(newEncoded);
            game.shroomsConfig.shrooms[index] = newRules;
            // Hier wird die Farbe anhand des neuen Strings neu generiert
            game.shroomsConfig.shroomColors[index] = generateSeededColor(newEncoded);
            console.log(`Shroom ${index} aktualisiert:`, newRules);
        } catch (error) {
            console.error(`Ungültiger Rule-Set-Index für Shroom ${index}`, error);
        }
        updateGame(); // Erzwingt ein Re-Rendering im Parent
    };

    // Aktualisiert die Farbe eines Shrooms anhand des Color-Picker-Werts.
    const updateShroomColor = (newColor: string) => {
        game.shroomsConfig.shroomColors[index] = newColor;
        console.log(`Shroom ${index} Farbe aktualisiert:`, newColor);
        updateGame();
    };

    // Rendert eine Vorschau des Shrooms in einem 15x15-Feld über 7 Evolutionsstufen.
    const renderPreview = () => {
        if (!previewCanvasRef.current) return;
        const gridSize = 15;
        const previewGame = new Game(
            eConfig,
            { shrooms: [game.shroomsConfig.shrooms[index]], shroomColors: [game.shroomsConfig.shroomColors[index]] },
            gridSize,
            gridSize
        );
        previewGame.shroomStartValues([{ x: 7, y: 7 }]);
        const viewerPreview = new Viewer(previewGame, previewCanvasRef.current);
        previewGame.setViewer(viewerPreview);
        previewGame.evolveAllShrooms(7);
        viewerPreview.render();
    };

    useEffect(() => {
        renderPreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ruleText, color]);

    return (
        <div className="flex items-center gap-3 mb-2">
            {/* Mini-Preview-Canvas */}
            <canvas
                ref={previewCanvasRef}
                id={`previewCanvas${index}`}
                width={15 * 5}
                height={15 * 5}
                className="border"
            />
            {/* Textfeld für den kodierten Rule-Set */}
            <input
                type="text"
                value={ruleText}
                onChange={(e) => {
                    const newValue = e.target.value;
                    setRuleText(newValue);
                    updateShroom(newValue);
                    renderPreview();
                }}
                className="border p-1"
            />
            {/* Color-Picker für die Shroom-Farbe */}
            <input
                type="color"
                value={color}
                onChange={(e) => {
                    const newColor = e.target.value;
                    setColor(newColor);
                    updateShroomColor(newColor);
                    renderPreview();
                }}
                className="h-8 w-10"
            />
        </div>
    );
};

export default ShroomEditor;
