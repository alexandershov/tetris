class Field {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this._cells = Field._make2DArray(this.width, this.height);
    }

    isSet(x, y) {
        this._checkBorders(x, y);
        return this._cells[y][x];
    }

    set(x, y, value = true) {
        this._checkBorders(x, y);
        this._cells[y][x] = value;
    }

    unset(x, y) {
        this.set(x, y, false);
    }

    unsetLine(y) {
        for (let x = 0; x < this.width; x++) {
            this.unset(x, y);
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
            if (!this.isSet(x, y)) {
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
            this.set(x, yDest, this.isSet(x, ySrc));
        }
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


    _checkBorders(x, y) {
        console.assert(x >= 0 && x < this.width, x);
        console.assert(y >= 0 && y < this.height, y);
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
}


class Game {
    constructor(field, scoreIncrement = 100) {
        this.field = field;
        this.scoreIncrement = scoreIncrement;
        this.score = 0;
    }

    onFilledLine() {
        this.score += this.scoreIncrement;
    }
}

