const spawn = require('child_process').spawn;
const os = require('os');
let keygen = function (filePath) {
    return new Promise(function (resolve, reject) {
        let ls = spawn('ssh-keygen', ['-f', filePath], {
            stdio: 'inherit'
        });
        ls.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else if (code === 512) {
                reject(new Error('取消密钥创建'))
            } else if (code === 1) {
                resolve(code);
            } else {
                reject(new Error('创建密钥失败，错误代码：' + code + '，密钥位置：' + filePath))
            }
        });
        ls.on('error', (error) => {
            reject(error)
        });
    });

};

let copy = function (host, filePath) {
    return new Promise(function (resolve, reject) {

        let options = [];
        let cmd = 'ssh-copy-id'
        var platform = os.platform();
        if (platform === 'win32') {
            options.push(cmd);
            cmd = 'sh';
        }

        if (filePath && filePath !== '') {
            options.push('-i');
            options.push(filePath);
        }
        options.push(host);

        let ls = spawn(cmd, options, {
            stdio: 'inherit'
        });
        ls.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error('拷贝密钥失败,主机：' + host + '，密钥位置：' + filePath))
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