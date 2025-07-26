"use client";

import BattleSimulator from "@/src/components/BattleSimulator";
import CanvasGame from "@/src/components/CanvasGame";
import { ElementConfig } from "@/src/script/models";
import { generateRuleSetByIndex, generateRuleSetByIndexExpanding, getIndexFromRuleSet } from "@/src/script/rules";
import { useEffect, useState } from "react";

export default function Home() {
  const [indices, setIndices] = useState<[number, number] | null>(null);
  const eConfig = new ElementConfig(1, "dyrk");

  useEffect(() => {
    // Wird nur client-seitig ausgeführt

    //generates only expanding
    const i1 = Math.floor(Math.random() * 12188);
    const i2 = Math.floor(Math.random() * 12188);

    const rules1 = generateRuleSetByIndexExpanding(i1);
    const rules2 = generateRuleSetByIndexExpanding(i2);

    const i1Real = getIndexFromRuleSet(rules1);
    const i2Real = getIndexFromRuleSet(rules2);

    const rules1Real = generateRuleSetByIndex(i1Real);
    const rules2Real = generateRuleSetByIndex(i2Real);

    console.log(i1, rules1, i1Real, rules1Real);
    console.log(i2, rules2, i2Real, rules2Real);
    setIndices([
      i1Real,
      i2Real
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
