const spawn = require('child_process').spawn;
let keygen = function (filePath, passphrase) {
    return new Promise(function (resolve, reject) {
        passphrase = passphrase || 'empty';
        let options = ['-f', filePath];
        let ls = spawn('ssh-keygen', options, {
            stdio: 'inherit',
            shell: true
        });
        ls.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else if (code === 512) {
                reject(new Error('cancel create'))
            } else {
                reject(new Error('create error, error code:' + code))
            }
        });
        ls.on('error', (error) => {
            reject(error)
        });
    });

};

let copy = function (host, filePath, port) {
    return new Promise(function (resolve, reject) {

        let options = [];
        let cmd = 'ssh-copy-id'

        if (filePath && filePath !== '') {
            options.push('-i');
            options.push(filePath);
        }

        if (port) {
            options.push('-p');
            options.push(port + '');
        }

        options.push(host);

        let ls = spawn(cmd, options, {
            stdio: 'inherit',
            shell: true
        });
        ls.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error('copy fail, error code：' + code))
            }
        });
        ls.on('error', (error) => {
            reject(error)
        });
    });

};

module.exports = {
    keygen,
    copy
};