import React, { useState } from "react";
import ReactDOMServer from 'react-dom/server';

// Song-Schnittstelle
interface Song {
    name: string;
    duration: string;
    beginningChord?: string;
    endChord?: string;
    beginningTempo?: string;
    endTempo?: string;
    instruments: {
        [musiker: string]: string;
    };
}

// Statisches Array mit Songs der Batiargang – basierend auf aktuellen Internetrecherchen
const initialRepertoire: Song[] = [
    {
        "name": "Go East Go Home",
        "duration": "4:26",
        "instruments": {
            "Matze": "Kalri",
            "Musiker2": "Schlagzeug",
            "Steffo": "Akkordeon",
        }
    },
    {
        "name": "1-7 Oy!",
        "duration": "3:15",
        "instruments": {
            "Matze": "Kalri",
            "Musiker2": "Schlagzeug",
            "Steffo": "Akkordeon",
        }
    },
    {
        "name": "Powka",
        "duration": "3:48",
        "instruments": {
            "Matze": "Kalri",
            "Musiker2": "Schlagzeug",
            "Steffo": "Akkordeon",
        }
    },
    {
        "name": "Chort",
        "duration": "2:56",
        "instruments": {
            "Matze": "Kalri",
            "Musiker2": "Schlagzeug",
            "Steffo": "Akkordeon",
        }
    },
    {
        "name": "Opinion Man",
        "duration": "3:32",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
        }
    },
    {
        "name": "Disco 3000",
        "duration": "4:12",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
        }
    },
    {
        "name": "Rejoice!",
        "duration": "3:22",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",

        }
    },
    {
        "name": "Batiar Hoax",
        "duration": "3:58",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",

        }
    },
    {
        "name": "Lullaby Of The Sleepless",
        "duration": "4:05",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Goc",
            "Steffo": "Posaune",
        }
    },
    {
        "name": "Moloch & Nadiya",
        "duration": "3:45",
        "instruments": {
            "Steffo": "Gitarre",
        }
    },
    {
        "name": "Tomu Kosa",
        "duration": "3:50",
        "instruments": {
            "Matze": "Kalri",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
        }
    },
    {
        "name": "Avtobus",
        "duration": "4:10",
        "instruments": {
            "Matze": "Kalri",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
        }
    },
    {
        "name": "Ikarus",
        "duration": "3:30",
        "instruments": {
            "Matze": "Kalri",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
        }
    }
]
const parseDuration = (duration: string) => {
    const [minutes, seconds] = duration.split(":").map(Number);
    return minutes * 60 + seconds;
};

const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};




const SetlistPlanner: React.FC = () => {
    // Editierbarer Titel
    const [title, setTitle] = useState("Glauchauer Stadtfest 2022");

    const [repertoire, setRepertoire] = useState<Song[]>(initialRepertoire);
    const [setlist, setSetlist] = useState<Song[]>([]);
    // Separater Drop-Index-Status für beide Container
    const [setlistDropIndex, setSetlistDropIndex] = useState<number | null>(null);
    const [repertoireDropIndex, setRepertoireDropIndex] = useState<number | null>(null);

    const totalDuration = setlist.reduce((sum, song) => sum + parseDuration(song.duration), 0);
    // Beim DragStart wird gespeichert, aus welcher Liste und von welchem Index der Song kommt
    const handleDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        source: "repertoire" | "setlist",
        index: number
    ) => {
        event.dataTransfer.setData("text/plain", JSON.stringify({ source, index }));
    };

    const PrintableSetlist: React.FC<{ title: string; setlist: Song[] }> = ({
        title,
        setlist,
    }) => {
        const totalDuration = setlist.reduce(
            (sum, song) => sum + parseDuration(song.duration),
            0
        );

        return (
            <div className="printable-content">
                <h1 className="print-title">{title}</h1>

                <div className="song-list">
                    {setlist.map((song, index) => (
                        <>
                            {index > 0 && (
                                <div className="instrument-changes">
                                    {renderInstrumentChange(setlist[index - 1], song)}
                                </div>
                            )}
                            <div key={song.name + index} className="song-item">
                                <div className="song-header">
                                    <span className="song-number">{index + 1}.</span>
                                    <h2 className="song-name">{song.name}</h2>
                                    <span className="song-duration">{song.duration}</span>
                                </div>

                            </div>
                        </>
                    ))}
                </div>

                <div className="total-duration">
                    Reine Spielzeit: {formatDuration(totalDuration)}
                </div>
            </div>
        );
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                ${document.querySelector("style")?.innerHTML}
                
                @media print {
                  body { padding: 20px; }
                  .print-title { 
                    font-size: 24pt; 
                    text-align: center; 
                    margin-bottom: 30px;
                  }
                  .song-item {
                    page-break-inside: avoid;
                    margin-bottom: 15px;
                  }
                  .song-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                  }
                  .song-name {
                    font-size: 18pt;
                    margin: 0;
                  }
                  .song-duration {
                    margin-left: auto;
                  }
                  .instrument-changes {
                    font-size: 10pt;
                    color: #666;
                    margin-left: 30px;
                  }
                  .total-duration {
                    margin-top: 30px;
                    font-weight: bold;
                    text-align: right;
                  }
                }
              </style>
            </head>
            <body>
              ${ReactDOMServer.renderToString(<PrintableSetlist title={title} setlist={setlist} />)}
            </body>
          </html>
        `);

        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    // Berechnet anhand der Mausposition (y) den Einfügeindex innerhalb des Containers
    const computeDropIndex = (e: React.DragEvent<HTMLDivElement>, list: Song[]): number => {
        const container = e.currentTarget;
        const y = e.clientY;
        let newIndex = list.length;
        const items = container.querySelectorAll<HTMLDivElement>(".draggable-card");
        items.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (y < midY && newIndex === list.length) {
                newIndex = index;
            }
        });
        return newIndex;
    };

    // Drop-Handler für die Setlist
    const handleSetlistDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const newIndex = computeDropIndex(e, setlist);
        setSetlistDropIndex(newIndex);
    };

    const handleSetlistDragLeave = () => {
        setSetlistDropIndex(null);
    };

    // Drop-Handler für das Repertoire
    const handleRepertoireDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const newIndex = computeDropIndex(e, repertoire);
        setRepertoireDropIndex(newIndex);
    };

    const handleRepertoireDragLeave = () => {
        setRepertoireDropIndex(null);
    };

    // Gemeinsamer Drop-Handler für beide Listen
    const handleDrop = (
        e: React.DragEvent<HTMLDivElement>,
        destinationType: "repertoire" | "setlist",
        dropIndex: number | null
    ) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");
        if (!data) return;
        const { source, index } = JSON.parse(data);
        let computedDropIndex =
            dropIndex !== null
                ? dropIndex
                : destinationType === "repertoire"
                    ? repertoire.length
                    : setlist.length;

        // Wenn innerhalb derselben Liste verschoben wird, passe den Index an
        if (source === destinationType && index < computedDropIndex) {
            computedDropIndex = computedDropIndex - 1;
        }

        if (source === destinationType) {
            // Reordering innerhalb derselben Liste
            if (destinationType === "repertoire") {
                setRepertoire((prev) => {
                    const newList = [...prev];
                    const [dragged] = newList.splice(index, 1);
                    newList.splice(computedDropIndex, 0, dragged);
                    return newList;
                });
            } else {
                setSetlist((prev) => {
                    const newList = [...prev];
                    const [dragged] = newList.splice(index, 1);
                    newList.splice(computedDropIndex, 0, dragged);
                    return newList;
                });
            }
        } else {
            // Verschieben zwischen den Listen
            if (source === "repertoire" && destinationType === "setlist") {
                const dragged = repertoire[index];
                setRepertoire((prev) => {
                    const newList = [...prev];
                    newList.splice(index, 1);
                    return newList;
                });
                setSetlist((prev) => {
                    const newList = [...prev];
                    newList.splice(computedDropIndex, 0, dragged);
                    return newList;
                });
            } else if (source === "setlist" && destinationType === "repertoire") {
                const dragged = setlist[index];
                setSetlist((prev) => {
                    const newList = [...prev];
                    newList.splice(index, 1);
                    return newList;
                });
                setRepertoire((prev) => {
                    const newList = [...prev];
                    newList.splice(computedDropIndex, 0, dragged);
                    return newList;
                });
            }
        }
        // Drop-Index zurücksetzen
        if (destinationType === "setlist") {
            setSetlistDropIndex(null);
        } else {
            setRepertoireDropIndex(null);
        }
    };

    // Zeigt zwischen zwei Songs in der Setlist den Instrumentwechsel an
    const renderInstrumentChange = (prev: Song, next: Song) => {
        const changes = [];
        for (const musician in next.instruments) {
            if (
                prev.instruments[musician] &&
                prev.instruments[musician] !== next.instruments[musician]
            ) {
                changes.push(
                    <div key={musician} className="text-sm text-gray-600 ml-8">
                        {musician} {" -> "}
                        <span className="font-bold">{next.instruments[musician]}</span>
                    </div>
                );
            }
        }
        return changes;
    };

    // Gemeinsame Render-Funktion für beide Listen
    const renderList = (list: Song[], listType: "repertoire" | "setlist") => {
        const dropIndex = listType === "repertoire" ? repertoireDropIndex : setlistDropIndex;
        return (
            <div
                className="bg-gray-100 p-4 rounded-md w-full min-h-[150px] relative"
                onDragOver={listType === "repertoire" ? handleRepertoireDragOver : handleSetlistDragOver}
                onDragLeave={listType === "repertoire" ? handleRepertoireDragLeave : handleSetlistDragLeave}
                onDrop={(e) => handleDrop(e, listType, dropIndex)}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {listType === "repertoire" ? "Repertoire" : "Setlist"}
                </h2>
                {list.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        {listType === "repertoire"
                            ? ""
                            : ""}
                    </div>
                )}
                {list.map((song, index) => (
                    <React.Fragment key={song.name + index}>
                        {dropIndex === index && (
                            <div className="h-0 border-t-2 border-dashed border-yellow-500 mb-2 animate-fadeIn" />
                        )}
                        {listType === "setlist" && index > 0 && renderInstrumentChange(list[index - 1], song)}
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, listType, index)}
                            className="draggable-card bg-white text-gray-900 border border-gray-300 p-3 mb-2 rounded-md shadow-md cursor-move hover:shadow-lg transition-all"
                        >
                            <div className="font-bold">{song.name}</div>
                        </div>
                    </React.Fragment>
                ))}
                {dropIndex === list.length && (
                    <div className="h-0 border-t-2 border-dashed border-yellow-500 mb-2 animate-fadeIn" />
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen py-6">
            <div className="max-w-7xl min-w-[600px] mx-auto px-4">
                <div className="mb-6">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-3xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-yellow-500 w-full"
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 min-w-[500px]">
                        {renderList(setlist, "setlist")}
                        <div className="mt-4 text-lg font-semibold text-gray-800">
                            Reine Spielzeit: {formatDuration(totalDuration)}
                            <button
                                onClick={handlePrint}
                                className="ml-4 px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition-colors cursor-pointer"
                            >
                                print
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 min-w-[500px]">
                        {renderList(repertoire, "repertoire")}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SetlistPlanner;