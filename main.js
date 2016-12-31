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

    set(x, y) {
        this._checkBorders(x, y);
        this._cells[y][x] = true;
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

    unset(x, y) {
        this._checkBorders(x, y);
        this._cells[y][x] = false;
    }
}
