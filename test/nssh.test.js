const assert = require('assert');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const cts = require('./test.constant');
const nssh = require('../index')(cts);
const {
    hookConsole,
    indexofArray
} = require('./test.util')
let consoleMsgs = [];
let successChar = '✔';
let defLogger = console.log

describe('NSSH testing:', function () {
    before(function () {
        shell.rm('-rf', cts.TestPath);
        shell.mkdir('-p', cts.TestPath);
        shell.mkdir('-p', cts.SSHPath);
        console.log = hookConsole(defLogger, consoleMsgs)
    })

    after(function () {
        // shell.rm('-rf', cts.TestPath);
    })

    beforeEach(function () {
        consoleMsgs.splice(0, consoleMsgs.length)
    })

    describe('#Init Command', function () {
        it('nssh initialized success', function () {
            nssh.init();
            assert.equal(indexofArray(consoleMsgs, successChar), true);
            assert.equal(shell.test('-d', cts.NSSHPath), true);
        })
        it('nssh re-initialized success', function () {
            nssh.init();
            assert.equal(indexofArray(consoleMsgs, successChar), true);
            assert.equal(shell.test('-d', cts.NSSHPath), true);
        })

        it('nssh re-initialized and create default key', function () {
            shell.touch(cts.SSHPrivateKeyPath);
            shell.touch(cts.SSHPublicKeyPath);
            nssh.init();
            assert.equal(indexofArray(consoleMsgs, successChar), true);
            assert.equal(shell.test('-d', cts.NSSHPath), true);
            assert.equal(shell.test('-f', cts.DefaultPrivateKeyPath), true);
        })
    })

    describe('#Create command', function () {
        it('nssh initialized success', function () {
            nssh.init();
            assert.equal(indexofArray(consoleMsgs, successChar), true);
            assert.equal(shell.test('-d', cts.NSSHPath), true);
        })

        it('nssh re-initialized success', function () {
            nssh.init();
            assert.equal(indexofArray(consoleMsgs, successChar), true);
            assert.equal(shell.test('-d', cts.NSSHPath), true);
        })
    })


});