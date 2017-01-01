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

    /**
     * @return {Field}
     */
    function makeField(s) {
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
        return new Field(cells);
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
    it("", function () {

    });
});
