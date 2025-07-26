"use client"

// components/RandomShroomsList.tsx
import React, { useMemo } from 'react';
import ShroomDisplay from './ShroomDisplay';
import { ElementConfig, ShroomsConfig } from '../script/models';
import { encodeRuleSetCompact } from '../script/rules';

interface RandomShroomsListProps {
    count?: number;
    eConfig: ElementConfig;
}

const RandomShroomsList: React.FC<RandomShroomsListProps> = ({ count = 5, eConfig }) => {
    // Erzeuge ein Array von zufälligen Shroom-Daten
    const shrooms = useMemo(() => {
        const sConfig = new ShroomsConfig(eConfig.allElements, count, 60);

        return Array.from({ length: count }, (_, index) => {
            const ruleDecoded = sConfig.shrooms[index];
            const ruleEncoded = encodeRuleSetCompact(ruleDecoded);
            const shroomColor = sConfig.shroomColors[index];
            return { ruleEncoded, shroomColor };
        });
    }, [count, eConfig.allElements]);

    return (
        <div className="flex flex-wrap gap-4">
            {shrooms.map((shroom, index) => (
                <ShroomDisplay
                    key={index}
                    index={index}
                    ruleEncoded={shroom.ruleEncoded}
                    shroomColor={shroom.shroomColor}
                    eConfig={eConfig}
                />
            ))}
        </div>
    );
};

export default RandomShroomsList;
