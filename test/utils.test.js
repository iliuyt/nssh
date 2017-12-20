const assert = require('assert');
const fs = require('fs');
const path = require('path');
const tempPath = path.join(__dirname, 'temp');
const utils = require('../lib/utils');
const shell = require('shelljs');

let originPath = path.join(tempPath, 'origin.test');
let linkPath = path.join(tempPath, 'link.test');
let copyOriginPath = path.join(tempPath, 'copy.origin.test');
let copyLinkPath = path.join(tempPath, 'copy.link.test');
let testNsshPath = path.join(tempPath, '.nssh');
let emptyDirPath = path.join(tempPath, 'empty');
let emptyFilePath = path.join(tempPath, 'empty');
let saveConfPath = path.join(tempPath, 'test.config');
let confNames = ['test', 'stage', 'prod'];

let testConf = {};

describe('Utils testing:', function () {
    before(function () {
        shell.rm('-rf', tempPath);
        shell.mkdir('-p', tempPath);
        shell.mkdir('-p', emptyDirPath);
        shell.touch(originPath);
        shell.touch(emptyFilePath);
        shell.ln('-s', originPath, linkPath);

        confNames.forEach(function (name) {
            let namePath = path.join(testNsshPath, name);
            let privateKeyPath = path.join(namePath, 'id_rsa');
            let publickKeyPath = path.join(namePath, 'id_rsa.pub');

            shell.mkdir('-p', namePath);
            shell.touch(privateKeyPath);
            shell.touch(publickKeyPath);

            testConf[name] = {
                Host: name,
                HostName: '192.168.0.2',
                PreferredAuthentications: 'publickey',
                IdentityFile: publickKeyPath,
                User: 'root'
            };
        });
    })

    after(function () {
        shell.rm('-rf', tempPath);
    })

    describe('copySync()', function () {
        it('copy file success', function () {
            assert.equal(utils.copySync(originPath, copyOriginPath), true);
            assert.equal(shell.test('-f', copyOriginPath), true);
        })

        it('copy symlink success', function () {
            assert.equal(utils.copySync(linkPath, copyLinkPath), true);
            assert.equal(shell.test('-f', copyLinkPath), true);
        })
    })

    describe('mkdirSync()', function () {
        it('create full path success', function () {
            let deptPath = path.join(tempPath, '/mkdir/a/b/c');
            assert.equal(utils.mkdirSync(deptPath), true);
            assert.equal(shell.test('-d', deptPath), true);
        })
    })

    describe('rmdirSync()', function () {
        it('remove full path success', function () {
            let deptPath = path.join(tempPath, '/rmdir/a/b/c');
            let filePath = path.join(deptPath, 'test');
            let dirPath = path.join(deptPath, '/dir');
            shell.mkdir('-p', deptPath);
            shell.mkdir('-p', dirPath);
            shell.touch(filePath);
            assert.equal(utils.rmdirSync(deptPath), true);
            assert.equal(shell.test('-d', deptPath), false);
        })
    })

    describe('existsFile()', function () {

        it('test exists file return fs stat', function () {
            let originStat = utils.existsFile(originPath);
            assert.equal(typeof originStat, 'object');
            assert.equal(originStat.isFile(), true);
        })

        it('test exists symlink return fs stat', function () {
            let linkStat = utils.existsFile(linkPath);
            assert.equal(typeof linkStat, 'object');
            assert.equal(linkStat.isSymbolicLink(), true);
        })

        it('test exists floder return false', function () {
            let deptPath = path.join(tempPath, '/exists/a/b/c');
            shell.mkdir('-p', deptPath);
            assert.equal(utils.existsFile(deptPath), false);
        })

        it('test not exists path return false', function () {
            let notExistsPath = path.join(tempPath, '/exists/a/b/notexists.txt');
            assert.equal(utils.existsFile(notExistsPath), false);
        })
    })

    describe('createLink()', function () {
        it('create new symlink', function () {
            let newLinkPath = path.join(tempPath, 'newlink.test');
            assert.equal(utils.createLink(newLinkPath, originPath), true);
            assert.equal(shell.test('-f', newLinkPath), true);
        })

        it('linkPath is exists symlink', function () {
            assert.equal(utils.createLink(linkPath, originPath), true);
            assert.equal(shell.test('-f', linkPath), true);
        })

        it('linkPath is exists file', function () {
            let newfilePath = path.join(tempPath, 'newfile.test');
            shell.touch(newfilePath);
            assert.equal(utils.createLink(newfilePath, originPath), true);
            assert.equal(shell.test('-f', newfilePath), true);
        })
    });

    describe('getLinkPath()', function () {
        it('get symlink return path', function () {
            assert.equal(utils.getLinkPath(linkPath), originPath);
        })

        it('get file path return false', function () {
            assert.equal(utils.getLinkPath(originPath), false);
        })
    });

    describe('loadSingleKey()', function () {

        it('load empty directory', function () {
            let emptyDirPath = path.join(tempPath, 'empty');
            shell.mkdir('-p', emptyDirPath);
            let key = utils.loadSingleKey(emptyDirPath);
            assert.equal(typeof key, 'object');
            assert.equal(Object.keys(key).length, 0);
        })

        it('load has keys directory', function () {
            let namePath = path.join(testNsshPath, confNames[0]);
            let privateKeyPath = path.join(namePath, 'id_rsa');

            let key = utils.loadSingleKey(namePath);
            assert.equal(typeof key, 'object');
            assert.equal(key.PrivateKey, privateKeyPath);
        })
    });

    describe('loadSSHKeys()', function () {
        it('load empty directory', function () {
            let keys = utils.loadSSHKeys(emptyDirPath);
            assert.equal(typeof keys, 'object');
            assert.equal(Object.keys(keys).length, 0);
        })

        it('load nssh directory', function () {
            let keys = utils.loadSSHKeys(testNsshPath);
            assert.equal(typeof keys, 'object');
            assert.equal(Object.keys(keys).length, confNames.length);
        })
    });

    describe('confToStr()', function () {
        it('config to string', function () {
            let str = utils.confToStr(testConf[confNames[0]]);
            assert.equal(typeof str, 'string');
        })
    });

    describe('saveConf()', function () {
        it('save null', function () {
            assert.equal(utils.saveConf(null, saveConfPath), false);
            assert.equal(shell.test('-f', saveConfPath), false);
        })

        it('save null Object', function () {
            assert.equal(utils.saveConf({}, saveConfPath), false);
            assert.equal(shell.test('-f', saveConfPath), false);
        })

        it('save config', function () {
            assert.equal(utils.saveConf(testConf, saveConfPath), true);
            assert.equal(shell.test('-f', saveConfPath), true);
        })
    });

    describe('loadConf()', function () {
        it('load not exists file', function () {
            let noconfig = path.join(tempPath, '/noconfig');
            assert.equal(utils.loadConf(noconfig), false);
        })

        it('load empty file', function () {
            let confs = utils.loadSSHKeys(emptyDirPath);
            assert.equal(typeof confs, 'object');
            assert.equal(Object.keys(confs).length, 0);
        })

        it('load config', function () {
            shell.rm('-rf', saveConfPath);
            utils.saveConf(testConf, saveConfPath)
            let confs = utils.loadConf(saveConfPath);
            assert.equal(typeof confs, 'object');
            assert.equal(Object.keys(confs).length, confNames.length);
        })
    });


    describe('getHost()', function () {

        it('default host', function () {
            let obj = utils.getHost('192.168.0.2');
            assert.equal(typeof obj, 'object');
            assert.equal(obj.user, 'root');
            assert.equal(obj.address, '192.168.0.2');
            assert.equal(obj.port, '22');
        })

        it('string to host object', function () {
            let obj = utils.getHost('root@192.168.0.2:50001')
            assert.equal(typeof obj, 'object');
            assert.equal(obj.user, 'root');
            assert.equal(obj.address, '192.168.0.2');
            assert.equal(obj.port, '50001');
        })

        it('cover host', function () {
            let cover = {
                user: 'root',
                port: 22
            }
            let obj = utils.getHost('test@192.168.0.2:50001', cover);
            assert.equal(typeof obj, 'object');
            assert.equal(obj.user, 'root');
            assert.equal(obj.address, '192.168.0.2');
            assert.equal(obj.port, '22');
        })
    });

});