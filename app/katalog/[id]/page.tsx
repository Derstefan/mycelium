// pages/random-shrooms.tsx
"use client";

import { ElementConfig } from "@/src/script/models";
import { generateSeededColor } from "@/src/script/utils";
import { useRouter } from 'next/router'

import dynamic from 'next/dynamic';
const ShroomDisplay = dynamic(
    () => import('@/src/components/ShroomDisplay'),
    { ssr: false }
);


export default function Page() {
    const router = useRouter()
    const id = router.query.id as string;
    console.log(id);
    const eConfig = new ElementConfig(1, "dyrk");

    const shroomColor = generateSeededColor(id);

    return (
        <div className="flex flex-wrap gap-4">
            <ShroomDisplay
                key={0}
                index={0}
                ruleEncoded={id ? id : ""}
                shroomColor={shroomColor}
                eConfig={eConfig}
            />
        </div>
    );
};
