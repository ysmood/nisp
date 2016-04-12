var nisp = require("../src");

var env = {
    add: function (get) {
        return get(1) + get(2);
    }
};

console.log(nisp(["add", 1, 2], env));