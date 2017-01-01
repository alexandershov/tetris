describe("Field", function () {
    it("is unset by default", function () {
        let field = new Field(30, 20);
        expect(field.isSet(0, 0)).toBe(false);
    });

    it("sets cells", function () {
        let field = new Field(30, 20);
        field.set(0, 0);
        expect(field.isSet(0, 0)).toBe(true);
    });

    it("unsets cells", function () {
        let field = new Field(30, 20);
        field.set(0, 0);
        field.unset(0, 0);
        expect(field.isSet(0, 0)).toBe(false);
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
        expect(field.isEqualTo(expectedField)).toBe(true);
    });

    function setLine(field, y) {
        for (let x = 0; x < field.width; x++) {
            field.set(x, y);
        }
    }

    function isLineClear(field, y) {
        for (let x = 0; x < field.width; x++) {
            if (field.isSet(x, y)) {
                return false;
            }
        }
        return true;
    }

    function makeField(s) {
        let lines = s.split("\n")
            .map(aLine => aLine.trim())
            .filter(aLine => aLine !== "");
        let width = Math.max(...lines.map(aLine => aLine.length));
        let height = lines.length;
        let field = new Field(width, height);
        for (let [y, aLine] of lines.reverse().entries()) {
            for (let [x, char] of aLine.split("").entries()) {
                if (char === "x") {
                    field.set(x, y);
                }
            }
        }
        return field;
    }
});

describe("Game", function () {
    it("has zero initial score", function () {
        let field = new Field(30, 20);
        let game = new Game(field);
        expect(game.score).toEqual(0);
    });

    it("increments score", function () {
        let field = new Field(30, 20);
        let game = new Game(field, 150);
        game.onFilledLine();
        expect(game.score).toEqual(150);
    });
});
