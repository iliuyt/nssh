var spawn = require('child_process').spawn;

var keygen = function (filePath) {
    console.log(filePath);
    return new Promise(function (resolve, reject) {
        console.log(filePath);
        var ls = spawn('ssh-keygen', ['-f', filePath], {
            stdio: 'inherit'
        });
        ls.on('close', (code) => {
            resolve(code)
        });
    })

}

var copy = function (user, ip, filePath) {
    return new Promise(function (resolve, reject) {
        var options = ['ssh-copy-id'];
        if (filePath && filePath !== '') {
            options.push('-i');
            options.push(filePath);
        }
        options.push(user + '@' + ip);
        var ls = spawn('sh', options, {
            stdio: 'inherit'
        });

        ls.on('close', (code) => {
            resolve(code)
        });
    })

}

module.exports = {
    keygen,
    copy
}