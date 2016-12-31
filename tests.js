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

    it("clears one line", function () {
        let field = new Field(30, 20);
        setLine(field, 0);
        field.clearFullLines();
        expect(isLineClear(field, 0)).toBe(true);
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
});
