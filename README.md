## NSSH

    通过NSSH可以管理SSH，一条命令，生成密钥，拷贝到服务器，添加配置，通过别名进行无密码登陆。

## 安装

    npm install nshh -g


## 一键添加SSH

    # 创建配置
    nssh create name0 192.168.0.1 root

    # ssh 无密登录
    ssh name0

## 其他功能

    # 添加配置
    nssh add <host> <hostname> <user> <file> <auth>

    # 删除配置
    nssh remove <hosts>

    # 显示配置
    nssh show <hosts>


## 后续计划

#### 添加显示密钥功能
#### 创建密钥考虑github的情况，是否可以直接上传github
#### 如何删除密钥的情况下如何删除服务器密钥

