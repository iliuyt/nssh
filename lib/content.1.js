let path = require('path');
let os = require('os');
let fs = require('fs');
let shell = require('./shell');
let chalk = require('chalk');


let sshPath = path.join(os.homedir(), '/.ssh/');
let nsshPath = path.join(os.homedir(), '/.nssh/');
let tmpPath = path.join(os.homedir(), '/.nssh/.tmp/');

let configPath = path.join(sshPath, 'config');

let loadConf = function () {
    if (!fs.existsSync(configPath)) {
        return false;
    }
    let content = fs.readFileSync(configPath, 'utf-8');
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

let getConfStr = function (conf) {
    let fileContent = '\r\n\r\n';
    for (let key in conf) {
        if (fields.indexOf(key) < 0) {
            fileContent += key + ' ' + conf[key] + '\r\n';
        }
    }
    return fileContent;
};

let checkFile = function (filePath) {
    if (!fs.existsSync(filePath)) {
        console.error('配置文件不存在');
        return false;
    }
    return true;
};

let checkHost = function (configs, host) {
    let isExists = false;
    configs.forEach((item) => {
        if (!isExists && item.Host === host) {
            isExists = true;
        }
    });
    return isExists;
};

let getConfig = function (filePath) {
    if (!fs.existsSync(filePath)) {
        return false;
    }
    let content = fs.readFileSync(filePath, 'utf-8');
    // 去除tab符 根据回车分割
    let contentArr = content.replace(/\t+/g, '').split('\r\n');
    let configs = [];
    let tmp = {};
    contentArr.forEach((item) => {
        if (item.trim().substr(0, 1) !== '#') {
            let prop = item.replace(/\s+/g, ' ').split(' ');
            if (prop && prop.length === 2) {
                if (prop[0] === 'Host' && tmp.Host) {
                    configs.push(Object.assign({}, tmp));
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

let setConfig = function (filePath, configs) {
    let fileContent = '';
    configs.forEach((item, index) => {
        fileContent += getConfigStr(item);
    });
    fs.writeFileSync(filePath, fileContent);
};

let addConfig = function (option) {
    let configs = [];
    // 检查文件
    if (checkFile(configPath)) {
        // 获取配置
        configs = getConfig(configPath);
        if (checkHost(configs, option.host)) {
            console.log('配置名称已存在');
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

    let item = {
        Host: option.host,
        HostName: option.hostname,
        PreferredAuthentications: option.auth || 'publickey',
        IdentityFile: option.file,
        User: option.user || 'root',
    };


    configs.push(item);

    // 保存配置
    setConfig(configPath, configs);

    console.log(getConfigStr(item));
    console.log('添加配置完成');
    return true;
};

let removeConfig = function (hosts, isDel) {
    // 检查文件
    if (!checkFile(configPath)) {
        return false;
    }

    // 获取配置
    let configs = getConfig(configPath);

    if (configs.length <= 0) {
        console.log('配置文件内容为空');
        return true;
    }

    // 获取要删除的配置Index
    let removes = [];
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
            let delFilePath = item.IdentityFile;
            if (delFilePath.substr(0, 1) === '~') {
                delFilePath = path.join(os.homedir(), delFilePath.substr(1, delFilePath.length - 1));
            }
            console.log(delFilePath);
            if (fs.existsSync(delFilePath)) {
                fs.unlinkSync(delFilePath);
                console.log(item.Host + '的密钥删除完成', delFilePath);
            }
        }
        console.log(item.Host + '配置删除完成');
    });

    // 保存配置
    setConfig(configPath, configs);



    return true;
};

let listConfig = function () {
    // 检查文件
    if (!checkFile(configPath)) {
        return false;
    }

    // 获取配置
    let configs = getConfig(configPath);
    if (configs.length <= 0) {
        console.log('配置文件没有任何内容');
        return true;
    }
    // 查找Host
    configs.forEach((item, index) => {
        console.log(getConfigStr(item));
    });

    return true;
};

let showConfig = function (hosts) {


    // 检查文件
    if (!checkFile(configPath)) {
        return false;
    }

    // 获取配置
    let configs = getConfig(configPath);

    if (configs.length <= 0) {
        console.log('配置文件内容为空');
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
};

let create = function (option) {

    let conf = null;

    // 检查文件夹是否存在
    let newPath = path.join(nsshPath, option.name);
    let hostname, hostuser = false;
    if (fs.existsSync(newPath)) {
        console.log(chalk.red('密钥名称已存在'));
        return true;
    }

    let isCopy = option.type === 2 || option.type === 3;
    let isConf = option.type === 1 || option.type === 3;

    if (isCopy || isConf) {
        // 参数检查
        if (option.host.split('@').length < 2) {
            console.log(chalk.red('主机地址和登录用户不可为空'));
            return false;
        }
        hostname = option.host.split('@')[0];
        hostuser = option.host.split('@')[1];
    }

    // 是否创建配置
    if (isConf) {
        // 加载配置
        conf = loadConf();
        // 检测配置是否存在
        if (conf[option.name]) {
            console.log(chalk.red('配置文件名称已存在，配置文件地址：' + configPath));
            return true;
        }
    }

    // 创建临时库
    mkdirSync(tmpPath);

    let newKeyFilePath = path.join(newPath, 'id_rsa');
    let tmpKeyFilePath = path.join(tmpPath, 'id_rsa');
    // 生成密钥
    shell.keygen(tmpKeyFilePath)
        .then(function () {
            console.log(chalk.green('密钥已生成'));
            // 拷贝文件
            if (isCopy) {
                return shell.copy(option.host, path.join(tmpPath, 'id_rsa.pub'));
            }
            return Promise.resolve();
        })
        .then(function (code) {
            if (isCopy) {
                console.log(chalk.green('密钥拷贝完成，主机：' + option.host));
            }

            // 添加配置
            if (isConf) {
                let fileContent = getConfStr({
                    Host: option.name,
                    HostName: hostname,
                    PreferredAuthentications: 'publickey',
                    IdentityFile: newKeyFilePath,
                    User: hostuser,
                });
                fs.appendFileSync(configPath, fileContent);
                console.log(chalk.green('配置添加完成，配置地址：' + configPath));
            }
            // 拷贝密钥
            fs.renameSync(tmpPath, newPath);

            console.log(chalk.green('✔ 密钥创建成功'));
        })
        .catch(function (error) {
            var platform = os.platform();
            if (platform === 'win32' && error.message.indexOf('ENOENT') > -1) {
                console.log(chalk.red('请使用git bash执行nssh命令'));
            } else {
                console.log(chalk.red(error.message));
            }
        })
};

let init = function () {
    try {
        let keyPath = path.join(sshPath, '/id_rsa');
        let pubPath = path.join(sshPath, '/id_rsa.pub');
        if (fs.existsSync(sshPath)) {
            console.log(chalk.green('✔ 密钥库已经存在'));
            console.log(chalk.green('密钥库地址为：' + nsshPath));
            return true;
        }

        mkdirSync(sshPath);

        // 判断是否有密钥
        if (fs.existsSync(keyPath) && fs.existsSync(pubPath)) {

            let defaultPath = path.join(nsshPath, '/default');
            let defaultKeyPath = path.join(defaultPath, '/id_rsa');
            let defaultPubPath = path.join(defaultPath, '/id_rsa.pub');

            // 创建default文件夹
            mkdirSync(defaultPath);

            // 拷贝文件
            copy(keyPath, defaultKeyPath);
            copy(pubPath, defaultPubPath);

            // 删除
            fs.unlinkSync(keyPath);
            fs.unlinkSync(pubPath);

            // 创建软连接
            fs.symlinkSync(defaultKeyPath, keyPath)
            fs.symlinkSync(defaultPubPath, pubPath)
        }
        console.log(chalk.green('✔ 密钥库初始化完成'));
        console.log(chalk.green('密钥库地址为：' + nsshPath));
    } catch (error) {
        console.log(chalk.red('密钥库初始化失败' + error.message));
    }
}

let list = function () {

}



module.exports = {
    init,
    removeConfig,
    addConfig,
    listConfig,
    showConfig,
    create
};