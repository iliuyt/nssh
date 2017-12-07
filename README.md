## NSSH

    通过NSSH可以管理SSH密钥，一条命令，生成密钥，拷贝到服务器，添加配置，通过别名进行无密码登陆。

## 功能

    * 一键创建密钥，并拷贝的远程主机，通过别名直接登录
    * 对SSH密钥可以创建，删除，查看列表
    * 通过别名管理密钥
    * 选择和设置默认密钥
    * 拷贝密钥到远程主机
    * 对SSH 密钥别名进行重命名
    * 备份SSH密钥库

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
        $ nssh create node1 -t 2 -h root@192.168.0.2 -u root

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

<<<<<<< HEAD
        -h, --help  output usage information

    Examples:
=======
#### 添加显示密钥功能
#### 创建密钥考虑github的情况，是否可以直接上传github
#### 如何删除密钥的情况下如何删除服务器密钥
>>>>>>> 34480c6302bedbfd1e9797a496337a8f0d9e0171

        # 通过nssh拷贝密钥到远程主机
        $ nssh copy node1 root@192.168.0.2
