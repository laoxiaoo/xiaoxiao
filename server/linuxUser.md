# 用户的相关文件

## 用户信息

### 基本信息

```shell
#查看用户信息文件 
[root@localhost ~]# cat /etc/passwd
root:x:0:0:root:/root:/bin/bash

```

- 第一列：
- 第二列： x ： 密码的标志，真正的密码存在/etc/shadow文件中，这个文件只有超级用户能查看
- 第三列：用户id   (系统靠这个识别用户，如果普通用户uid改成0， 则它也变成root了)
  - 0 超级用户
  - 1-499 系统用户（伪用户）
  - 500-? 普通用户
- 第四列： 组id
- 5：说明
- 6： 家目录

### 使用户不能登录

修改/etc/passwd对应用户，改成/sbin/nologin

```shell
user1:x:1000:1000::/home/user1:/sbin/nologin
```

再次登录

```shell
[root@localhost ~]# su user1
This account is currently not available.
```

## 影子文件

/etc/shadow     (密码文件)

```shell
[root@localhost home]# cat /etc/shadow
```

## 组信息

/etc/group

```shell
[root@localhost home]# cat /etc/group
root:x:0:
```

- 1: 组名
- 2：组密码为
- 3 ： 组id
- 4 ： 该组的附加用户

## 命令

添加用户后，没密码的用户不允许登录的

