let spawn = require('child_process').spawn;

let keygen = function (filePath) {
    console.log(filePath);
    return new Promise(function (resolve, reject) {
        console.log(filePath);
        let ls = spawn('ssh-keygen', ['-f', filePath], {
            stdio: 'inherit'
        });
        ls.on('close', (code) => {
            resolve(code);
        });
    });

};

let copy = function (user, ip, filePath) {
    return new Promise(function (resolve, reject) {
        let options = ['ssh-copy-id'];
        if (filePath && filePath !== '') {
            options.push('-i');
            options.push(filePath);
        }
        options.push(user + '@' + ip);
        let ls = spawn('sh', options, {
            stdio: 'inherit'
        });

        ls.on('close', (code) => {
            resolve(code);
        });
    });

};

module.exports = {
    keygen,
    copy
};