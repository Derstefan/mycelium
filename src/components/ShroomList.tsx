"use client"

import React, { useMemo, useState } from 'react';
import ShroomDisplay from './ShroomDisplay';
import { ElementConfig, ShroomsConfig } from '../script/models';
import { encodeRuleSetCompact, generateRuleSetByIndex } from '../script/rules';
import { createSeededRandom, generateSeededColor } from '../script/utils';

interface ShroomsListProps {
    count?: number;
    eConfig: ElementConfig;
    startIndex?: number; // Neuer Prop für Startindex
}

const ShroomsList: React.FC<ShroomsListProps> = ({
    count = 5,
    eConfig,
    startIndex = 0
}) => {

    const [selectedShrooms, setSelectedShrooms] = useState<number[]>([]);


    const shrooms = useMemo(() => {
        return Array.from({ length: count }, (_, i) => {
            const currentIndex = startIndex + i;

            // Generiere Regel-Set basierend auf dem aktuellen Index
            const ruleDecoded = generateRuleSetByIndex(currentIndex);
            // Kodiere die Regeln
            const ruleEncoded = encodeRuleSetCompact(ruleDecoded);

            // Generiere Farbe deterministisch aus dem Index

            return {
                ruleEncoded, shroomColor: generateSeededColor(ruleEncoded)
            };
        });
    }, [count, startIndex]); // Abhängigkeiten

    return (
        <div>
            <div className="flex flex-wrap gap-4">
                {selectedShrooms.map((index) => <span key={index} >{index}</span>)}
            </div>
            <div className="flex flex-wrap gap-4">

                {shrooms.map((shroom, index) => (
                    <ShroomDisplay
                        key={startIndex + index} // Eindeutiger Key mit Index
                        index={startIndex + index} // Globaler Index
                        ruleEncoded={shroom.ruleEncoded}
                        shroomColor={shroom.shroomColor}
                        eConfig={eConfig}
                        addSelectedShroom={(index) => {
                            setSelectedShrooms([...selectedShrooms, index]);
                        }}

                    />
                ))}
            </div>
        </div>
    );
};

export default ShroomsList;