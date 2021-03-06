const path = require('path');
const os = require('os');
const fs = require('fs');
const chalk = require('chalk');
const shell = require('./lib/shell');
const utils = require('./lib/utils');
const inquirer = require('inquirer');
const program = require('commander');



let nssh = function (constConf) {
  let cts = constConf || require('./lib/constant');
  let initCheck = function () {
    utils.mkdirSync(cts.NSSHPath);
  }
  return {
    init: function () {
      try {
        // check initialized
        initCheck();

        // create default symlink
        function createDefaultLink(linkPath, filePath) {
          let stat = utils.existsFile(linkPath);
          if (stat) {
            let copyPath = linkPath;

            if (stat.isSymbolicLink()) {
              copyPath = fs.readlinkSync(linkPath);
            }

            if (copyPath !== filePath) {
              utils.copySync(copyPath, filePath);
              utils.createLink(linkPath, filePath);
            }
            return true
          }
          return false;
        }

        // create ssh private key
        let isCreate = createDefaultLink(cts.SSHPrivateKeyPath, cts.DefaultPrivateKeyPath)
        if (isCreate) {
          // create ssh public key
          createDefaultLink(cts.SSHPublicKeyPath, cts.DefaultPublicKeyPath)
        }

        console.log(chalk.green('✔ ssh key store initialized!'));
        console.log(chalk.green('ssh key store location is:' + cts.NSSHPath));
      } catch (error) {
        console.log(chalk.red('ssh key store initialize fail' + error.message));
      }
    },

    list: function () {
      initCheck();

      // load ssh key store
      let keys = utils.loadSSHKeys(cts.NSSHPath);
      let currentKeyPath = '';

      // get default ssh key's name
      let stat = utils.existsFile(cts.SSHPrivateKeyPath);
      if (stat && stat.isSymbolicLink()) {
        currentKeyPath = fs.readlinkSync(cts.SSHPrivateKeyPath);
      }

      let content = [];
      for (let name in keys) {
        // exclude the temp ssh key
        if (name !== cts.TmpKey) {
          // set style for current ssh key 
          if (keys[name].PrivateKey === currentKeyPath) {
            content.push(chalk.green('->    ' + name + ' (current)'));
          } else {
            content.push(chalk.cyan('      ' + name));
          }
        }
      }

      console.log(chalk.green('✔  Found ' + content.length + ' ssh key(s)!'));
      console.log();

      if (content.length > 0) {

        content.forEach(function (item) {
          console.log(item);
        })
      }
    },

    create: function (name) {
      initCheck();
      if (!name || name === '') {
        program.help();
        return false;
      }

      let type = program.type;
      let password = program.password;
      let passphrase = program.new_passphrase;

      // check name is exists
      let newPath = path.join(cts.NSSHPath, name);
      if (fs.existsSync(newPath)) {
        console.log(chalk.red('SSH key name already exists'));
        return true;
      }

      let host = utils.getHost(program.host, program)
      // check host
      if (type && !program.host) {
        console.log(chalk.red('remote host is empty'));
        return false;
      }

      let conf = null;
      // check config
      if (type === 1 || type === 3) {
        // load config
        conf = utils.loadConf(cts.ConfPath);
        // check config is exists
        if (conf[name]) {
          console.log(chalk.red('SSH key config already exists'));
          return true;
        }
      }

      // clear temp floder
      utils.rmdirSync(cts.TmpPath);

      // create temp floder
      utils.mkdirSync(cts.TmpPath);

      let newKeyFilePath = path.join(newPath, cts.PrivateKey);
      shell.keygen(cts.TmpPrivateKeyPath, passphrase)
        .then(function (code) {
          console.log(chalk.green('create ssh key success'), code);
          // copy ssh key
          if (type > 1) {
            return shell.copy(host.user + '@' + host.address, cts.TmpPublicKeyPath, host.port);
          }
          return Promise.resolve();
        })
        .then(function (code) {
          if (type > 1) {
            console.log(chalk.green('copy ssh key success'));
          }

          // add config
          if (type === 1 || type === 3) {
            conf[name] = {
              Host: name,
              HostName: host.address,
              PreferredAuthentications: 'publickey',
              IdentityFile: newKeyFilePath,
              User: host.user,
              Port: host.port
            };
            utils.saveConf(conf, cts.ConfPath);
            console.log(chalk.green('add ssh key success'));
          }
          // 拷贝密钥
          fs.renameSync(cts.TmpPath, newPath);
          console.log(chalk.green('✔  ssh key [' + name + '] created'));
        })
        .catch(function (error) {
          var platform = os.platform();
          if (platform === 'win32' && error.message.indexOf('ENOENT') > -1) {
            console.log(chalk.red('please use git bash exec nssh'));
          } else {
            console.log(chalk.red(error.message));
          }
        })
    },

    rename: function (name, newName) {
      initCheck();

      // check arguments
      if (!name || name === '' || !newName || newName === '') {
        program.help();
        return false;
      }

      // check newName
      let keys = utils.loadSSHKeys(cts.NSSHPath);
      if (keys[newName]) {
        console.log(chalk.red(newName + ' already exists'));
        return false;
      }

      // check name
      if (!keys[name]) {
        console.log(chalk.red('No found ' + name));
        return false;
      }

      let confs = utils.loadConf(cts.ConfPath);

      // delete config of newName
      if (confs[newName]) {
        delete confs[newName];
      }

      // update config
      if (confs[name]) {
        confs[newName] = confs[name];
        delete confs[name];
        confs[newName].Host = newName;
        confs[newName].IdentityFile = path.join(cts.NSSHPath, newName, cts.PrivateKey);
        utils.saveConf(confs, cts.ConfPath);
      }

      // check current symlink
      let isDefault = false;
      let currentKeyPath = utils.getLinkPath(cts.SSHPrivateKeyPath);
      if (path.join(cts.NSSHPath, name, cts.PrivateKey) === currentKeyPath) {
        fs.unlinkSync(cts.SSHPrivateKeyPath);
        fs.unlinkSync(cts.SSHPublicKeyPath);
        isDefault = true;
      }

      // rename floder
      fs.renameSync(path.join(cts.NSSHPath, name), path.join(cts.NSSHPath, newName));

      if (isDefault) {
        // create symlink
        fs.symlinkSync(path.join(cts.NSSHPath, newName, cts.PrivateKey), cts.SSHPrivateKeyPath)
        fs.symlinkSync(path.join(cts.NSSHPath, newName, cts.PublicKey), cts.SSHPublicKeyPath)
      }

      console.log(chalk.green('✔  ssh key [' + name + '] renamed to [' + newName + ']'));
    },

    remove: function (name) {
      initCheck();

      // check arguments
      if (!name || name === '') {
        program.help();
        return false;
      }

      // check config
      let keys = utils.loadSSHKeys(cts.NSSHPath);
      if (!keys[name]) {
        console.log(chalk.red('Not Found ' + name));
        return false;
      }

      inquirer.prompt([{
        type: 'confirm',
        name: 'yes',
        message: 'confirm to remove [' + name + ']?'
      }]).then(function (resp) {
        if (resp.yes) {
          // check current symlink
          let currentKeyPath = utils.getLinkPath(cts.SSHPrivateKeyPath);
          if (keys[name].PrivateKey === currentKeyPath) {
            fs.unlinkSync(cts.SSHPrivateKeyPath);
            fs.unlinkSync(cts.SSHPublicKeyPath);
          }

          // remove floder
          utils.rmdirSync(path.join(cts.NSSHPath, name));

          // remove config
          let confs = utils.loadConf(cts.ConfPath);
          if (confs[name]) {
            delete confs[name];
            utils.saveConf(confs, cts.ConfPath);
          }
          console.log(chalk.green('✔  ssh key [' + name + '] removed'));
        }
      });
    },

    copy: function (name, host) {
      initCheck();
      // check arguments
      if (!name || name === '' || !host || host === '') {
        program.help();
        return false;
      }
      // check name is exists
      let keys = utils.loadSSHKeys(cts.NSSHPath);
      if (!keys[name]) {
        console.log(chalk.red('Not Found ' + name));
        return false;
      }

      host = utils.getHost(host, program)

      shell.copy(host.user + '@' + host.address, keys[name].PublicKey, host.port)
        .then(function () {
          console.log(chalk.green('copy ssh key success'));
        }).catch(function (error) {
          var platform = os.platform();
          if (platform === 'win32' && error.message.indexOf('ENOENT') > -1) {
            console.log(chalk.red('please use git bash exec nssh'));
          } else {
            console.log(chalk.red(error.message));
          }
        });
    },
    use: function (name) {
      if (!name || name === '') {
        program.help();
        return false;
      }

      initCheck();

      // load ssh key store,check name is exists
      let keys = utils.loadSSHKeys(cts.NSSHPath);
      if (!keys[name]) {
        console.log(chalk.red('Not Found ' + name));
        return false;
      }

      utils.createLink(cts.SSHPrivateKeyPath, keys[name].PrivateKey);

      utils.createLink(cts.SSHPublicKeyPath, keys[name].PublicKey);

      console.log(chalk.green('✔  Now using SSH key: [' + name + ']'));
    }
  }
}

module.exports = nssh;