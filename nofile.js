var kit = require("nokit");

module.exports = function (task) {
    task("build", ["clean"], function () {
        return kit.copy("src", "lib");
    });

    task("clean", function () {
        return kit.remove("lib");
    });

    task("test", function () {
        return kit.spawn("junit", ["test/**/*.js"]);
    });
};