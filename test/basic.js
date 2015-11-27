var misp = require("../src/misp");

module.exports = function (it) {
    it.describe("basic", function (it) {
        it("number", function () {
            return it.eq(misp([1], {}), 1);
        });
    });
};
