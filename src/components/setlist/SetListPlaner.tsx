import React, { useState } from "react";
import ReactDOMServer from 'react-dom/server';

// Song-Schnittstelle
interface Song {
    name: string;
    duration: string;
    tempo?: string;
    beginningChord?: string;
    endChord?: string;
    beginningTempo?: string;
    endTempo?: string;
    instruments: {
        [musiker: string]: string;
    };
}

interface SetlistItem extends Song {
    type?: 'song' | 'pause' | 'encore';
}



// Statisches Array mit Songs der Batiargang – basierend auf aktuellen Internetrecherchen
const initialRepertoire: SetlistItem[] = [
    {
        "name": "Go East Go Home",
        "duration": "4:26",
        "tempo": "110",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Mikrofon",
            "Marc": "Bass"
        }
    },
    {
        "name": "1-7 Oy!",
        "duration": "3:15",
        "tempo": "120",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Mikrofon",
            "Marc": "Bass"

        }
    },
    {
        "name": "Powka",
        "duration": "3:48",
        "tempo": "150",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Mikrofon",
            "Marc": "Bass"
        }
    },
    {
        "name": "Chort",
        "duration": "2:56",
        "tempo": "140",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Mikrofon",
            "Marc": "Bass"
        }
    },
    {
        "name": "Opinion Man",
        "duration": "3:32",
        "tempo": "110",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Pause",
            "Marc": "Bass+Gesang",
        }
    },
    {
        "name": "Disco 3000",
        "duration": "4:12",
        "tempo": "120",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Mikrofon",
            "Marc": "Bass",

        }
    },
    {
        "name": "Rejoice!",
        "duration": "3:22",
        "tempo": "140",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Pause",
            "Marc": "Bass",

        }
    },
    {
        "name": "Batiar Hoax",
        "duration": "3:58",
        "tempo": "110",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Pause",
            "Marc": "Bass"

        }
    },
    {
        "name": "Lullaby Of The Sleepless",
        "duration": "4:05",
        "tempo": "100",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Goc",
            "Steffo": "Posaune",
            "MainVocal": "Mikrofon",
            "Marc": "Gesang"
        }
    },
    {
        "name": "Avtobus",
        "duration": "4:10",
        "tempo": "110",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Pause",
            "Marc": "Bass"
        }
    },
    {
        "name": "Ikarus",
        "duration": "3:30",
        "tempo": "90",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Mikrofon",
            "Marc": "Bass"

        }
    }, {
        "name": "Sve Sto Cveta",
        "duration": "5:22",
        "tempo": "110",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Keyboard",
            "MainVocal": "Mikrofon",
            "Marc": "Bass"

        }
    },
    {
        "name": "Why is she so mental",
        "duration": "2:29",
        "tempo": "120",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Pause",
            "Marc": "Gesang+Bass",
        }
    },
    {
        "name": "Kestenje",
        "duration": "4:48",
        "tempo": "150",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Mikrofon",
            "Marc": "Bass",
        }
    },
    {
        "name": "Parasocial Love Affair",
        "duration": "5:16",
        "tempo": "140",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Pause",
            "Marc": "Gesang+Bass",
        }
    },
    {
        "name": "The Kids from Surdilica",
        "duration": "3:42",
        "tempo": "110",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Mikrofon",
            "Marc": "Bass",
        }
    },
    {
        "name": "Acuka",
        "duration": "4:27",
        "tempo": "120",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Mikrofon",
            "Marc": "Bass",
        }
    },
    {
        "name": "Lonesome Lifes",
        "duration": "2:51",
        "tempo": "140",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Posaune",
            "MainVocal": "Pause",
            "Marc": "Gesang",

        }
    },
    {
        "name": "Chicken Song",
        "duration": "1:51",
        "tempo": "110",
        "instruments": {
            "Matze": "Bari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Pause",
            "Marc": "Bass",

        }
    },
    {
        "name": "Molka",
        "duration": "4:49",
        "tempo": "100",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Goc",
            "Steffo": "Gitarre",
            "MainVocal": "Pause",
            "Marc": "Gesang+Bass",
        }
    },
    {
        "name": "Nunta pe Tisa",
        "duration": "4:34",
        "tempo": "110",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Goc",
            "Steffo": "Akkordeon",
            "MainVocal": "Pause",
            "Marc": "Bass",
        }
    },
    {
        "name": "Yaldi Ha Yakar",
        "duration": "8:01",
        "tempo": "90",
        "instruments": {
            "Matze": "Klari",
            "Seppel": "Schlagzeug",
            "Steffo": "Akkordeon",
            "MainVocal": "Mikrofon",
            "Marc": "Bass",
        }
    },
    {
        name: "PAUSE",
        duration: "5:00",
        type: "pause",
        instruments: {}
    },
    {
        name: "Zugaben",
        duration: "0:00",
        type: "encore",
        instruments: {}
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
    const [title, setTitle] = useState("Glauchauer Stadtfest 2023");

    //sort alphabetically
    const [repertoire, setRepertoire] = useState<Song[]>(initialRepertoire.sort((a, b) => a.name.localeCompare(b.name)));
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

    const PrintableSetlist: React.FC<{ title: string; setlist: SetlistItem[] }> = ({
        title,
        setlist,
    }) => {


        return (
            <div className="printable-content">
                <h1 className="print-title">{title}</h1>

                <div className="song-list">
                    {setlist.map((song, index) => {
                        const isSpecial = song.type === 'pause' || song.type === 'encore';
                        const songNumber = isSpecial ? null : index + 1;

                        return (
                            <React.Fragment key={song.name}>
                                {index > 0 && (
                                    <div className="instrument-changes">
                                        {renderInstrumentChange(setlist[index - 1], song, false)}
                                    </div>
                                )}

                                <div className={`song-item ${isSpecial ? 'special-item' : ''
                                    }`}>
                                    <div className="song-header">
                                        {!isSpecial && (
                                            <span className="song-number">{songNumber}.</span>
                                        )}
                                        <h2 className={` ${isSpecial ? 'special-name' : 'song-name'
                                            }`} >
                                            {song.name}
                                        </h2>
                                        {!isSpecial && (
                                            <span className="song-duration">{song.duration}</span>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="total-duration">
                    reine Spielzeit: {formatDuration(setlist.reduce((sum, song) => sum + parseDuration(song.duration), 0))}
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
             <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
              <style>
                @media print {
                  body { 
                    padding: 10px; 
                    font-family: Arial, sans-serif;
                  }
                  
                  .print-title { 
                    font-size: 14pt; 
                    text-align: center; 
                    margin-bottom: 5px;
                  }
                  
                  .song-item {
                    page-break-inside: avoid;
                    margin-bottom: 5px;
                  }
                  
                  .special-item {
                    background-color: #f5f5f5;
                    border-left: 4px solid #ddd;
                    padding: 10px;
                    color: #666;
                  }
                  
                  .song-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                  }
                  
                  .song-number {
                    font-weight: bold;
                    min-width: 30px;
                    font-size: 10pt;
                  }
                  
                  .song-name {
                    font-size: 12pt;
                    margin: 0;
                    flex-grow: 1;
                  }
                
                  .special-name {
                    font-size: 10pt;
                    margin: 0;
                    color: #999;
                    flex-grow: 1;
                  }
                  
                  .special-item .song-name {
                    font-size: 14pt;
                  }
                  
                  .song-duration {
                    margin-left: auto;
                    color: #666;
                    font-size: 10pt;
                  }
                  
                  .instrument-changes {
                    font-size: 9pt;
                    color: #666;
                    margin-left: 30px;
                    margin-bottom: 5px;
                  }
                  
                  .total-duration {
                    margin-top: 30px;
                    font-weight: bold;
                    text-align: right;
                    font-size: 10pt;
                  }
                    @media print {
  @page {
    margin: 0;
    size: A4 portrait;
    marks: none;
  }
  
  body {
    margin: 0!important;
    padding: 5mm!important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  /* Verbirgt alle Browser-generierten Footer */
  @page :footer { display: none; }
  @page :header { display: none; }
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

    // Neuer State für Hover-Status
    const [hoveredItem, setHoveredItem] = useState<{
        index: number;
        list: "repertoire" | "setlist";
    } | null>(null);

    // Handler für Listenänderungen
    const handleAddToSetlist = (index: number) => {
        const item = repertoire[index];
        setRepertoire(prev => prev.filter((_, i) => i !== index));
        setSetlist(prev => [...prev, item]);
    };

    const handleRemoveFromSetlist = (index: number) => {
        const item = setlist[index];
        setSetlist(prev => prev.filter((_, i) => i !== index));
        setRepertoire(prev => [item, ...prev]);
    };

    const renderInstrumentChange = (prev: Song, next: Song, vertical = true) => {
        const changes = [];
        for (const musician in next.instruments) {
            if (
                prev.instruments[musician] &&
                prev.instruments[musician] !== next.instruments[musician]
            ) {
                changes.push(
                    vertical ? (
                        <div key={musician} className="text-sm text-gray-600 ml-8">
                            {"  ⟲ "} {musician} {" → "}
                            <span className="font-bold">{next.instruments[musician]}</span>
                        </div>
                    ) : (
                        <span key={musician} className="text-sm text-gray-600 mr-3 last:mr-0">
                            {"  ⟲ "} {musician} <span className="text-xs mx-1">{" → "}</span>
                            <span className="font-bold">{next.instruments[musician]}</span>
                        </span>
                    )
                );
            }
        }

        return vertical ? (
            changes
        ) : (
            <div className="ml-8 flex flex-wrap gap-2">
                {changes}
            </div>
        );
    };

    // Gemeinsame Render-Funktion für beide Listen
    const renderList = (list: SetlistItem[], listType: "repertoire" | "setlist") => {
        const dropIndex = listType === "repertoire" ? repertoireDropIndex : setlistDropIndex;

        return (
            <div
                className="bg-gray-100 p-3 md:p-4 rounded-md w-full min-h-[150px] relative shadow-sm md:shadow-md"
                onDragOver={listType === "repertoire" ? handleRepertoireDragOver : handleSetlistDragOver}
                onDragLeave={listType === "repertoire" ? handleRepertoireDragLeave : handleSetlistDragLeave}
                onDrop={(e) => handleDrop(e, listType, dropIndex)}
            >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                    {listType === "repertoire" ? "Repertoire" : "Setlist"}
                </h2>

                {list.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        {listType === "repertoire" ? "Keine Songs verfügbar" : "Songs hierher ziehen"}
                    </div>
                )}

                {list.map((song, index) => (
                    <div
                        key={song.name}
                        className="group relative" // CSS Group für Hover-Status
                        onMouseEnter={() => setHoveredItem({ index, list: listType })}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        {dropIndex === index && (
                            <div className="h-0 border-t-2 border-dashed border-yellow-500 mb-2 animate-fadeIn" />
                        )}

                        {listType === "setlist" && index > 0 && renderInstrumentChange(list[index - 1], song)}

                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, listType, index)}
                            className={`relative draggable-card ${song.type === 'pause'
                                ? 'bg-gray-200 italic'
                                : song.type === 'encore'
                                    ? 'bg-gray-100 italic'
                                    : 'bg-white'
                                } text-gray-900 border border-gray-300 rounded-md shadow-md cursor-move hover:shadow-lg transition-all p-2 md:p-3 text-sm md:text-base mb-2 md:mb-3 rounded-sm md:rounded-md`}
                        >
                            <div className="flex items-center">
                                <div className="font-bold flex-1 pr-6">
                                    {song.name}
                                </div>
                                {song.type === 'song' && (
                                    <div className="text-sm text-gray-600">
                                        {song.tempo} BPM • {song.duration}
                                    </div>
                                )}
                                <button
                                    onClick={() =>
                                        listType === "repertoire"
                                            ? handleAddToSetlist(index)
                                            : handleRemoveFromSetlist(index)
                                    }
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer flex-
              ${hoveredItem?.index === index && hoveredItem?.list === listType
                                            ? "opacity-100"
                                            : "opacity-0"
                                        } 
              transition-opacity duration-200 ease-in-out
              p-1 rounded-full bg-gray-200 hover:bg-gray-300 z-10`}
                                >
                                    {listType === "repertoire" ? (
                                        <div className="h-5 w-5 text-gray-600" >+</div>
                                    ) : (
                                        <div className="h-5 w-5 text-gray-600" >-</div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {dropIndex === list.length && (
                    <div className="h-0 border-t-2 border-dashed border-yellow-500 mb-2 animate-fadeIn" />
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen py-6">
            <div className="max-w-7xl mx-auto px-4 xl:px-4"> {/* Erhöhtes Padding */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-2xl md:text-4xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-yellow-500 w-full pb-1"
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-6 lg:gap-8"> {/* Größerer Abstand */}
                    {/* Setlist Column */}
                    <div className="flex-1 min-w-[320px] md:min-w-[400px] lg:min-w-[480px]"> {/* Mindestbreiten */}
                        {renderList(setlist, "setlist")}
                        <div className="mt-4 text-base lg:text-lg font-semibold text-gray-800 flex items-center justify-between">
                            <span>Spielzeit: {formatDuration(totalDuration)}</span>
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition-colors cursor-pointer text-sm md:text-base"
                            >
                                Drucken
                            </button>
                        </div>
                    </div>

                    {/* Repertoire Column */}
                    <div className="flex-1 min-w-[320px] md:min-w-[400px] lg:min-w-[480px]"> {/* Gleiche Mindestbreite */}
                        {renderList(repertoire, "repertoire")}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetlistPlanner;