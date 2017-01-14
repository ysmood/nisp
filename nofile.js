var kit = require("nokit");

module.exports = function (task) {
    task("build", ["lint"], function () {
        return kit.spawn('tsc')
    });

    task('default dev', () => {
        return kit.spawn('tsc', ['-w'])
    })

    task("lint", function () {
        return kit.spawn("eslint", ["{core,fn,lang}/**/*.js", "nofile.js"]);
    });

    task("test", function () {
        return kit.spawn("junit", ["test/basic.js"]);
    });
};