const common = require('./common');
const path = require('path');
const fs = require('fs');
let program = require('commander');

// 拷贝文件
let copySync = function (src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src));
}

// 递归创建文件
let mkdirSync = function (dirpath, mode) {
    try {
        if (!fs.existsSync(dirpath)) {
            let pathtmp;
            dirpath.split(/[/\\]/).forEach(function (dirname) {
                if (dirname === '') {
                    if (!pathtmp) {
                        pathtmp += '/';
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

// 递归删除文件夹
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

// 获取keys库
let loadSSHKeys = function (dirpath) {
    if (!fs.existsSync(dirpath)) {
        console.log('加载SSH KEY库目录不存在，目录地址：' + dirpath);
        return false;
    }
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

// 获取单个Key
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


// 加载配置
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
        configs.push(Object.assign({}, tmp));
    }
    return configs;
};

// 配置对象转字符串
let confToStr = function (conf) {
    let fileContent = '\r\n\r\n';
    for (let key in conf) {
        fileContent += key + ' ' + conf[key] + '\r\n';
    }
    return fileContent;
}

// 保存配置
let saveConf = function (confs, savePath) {
    let fileContent = '';
    for (let key in confs) {
        fileContent += confToStr(confs[key]);
    }
    fs.writeFileSync(savePath, fileContent);
}


/**
 * Help.
 */
function help(len) {
    len = len || 1;
    program.parse(process.argv);
    // 删除因action导致多余的参数
    if (program.args.length > 0) {
        program.args.splice(program.args.length - 1, 1);
    }
    if (program.args.length < len) return program.help();
}

module.exports = {
    copySync,
    mkdirSync,
    rmdirSync,
    loadSSHKeys,
    loadSingleKey,
    loadConf,
    confToStr,
    saveConf,
    help
};