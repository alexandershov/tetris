describe("Cells", function () {
    let cells;
    beforeEach(function () {
        cells = new Cells(30, 20);
    });

    it("is unset by default", function () {
        expect(cells.isSet(0, 0)).toBe(false);
    });

    it("sets cells", function () {
        cells.set(0, 0);
        expect(cells.isSet(0, 0)).toBe(true);
    });

    it("unsets cells", function () {
        cells.set(0, 0);
        cells.unset(0, 0);
        expect(cells.isSet(0, 0)).toBe(false);
    });
});

describe("Field", function () {
    let emptyField;
    let notEmptyField;

    beforeEach(function () {
        let cells = new Cells(30, 20);

        emptyField = new Field(cells);
        notEmptyField = makeField(`
        xox
        xxx
        oxx
        xxx
`);
    });

    it("gets the indexes of filled lines", function () {
        expect(notEmptyField.getFilledLines()).toEqual([0, 2]);
    });

    it("clears one filled line", function () {
        setLine(emptyField, 0);
        emptyField.clearFilledLines();
        expect(isLineClear(emptyField, 0)).toBe(true);
    });

    it("clears all filled lines and moves everything down", function () {
        let expectedField = makeField(`
        ooo
        ooo
        xox
        oxx
`);
        notEmptyField.clearFilledLines();
        expect(notEmptyField.cells).toEqual(expectedField.cells);
    });

    it("allows valid figure to be placed", function () {
        let figure = makeDefaultFigure(0, 0);
        expect(emptyField.canPlaceFigure(figure)).toBe(true);
    });

    it("allows valid figure to be placed", function () {
        let figure = makeDefaultFigure(0, -1);
        expect(emptyField.canPlaceFigure(figure)).toBe(true);
    });

    it("disallows out of bounds (by x) figure to be placed", function () {
        let figure = makeDefaultFigure(-1, -1);
        expect(emptyField.canPlaceFigure(figure)).toBe(false);
    });

    it("disallows out of bounds (by y) figure to be placed", function () {
        let figure = makeDefaultFigure(0, -2);
        expect(emptyField.canPlaceFigure(figure)).toBe(false);
    });

    function setLine(field, y) {
        for (let x of field.columnNumbers()) {
            field.set(x, y);
        }
    }

    function isLineClear(field, y) {
        for (let x of field.columnNumbers()) {
            if (field.isSet(x, y)) {
                return false;
            }
        }
        return true;
    }
});

describe("Scorer", function () {
    it("has zero initial score", function () {
        let game = new Scorer();
        expect(game.score).toEqual(0);
    });

    it("increments score", function () {
        let game = new Scorer(150);
        game.onFilledLine();
        expect(game.score).toEqual(150);
    });

    it("increments speed with score", function () {
        let game = new Scorer(150, [1000, 1100]);
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
        movedCopy.cells.set(0, 0);
        expect(figure.getCellPoints()).toEqual([
            new Point(2, 4),
            new Point(3, 4),
            new Point(4, 4),
            new Point(3, 5),
        ]);
    });

    it("can copy and move", function () {
        let figure = makeDefaultFigure(2, 3);
        let movedCopy = figure.copyAndApplyEvent(new Event(1, 2));
        expect(movedCopy.getCellPoints()).toEqual([
            new Point(3, 6),
            new Point(4, 6),
            new Point(5, 6),
            new Point(4, 7),
        ]);
    });

    it("can copy and rotate", function () {
        let figure = makeDefaultFigure(2, 3);
        let rotatedCopy = figure.copyAndApplyEvent(new Event(0, 0, true));
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
