const assert = require('assert');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const cts = require('./test.constant');
const nssh = require('../index')(cts);
const {
    indexofArray,
    spawn
} = require('./test.util')


const nsshPath = path.join(process.cwd(), '/bin/nssh');

describe('NSSH testing:', function () {
    before(function () {
        shell.rm('-rf', cts.TestPath);
        shell.mkdir('-p', cts.TestPath);
        shell.mkdir('-p', cts.SSHPath);
    })

    after(function () {
        shell.rm('-rf', cts.TestPath);
    })

    beforeEach(function () {
        shell.rm('-rf', cts.NSSHPath);
    })

    describe('#Init Command', function () {
        let successStr = '✔ ssh key store initialized!';
        it('nssh initialized success', function () {
            spawn(nsshPath, ['init'], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', cts.NSSHPath), true);
            })
        })
        it('nssh re-initialized success', function () {
            spawn(nsshPath, ['init'], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', cts.NSSHPath), true);
            })
        })

        it('nssh re-initialized and create default key', function () {
            shell.touch(cts.SSHPrivateKeyPath);
            shell.touch(cts.SSHPublicKeyPath);
            spawn(nsshPath, ['init'], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', cts.NSSHPath), true);
                assert.equal(shell.test('-f', cts.DefaultPrivateKeyPath), true);
            })

        })
    })

    describe('#Create command', function () {
        nssh.init();
 
        let user = 'root';
        let port = '50001';
        let address = '139.196.39.133';
        let host = user + '@' + address + ':' + port;
        let coverHost = 'test@' + address + ':22';

        let handle = function (term, data) {
            if (data.indexOf('Enter passphrase (empty for no passphrase):') >= 0) {
                term.write('\r');
            }
            if (data.indexOf('Enter same passphrase again:') >= 0) {
                term.write('\r');
            }
            if (data.indexOf('s password:') >= 0) {
                term.write('root\r');
            }
        }

        it('type:0 (default), nssh create ssh success', function () {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName];
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
            })
        })

        it('type:1, nssh create ssh success', function () {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '1', '-H', host]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
            })
        })

        it('type:2, nssh create ssh success', function () {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '2', '-H', host]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
            })
        })

        it('type:3, nssh create ssh success', function () {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '3', '-H', host]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
            })
        })

        it('use -p and -u', function () {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '3', '-p', port, '-u', user, '-H', address]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
            })
        })

        it('test default user', function () {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '3', '-p', port, '-H', address]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
            })
        })

        it('test priority (-u,-p)', function () {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '3', '-p', port, '-u', user, '-H', coverHost]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
            })
        })
    })

    describe('#List Command', function () {
        let successStr = '✔  Found';
        nssh.init();


        it('nssh is empty folder', function () {
            spawn(nsshPath, ['ls'], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
            })
        })

        it('nssh has keys', function () {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName];
            spawn(nsshPath, options, null, function (content) {
                spawn(nsshPath, ['ls'], null, function (content) {
                    assert.equal(indexofArray(content, successStr), true);
                })
            })

        })
    })


    describe('#Remove Command', function () {
        nssh.init();

        it('remove not exists ssh key', function () {
            let successStr = 'Not Found test';
            spawn(nsshPath, ['rm', 'test'], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
            })
        })

        it('remove exists ssh key', function () {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName];
            let successStr = '✔  ssh key [' + sshName + '] removed';
            spawn(nsshPath, options, null, function (content) {
                spawn(nsshPath, ['rm', sshName], function (term, data) {
                    if (data.indexOf('confirm to remove') >= 0) {
                        term.write('\r');
                    }
                }, function (content) {
                    assert.equal(indexofArray(content, successStr), true);
                    assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), false);
                })
            })

        })
    })

    describe('#Rename Command', function () {
        nssh.init();
        let sshName = 'test' + Date.now();
        let newsshName = 'newtest' + Date.now();

        it('rename not exists ssh key', function () {
            let successStr = 'No found ' + sshName;
            spawn(nsshPath, ['rn', sshName, newsshName], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
            })
        })

        it('rename ssh key', function () {
            let options = ['create', sshName];
            let successStr = '✔  ssh key [' + sshName + '] renamed to [' + newsshName + ']';
            spawn(nsshPath, options, null, function (content) {
                spawn(nsshPath, ['rn', sshName, newsshName], null, function (content) {
                    assert.equal(indexofArray(content, successStr), true);
                    assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), false);
                    assert.equal(shell.test('-d', path.join(cts.NSSHPath, newsshName)), true);
                })
            })
        })

        it('new name already exists', function () {
            let options = ['create', sshName];
            let successStr = newsshName + ' already exists';
            spawn(nsshPath, ['rn', sshName, newsshName], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), false);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, newsshName)), true);
            })
        })
    })


    describe('#Copy Command', function () {
        nssh.init();

        let user = 'root';
        let port = '50001';
        let address = '139.196.39.133';
        let host = user + '@' + address + ':' + port;
        let coverHost = 'test@' + address + ':22';

        let handle = function (term, data) {
            if (data.indexOf('s password:') >= 0) {
                term.write('root\r');
            }
        }

        it('copy not exists ssh key', function () {
            let sshName = 'test' + Date.now();
            let successStr = 'Not Found ' + sshName;
            spawn(nsshPath, ['copy', sshName, host], handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
            })
        })


        it('copy ssh key', function () {
            let sshName = 'test' + Date.now();
            let successStr = 'Not Found ' + sshName;
            spawn(nsshPath, ['copy', sshName, host], handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
            })
        })
    })



});