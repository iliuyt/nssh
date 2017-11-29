var path = require('path');
var os = require('os');
var fs = require('fs');
var shell = require('./shell');

var sshPath = path.join(os.homedir(), '/.ssh/');
var configPath = path.join(sshPath, 'config');


var checkFile = function (filePath) {
    if (!fs.existsSync(filePath)) {
        console.error("配置文件不存在");
        return false;
    }
    return true;
}

var checkHost = function (configs, host) {

    var isExists = false;
    configs.forEach((item) => {
        if (!isExists && item.Host === host) {
            isExists = true;
        }
    });

    return isExists;
}

var getConfig = function (filePath) {
    var content = fs.readFileSync(filePath, 'utf-8');

    // 去除tab符 根据回车分割
    var contentArr = content.replace(/\t+/g, '').split('\r\n');

    var configs = [];
    var tmp = {};
    contentArr.forEach((item) => {
        if (item.trim().substr(0, 1) !== "#") {
            var prop = item.replace(/\s+/g, ' ').split(' ')
            if (prop && prop.length === 2) {
                if (prop[0] === "Host" && tmp.Host) {
                    configs.push(Object.assign({}, tmp))
                    tmp = {};
                }
                tmp[prop[0]] = prop[1];
            }
        }
    });
    // 最后需要再添加一次
    if (tmp.Host) {
        configs.push(Object.assign({}, tmp))
    }
    return configs;
}


var getConfigStr = function (config) {
    var fields = ['Host', 'HostName', 'PreferredAuthentications', 'IdentityFile', 'User'];
    var fileContent = '\r\n\r\n';
    fileContent += 'Host ' + config.Host + '\r\n';
    fileContent += 'HostName ' + config.HostName + '\r\n';
    fileContent += 'PreferredAuthentications ' + config.PreferredAuthentications + '\r\n';
    fileContent += 'IdentityFile ' + config.IdentityFile + '\r\n';
    fileContent += 'User ' + config.User + '\r\n';

    for (var key in config) {
        if (fields.indexOf(key) < 0) {
            fileContent += key + ' ' + config[key] + '\r\n';
        }
    }
    return fileContent;
}

var setConfig = function (filePath, configs) {
    var fileContent = '';
    configs.forEach((item, index) => {
        fileContent += getConfigStr(item);
    });
    fs.writeFileSync(filePath, fileContent)
}

var addConfig = function (option) {
    var configs = [];
    // 检查文件
    if (checkFile(configPath)) {
        // 获取配置
        configs = getConfig(configPath);
        if (checkHost(configs, option.host)) {
            console.log('配置名称已存在')
            return false;
        }
    }

    option.file = option.file || path.join(sshPath, 'id_rsa_' + option.host);
    if (option.file.indexOf('/') < 0) {
        option.file = path.join(sshPath, 'id_rsa_' + option.host);
    }

    // 判断密钥文件是否存在
    if (!fs.existsSync(option.file) && !fs.existsSync(option.file + '.pub')) {
        console.log('密钥文件不存在', option.file);
        return false;
    }

    var item = {
        Host: option.host,
        HostName: option.hostname,
        PreferredAuthentications: option.auth || 'publickey',
        IdentityFile: option.file,
        User: option.user || 'root',
    }


    configs.push(item);

    // 保存配置
    setConfig(configPath, configs);

    console.log(getConfigStr(item))
    console.log('添加配置完成')
    return true;
}

var removeConfig = function (hosts, isDel) {
    // 检查文件
    if (!checkFile(configPath)) {
        return false;
    }

    // 获取配置
    var configs = getConfig(configPath);

    if (configs.length <= 0) {
        console.log('配置文件内容为空')
        return true;
    }

    // 获取要删除的配置Index
    var removes = [];
    configs.forEach((item, index) => {
        if (hosts.indexOf(item.Host) >= 0) {
            removes.push({
                Host: item.Host,
                IdentityFile: item.IdentityFile,
                Index: index
            });
            hosts.splice(hosts.indexOf(item.Host), 1);
        }
    });

    hosts.forEach(item => {
        console.log('找不到' + item + '配置');
    });

    // 删除配置
    removes.forEach(item => {
        configs.splice(parseInt(item.Index), 1);
        if (isDel) {
            var delFilePath = item.IdentityFile;
            if (delFilePath.substr(0, 1) === '~') {
                delFilePath = path.join(os.homedir(), delFilePath.substr(1, delFilePath.length - 1));
            }
            console.log(delFilePath)
            if (fs.existsSync(delFilePath)) {
                fs.unlinkSync(delFilePath);
                console.log(item.Host + '的密钥删除完成', delFilePath);
            };
        }
        console.log(item.Host + '配置删除完成');
    });

    // 保存配置
    setConfig(configPath, configs);




    return true;
}

var listConfig = function () {
    // 检查文件
    if (!checkFile(configPath)) {
        return false;
    }

    // 获取配置
    var configs = getConfig(configPath);
    if (configs.length <= 0) {
        console.log('配置文件没有任何内容');
        return true;
    }
    // 查找Host
    configs.forEach((item, index) => {
        console.log(getConfigStr(item));
    });

    return true;
}

var showConfig = function (hosts) {


    // 检查文件
    if (!checkFile(configPath)) {
        return false;
    }

    // 获取配置
    var configs = getConfig(configPath);

    if (configs.length <= 0) {
        console.log('配置文件内容为空')
        return true;
    }

    // 查找Host
    configs.forEach((item, index) => {
        if (hosts.indexOf(item.Host) >= 0) {
            console.log(getConfigStr(item));
            hosts.splice(hosts.indexOf(item.Host), 1);
        }
    });

    hosts.forEach(item => {
        console.log('找不到' + item + '配置');
    });


    return true;
}

// ssh create tmp 192.168.0.1 root
// -s 0不创建 1创建
var createSSH = function (option, isCreate) {

    var configs = [];
    // 检查文件
    if (checkFile(configPath)) {
        // 获取配置
        configs = getConfig(configPath);
        if (checkHost(configs, option.host)) {
            console.log('配置名称已存在')
            return false;
        }
    }

    // 获取地址
    option.file = option.file || path.join(sshPath, 'id_rsa_' + option.host);
    if (option.file.indexOf('/') < 0) {
        option.file = path.join(sshPath, 'id_rsa_' + option.host);
    }

    option.user = option.user || 'root';

    var keygenP = Promise.resolve(0);
    // 是否创建文件
    if (isCreate) {
        keygenP = shell.keygen(option.file);
    } else {
        // 判断密钥文件是否存在
        if (!fs.existsSync(option.file) && !fs.existsSync(option.file + '.pub')) {
            console.log('密钥文件不存在', option.file);
            return false;
        }
    }


    return keygenP.then(function (code) {
        if (code === 0) {
            console.log('创建密钥完成', option);
            return shell.copy(option.user, option.hostname, option.file + '.pub');
        } else {
            console.log('创建密钥失败', code);
            return Promise.reject(code);
        }
    }).then(function (code) {
        if (code === 0) {
            console.log('拷贝文件完成');
            var item = {
                Host: option.host,
                HostName: option.hostname,
                PreferredAuthentications: option.auth || 'publickey',
                IdentityFile: option.file,
                User: option.user
            }

            configs.push(item);

            // 保存配置
            setConfig(configPath, configs);

            console.log(getConfigStr(item))

            console.log('添加配置完成')
            return Promise.resolve(code);

        } else {
            console.log('拷贝文件失败');
            return Promise.reject(code);
        }
    }).catch(function (err) {
        return Promise.reject(err);
    });
}


module.exports = {
    removeConfig,
    addConfig,
    listConfig,
    showConfig,
    createSSH
}