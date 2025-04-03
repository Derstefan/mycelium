import { Field } from "./models";
import { arraysAreTheSame } from "./utils";




const WOOD_AGE = 7; // Alter, ab dem ein Shroom nicht mehr wächst
const DIE_AGE = 33405;

const INDICATOR_RADIUS = 5;
//const INDICATOR_COLOR = "rgba(0, 255, 0, 0.1)";

const stepsPerTurn = 1;


export class Game {
  constructor(elementConfig, shroomsConfig, WIDTH, HEIGHT) {
    this.WIDTH = WIDTH;
    this.HEIGHT = HEIGHT;
    this.elementConfig = elementConfig;
    this.shroomsConfig = shroomsConfig;

    // Spielstatus und Steuerung
    this.isBot = [false].concat(new Array(shroomsConfig.shrooms.length - 1).fill(true));
    this.currentShroom = 0;
    this.stepsInCurrentTurn = 0;
    this.botCurrentPosition = null;
    // Zählvariablen für Shrooms
    this.sCount = [];

    // Erstelle ein 2D-Feld und initialisiere alle Zellen mit Field(0, null)
    this.data = new Array(this.WIDTH);
    this.resetCount();
    this.cleanData();
  }

  setViewer(viewer) {
    this.viewer = viewer;
  }

  evolveAllShrooms(times = 1) {
    for (let j = 0; j < times; j++) {
      for (let i = 0; i < this.shroomsConfig.shrooms.length; i++) {
        this.evolveAll(i);
        // console.log("Shroom " + i + " evolved");
      }
    }
  }

  resetCount() {
    this.sCount = new Array(this.shroomsConfig.shroomColors.length).fill(0);
  }

  cleanData() {
    for (let i = 0; i < this.WIDTH; i++) {
      this.data[i] = new Array(this.HEIGHT);
      for (let j = 0; j < this.HEIGHT; j++) {
        this.data[i][j] = new Field(0, null);
      }
    }
  }


  shroomStartValues(posList) {
    for (let i = 0; i < posList.length; i++) {
      this.shroomStartValue(posList[i].x, posList[i].y, i);
    }
  }

  shroomStartValue(x, y, shroomId) {
    this.data[x - 1][y] = new Field(1, shroomId);

    this.data[x + 1][y] = new Field(1, shroomId);

    this.data[x][y - 1] = new Field(1, shroomId);

    this.data[x][y + 1] = new Field(1, shroomId);
  }

  putWall(x1, y1, x2, y2) {
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        this.data[x][y] = new Field(1, -1);
      }
    }
  }




  botTurn() {
    // Bot-Logik: Bestimme eine Zielzelle, die genau 2 Zellen (Manhattan-Distanz) entfernt ist
    if (this.isBot[this.currentShroom]) {
      if (!this.botCurrentPosition) {
        let candidatePositions = [];
        const offsets = [
          { dx: 2, dy: 0 },
          { dx: -2, dy: 0 },
          { dx: 0, dy: 2 },
          { dx: 0, dy: -2 },
          { dx: 1, dy: 1 },
          { dx: 1, dy: -1 },
          { dx: -1, dy: 1 },
          { dx: -1, dy: -1 }
        ];

        // Suche nach Zellen, die dem aktuellen Bot gehören und bestimme Kandidatenpositionen
        for (let x = 1; x < this.WIDTH - 1; x++) {
          for (let y = 1; y < this.HEIGHT - 1; y++) {
            if (this.data[x][y].shroom === this.currentShroom) {
              offsets.forEach(off => {
                const newX = x + off.dx;
                const newY = y + off.dy;
                if (newX >= 1 && newX < this.WIDTH - 1 && newY >= 1 && newY < this.HEIGHT - 1) {
                  candidatePositions.push({ x: newX, y: newY });
                }
              });
            }
          }
        }

        // Duplikate entfernen
        candidatePositions = candidatePositions.filter((pos, index, self) =>
          index === self.findIndex(p => p.x === pos.x && p.y === pos.y)
        );

        // Wähle zufällig eine der Kandidatenpositionen, falls vorhanden
        if (candidatePositions.length > 0) {
          this.botCurrentPosition = candidatePositions[Math.floor(Math.random() * candidatePositions.length)];
        } else {
          // Fallback: zufällige Position im gültigen Bereich
          this.botCurrentPosition = {
            x: Math.floor(Math.random() * (this.WIDTH - 2)) + 1,
            y: Math.floor(Math.random() * (this.HEIGHT - 2)) + 1
          };
        }
      }
      setTimeout(this.botDraw, 200);
    }
  }




  stepClick(clickedX, clickedY) {
    const cellsUpdate = this.initializeCellsUpdate();
    const { startX, endX, startY, endY } = calculateUpdateArea(clickedX, clickedY, INDICATOR_RADIUS);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        if (isWithinRadius(x, y, clickedX, clickedY, INDICATOR_RADIUS) && isAdjacentToShroom(x, y, currentShroom)) {
          cellsUpdate[x][y] = evolveCell(x, y, this.currentShroom);
        }
      }
    }

    applyCellsUpdate(cellsUpdate);
    updateGameState();
  }




  evolveAll(shroomId) {
    const cellsUpdate = this.initializeCellsUpdate();
    // Durch alle Zellen iterieren (ohne Rand)
    for (let x = 1; x < this.WIDTH - 1; x++) {
      for (let y = 1; y < this.HEIGHT - 1; y++) {
        // Nur Zellen evolvieren, die an den Shroom angrenzen
        if (this.isAdjacentToShroom(x, y, shroomId)) {

          cellsUpdate[x][y] = this.evolveCell(x, y, shroomId);
        }
      }
    }

    this.applyCellsUpdate(cellsUpdate);
    this.updateGameState();
  }


  // Hilfsfunktion mit explizitem shroomId Parameter
  isAdjacentToShroom(x, y, shroomId) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        //        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.WIDTH && ny >= 0 && ny < this.HEIGHT) {
          if (this.data[nx][ny].shroom === shroomId && this.data[nx][ny].element !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }


  initializeCellsUpdate() {
    const cellsUpdate = new Array(this.WIDTH);
    for (let i = 0; i < this.WIDTH; i++) {
      cellsUpdate[i] = new Array(this.HEIGHT);
    }
    return cellsUpdate;
  }

  calculateUpdateArea(clickedX, clickedY, d) {
    return {
      startX: Math.max(1, clickedX - d),
      endX: Math.min(this.WIDTH - 2, clickedX + d),
      startY: Math.max(1, clickedY - d),
      endY: Math.min(this.HEIGHT - 2, clickedY + d)
    };
  }



  evolveCell(x, y, shroomId) {
    const aroundValues = [];
    const isOwnShroom = this.data[x][y].shroom === shroomId;
    const age = this.data[x][y].age;

    if (isOwnShroom && age >= DIE_AGE) {
      const field = new Field(0, shroomId);
      field.age = age;
      return field;
    }
    // && (!isOwnShroom && age === 1)
    if ((isOwnShroom && age >= WOOD_AGE)) {
      this.data[x][y].age++;
      return this.data[x][y];
    }

    // Sammle Werte der Nachbarzellen
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        aroundValues.push(
          (nx >= 0 && nx < this.WIDTH && ny >= 0 && ny < this.HEIGHT) && this.data[nx][ny].element !== 0
            ? this.data[nx][ny].element
            : 0
        );
      }
    }
    // Berechne die Summen für jedes Element
    const sums = new Array(this.elementConfig.elements.length - 1).fill(0);
    aroundValues.forEach(val => val > 0 && sums[val - 1]++);

    // Bestimme die anzuwendende Regel
    const rule = this.getRuleByShroom(this.data[x][y].element, sums, shroomId);

    if (rule) {
      const field = new Field(rule.elementId, shroomId);
      field.age = isOwnShroom ? age + 1 : 0;
      return field;
    }
    this.data[x][y].age = isOwnShroom ? age + 1 : 0;
    return this.data[x][y];
  }

  applyCellsUpdate(cellsUpdate) {
    for (let x = 1; x < this.WIDTH - 1; x++) {
      for (let y = 1; y < this.HEIGHT - 1; y++) {
        if (cellsUpdate[x][y] !== undefined) {
          this.data[x][y] = cellsUpdate[x][y];
        }
      }
    }
  }

  updateGameState() {
    this.stepsInCurrentTurn++;
    if (this.stepsInCurrentTurn >= stepsPerTurn) {
      this.stepsInCurrentTurn = 0;
      this.currentShroom = (this.currentShroom + 1) % this.shroomsConfig.shrooms.length;
      this.botCurrentPosition = null;
      if (this.viewer) {
        this.viewer.updateTurnDisplay();
      }
      // this.botTurn();
    }
  }



  // Gibt die Regel zurück, die zum übergebenen Element-Summen-Array und Shroom entspricht
  getRuleByShroom(element, sums, shroomId) {
    for (let i = 0; i < this.shroomsConfig.shrooms[shroomId].length; i++) {
      if (arraysAreTheSame(this.shroomsConfig.shrooms[shroomId][i].elementSums, sums) && element === this.shroomsConfig.shrooms[shroomId][i].fromElement) {
        return this.shroomsConfig.shrooms[shroomId][i];
      }
    }
    return null;
  }

  // Bot-Zug: Führt Schritt(s) basierend auf der zuvor festgelegten Zielposition aus
  botDraw() {
    if (!this.isBot[this.currentShroom]) return;
    stepClick(botCurrentPosition.x, botCurrentPosition.y);
    if (stepsInCurrentTurn < stepsPerTurn) {
      setTimeout(botDraw, 200);
    }
  }



  count() {
    for (let y = 0; y < this.data.length; y++) {
      for (let x = 0; x < this.data[y].length; x++) {
        // Zeichne zuerst die Shroom-Farben
        if (this.data[y][x].shroom !== null) {
          this.sCount[this.data[y][x].shroom]++;
        }
      }
    }
  }
}
