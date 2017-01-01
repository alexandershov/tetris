class Movement {
    constructor(deltaX, deltaY, hasRotation = false) {
        this.deltaX = deltaX;
        this.deltaY = deltaY;
        this.hasRotation = hasRotation;
    }
}


const EVENT_TO_MOVEMENT_MAPPING = new Map(
    [
        ['ArrowDown', new Movement(0, -1)],
        ['ArrowLeft', new Movement(-1, 0)],
        ['ArrowRight', new Movement(1, 0)],
        ['ArrowUp', new Movement(0, 0, true)],
    ]
);

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Cells {
    constructor(width, height, grid = null) {
        this.width = width;
        this.height = height;
        this._grid = grid || Cells._makeGrid(this.width, this.height);
    }

    isInBounds(x, y) {
        if (!(x >= 0 && x < this.width)) {
            return false;
        }
        return y >= 0 && y < this.height;
    }

    isSet(x, y) {
        this._checkBorders(x, y);
        return this._grid[y][x];
    }

    set(x, y, value = true) {
        this._checkBorders(x, y);
        this._grid[y][x] = value;
    }

    unset(x, y) {
        this.set(x, y, false);
    }

    copy() {
        let gridCopy = this._getGridCopy();
        return new Cells(this.width, this.height, gridCopy);
    }

    *columnNumbers() {
        for (let x = 0; x < this.width; x++) {
            yield x;
        }
    }

    *lineNumbers(start = 0) {
        for (let y = start; y < this.height; y++) {
            yield y;
        }
    }

    *reversedLineNumbers() {
        for (let y = this.height - 1; y >= 0; y--) {
            yield y;
        }
    }

    _getGridCopy() {
        return this._grid.map(line => line.slice());
    }

    rotate() {
        if (this.width !== this.height) {
            throw `can't rotate: ${this.width} !== ${this.height}`;
        }
        let gridCopy = this._getGridCopy();
        for (let y of this.lineNumbers()) {
            for (let x of this.columnNumbers()) {
                gridCopy[this.height - x - 1][y] = this._grid[y][x];
            }
        }
        this._grid = gridCopy;
    }

    maxSetY() {
        for (let y of this.reversedLineNumbers()) {
            for (let x of this.columnNumbers()) {
                if (this.isSet(x, y)) {
                    return y;
                }
            }
        }
        return -1;
    }


    static _makeGrid(width, height) {
        let result = new Array(height);
        for (let i = 0; i < height; i++) {
            result[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                result[i][j] = false;
            }
        }
        return result;
    }

    _checkBorders(x, y) {
        if (!this.isInBounds(x, y)) {
            throw `is out of bounds: (${x}, ${y})`
        }
    }

    static fromAsciiDrawing(s) {
        let lines = s.split("\n")
            .map(aLine => aLine.trim())
            .filter(aLine => aLine !== "");
        let width = Math.max(...lines.map(aLine => aLine.length));
        let height = lines.length;
        let cells = new this(width, height);
        for (let [y, aLine] of lines.reverse().entries()) {
            for (let [x, char] of aLine.split("").entries()) {
                if (char === "x") {
                    cells.set(x, y);
                }
            }
        }
        return cells;
    }
}

class Field extends Cells {

    unsetLine(y) {
        for (let x of this.columnNumbers()) {
            this.unset(x, y);
        }
    }

    getFilledLines() {
        let result = [];
        for (let y of this.lineNumbers()) {
            if (this.isLineFilled(y)) {
                result.push(y);
            }
        }
        return result;
    }

    clearFilledLines() {
        let y = 0;
        for (let _ of this.lineNumbers()) {
            if (this.isLineFilled(y)) {
                this.unsetLine(y);
                this.moveAboveLinesDown(y)
            } else {
                y++;
            }
        }
    }

    isLineFilled(y) {
        for (let x of this.columnNumbers()) {
            if (!this.isSet(x, y)) {
                return false;
            }
        }
        return true;
    }

    moveAboveLinesDown(y) {
        for (let i of this.lineNumbers(y + 1)) {
            this.copyLine(i, i - 1);
            this.unsetLine(i);
        }
    }

    copyLine(ySrc, yDest) {
        for (let x of this.columnNumbers()) {
            this.set(x, yDest, this.isSet(x, ySrc));
        }
    }

    canPlaceFigure(figure) {
        for (let point of figure.getCellPoints()) {
            if (!this.isInBounds(point.x, point.y)) {
                return false;
            }
            if (this.isSet(point.x, point.y)) {
                return false;
            }
        }
        return true;
    }
}


class Figure {
    constructor(x, y, cells) {
        this.x = x;
        this.y = y;
        this.cells = cells;
    }

    getCellPoints() {
        let cellPoints = [];
        for (let y of this.cells.lineNumbers()) {
            for (let x of this.cells.columnNumbers()) {
                if (this.cells.isSet(x, y)) {
                    let point = new Point(this.x + x, this.y + y);
                    cellPoints.push(point);
                }
            }
        }
        return cellPoints;
    }

    copyAndApplyMovement(movement) {
        let copy = this.copy();
        if (movement.hasRotation) {
            copy.rotate();
        }
        copy.move(movement.deltaX, movement.deltaY);
        return copy;
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
    }

    rotate() {
        this.cells.rotate();
    }

    copy() {
        return new Figure(
            this.x,
            this.y,
            this.cells.copy()
        );
    }
}


class Scorer {
    constructor(scoreIncrement = 100,
                speedLevels = [200, 400, 600]) {
        this.score = 0;
        this._scoreIncrement = scoreIncrement;
        this._speedLevels = speedLevels;
    }

    onFilledLine() {
        this.score += this._scoreIncrement;
    }

    get speedLevel() {
        for (let [i, level] of this._speedLevels.entries()) {
            if (this.score < level) {
                return i;
            }
        }
        return this._speedLevels.length;
    }
}


class Game {
    constructor(field, canvasElement, scoreElement) {
        this.field = field;
        this.figure = this.generateFigure();
        this.canvasElement = canvasElement;
        this.scoreElement = scoreElement;
        this.scorer = new Scorer();
        this.scale = 20;
    }

    loop() {
        if (this.isOver) {
            alert('Game over!');
            return;
        }
        this.tryToMoveFigure(new Movement(0, -1), true);
        this.render();
        setTimeout(() => this.loop(), (4 - this.scorer.speedLevel) * 150);
    }

    get isOver() {
        return !this.field.canPlaceFigure(this.figure);

    }

    render() {
        console.log('render');
        this.renderScore();
        this.clearCanvas();
        this.renderField();
        this.renderFigure();
    }

    prepareCanvas() {
        this.canvasElement.width = this.unitsToPixelsSize(this.field.width);
        this.canvasElement.height = this.unitsToPixelsSize(this.field.height);
    }

    unitsToPixelsSize(units) {
        return units * this.scale;
    }

    get context() {
        return this.canvasElement.getContext('2d');
    }

    renderSquare(x, y) {
        let topLeft = this.topLeftPoint(x, y);
        this.context.fillRect(topLeft.x, topLeft.y, this.scale, this.scale);
    }

    clearCanvas() {
        this.context.clearRect(
            0, 0,
            this.canvasElement.width, this.canvasElement.height);
    }

    renderField() {
        for (let x of this.field.columnNumbers()) {
            for (let y of this.field.lineNumbers()) {
                if (this.field.isSet(x, y)) {
                    this.renderSquare(x, y);
                }
            }
        }
    }

    renderFigure() {
        if (this.figure === null) {
            return;
        }
        for (let point of this.figure.getCellPoints()) {
            this.renderSquare(point.x, point.y);
        }
    }

    topLeftPoint(x, y) {
        let pixelX = this.unitsToPixelsSize(x);
        let pixelY = this.unitsToPixelsSize(this.field.height) - this.unitsToPixelsSize(y) - this.scale;
        return new Point(pixelX, pixelY);
    }

    static run() {
        let field = new Field(15, 22);
        let canvasElement = document.getElementById('field-canvas');
        let scoreElement = document.getElementById('score');
        let game = new Game(field, canvasElement, scoreElement);
        game.prepareCanvas();
        game.listenToEvents();
        game.loop();
    }

    listenToEvents() {
        document.addEventListener('keydown', event => {
            if (EVENT_TO_MOVEMENT_MAPPING.has(event.key)) {
                console.log('got event', event.key);
                let movement = EVENT_TO_MOVEMENT_MAPPING.get(event.key);
                this.handleMovement(movement);
            }
        });
    }

    renderScore() {
        this.scoreElement.innerText = this.scorer.score.toString();
    }

    generateFigure() {
        let i = Math.floor(Math.random() * KNOWN_FIGURE_CELLS.length);
        let cells = KNOWN_FIGURE_CELLS[i];
        let x = Math.floor(this.field.width / 2 - cells.width / 2);
        let maxSetY = cells.maxSetY();
        if (maxSetY === -1) {
            throw `maxSetY is equal to ${maxSetY}`;
        }
        let y = this.field.height - cells.maxSetY() - 1;
        console.log('putting new figure at', x, y);
        return new Figure(x, y, cells);
    }

    tryToMoveFigure(movement, createNewIfImpossible) {
        let movedFigure = this.figure.copyAndApplyMovement(movement);
        if (this.field.canPlaceFigure(movedFigure)) {
            this.figure = movedFigure;
        } else if (createNewIfImpossible) {
            for (let point of this.figure.getCellPoints()) {
                this.field.set(point.x, point.y);
            }
            for (let line of this.field.getFilledLines()) {
                console.log('line', line, 'is filled');
                this.scorer.onFilledLine();
            }
            this.field.clearFilledLines();
            this.figure = this.generateFigure();
        }
    }

    handleMovement(movement) {
        console.log('handling movement', movement);
        this.tryToMoveFigure(movement);
        this.render();
    }
}


const KNOWN_FIGURE_CELLS = [
    Cells.fromAsciiDrawing(`
      ooooo
      ooxoo
      oxxxo
      ooooo
      ooooo
`),
    Cells.fromAsciiDrawing(`
      ooooo
      ooxoo
      ooxoo
      ooxoo
      ooxoo
`),
    Cells.fromAsciiDrawing(`
      oooo
      oxxo
      oxxo
      oooo
`),
    Cells.fromAsciiDrawing(`
      ooooo
      ooxxo
      ooxoo
      ooxoo
      ooooo
`),
    Cells.fromAsciiDrawing(`
      ooooo
      oxxoo
      ooxoo
      ooxoo
      ooooo
`),
    Cells.fromAsciiDrawing(`
      ooooo
      oooxo
      ooxxo
      ooxoo
      ooooo
`),
    Cells.fromAsciiDrawing(`
      ooooo
      oxooo
      oxxoo
      ooxoo
      ooooo
`),
];
