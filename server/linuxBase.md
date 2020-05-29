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