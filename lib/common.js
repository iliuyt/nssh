const path = require('path');
const os = require('os');
const fs = require('fs');

const PublicKey = 'id_rsa.pub';
const PrivateKey = 'id_rsa';
const DefaultKey = 'default';
const TmpKey = '.tmp';
const SSHPath = path.join(os.homedir(), '/.ssh/');
const NSSHPath = path.join(os.homedir(), '/.nssh/');
const ConfPath = path.join(SSHPath, 'config');

const SSHPublicKeyPath = path.join(SSHPath, PublicKey);
const SSHPrivateKeyPath = path.join(SSHPath, PrivateKey);
const NSSHPublicKeyPath = path.join(NSSHPath, PublicKey);
const NSSHPrivateKeyPath = path.join(NSSHPath, PrivateKey);
const TmpPath = path.join(NSSHPath, TmpKey);
const DefaultPath = path.join(NSSHPath, DefaultKey);
const TmpPublicKeyPath = path.join(TmpPath, PublicKey);
const TmpPrivateKeyPath = path.join(TmpPath, PrivateKey);

module.exports = {
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
    NSSHPrivateKeyPath
};