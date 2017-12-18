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

module.exports = {
    hookConsole,
    indexofArray
}