describe("Cells", function () {
    it("is unset by default", function () {
        let cells = new Cells(30, 20);
        expect(cells.isSet(0, 0)).toBe(false);
    });

    it("sets cells", function () {
        let cells = new Cells(30, 20);
        cells.set(0, 0);
        expect(cells.isSet(0, 0)).toBe(true);
    });

    it("unsets cells", function () {
        let cells = new Cells(30, 20);
        cells.set(0, 0);
        cells.unset(0, 0);
        expect(cells.isSet(0, 0)).toBe(false);
    });
});

describe("Field", function () {
    it("gets the number of filled lines", function () {
        let field = makeField(`
        xox
        xxx
        oxx
        xxx
`);
        expect(field.getFilledLines()).toEqual([0, 2]);
    });

    it("clears one filled line", function () {
        let field = new Field(30, 20);
        setLine(field, 0);
        field.clearFilledLines();
        expect(isLineClear(field, 0)).toBe(true);
    });

    it("clears all filled lines and moves everything down", function () {
        let field = makeField(`
        xox
        xxx
        oxx
        xxx
`);
        let expectedField = makeField(`
        ooo
        ooo
        xox
        oxx
`);
        field.clearFilledLines();
        expect(field._cells.isEqualTo(expectedField._cells)).toBe(true);
    });

    it("allows valid figure to be placed", function() {
        let figure = makeDefaultFigure(0, 0);
        let field = new Field(new Cells(30, 20));
        expect(field.canPlaceFigure(figure)).toBe(true);
    });

    function setLine(field, y) {
        for (let x = 0; x < field.width; x++) {
            field._cells.set(x, y);
        }
    }

    function isLineClear(field, y) {
        for (let x = 0; x < field.width; x++) {
            if (field._cells.isSet(x, y)) {
                return false;
            }
        }
        return true;
    }

});

describe("Game", function () {
    it("has zero initial score", function () {
        let field = new Field(new Cells(30, 20));
        let game = new Game(field);
        expect(game.score).toEqual(0);
    });

    it("increments score", function () {
        let field = new Field(new Cells(30, 20));
        let game = new Game(field, 150);
        game.onFilledLine();
        expect(game.score).toEqual(150);
    });

    it("increments speed with score", function () {
        let field = new Field(new Cells(30, 20));
        let game = new Game(field, 150, [1000, 1100]);
        expect(game.speed).toEqual(0);
        for (let i = 0; i < 6; i++) {
            game.onFilledLine();
        }
        expect(game.speed).toEqual(0);
        game.onFilledLine();
        expect(game.speed).toEqual(1);
        game.onFilledLine();
        expect(game.speed).toEqual(2);
    });
});


describe("Figure", function () {
    it("has position", function () {
        let figure = makeDefaultFigure(2, 3);
        expect(figure.getCellPoints()).toEqual([
            new Point(2, 4),
            new Point(3, 4),
            new Point(4, 4),
            new Point(3, 5),
        ]);
    });

    it("can copy itself", function () {
        let figure = makeDefaultFigure(2, 3);
        let movedCopy = figure.copy();
        movedCopy._cells.set(0, 0);
        expect(figure.getCellPoints()).toEqual([
            new Point(2, 4),
            new Point(3, 4),
            new Point(4, 4),
            new Point(3, 5),
        ]);
    });

    it("can copy and move", function () {
        let figure = makeDefaultFigure(2, 3);
        let movedCopy = figure.copyAndMove(1, 2);
        expect(movedCopy.getCellPoints()).toEqual([
            new Point(3, 6),
            new Point(4, 6),
            new Point(5, 6),
            new Point(4, 7),
        ]);
    });

    it("can copy and rotate", function () {
        let figure = makeDefaultFigure(2, 3);
        let rotatedCopy = figure.copyAndRotate();
        let expectedFigure = makeFigure(2, 3, `
        oxo
        oxx
        oxo
`);
        expect(rotatedCopy).toEqual(expectedFigure);
    });
});


/**
 * @return {Field}
 */
function makeField(s) {
    return new Field(makeCells(s));
}


function makeDefaultFigure(x, y) {
    return makeFigure(x, y, `
        oxo
        xxx
        ooo
`);
}

/**
 * @return {Figure}
 */
function makeFigure(x, y, s) {
    return new Figure(x, y, makeCells(s));
}


/**
 * @return {Cells}
 */
function makeCells(s) {
    let lines = s.split("\n")
        .map(aLine => aLine.trim())
        .filter(aLine => aLine !== "");
    let width = Math.max(...lines.map(aLine => aLine.length));
    let height = lines.length;
    let cells = new Cells(width, height);
    for (let [y, aLine] of lines.reverse().entries()) {
        for (let [x, char] of aLine.split("").entries()) {
            if (char === "x") {
                cells.set(x, y);
            }
        }
    }
    return cells;
}
