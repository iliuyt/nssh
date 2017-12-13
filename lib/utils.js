const cts = require('./constant');
const path = require('path');
const fs = require('fs');

let copySync = function (src, dst) {
    mkdirSync(path.dirname(dst))
    fs.writeFileSync(dst, fs.readFileSync(src));
}

let mkdirSync = function (dirpath, mode) {
    try {
        if (!fs.existsSync(dirpath)) {
            let pathtmp;
            dirpath.split(/[/\\]/).forEach(function (dirname) {
                if (dirname === '') {
                    if (!pathtmp) {
                        pathtmp = '/';
                    }
                    return false;
                }
                if (pathtmp) {
                    pathtmp = path.join(pathtmp, dirname);
                } else {
                    pathtmp = dirname;
                }
                if (!fs.existsSync(pathtmp)) {
                    if (!fs.mkdirSync(pathtmp, mode)) {
                        return false;
                    }
                }
            });
        }
        return true;
    } catch (e) {
        console.error("create director fail! path=" + dirpath + " errorMsg:" + e);
        return false;
    }
}

let rmdirSync = function (dirpath) {
    var files = [];
    if (fs.existsSync(dirpath)) {
        files = fs.readdirSync(dirpath);
        files.forEach(function (file, index) {
            var curPath = path.join(dirpath, file);
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dirpath);
    }
};

let loadSSHKeys = function (dirpath) {
    let keys = [];
    let files = fs.readdirSync(dirpath);
    files.forEach(function (file, index) {
        var curPath = path.join(dirpath, file);
        if (fs.statSync(curPath).isDirectory()) {
            let key = loadSingleKey(curPath)
            if (key) {
                keys[file] = key;
            }
        }
    });
    return keys;
}

let loadSingleKey = function (filepath) {
    let key = {};
    let files = fs.readdirSync(filepath);
    files.forEach(function (file, index) {
        var curPath = path.join(filepath, file);
        if (!fs.statSync(curPath).isDirectory()) {

            if (file.indexOf('.pub') >= 0) {
                key.PublicKey = curPath;
            } else {
                key.PrivateKey = curPath;
            }
        }
    });
    return key;
}

let loadConf = function (filepath) {
    if (!fs.existsSync(filepath)) {
        return {};
    }
    let content = fs.readFileSync(filepath, 'utf-8');
    // 去除tab符 根据回车分割
    let contentArr = content.replace(/\t+/g, '').split('\r\n');
    let configs = [];
    let tmp = {};
    contentArr.forEach((item) => {
        if (item.trim().substr(0, 1) !== '#') {
            let prop = item.replace(/\s+/g, ' ').split(' ');
            if (prop && prop.length === 2) {
                if (prop[0] === 'Host' && tmp.Host) {
                    configs[tmp.Host] = Object.assign({}, tmp);
                    tmp = {};
                }
                tmp[prop[0]] = prop[1];
            }
        }
    });
    // 最后需要再添加一次
    if (tmp.Host) {
        configs[tmp.Host] = Object.assign({}, tmp);
    }
    return configs;
};

let confToStr = function (conf) {
    let fileContent = '\r\n\r\n';
    for (let key in conf) {
        fileContent += key + ' ' + conf[key] + '\r\n';
    }
    return fileContent;
}

let saveConf = function (confs, savePath) {
    let fileContent = '';
    for (let key in confs) {
        fileContent += confToStr(confs[key]);
    }
    fs.writeFileSync(savePath, fileContent);
}

// check file is exists, return stat
let existsFile = function (filePath) {
    try {
        let stat = fs.lstatSync(filePath)
        return stat;
    } catch (err) {
        return false
    }
    return false

}

// create symlink
let createLink = function (linkPath, filePath) {
    stat = existsFile(linkPath);
    if (stat) {
        // remove symlink
        fs.unlinkSync(linkPath);
    }
    // create symlink in ssh floder
    fs.symlinkSync(filePath, linkPath)
}

let getLinkPath = function (linkPath) {
    let stat = existsFile(linkPath);
    if (stat && stat.isSymbolicLink()) {
        return fs.readlinkSync(linkPath);
    }
    return false;
}


module.exports = {
    getLinkPath,
    existsFile,
    createLink,
    copySync,
    mkdirSync,
    rmdirSync,
    loadSSHKeys,
    loadSingleKey,
    loadConf,
    confToStr,
    saveConf
};