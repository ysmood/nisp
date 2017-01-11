var kit = require("nokit");

module.exports = function (task) {
    task("build", ["lint"], function () {
    });

    task("lint", function () {
        return kit.spawn("eslint", ["{core,fn,lang,test}/**/*.js", "nofile.js"]);
    });

    task("test", function () {
        return kit.spawn("junit", ["test/basic.js"]);
    });
};