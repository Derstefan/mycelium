"use client"

import { useEffect, useRef } from 'react';
import { ElementConfig } from '../script/models';
import { ShroomsConfig } from '../script/models';
import { Game } from '../script/game';
import { Viewer } from '../script/view';
import { Field } from '../script/models';
import { setStartValues } from '../script/utils';



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

  useEffect(() => {
    if (!canvasRef.current) return;
    let eConfig: any, sConfig: any, game: any, startPositions: any, viewer: any;
    const WIDTH = 121;
    const HEIGHT = 121;

    // Initialisierungsfunktion gemäß der Original-Logik
    function init() {
      eConfig = new ElementConfig(1);
      sConfig = new ShroomsConfig(eConfig.allElements, 4, 60);
      startPositions = setStartValues(sConfig.shrooms.length, WIDTH, HEIGHT);
      game = new Game(eConfig, sConfig, WIDTH, HEIGHT);

      // Übergabe des Canvas-Elements per Ref
      viewer = new Viewer(game, canvasRef.current);
      game.shroomStartValues(startPositions);

      game.setViewer(viewer);
      viewer.render();
      viewer.updateTurnDisplay();
      //  initShroomsUI();
    }

    // Beispiel-Funktionen für die Button-Aktionen
    function resetCells() {
      for (let i = 0; i < WIDTH; i++) {
        for (let j = 0; j < HEIGHT; j++) {
          game.data[i][j] = new Field(0, null);
        }
      }
      game.shroomStartValues(startPositions);
      viewer.render(game);
    }

    function evolveAllShroomsAndRender() {
      game.evolveAllShrooms();
      viewer.render(game);
    }

    function reset() {
      init();
    }

    // Initialisierung beim Mounten der Komponente
    init();

    // Funktionen global verfügbar machen, damit sie in den onClick-Handlern genutzt werden können
    window.resetCells = resetCells;
    window.evolveAllShroomsAndRender = evolveAllShroomsAndRender;
    window.reset = reset;
  }, []);

  return (
    <div className="p-4">
      <div id="canvas-container" className="mt-2">
        <canvas ref={canvasRef} />
      </div>
      {/* <div id="currentShroomDisplay" />*/}
      <div id="sCount" />
      <div className="button-container mt-4 space-x-2">
        <button
          onClick={() => window.reset()}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          new
        </button>
        <button
          onClick={() => window.evolveAllShroomsAndRender()}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          evolve
        </button>
        <button
          onClick={() => window.resetCells()}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          reset
        </button>
      </div>
      <div id="shroomsContainer" className="flex flex-col items-start justify-center mt-4"></div>
    </div>
  );
};

export default CanvasGame;
