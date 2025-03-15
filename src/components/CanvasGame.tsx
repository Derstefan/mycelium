"use client"

import { useEffect, useState, useRef } from 'react';
import { ElementConfig } from '../script/models';
import { ShroomsConfig } from '../script/models';
import { Game } from '../script/game';
import { Viewer } from '../script/view';
import { Field } from '../script/models';
import { setStartValues } from '../script/utils';
import ShroomEditor from './ShroomEditor';

// Erweiterung des globalen Window-Objekts um die benötigten Funktionen
declare global {
  interface Window {
    resetCells: () => void;
    evolveAllShroomsAndRender: () => void;
    reset: () => void;
    sim: () => void;
  }
}

const CanvasGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const [game, setGame] = useState<any>(null);
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const [eConfig, setEConfig] = useState<any>(null);
  const [updateCount, setUpdateCount] = useState(0);

  // Hilfsfunktion, um ein Re-Rendering zu erzwingen
  const updateGame = () => setUpdateCount(c => c + 1);

  useEffect(() => {

    if (typeof window === 'undefined') return;

    if (!canvasRef.current) return;
    const WIDTH = 221;
    const HEIGHT = 221;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    let localEConfig: any, sConfig: any, localGame: any, startPositions: any, viewer: any;

    function init() {
      localEConfig = new ElementConfig(4, "dyrk");
      sConfig = new ShroomsConfig(localEConfig.allElements, 4, 3260);
      startPositions = setStartValues(sConfig.shrooms.length, WIDTH, HEIGHT);
      localGame = new Game(localEConfig, sConfig, WIDTH, HEIGHT);

      // Übergabe des Canvas per Ref
      viewer = new Viewer(localGame, canvasRef.current);
      localGame.shroomStartValues(startPositions);

      localGame.setViewer(viewer);
      viewer.render();
      viewer.updateTurnDisplay();

      // Setze den State neu, damit ein Re-Render erfolgt
      setGame(localGame);
      setEConfig(localEConfig);
      updateGame();
    }

    function resetCells() {
      for (let i = 0; i < WIDTH; i++) {
        for (let j = 0; j < HEIGHT; j++) {
          localGame.data[i][j] = new Field(0, null);
        }
      }
      localGame.shroomStartValues(startPositions);
      viewer.render(localGame);
    }

    function evolveAllShroomsAndRender() {
      localGame.evolveAllShrooms();
      viewer.render(localGame);
    }

    function reset() {
      init();
    }

    init();

    window.resetCells = resetCells;
    window.evolveAllShroomsAndRender = evolveAllShroomsAndRender;
    window.reset = reset;
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Haupt-Canvas */}
      <div id="canvas-container" className="mt-2">
        <canvas ref={canvasRef} className="border" />
      </div>
      <div id="sCount" className="mt-2" />
      <div className="button-container mt-4 space-x-2">
        <button
          onClick={() => window.reset && window.reset()}
          className="text-gray-900 bg-white border border-gray-300 rounded-lg text-sm px-5 py-2.5 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100"
        >
          new
        </button>
        <button
          onClick={() => window.evolveAllShroomsAndRender && window.evolveAllShroomsAndRender()}
          className="text-gray-900 bg-white border border-gray-300 rounded-lg text-sm px-5 py-2.5 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100"
        >
          evolve
        </button>
        <button
          onClick={() => window.resetCells && window.resetCells()}
          className="text-gray-900 bg-white border border-gray-300 rounded-lg text-sm px-5 py-2.5 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100"
        >
          reset
        </button>
      </div>

      <div id="shroomsContainer" className="mt-4">

        {game && eConfig &&
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          game.shroomsConfig.shrooms.map((_: any, index: number) => (
            <ShroomEditor
              key={`${updateCount}-${index}`}
              index={index}
              game={game}
              eConfig={eConfig}
              updateGame={updateGame}
            />
          ))}
      </div>
    </div>
  );
};

export default CanvasGame;
