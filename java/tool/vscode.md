#

# 修改快捷方式

打开默认键盘快捷方式设置：
File -> Preferences -> Keyboard Shortcuts

# 几个常见的快捷键修改

## 格式化

![image-20231227193512022](image/vscode/image-20231227193512022.png)

## 搜索文件

![image-20231227193544000](image/vscode/image-20231227193544000.png)

## 方法提示

![image-20231227193931177](image/vscode/image-20231227193931177.png)

## 触发提示

![image-20231227194113440](image/vscode/image-20231227194113440.png)

# 字体调整

File -> Preferences -> setting

![image-20231227200545726](image/vscode/image-20231227200545726.png)

# 插件

## GIT

### Git Graph

显示git分支相关信息

![image-20231231114229889](image/vscode/image-20231231114229889.png)

## Git History

显示历史

![image-20231231114433747](image/vscode/image-20231231114433747.png)

# 折叠代码块

右键进入命令行

![image-20240713163452631](image/vscode/image-20240713163452631.png)

搜索fold

![image-20240713163511683](image/vscode/image-20240713163511683.png)

## Idea 快捷键

搜索 `IntelliJ IDEA Keybindings`。进行安装

## idea 主题

<b id="gray">IntelliJ IDEA Darcula Theme</b> 插件



# json处理

> json 树结构处理

<b id="gray">JSON Tree Editor</b>

安装完后，点击右上角

![image-20240731142445976](image/vscode/image-20240731142445976.png)

<b id="gray">JSON Tools</b>

json格式化/压缩

![image-20241023155630517](image/vscode/image-20241023155630517.png)

## 文件对比

<b id="gray">Compare View</b>

![image-20241023155725031](image/vscode/image-20241023155725031.png)



# 配置终端为Git

1. 在设置中搜索：profiles.windows

2. 在json中配置
```json
   "terminal.integrated.profiles.windows": {
       "PowerShell -NoProfile": {
         "source": "PowerShell",
         "args": [
           "-NoProfile"
         ]
       },
       "Git-Bash": {
         "path": "D:\\softinstall\\Git\\bin\\bash.exe",
         "args": []
       }
     },
   "terminal.integrated.defaultProfile.windows": "Git-Bash",
```