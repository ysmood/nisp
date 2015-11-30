var kit = require("nokit");

module.exports = function (task) {
    task("build", ["lint", "clean"], function () {
        return kit.copy("src", "lib");
    });

    task("lint", function () {
        return kit.spawn("eslint", ["{src,test}/**/*.js", "nofile.js"]);
    });

    task("clean", function () {
        return kit.remove("lib");
    });

    task("test", function () {
        return kit.spawn("junit", ["test/**/*.js"]);
    });
};