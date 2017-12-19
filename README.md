
![](https://raw.githubusercontent.com/iliuyt/blog/master/lib/images/nssh-logo.png)  
[![Build Status](https://travis-ci.org/iliuyt/nssh.svg?branch=dev)](https://travis-ci.org/iliuyt/nssh)
[![codecov](https://codecov.io/gh/iliuyt/nssh/branch/dev/graph/badge.svg)](https://codecov.io/gh/iliuyt/nssh)
[![MIT licensed](https://img.shields.io/dub/l/vibe-d.svg)](LICENSE) 
[![NPM Downloads](https://img.shields.io/npm/dm/nssh.svg?style=flat-square)](https://www.npmjs.com/package/nssh) 
[![GitHub last commit](https://img.shields.io/github/last-commit/iliuyt/nssh.svg?style=plastic)]()

## NSSH

    NSSH is a SSH Keys Manager for node.js command-line interfaces.
    It can generate a ssh key and set ssh key config and copy the public key to a remote host with one commond.
    then you can use ssh login with name, no need for passwords. 
    Inspired by TimothyYe/skm , which is written in go language.

![image](https://raw.githubusercontent.com/iliuyt/blog/master/lib/images/nssh.gif)


## Features

    * generate a ssh key and set ssh key config and copy the public key to a remote host with one commond
    * Manage all your SSH keys by alias names
    * Choose and set a default SSH key
    * Copy default SSH key to a remote host
    * Rename SSH key alias name

## Installation

    npm install nssh -g

## Usage

    $ nssh

    Usage: nssh <command> [options]

    Options:

        -V, --version      output the version number
        -v, --version      get version
        -t, --type <n>      0:Only create a new ssh key
                            1:Create a new ssh key and set ssh key config
                            2:Create a new ssh key and copy new ssh key to remote host
                            3:Create a new ssh key and copy new ssh key to remote host and set ssh key config

        -H --host [value]  Remote host address and username
        -h, --help         output usage information

    Basic Examples:

        # Initialize SSH keys store
        $ nssh init

        # List all the store SSH keys
        $ nssh ls

        # Create a new ssh key
        $ nssh create node0

        # Create a new ssh key and set its config
        $ nssh create node1 -t 1 -H root@192.168.0.2

        # Create a new ssh key for github and set its config
        $ nssh create github.com -t 1 -H liuyt@github.com

        # Create a new ssh key and copy public key to a remote host
        $ nssh create node1 -t 2 -H root@192.168.0.2 -u root

        # Create a new ssh key and set its config and copy public key to a remote host
        $ nssh create node1 -t 3 -H root@192.168.0.2

        # Copy ssh public key to a remote host
        $ nssh copy node1 root@192.168.0.2

        # Remove ssh key
        $ nssh rm default

        # Rename ssh key
        $ nssh rn default new

        # Switch to use the specified SSH key
        $ nssh use default


## For the first time use

    $ nssh init
    ✔ ssh key store initialized!
    sh key store location is:C:\Users\liuyt\.nssh\

NOTE: If you already have id_rsa & id_rsa.pub key pairs in $HOME/.ssh, NSSH will move them to $HOME/.nssh/default

## Create a new SSH key

    $ nssh create work1 -t 3 -H root@139.196.39.155
    Generating public/private rsa key pair.
    Enter passphrase (empty for no passphrase):
    Enter same passphrase again:
    Your identification has been saved in C:\Users\liuyt\.nssh\.tmp\id_rsa.
    Your public key has been saved in C:\Users\liuyt\.nssh\.tmp\id_rsa.pub.
    The key fingerprint is:
    SHA256:IoWtg5M1+7VUANVB/JdU2EYVGjzMh5he/iSkwNfjRp4 liuyt@DESKTOP-48BGCR8
    The key's randomart image is:
    +---[RSA 2048]----+
    |      .o++o.B..**|
    |     o   +o+ %=.o|
    |    + o   =.Oo=o |
    |   + =   . o.Eo. |
    |  + = . S   ..+  |
    |   . + + .     . |
    |      . .        |
    |                 |
    |                 |
    +----[SHA256]-----+
    create ssh key success
    ssh-copy-id: INFO: Source of key(s) to be installed: "C:\Users\liuyt\.nssh\.tmp\id_rsa.pub"
    ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
    ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
    root@139.196.39.155's password:

    Number of key(s) added: 1

    Now try logging into the machine, with:   "ssh 'root@139.196.39.155'"
    and check to make sure that only the key(s) you wanted were added.

    copy ssh key success

    add ssh key success

    ✔  ssh key [work1] created


    $ ssh work1
    Welcome to Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-63-generic x86_64)

    * Documentation:  https://help.ubuntu.com
    * Management:     https://landscape.canonical.com
    * Support:        https://ubuntu.com/advantage

    Welcome to Alibaba Cloud Elastic Compute Service !

    Last login: Thu Dec  7 16:56:53 2017 from 2.3.1.1
    root@iZ1193ih9wgZ:~#



## List SSH keys

    $ nssh ls
    ✔  Found 2 ssh key(s)!

    ->  test (current)
        test2

## Set default SSH key

    $ nssh use test2
    ✔  Now using SSH key: [test2]

    $ nssh ls
    ✔  Found 2 ssh key(s)!

        test
    ->  test2 (current)


## Rename a SSH key with a new alias name

    $ nssh rn test2 new
    ✔  ssh key [test2] renamed to [new]'

    $ nssh ls
    ✔  Found 2 ssh key(s)!

    ->  new (current)
        test2

## Remove a SSH key

    $ nssh rm new
    ? confirm to remove [new]? (Y/n)
    ? confirm to remove [new]? Yes
    ✔  ssh key [new] removed

    $ nssh ls
    ✔  Found 1 ssh key(s)!

        test2

## Copy SSH public key to a remote host

    $ nssh cp test2 139.196.39.155
    ssh-copy-id: INFO: Source of key(s) to be installed: "C:\Users\liuyt\.nssh\test2\id_rsa.pub"
    ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
    ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
    root@139.196.39.155's password:

    Number of key(s) added: 1

    Now try logging into the machine, with:   "ssh 'root@139.196.39.155'"
    and check to make sure that only the key(s) you wanted were added.

    copy ssh key success

## Licence

[MIT License](https://github.com/iliuyt/nssh/blob/master/LICENSE)