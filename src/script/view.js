



const rectSize = 5; // Größe jeder Zelle

export class Viewer {
    constructor(game, canvas) {
        // Canvas-Einstellungen
        this.game = game;
        this.canvasWidth = game.WIDTH * rectSize;
        this.canvasHeight = game.HEIGHT * rectSize;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.offsetX = (this.canvasWidth - game.data[0].length * rectSize) / 2;
        this.offsetY = (this.canvasHeight - game.data.length * rectSize) / 2;
        this.hoverArea = null;
        // Canvas-Event-Listener hinzufügen

    }








    // Rendert das Spielfeld auf das Canvas
    render() {
        const data = this.game.data;
        const shroomColors = this.game.shroomsConfig.shroomColors;
        const sCount = this.game.sCount;
        const allElements = this.game.elementConfig.allElements;
        for (let y = 0; y < data.length; y++) {
            for (let x = 0; x < data[y].length; x++) {
                // Zeichne zuerst die Shroom-Farben
                if (data[y][x].shroom !== null) {
                    this.ctx.fillStyle = shroomColors[data[y][x].shroom];
                    sCount[data[y][x].shroom]++;
                    this.ctx.fillRect(
                        this.offsetX + x * rectSize,
                        this.offsetY + y * rectSize,
                        rectSize,
                        rectSize
                    );
                }
                // Zeichne den Element-Overlay (kleineres Rechteck in der Mitte)
                this.ctx.fillStyle = allElements[data[y][x].element].color;
                if (data[y][x].element > 0) {
                    this.ctx.fillRect(
                        this.offsetX + 1 + x * rectSize,
                        this.offsetY + 1 + y * rectSize,
                        rectSize - 2,
                        rectSize - 2
                    );
                } else {
                    this.ctx.fillRect(
                        this.offsetX + x * rectSize,
                        this.offsetY + y * rectSize,
                        rectSize,
                        rectSize
                    );
                }
            }
        }

        this.game.count();
        this.renderCounts(this.game);
        this.game.resetCount();

        if (this.hoverArea) {
            const x = this.hoverArea.startX * rectSize;
            const y = this.hoverArea.startY * rectSize;
            const width = (this.hoverArea.endX - this.hoverArea.startX + 1) * rectSize;
            const height = (this.hoverArea.endY - this.hoverArea.startY + 1) * rectSize;
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
            this.ctx.fillRect(x, y, width, height);
        }
    }


    renderCounts() {
        const countDiv = document.getElementById("sCount");
        if (!countDiv) return;
        countDiv.innerHTML = "";

        this.game.sCount.forEach((count, i) => {
            const span = document.createElement("span");
            span.innerText = count;
            span.style.color = this.game.shroomsConfig.shroomColors[i];
            countDiv.appendChild(span);
            const divider = document.createElement("span");
            divider.innerText = "|";
            countDiv.appendChild(divider);

        });
    }




    // Aktualisiert die Anzeige des aktuellen Shrooms und wählt für Bots eine Zielposition
    updateTurnDisplay() {
        const shroomColors = this.game.shroomColors;
        const currentShroom = this.game.currentShroom;

        const display = document.getElementById("currentShroomDisplay");
        if (display) {
            display.innerHTML = `Aktueller Shroom: <span style="color: ${shroomColors[currentShroom]}; font-weight:bold;">Shroom ${currentShroom + 1}</span>`;
        }
    }

}