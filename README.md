## NSSH

    通过NSSH可以管理SSH密钥，一条命令，生成密钥，拷贝到服务器，添加配置，通过别名进行无密码登陆。
    测试了Windows和ubuntu，没有mac电脑，没有测试mac，如果有BUG大家给我留言，谢谢。


![image](https://raw.githubusercontent.com/iliuyt/blog/master/lib/images/nssh.gif)


## 功能

    * 一键创建密钥，并拷贝的远程主机，通过别名直接登录
    * 对SSH密钥可以创建，删除，查看列表
    * 通过别名管理密钥
    * 选择和设置默认密钥
    * 拷贝密钥到远程主机
    * 对SSH 密钥别名进行重命名

## 安装

    npm install nssh -g

## 使用

    $ nssh

    Usage: nssh <command> [options]

    Options:

        -V, --version  output the version number
        -h, --help     output usage information

    Commands:

        init                初始化SSH key库
        ls                  查看SSH key列表
        use <name>          切换SSH key
        rm <name>           删除SSH key
        rn <name> <new>     修改SSH key名称
        create <name>       创建SSH key
        copy <name> <host>  创建SSH key
        help [cmd]          display help for [cmd]

## 首次使用

    $ nssh init
    ✔ 密钥库初始化完成
    密钥库地址为：C:\Users\liuyt\.nssh\

注意：如果您在$home/.ssh已经有id_rsa、id_rsa.pub密钥对,那么初始化将会将其移动到$HOME/.nssh/default

## 创建SSH KEY，通过别名登录

    $ nssh create work1 -t 3 -h root@139.196.39.155
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
    密钥已生成
    ssh-copy-id: INFO: Source of key(s) to be installed: "C:\Users\liuyt\.nssh\.tmp\id_rsa.pub"
    ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
    ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
    root@139.196.39.155's password:

    Number of key(s) added: 1

    Now try logging into the machine, with:   "ssh 'root@139.196.39.155'"
    and check to make sure that only the key(s) you wanted were added.

    密钥拷贝完成，主机：root@139.196.39.155
    配置添加完成，配置地址：C:\Users\liuyt\.ssh\config
    ✔  密钥创建成功


    $ ssh work1
    Welcome to Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-63-generic x86_64)

    * Documentation:  https://help.ubuntu.com
    * Management:     https://landscape.canonical.com
    * Support:        https://ubuntu.com/advantage

    Welcome to Alibaba Cloud Elastic Compute Service !

    Last login: Thu Dec  7 16:56:53 2017 from 2.3.1.1
    root@iZ1193ih9wgZ:~#


## 创建密钥

    $ nssh create

    Usage: nssh-create <name>

    Options:

        -t --type <n>      0:仅创建SSH key 1:创建SSH key并生成配置 2:创建SSH key 并拷贝到远程主机 3、创建SSH key，生成配置并拷贝到远程主机
        -h --host [value]  主机地址
        -h, --help         output usage information

    Examples:

        # 通过nssh创建密钥
        $ nssh create node0

        # 通过nssh创建密钥并生成配置
        $ nssh create node1 -t 1 -h root@192.168.0.2

        # 通过nssh创建密钥并生成github配置
        $ nssh create github.com -t 1 -h liuyt@github.com

        # 通过nssh创建密钥并拷贝到192.168.0.2
        $ nssh create node1 -t 2 -h root@192.168.0.2

        # 通过nssh创建密钥,生成配置并拷贝到192.168.0.2
        $ nssh create node1 -t 3 -h root@192.168.0.2

## 查看密钥列表

    $ nssh ls
    ✔  找到2个密钥

    ->  test (current)
        test2

## 切换密钥

    $ nssh use test2
    ✔  当前使用的密钥：test2

    $ nssh ls
    ✔  找到2个密钥

        test
    ->  test2 (current)


## 重命名密钥

    $ nssh rn test2 nsew
    ✔  test2重命名为：new

    $ nssh ls
    ✔  找到2个密钥

    ->  new (current)
        test2

## 删除密钥

    $ nssh rm new
    ? 确定要删除 new 吗？ (Y/n)
    ? 确定要删除 new 吗？ Yes
    ✔  删除密钥new完成

    $ nssh ls
    ✔  找到1个密钥

        test2

## 拷贝已存在的密钥到主机

    $ nssh copy

    Usage: nssh-copy <name> <host>


    Options:

        -h, --help  output usage information

    Examples:

        # 通过nssh拷贝密钥到远程主机
        $ nssh copy node1 root@192.168.0.2


## 感谢

NSSH的大部分思路来源与[SKM](https://github.com/TimothyYe/skm)，参考了大部分代码，只是通过Node实现了而已,在此特别声明，非常感谢。


