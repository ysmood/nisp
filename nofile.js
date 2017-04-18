var kit = require("nokit");

module.exports = function (task) {
    task("build", function () {
        return kit.spawn('pegjs', ['parser/index.pegjs'])
        .then(function () {
            return kit.spawn('pegjs', ['parser/extended.pegjs'])
        })
        .then(function () {
            return kit.spawn('tsc')
        })
    });

    task('default dev', function () {
        return kit.spawn('tsc', ['-w'])
    })

    task("test", function () {
        return kit.spawn("junit", ["test/basic.js"]);
    });

    task('lab', function () {
        kit.spawn('noe', [
            '-b', 'node',
            '-w', 'test/**/*.js', '--',

            '--harmony',

            'test/lab.js'
        ]);
    });
}