describe("Field", function () {
    it("is unset by default", function () {
        let field = new Field(20, 20);
        expect(field.isSet(0, 0)).toBe(false);
    });

    it("sets cells", function() {
        let field = new Field(20, 20);
        field.set(0, 0);
        expect(field.isSet(0, 0)).toBe(true);
    })
});