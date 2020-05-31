# linux 目录结构

## 一级目录

| 目录   | 目录作用                                                     |
| ------ | ------------------------------------------------------------ |
| /bin/  | 存放系统命令的目录，普通用户和超级用户都可以访问，是/usr/bin/目录的软连接 |
| /sbin/ | 存放系统命令的目录，只有**超级用户**才可以执行。是/usr/sbin/目录的软连接 |
| /boot/ | 系统的启动目录，保存于系统启动相关的文件                     |
| /dev/  | 设备文件保存位置                                             |
| /etc/  | 配置文件保存位置。系统内所有采用默认安装方式（rpm）的服务配置文件保存在此目录，如用户信息、启动脚本等 |
| /home/ | 普通用会在这个目录下建立一个家目录，在这个家目录下拥有超级权限，登录后，就是在家木箱 |
| /media | 挂载目录                                                     |

## 二级目录

| 目录             | 描述                                                         |
| ---------------- | ------------------------------------------------------------ |
| /user/local      | 一般建议做安装目录                                           |
| /user/local/src  | 一般建议放源程序                                             |
| /usr/src/kernels | 内核源码目录                                                 |
| /var/log         | 系统日志                                                     |
| /var/www/html    | rpm包安装的apache的网页主目录                                |
| /var/lib         | 程序运行的数据保存目录，如mysql数据默认保存在/var/lib/mysql/目录中 |
| /var/run/        | 服务运行的pid保存位置                                        |
| /var/spool/cron  | 定时任务目录                                                 |

# 服务器建议

- 服务器只能重启，不允许关机
  - 重启前，终止正在执行的服务（否则可能造成硬盘损坏）
  - 重启前，建议对外的网络断掉
  - 重启前，建议指向sync命令
  - 重启命令建议用：shutdown -r now

# 常见命令

## ls

```shell
[root@localhost home]# ls --help
Usage: ls [OPTION]... [FILE]...
-a 显示所有文件
-h 按照习惯显示文件大小，默认全是byte

```

## mkdir

```shell
## 递归建立目录
[root@localhost home]# mkdir -p a/b/c/d
```

## stat查看文件详情

```shell
[root@localhost home]# stat derby.log 
  File: ‘derby.log’
  Size: 686       	Blocks: 8          IO Block: 4096   regular file
Device: fd00h/64768d	Inode: 50803096    Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Context: unconfined_u:object_r:home_root_t:s0
## 最后访问时间
Access: 2020-03-27 11:49:13.739673217 -0400
## 最后数据修改时间
Modify: 2020-04-03 21:21:19.130301270 -0400
## 最后修改状态时间，如权限等
Change: 2020-04-03 21:21:19.130301270 -0400
 Birth: -
```

## cat

```shell
## 显示行号
cat -n
```

## less 分行显示

向上箭头 ：向上走

## hard显示文件头

和tail对应

## ln链接

### 硬链接

建立一个硬链接，查看，发现两个文件的**i节点**是一样的

```shell
[root@localhost ~]# echo aaaa >> a
[root@localhost ~]# ln a /home/a_a
[root@localhost ~]# ls -ild a /home/a_a
33574992 -rw-r--r--. 3 root root 5 May 30 11:33 a
33574992 -rw-r--r--. 3 root root 5 May 30 11:33 /home/a_a
```

硬链接特点

- 源文件和链接文件inode和block相同
- 任意一个修改，另一个也会修改
- 删除一个，另一个还能使用
- 硬链接不能夸分区

原理：因为他们的inode 相同

**不建议使用，因为他的标记不清楚，它不能链接目录**

### 软链接

建立软连接，发现他们的inode不一样。 **骚年，记得用绝对路径**

```shell
[root@localhost ~]# echo ddd d
ddd d
[root@localhost ~]# echo ddd >> d
[root@localhost ~]# ln -s /root/d /home/d_s
[root@localhost ~]# ls -il /root/d /home/d_s
53234855 lrwxrwxrwx. 1 root root 7 May 30 11:54 /home/d_s -> /root/d
33575679 -rw-r--r--. 1 root root 4 May 30 11:54 /root/d
```

特性

- 任意一个修改，另一个也会修改
- 删除源文件，软链接失效
- 不论源文件多大，软链接不变
- 软连接可以链目录

原理：软链接的block里面，存放的是源文件的inode

## 查看帮助文档

- man
- info

## 看看系统中的别名

```shell
[root@localhost home]# alias
```

## 文件搜索

### locate

- 优点，查询的是数据库，速度快，数据库位置：/var/lib/mlocate/mlocate.db
- 缺点： 只能安装文件名搜，不能安装时间，权限等

```shell
##安装
[root@localhost yum.repos.d]# yum  -y install mlocate
##更新数据库
[root@localhost yum.repos.d]# updatedb
##搜索
[root@localhost yum.repos.d]# locate a_a
```

### find

- 按文件名搜

```shell
## 安装文件名搜。 这个搜索范围越大，性能越消耗大
[root@localhost mlocate]# find / -name a_a
/home/a_a
## 忽略大小写搜索
[root@localhost mlocate]# find / -iname a_a

```

- 按大小搜索

```shell
## 搜索比29M大的
[root@localhost home]# find . -size +29M
## 搜索比29M小的
[root@localhost home]# find . -size -29M
```

- 按照权限搜索

```shell
[root@localhost home]# find . -perm 755
```

- 逻辑运算查询
  - -a :&&
  - -o: ||

```shell
#查询size=10m&&type=文件
[root@localhost home]# find . -size 10M -a -type f

```

- 将查询到的结果放入命令中
  - -exec
  - -ok

## grep 

### 搜索文件里面的内容

grep是使用正则表达式匹配，find是使用通配符匹配

所以grep是包含匹配的

搜索a_a文件夹中的内容

-n : 显示行号

```shell
[root@localhost home]# grep -n 'a' a_a
1:aaaa
```

反向查找，不存在a

```shell
[root@localhost home]# grep -v 'a' a_a
```



# 权限

linux靠权限来区分文件类型

“-” ： 普通文件

“d” ： 目录文件

"l" ： 软链接

"s" ： 套接字文件，**不能删**

```shell
-rw-r--r--.  1 root root  33958849 Mar 31 11:29 seata-server-1.0.0.tar.gz
drwxr-xr-x.  3 root root        20 Mar 26 09:03 work
lrwxrwxrwx.  1 root root         1 May 30 11:46 b_b -> b
```

权限位置

文件类型， 所属用户 u（rwx），所属组 g（rwx）， 其他人 o（rwx）

## 基本权限

### 修改权限

chmod 

- 使用字母赋值权限

```shell
## 给所属人，所属组添加可执行权限
[root@localhost home]# chmod u+x,g+x a_a
[root@localhost home]# ls -l a_a
-rwxr-xr-x. 3 root root 5 May 30 11:33 a_a
## 减少权限
[root@localhost home]# chmod u-x a_a

```

- 使用数字赋值权限

4+2+1（读，写， 执行）

基本数字类型

644： 文件的基本权限

755: 文件的执行权限和目录的基本权限

```shell
## 给文件添加 可读权限
[root@localhost home]# chmod 444 a_a
[root@localhost home]# ls -l a_a 
-r--r--r--. 3 root root 5 May 30 11:33 a_a

```

### 修改所属用户：所属组

修改所属用户

```shell
[root@localhost home]# chown user1 a_a
[root@localhost home]# ls -l a_a
-r--r--r--. 3 user1 root 5 May 30 11:33 a_a
```

修改所属组

```shell
[root@localhost home]# chgrp user1 a_a
[root@localhost home]# ls -l a_a
-r--r--r--. 3 user1 user1 5 May 30 11:33 a_a

```

修改所属用户和所属组

```shell
[root@localhost home]# chown root:root a_a
[root@localhost home]# ls -l a_a
-r--r--r--. 3 root root 5 May 30 11:33 a_a

```

**普通用户能修改所有者是自己的的文件权限**

## 权限的作用

- r
  - 可读
- w:
  - 可以修改文件
  - 如果想**删除文件，需要对文件的上级目录拥有写权限**
- x
  - 可执行

**目录的权限只能是：0、 5、 7**

## 系统默认权限umask、

新建文件最大权限默认为 666 ，没有执行权限

目录默认权限最大 777

```shell

[root@localhost home]# umask
0022

##
[root@localhost home]# umask -S
u=rwx,g=rx,o=rx

```



## 用户

### 新建用户

```shell
##添加用户
[root@localhost home]# useradd user1
## 给用户添加密码
[root@localhost home]# passwd user1

```

