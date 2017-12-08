const path = require('path');
const os = require('os');
const fs = require('fs');

const chalk = require('chalk');
const shell = require('./shell');
const utils = require('./utils');
const common = require('./common');
const inquirer = require('inquirer');

// 创建密钥
let create = function (option) {
    initCheck();

    let conf = null;

    // 检查文件夹是否存在
    let newPath = path.join(common.NSSHPath, option.name);
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
        hostuser = option.host.split('@')[0];
        hostname = option.host.split('@')[1];
    }

    // 是否创建配置
    if (isConf) {
        // 加载配置
        conf = utils.loadConf(common.ConfPath);
        // 检测配置是否存在
        if (conf[option.name]) {
            console.log(chalk.red('配置已存在'));
            return true;
        }
    }

    // 清理临时库
    if (!fs.existsSync(common.TmpPath)) {
        utils.rmdirSync(common.TmpPath);
    }

    // 创建临时库
    utils.mkdirSync(common.TmpPath);

    let newKeyFilePath = path.join(newPath, common.PrivateKey);
    // 生成密钥
    shell.keygen(common.TmpPrivateKeyPath)
        .then(function () {
            console.log(chalk.green('密钥已生成'));
            // 拷贝文件
            if (isCopy) {
                return shell.copy(option.host, common.TmpPublicKeyPath);
            }
            return Promise.resolve();
        })
        .then(function (code) {
            if (isCopy) {
                console.log(chalk.green('密钥拷贝完成，主机：' + option.host));
            }

            // 添加配置
            if (isConf) {
                conf.push({
                    Host: option.name,
                    HostName: hostname,
                    PreferredAuthentications: 'publickey',
                    IdentityFile: newKeyFilePath,
                    User: hostuser
                });
                utils.saveConf(conf, common.ConfPath);
                console.log(chalk.green('配置添加完成，配置地址：' + common.ConfPath));
            }
            // 拷贝密钥
            fs.renameSync(common.TmpPath, newPath);
            console.log(chalk.green('✔  密钥创建成功'));
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

// 初始化
let init = function () {
    try {
        // 判断是否创建过密钥库
        if (!fs.existsSync(common.NSSHPath)) {
            // 创建文件夹
            utils.mkdirSync(common.NSSHPath);
        }


        // 判断是否有密钥
        if (fs.existsSync(common.SSHPrivateKeyPath) && fs.existsSync(common.SSHPublicKeyPath)) {

            // 判断是否创建过密钥库
            if (!fs.existsSync(common.DefaultPath)) {

                let defaultKeyPath = path.join(common.DefaultPath, common.PrivateKey);
                let defaultPubPath = path.join(common.DefaultPath, common.PublicKey);

                // 创建default文件夹
                utils.mkdirSync(common.DefaultPath);

                // 拷贝文件
                utils.copySync(common.SSHPrivateKeyPath, defaultKeyPath);
                utils.copySync(common.SSHPublicKeyPath, defaultPubPath);

                // 删除
                fs.unlinkSync(common.SSHPrivateKeyPath);
                fs.unlinkSync(common.SSHPublicKeyPath);

                // 创建软连接
                fs.symlinkSync(defaultKeyPath, common.SSHPrivateKeyPath)
                fs.symlinkSync(defaultPubPath, common.SSHPublicKeyPath)
            }

        }
        console.log(chalk.green('✔ 密钥库初始化完成'));
        console.log(chalk.green('密钥库地址为：' + common.NSSHPath));
    } catch (error) {
        console.log(chalk.red('密钥库初始化失败' + error.message));
    }
}

// 查看列表
let list = function () {
    initCheck();

    let keys = utils.loadSSHKeys(common.NSSHPath);
    let useKeyPath = false;
    if (fs.existsSync(common.SSHPrivateKeyPath)) {
        useKeyPath = fs.readlinkSync(common.SSHPrivateKeyPath);
    }

    let content = [];

    for (let name in keys) {
        if (name !== common.TmpKey) {
            if (keys[name].PrivateKey === useKeyPath) {
                content.push(chalk.green('->    ' + name + ' (current)'));
            } else {
                content.push(chalk.blue('      ' + name));
            }
        }
    }

    if (content.length > 0) {
        console.log(chalk.green('✔  找到' + content.length + '个密钥'));
        console.log();
        content.forEach(function (item) {
            console.log(item);
        })
    } else {
        console.log(chalk.green('没有找到密钥'));
    }
}

// 切换密钥
let use = function (name) {
    initCheck();

    let keys = utils.loadSSHKeys(common.NSSHPath);
    if (!keys[name]) {
        console.log(chalk.red('未找到' + name + '密钥'));
        return false;
    }
    if (fs.existsSync(common.SSHPrivateKeyPath)) {
        // 删除
        fs.unlinkSync(common.SSHPrivateKeyPath);
        fs.unlinkSync(common.SSHPublicKeyPath);
    }


    // 创建软连接
    fs.symlinkSync(keys[name].PrivateKey, common.SSHPrivateKeyPath)
    fs.symlinkSync(keys[name].PublicKey, common.SSHPublicKeyPath)

    console.log(chalk.green('✔  当前使用的密钥：' + name));
}


// 修改密钥名称
let rename = function (name, newName) {
    initCheck();

    let keys = utils.loadSSHKeys(common.NSSHPath);
    if (!keys[name]) {
        console.log(chalk.red('未找到' + name + '密钥'));
        return false;
    }

    // 修改配置
    let confs = utils.loadConf(common.ConfPath);
    if (confs[name]) {
        confs[newName] = confs[name];
        delete confs[name];
        confs[newName].Host = newName;
        confs[newName].IdentityFile = path.join(common.NSSHPath, newName, common.PrivateKey);
        utils.saveConf(confs, common.ConfPath);
    }


    // 重命名文件夹
    fs.renameSync(path.join(common.NSSHPath, name), path.join(common.NSSHPath, newName));

    // 判断是否为当前使用的密钥
    if (fs.existsSync(common.SSHPrivateKeyPath)) {
        let currentKeyPath = fs.readlinkSync(common.SSHPrivateKeyPath);
        // 判断是否为默认
        if (path.join(common.NSSHPath, name, common.PrivateKey) === currentKeyPath) {
            fs.unlinkSync(common.SSHPrivateKeyPath);
            fs.unlinkSync(common.SSHPublicKeyPath);

            // 创建软连接
            fs.symlinkSync(path.join(common.NSSHPath, newName, common.PrivateKey), common.SSHPrivateKeyPath)
            fs.symlinkSync(path.join(common.NSSHPath, newName, common.PublicKey), common.SSHPublicKeyPath)
        }
    }

    console.log(chalk.green('✔  ' + name + '重命名为：' + newName));
}

// 删除密钥
let remove = function (name) {
    initCheck();

    let keys = utils.loadSSHKeys(common.NSSHPath);
    if (!keys[name]) {
        console.log(chalk.red('未找到' + name + '密钥'));
        return false;
    }


    inquirer.prompt([{
        type: 'confirm',
        name: 'yes',
        message: '确定要删除 ' + name + ' 吗？'
    }]).then(function (resp) {
        if (resp.yes) {
            let currentKeyPath = false;
            if (fs.existsSync(common.SSHPrivateKeyPath)) {
                currentKeyPath = fs.readlinkSync(common.SSHPrivateKeyPath);
                // 判断是否为默认
                if (keys[name].PrivateKey === currentKeyPath) {
                    fs.unlinkSync(common.SSHPrivateKeyPath);
                    fs.unlinkSync(common.SSHPublicKeyPath);
                }
            }
            // 删除文件夹
            utils.rmdirSync(path.join(common.NSSHPath, name));

            // 删除配置
            let confs = utils.loadConf(common.ConfPath);
            if (confs[name]) {
                delete confs[name];
                utils.saveConf(confs, common.ConfPath);
            }

            console.log(chalk.green('✔  删除密钥' + name + '完成'));
        }
    });


}


// 拷贝密钥
let copy = function (name, host) {
    initCheck();

    let keys = utils.loadSSHKeys(common.NSSHPath);
    if (!keys[name]) {
        console.log(chalk.red('未找到' + name + '密钥'));
        return false;
    }

    shell.copy(host, keys[name].PublicKey)
        .then(function () {
            console.log(chalk.green('✔  密钥拷贝完成，主机：' + host));
        }).catch(function (error) {
            var platform = os.platform();
            if (platform === 'win32' && error.message.indexOf('ENOENT') > -1) {
                console.log(chalk.red('请使用git bash执行nssh命令'));
            } else {
                console.log(chalk.red(error.message));
            }
        });
}

let initCheck = function () {
    utils.mkdirSync(common.NSSHPath);
}



module.exports = {
    init,
    create,
    list,
    use,
    rename,
    remove,
    copy
};