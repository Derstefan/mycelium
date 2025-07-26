"use client";

import Link from "next/link";

export default function AdvancedSimulatorHelpPage() {
    const examples = [
        {
            title: "Standard 2-Shroom Battle",
            description: "Zwei Shrooms in diagonaler Position (Binär-IDs)",
            url: "/simulator/advanced?width=121&height=121&shrooms=0000001111101000,30,30;0000011111010000,91,91"
        },
        {
            title: "Großes Grid mit 3 Shrooms",
            description: "200x200 Grid mit drei Shrooms an verschiedenen Positionen",
            url: "/simulator/advanced?width=200&height=200&shrooms=0000001111101000,50,50;0000011111010000,150,50;0000101110111000,100,150"
        },
        {
            title: "Kleines Grid mit vielen Shrooms",
            description: "80x80 Grid mit 5 Shrooms",
            url: "/simulator/advanced?width=80&height=80&shrooms=0000001111101000,20,20;0000011111010000,60,20;0000101110111000,40,40;0000111110001000,20,60;0001001101010000,60,60"
        },
        {
            title: "Rechteckiges Grid",
            description: "150x100 Grid mit 4 Shrooms",
            url: "/simulator/advanced?width=150&height=100&shrooms=0000001111101000,30,30;0000011111010000,120,30;0000101110111000,30,70;0000111110001000,120,70"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Erweiterter Battle Simulator - Hilfe</h1>

                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4">URL-Parameter Format</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-green-400">width</h3>
                            <p>Breite des Simulations-Grids (Standard: 121)</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-400">height</h3>
                            <p>Höhe des Simulations-Grids (Standard: 121)</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-400">shrooms</h3>
                            <p>Format: "binaryIndex1,x1,y1;binaryIndex2,x2,y2;..."</p>
                            <p className="text-sm text-gray-400">
                                - binaryIndex: 16-Bit Binärzahl (z.B. "0000001111101000")<br />
                                - x, y: Position im Grid (0 bis width-1 / height-1)<br />
                                - Mehrere Shrooms werden durch Semikolon getrennt<br />
                                - Binärzahlen können auch mit Leerzeichen formatiert werden: "0000 0011 1110 1000"
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4">Beispiele</h2>
                    <div className="space-y-6">
                        {examples.map((example, index) => (
                            <div key={index} className="border border-gray-700 p-4 rounded">
                                <h3 className="font-semibold text-blue-400 mb-2">{example.title}</h3>
                                <p className="text-gray-300 mb-3">{example.description}</p>
                                <div className="bg-gray-900 p-3 rounded font-mono text-sm break-all">
                                    {example.url}
                                </div>
                                <Link
                                    href={example.url}
                                    className="inline-block mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                                >
                                    Testen
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4">Funktionen</h2>
                    <ul className="space-y-2 text-gray-300">
                        <li>• <strong>Beliebig viele Shrooms:</strong> Füge so viele Shrooms hinzu wie du möchtest</li>
                        <li>• <strong>Flexible Grid-Größe:</strong> Wähle beliebige width/height Kombinationen</li>
                        <li>• <strong>Benutzerdefinierte Positionen:</strong> Setze jeden Shroom an eine spezifische Position</li>
                        <li>• <strong>Live-Änderungen:</strong> Ändere Shrooms während der Simulation</li>
                        <li>• <strong>Hover-Cards:</strong> Zeige detaillierte Shroom-Informationen</li>
                        <li>• <strong>Chart-Visualisierung:</strong> Verfolge die Populationsentwicklung aller Shrooms</li>
                        <li>• <strong>URL-Sharing:</strong> Teile Simulationen über Links</li>
                    </ul>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4">Binär-IDs</h2>
                    <div className="space-y-4 text-gray-300">
                        <p>Jeder Shroom hat eine 16-Bit Binär-ID, die sein Verhalten bestimmt:</p>
                        <ul className="space-y-2">
                            <li>• <strong>Format:</strong> 16 Ziffern aus 0 und 1 (z.B. "0000001111101000")</li>
                            <li>• <strong>Bereich:</strong> 0000000000000000 bis 1111111111111111 (0-65535)</li>
                            <li>• <strong>Lesbarkeit:</strong> Kann mit Leerzeichen formatiert werden: "0000 0011 1110 1000"</li>
                            <li>• <strong>Beispiele:</strong></li>
                        </ul>
                        <div className="bg-gray-900 p-4 rounded font-mono text-sm">
                            <div>0000000000000001 = 1 (Dezimal)</div>
                            <div>0000001111101000 = 1000 (Dezimal)</div>
                            <div>1111111111111111 = 65535 (Dezimal)</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Tipps</h2>
                    <ul className="space-y-2 text-gray-300">
                        <li>• Verwende Positionen mit Abstand zu den Rändern (mindestens 30 Pixel)</li>
                        <li>• Für bessere Performance bei großen Grids: Reduziere die Anzahl der Shrooms</li>
                        <li>• Experimentiere mit verschiedenen Binär-IDs für unterschiedliche Verhaltensweisen</li>
                        <li>• Die Simulation stoppt automatisch, wenn nur noch ein Shroom übrig ist</li>
                        <li>• Du kannst Shrooms während der Simulation hinzufügen oder entfernen</li>
                        <li>• Binär-IDs können direkt in der URL eingegeben werden</li>
                    </ul>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/simulator/advanced"
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-lg font-semibold"
                    >
                        Zum erweiterten Simulator
                    </Link>
                </div>
            </div>
        </div>
    );
} 