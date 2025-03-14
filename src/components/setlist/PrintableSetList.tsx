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
                    <div key={song.name + index} className="song-item">
                        <div className="song-header">
                            <span className="song-number">{index + 1}.</span>
                            <h2 className="song-name">{song.name}</h2>
                            <span className="song-duration">{song.duration}</span>
                        </div>

                        {index > 0 && (
                            <div className="instrument-changes">
                                {renderInstrumentChange(setlist[index - 1], song)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="total-duration">
                Gesamtdauer: {formatDuration(totalDuration)}
            </div>
        </div>
    );
};