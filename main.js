class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Cells {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = Cells._make2DArray(this.width, this.height);
    }

    isEqualTo(other) {
        if (this.width !== other.width) {
            return false;
        }
        if (this.height !== other.height) {
            return false;
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.isSet(x, y) !== other.isSet(x, y)) {
                    return false;
                }
            }
        }
        return true;
    }

    isSet(x, y) {
        this._checkBorders(x, y);
        return this.cells[y][x];
    }

    set(x, y, value = true) {
        this._checkBorders(x, y);
        this.cells[y][x] = value;
    }

    unset(x, y) {
        this.set(x, y, false);
    }

    copy() {
        let arrayCopy = this.cells.map(line => line.slice());
        let result = new Cells(this.width, this.height);
        result.cells = arrayCopy;
        return result;
    }

    rotate() {
        if (this.width !== this.height) {
            throw `${this.width} !== ${this.height}`;
        }
        let arrayCopy = this.cells.map(line => line.slice());
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                arrayCopy[this.height - x - 1][y] = this.cells[y][x];
            }
        }
        this.cells = arrayCopy;
    }

    static _make2DArray(width, height) {
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
        console.assert(x >= 0 && x < this.width, x);
        console.assert(y >= 0 && y < this.height, y);
    }
}

class Field {

    /**
     *
     * @param cells {Cells}
     */
    constructor(cells) {
        this._cells = cells;
    }

    get width() {
        return this._cells.width;
    }

    get height() {
        return this._cells.height;
    }

    unsetLine(y) {
        for (let x = 0; x < this.width; x++) {
            this._cells.unset(x, y);
        }

    }

    getFilledLines() {
        let result = [];
        for (let y = 0; y < this.height; y++) {
            if (this.isLineFilled(y)) {
                result.push(y);
            }
        }
        return result;
    }

    clearFilledLines() {
        let numCheckedLines = 0;
        let y = 0;
        while (numCheckedLines < this.height) {
            if (this.isLineFilled(y)) {
                this.unsetLine(y);
                this.moveAboveLinesDown(y)
            } else {
                y++;
            }
            numCheckedLines++;
        }
    }

    isLineFilled(y) {
        for (let x = 0; x < this.width; x++) {
            if (!this._cells.isSet(x, y)) {
                return false;
            }
        }
        return true;
    }

    moveAboveLinesDown(y) {
        for (let i = y + 1; i < this.height; i++) {
            this.copyLine(i, i - 1);
            this.unsetLine(i);
        }
    }

    copyLine(ySrc, yDest) {
        for (let x = 0; x < this.width; x++) {
            this._cells.set(x, yDest, this._cells.isSet(x, ySrc));
        }
    }
}


class Figure {
    constructor(x, y, cells) {
        this.x = x;
        this.y = y;
        this._cells = cells;
    }

    get width() {
        return this._cells.width;
    }

    get height() {
        return this._cells.height;
    }

    getCellPoints() {
        let cellPoints = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this._cells.isSet(x, y)) {
                    let point = new Point(this.x + x, this.y + y);
                    cellPoints.push(point);
                }
            }
        }
        return cellPoints;
    }

    copyAndMove(deltaX, deltaY) {
        let copy = this.copy();
        copy.move(deltaX, deltaY);
        return copy;
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
    }

    copyAndRotate() {
        let copy = this.copy();
        copy.rotate();
        return copy;
    }


    rotate() {
        this._cells.rotate();
    }


    copy() {
        return new Figure(
            this.x,
            this.y,
            this._cells.copy()
        );
    }
}


class Game {
    constructor(field,
                scoreIncrement = 100,
                speedLevels = [20000, 40000, 60000]) {
        this.field = field;
        this.scoreIncrement = scoreIncrement;
        this._speedLevels = speedLevels;
        this.score = 0;
    }

    onFilledLine() {
        this.score += this.scoreIncrement;
    }

    get speed() {
        for (let [i, level] of this._speedLevels.entries()) {
            if (this.score < level) {
                return i;
            }
        }
        return this._speedLevels.length;
    }
}

