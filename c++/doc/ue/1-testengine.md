# 测试一个游戏

## 新建一个5.0的引擎

![image-20230603204146226](image/1-testengine/image-20230603204146226.png)

## 启动虚幻引擎

![image-20230603223731776](image/1-testengine/image-20230603223731776.png)



![image-20230603223927347](image/1-testengine/image-20230603223927347.png)

## 启动多人测试

将玩家数量调到多个

![image-20230604124231460](image/1-testengine/image-20230604124231460.png)

standalone运行： 将启动一个独立的游戏

监听服务器运行：编辑器作为服务器

![image-20230604124248641](image/1-testengine/image-20230604124248641.png)

运行的时候就能看到两个测试实例，并且他们已经连接了监听服务器

![image-20230604125759985](image/1-testengine/image-20230604125759985.png)

# 局域网连接

## 新建一个地图

新建一个关卡地图，保存到map下

![image-20230604130852510](image/1-testengine/image-20230604130852510.png)

![image-20230604130902317](image/1-testengine/image-20230604130902317.png)

## 使用蓝图局域网连接

进入蓝图双击

![image-20230604192442714](image/1-testengine/image-20230604192442714.png)

建立两个keyboard，表示按某个键触发某个事件

将第一个事件指向Open level , 命令为Lobby，表示按1进入关卡Lobby

![image-20230604192635792](image/1-testengine/image-20230604192635792.png)

![image-20230604192947882](image/1-testengine/image-20230604192947882.png)

2指向一个命令，表示输入2连接指定关卡

![image-20230604192813316](image/1-testengine/image-20230604192813316.png)

回到lobby打包

![image-20230604193056435](image/1-testengine/image-20230604193056435.png)

打包文件后，将文件传送另一个机子

在另一个机子（B）运行文件

在本机（A）运行文件

A点击1进入Lobby关卡， B点击2进入关卡

## 使用C++代码局域网连接

1. 在虚幻商城下载vs插件

![image-20230604230014046](image/1-testengine/image-20230604230014046.png)

2. 双击进入代码编辑界面

![image-20230604230048826](image/1-testengine/image-20230604230048826.png)