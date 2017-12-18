const path = require('path');
const fs = require('fs');

const PublicKey = 'id_rsa.pub';
const PrivateKey = 'id_rsa';
const DefaultKey = 'default';
const TmpKey = '.tmp';
const TestPath = path.join(__dirname, 'temp');
const SSHPath = path.join(TestPath, '/.ssh/');
const NSSHPath = path.join(TestPath, '/.nssh/');

const ConfPath = path.join(SSHPath, 'config');

const TmpPath = path.join(NSSHPath, TmpKey);
const DefaultPath = path.join(NSSHPath, DefaultKey);

const SSHPublicKeyPath = path.join(SSHPath, PublicKey);
const SSHPrivateKeyPath = path.join(SSHPath, PrivateKey);

const NSSHPublicKeyPath = path.join(NSSHPath, PublicKey);
const NSSHPrivateKeyPath = path.join(NSSHPath, PrivateKey);

const TmpPublicKeyPath = path.join(TmpPath, PublicKey);
const TmpPrivateKeyPath = path.join(TmpPath, PrivateKey);

const DefaultPublicKeyPath = path.join(DefaultPath, PublicKey);
const DefaultPrivateKeyPath = path.join(DefaultPath, PrivateKey);


module.exports = {
    TestPath,
    PublicKey,
    PrivateKey,
    DefaultKey,
    TmpKey,
    SSHPath,
    NSSHPath,
    TmpPath,
    ConfPath,
    TmpPublicKeyPath,
    TmpPrivateKeyPath,
    DefaultPath,
    SSHPublicKeyPath,
    SSHPrivateKeyPath,
    NSSHPublicKeyPath,
    NSSHPrivateKeyPath,
    DefaultPublicKeyPath,
    DefaultPrivateKeyPath
};