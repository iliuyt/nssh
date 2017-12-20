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


const nsshPath = path.join(process.cwd(), '/test/nssh');

let initStore = function () {
    let logger = console.log;
    console.log = function () {}
    nssh.init();
    console.log = logger;
}

let outTime = 5000;

describe('NSSH testing:', function () {

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
        if (data.indexOf('yes/no') >= 0) {
            term.write('yes\r');
        }
    }

    before(function () {
        shell.rm('-rf', cts.TestPath);
        shell.mkdir('-p', cts.TestPath);
        shell.mkdir('-p', cts.SSHPath);
        shell.cp(path.join(process.cwd(), '/bin/nssh'), nsshPath);
        shell.sed('-i', /require\(\'..\/index\'\)\(\)/, `require('../index')(require('./test.constant'))`, nsshPath);
    })

    after(function () {
        // shell.rm('-rf', cts.TestPath);
    })

    beforeEach(function () {
        shell.rm('-rf', cts.NSSHPath);
    })

    describe('#Init Command', function () {
        this.timeout(outTime)

        let successStr = '✔ ssh key store initialized!';
        it('nssh initialized success', function (done) {
            spawn(nsshPath, ['init'], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', cts.NSSHPath), true);
                done();
            })
        })
        it('nssh re-initialized success', function (done) {
            spawn(nsshPath, ['init'], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', cts.NSSHPath), true);
                done();
            })
        })

        it('nssh re-initialized and create default key', function (done) {
            shell.touch(cts.SSHPrivateKeyPath);
            shell.touch(cts.SSHPublicKeyPath);
            spawn(nsshPath, ['init'], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', cts.NSSHPath), true);
                assert.equal(shell.test('-f', cts.DefaultPrivateKeyPath), true);
                done();
            })
        })
    })

    describe('#Create command', function () {
        this.timeout(outTime)
        initStore();
        let user = 'root';
        let port = '22';
        let address = '139.196.39.133';
        let host = user + '@' + address + ':' + port;
        let coverHost = 'test@' + address + ':22';

        it('type:0 (default), nssh create ssh success', function (done) {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName];
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
                done();
            })
        })

        it('type:1, nssh create ssh success', function (done) {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '1', '-H', host]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
                done();
            })
        })


        it('type:2, nssh create ssh success', function (done) {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '2', '-H', host]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
                done();
            })
        })

        it('type:3, nssh create ssh success', function (done) {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '3', '-H', host]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
                done();
            })
        })

        it('use -p and -u', function (done) {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '3', '-p', port, '-u', user, '-H', address]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
                done();
            })
        })

        it('test default user', function (done) {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '3', '-p', port, '-H', address]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
                done();
            })
        })

        it('test priority (-u,-p)', function (done) {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName, '-t', '3', '-p', port, '-u', user, '-H', coverHost]
            let successStr = '✔  ssh key [' + sshName + '] created';
            spawn(nsshPath, options, handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
                done();
            })
        })
    })

    describe('#List Command', function () {
        initStore();

        let successStr = '✔  Found';
        it('nssh is empty folder', function (done) {
            spawn(nsshPath, ['ls'], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                done();
            })
        })

        it('nssh has keys', function (done) {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName];

            spawn(nsshPath, options, handle, function (content) {
                spawn(nsshPath, ['ls'], null, function (content) {
                    assert.equal(indexofArray(content, successStr), true);
                    done();
                })
            })

        })
    })

    describe('#Remove Command', function () {
        this.timeout(outTime)
        initStore();

        it('remove not exists ssh key', function (done) {
            let successStr = 'Not Found test';
            spawn(nsshPath, ['rm', 'test'], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                done();
            })
        })

        it('remove exists ssh key', function (done) {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName];
            let successStr = '✔  ssh key [' + sshName + '] removed';
            spawn(nsshPath, options, handle, function (content) {
                spawn(nsshPath, ['rm', sshName], function (term, data) {
                    if (data.indexOf('confirm to remove') >= 0) {
                        term.write('\r');
                    }
                }, function (content) {
                    assert.equal(indexofArray(content, successStr), true);
                    assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), false);
                    done();
                })
            })

        })
    })

    describe('#Rename Command', function () {
        this.timeout(outTime)
        initStore();
        it('rename not exists ssh key', function (done) {
            let sshName = 'test' + Date.now();
            let newsshName = 'newtest' + Date.now();
            let successStr = 'No found ' + sshName;
            spawn(nsshPath, ['rn', sshName, newsshName], null, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                done();
            })
        })

        it('rename ssh key', function (done) {
            let sshName = 'test' + Date.now();
            let newsshName = 'newtest' + Date.now();
            let options = ['create', sshName];
            let successStr = '✔  ssh key [' + sshName + '] renamed to [' + newsshName + ']';
            spawn(nsshPath, options, handle, function (content) {
                spawn(nsshPath, ['rn', sshName, newsshName], null, function (content) {
                    assert.equal(indexofArray(content, successStr), true);
                    assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), false);
                    assert.equal(shell.test('-d', path.join(cts.NSSHPath, newsshName)), true);
                    done();
                })
            })
        })

        it('new name already exists', function (done) {
            let sshName = 'test' + Date.now();
            let newsshName = 'newtest' + Date.now();
            let options = ['create', sshName];
            let successStr = newsshName + ' already exists';
            spawn(nsshPath, options, handle, function (content) {
                options = ['create', newsshName];
                spawn(nsshPath, options, handle, function (content) {
                    spawn(nsshPath, ['rn', sshName, newsshName], null, function (content) {
                        assert.equal(indexofArray(content, successStr), true);
                        assert.equal(shell.test('-d', path.join(cts.NSSHPath, sshName)), true);
                        assert.equal(shell.test('-d', path.join(cts.NSSHPath, newsshName)), true);
                        done();
                    })
                })
            })
        })
    })


    describe('#Copy Command', function () {
        this.timeout(outTime)
        initStore();

        let user = 'root';
        let port = '50001';
        let address = '139.196.39.133';
        let host = user + '@' + address + ':' + port;
        let coverHost = 'test@' + address + ':22';

        it('copy not exists ssh key', function (done) {
            let sshName = 'test' + Date.now();
            let successStr = 'Not Found ' + sshName;
            spawn(nsshPath, ['copy', sshName, host], handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                done();
            })
        })


        it('copy ssh key', function (done) {
            let sshName = 'test' + Date.now();
            let successStr = 'Not Found ' + sshName;
            spawn(nsshPath, ['copy', sshName, host], handle, function (content) {
                assert.equal(indexofArray(content, successStr), true);
                done();
            })
        })
    })

    describe('#Use Command', function () {
        this.timeout(5000)
        initStore();

        it('use ssh key', function (done) {
            let sshName = 'test' + Date.now();
            let options = ['create', sshName];
            spawn(nsshPath, options, handle, function (content) {
                spawn(nsshPath, ['use', sshName], null, function (content) {
                    assert.equal(shell.test('-f', cts.SSHPrivateKeyPath), true);
                    assert.equal(fs.readlinkSync(cts.SSHPrivateKeyPath), path.join(cts.NSSHPath, sshName, cts.PrivateKey));
                    done();
                })

            })
        })
    })
});