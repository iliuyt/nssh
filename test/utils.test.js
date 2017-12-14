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

describe('Util testing:', function () {
    before(function () {
        shell.rm('-rf', tempPath);
        shell.mkdir('-p', tempPath);
        shell.touch(originPath);
        shell.ln('-s', originPath, linkPath);
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
            shell.mkdir('-p', deptPath);
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


});