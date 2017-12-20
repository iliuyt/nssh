var pty = require('pty.js');

function hookConsole(logger, target) {
    return function (...args) {
        logger.apply(null, args)
        target.push(args[0])
    }
}

function indexofArray(arr, char) {
    for (let item of arr) {
        if (item.indexOf(char) >= 0) {
            return true;
        }
    }
    return false;
}

function spawn(cmd, options, handle, callback) {
    let term = pty.spawn(cmd, options);
    let content = [];
    term.on('data', function (data) {
        content.push(data);
        // console.log(data);
        if (handle && typeof handle === 'function') {
            handle(term, data, content)
        }
    });
    term.on('exit', function () {
        if (callback && typeof callback === 'function') {
            callback(content.reverse())
        }
    });
}

module.exports = {
    hookConsole,
    indexofArray,
    spawn
}