# vs修改成英语界面

![image-20230522192431312](image/1-base/image-20230522192431312.png)

![image-20230522192814837](image/1-base/image-20230522192814837.png)

# 字体设置

![image-20230522194218283](image/1-base/image-20230522194218283.png)	

# Vscode 配置环境

## 配置MinGW

前往：[MinGW-w64 - for 32 and 64 bit Windows - Browse /mingw-w64 at SourceForge.net](https://sourceforge.net/projects/mingw-w64/files/mingw-w64/)下载

![image-20230523192411136](image/1-base/image-20230523192411136.png)

将mingw64复制到无中文的路径，然后配置环境变量

## 安装vscode插件

![image-20230523192744181](image/1-base/image-20230523192744181.png)

## .vscode添加配置文件

### launch.json

用于运行可执行程序

```json
{
    "version": "0.2.0",
    "configurations": [
        {//这个大括号里是我们的‘调试(Debug)’配置
            "name": "Debug", // 配置名称
            "type": "cppdbg", // 配置类型，cppdbg对应cpptools提供的调试功能；可以认为此处只能是cppdbg
            "request": "launch", // 请求配置类型，可以为launch（启动）或attach（附加）
            "program": "${fileDirname}\\bin\\${fileBasenameNoExtension}.exe", // 将要进行调试的程序的路径
            "args": [], // 程序调试时传递给程序的命令行参数，这里设为空即可
            "stopAtEntry": false, // 设为true时程序将暂停在程序入口处，相当于在main上打断点
            "cwd": "${fileDirname}", // 调试程序时的工作目录，此处为源码文件所在目录
            "environment": [], // 环境变量，这里设为空即可
            "externalConsole": false, // 为true时使用单独的cmd窗口，跳出小黑框；设为false则是用vscode的内置终端，建议用内置终端
            "internalConsoleOptions": "neverOpen", // 如果不设为neverOpen，调试时会跳到“调试控制台”选项卡，新手调试用不到
            "MIMode": "gdb", // 指定连接的调试器，gdb是minGW中的调试程序
            "miDebuggerPath": "C:\\Program Files\\mingw64\\bin\\gdb.exe", // 指定调试器所在路径，如果你的minGW装在别的地方，则要改成你自己的路径，注意间隔是\\
            "preLaunchTask": "build" // 调试开始前执行的任务，我们在调试前要编译构建。与tasks.json的label相对应，名字要一样
    }]
}
```

### tasks.json

用于编译可执行程序，即build exe

<b id="blue">label</b>需要注意，在`launch.json`中的<b id="blue">preLaunchTask</b>用的到

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "type": "shell",
            "command": "gcc",
            "args": [
                "${file}",
                "-o",
                "${fileDirname}\\bin\\${fileBasenameNoExtension}.exe",
                "-g",
                "-Wall",
                "-static-libgcc",
                "-fexec-charset=GBK",
                "-std=c11"
            ],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "problemMatcher": "$gcc"
        },
        {
            "label": "run",
            "type": "shell",
            "dependsOn": "build",
            "command": "${fileDirname}\\bin\\${fileBasenameNoExtension}.exe",
            "group": {
                "kind": "test",
                "isDefault": true
            },
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": true,
                "panel": "new"
            }
        },
        {
            "type": "cppbuild",
            "label": "C/C++: g++.exe 生成活动文件",
            "command": "C:\\mingw64\\bin\\g++.exe",
            "args": [
                "-fdiagnostics-color=always",
                "-g",
                "${file}",
                "-o",
                "${fileDirname}\bin\\${fileBasenameNoExtension}.exe"
            ],
            "options": {
                "cwd": "${fileDirname}"
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "调试器生成的任务。"
        }
    ]
}
```

**如果遇到 正常的#include报错，可能是环境变量没配置**



### 多文件配置

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "type": "shell",
            "command": "gcc",
            "args": [
                "${file}",
                "-o",
                "${fileDirname}\\bin\\${fileBasenameNoExtension}.exe",
                "-g",
                "-Wall",
                "-static-libgcc",
                "-fexec-charset=GBK",
                "-std=c11"
            ],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "problemMatcher": "$gcc"
        },
        {
            "label": "run",
            "type": "shell",
            "dependsOn": "build",
            "command": "${fileDirname}\\bin\\${fileBasenameNoExtension}.exe",
            "group": {
                "kind": "test",
                "isDefault": true
            },
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": true,
                "panel": "new"
            }
        },
        {
            "type": "cppbuild",
            "label": "C/C++: g++.exe 生成活动文件",
            "command": "C:\\mingw64\\bin\\g++.exe",
            "args": [
                "*.cpp",
                "-o",
                "${fileDirname}\\bin\\${fileBasenameNoExtension}.exe",
                "-std=c++11",
                "-g",
                "-fexec-charset=GBK"
            ],
            "options": {
                "cwd": "${fileDirname}"
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "调试器生成的任务。"
        }
    ]
}
```



# VS创建一个空项目

![image-20230522191846504](image/1-base/image-20230522191846504.png)

# 编译链接模型

源代码 (source code) →预处理器(preprocessor) → 编译器 (compiler) →目标代码(object code) →链接器(Linker) → 可执行程序(executables)

![image-20231113195038094](image/1-base/image-20231113195038094.png)

## 预处理

将源文件转换为翻译单元的过程



```shell
g++ -E test.cpp -o test.i
```

### 防止头文件被循环展开

- #ifdef 解决方案
  - 有弊端，可能会定义重复的 定义
- #pragma once解决方案
  - 推荐使用，保证只会被include一次

## 编译

将其转为汇编代码

```bash
g++ -S test.i -o test.s
```

编译优化网站：[Compiler Explorer (godbolt.org)](https://godbolt.org/)

## 汇编

```text
g++ -c test.s -o test.o
```

## 链接

合并多个目标文件。关联声明与定义

```text
g++ test.o -o test
```

#  HelloWord

```c++
#include <iostream>

//使用命名空间，下面使用可以省略
using namespace std;

int main()
{	
	//输出helloword
	std::cout << "helloword \n";
	//定义变量
	int a = 1;
	char b = 'b';
	//endl 表示换行 类似cout << b << "\n";
	cout << a << endl;
	cout << b << "\n";
	//阻塞命令
	system("pause");
	return 0;
}
```

## 为什么main函数要有返回值

1. 一般来说，我们来通过返回值来判断程序执行是否成功，一般 程序返回0表示成功（约定俗称）
2. 我们通过错误返回的代码来做一些操作

## 为什么main函数可以没有return

c++标准规定，如果main没有return,则默认返回0

# 系统io

iostream:

标准库所提供的 IO 接口，用于与用户交互

1. 输入流： cin ；输出流： cout / cerr / clog
2. cout 与cerr的区别： 输出目标； 
3. cerr和clog的区别：是否立即刷新缓冲区，cerr会立即刷新缓冲区，clog将数据先输出缓冲区，不会立即刷新
4. 缓冲区与缓冲区刷新： std::flush; std::endl 

# 命名空间

1. 可以避免include的多个函数，从而导致的名字冲突

## 调用方式

定义一个命名空间，后面的人使用需要带上命名空间才能访问里面的函数

```c++
#include <iostream>

using namespace std;

//定义一个命名空间
namespace n1
{
    void fun() 
    {
        std::cout << "fun.. \n";
    }
}

int main(int argc, char const *argv[])
{
    //使用命名空间里的函数
    n1::fun();
    return 0;
}

```

## 全局定义使用某个命名空间

定义了全局之后，后面都可以省略命名空间

但是不建议，因为命名空间的定义本身就是为了解决冲突，这样定义可能产生冲突

```c++
//定义一个命名空间
namespace n1
{
    void fun() 
    {
        std::cout << "fun.. \n";
    }
}

using namespace n1;

int main(int argc, char const *argv[])
{
    //使用命名空间里的函数
    fun();
    return 0;
}
```

# 结构体

通过一个结构体，将不同的变量聚合到一起

## 定义结构体

```c++
struct stuStruct
{
    /* 定义一个struct */
    string name;

    int age;
    //构造方法
    stuStruct() {
        name = "小小";
        age = 18;
    }
	//带参数构造方法
    stuStruct(string name, int age) {
        this->age = age;
        this->name = name;
    }

    //定义一个方法
    void toString() {
        cout << name << endl;
        cout << age << endl;
    }
};
```

## 调用结构体

```c++
int main() {
    //在初始化的时候，就调用了结构体的构造方法
    stuStruct ss;
    //调用结构体的方法
    ss.toString();

    //给结构体属性赋值(这里实际调用的就是他的构造方法)
    stuStruct ss2 = {"小~", 19};
    ss2.toString();
    return 0;
}
```

# 类型

## 类型描述

1. 类型是一个编译期概念，可执行文件中不存在类型的概念

> 类型描述了

1. 存储所需要的尺寸 (sizeof ，标准并没有严格限制 )

```c++
//利用sizeof 输出类型存储所需要的大小， 输出 4  4
int main(int argc, char const *argv[])
{
    int x = 10;
    std::cout << sizeof(x) << '\n';
    std::cout << sizeof(int) << '\n';
    std::cout << "end--" << std::endl;
    return 0;
}
```

2. 取值空间 (std::numeric_limits ，超过范围可能产生溢出 )

```c++
#include <iostream>
#include <limits>

//输出某个类型的取值范围（最大的存取数值）
int main(int argc, char const *argv[])
{
    std::cout << std::numeric_limits<int>::min() << std::endl;
    std::cout << std::numeric_limits<int>::max() << std::endl;
    return 0;
}
```

3. 对齐信息（ alignof ）
   1. 为啥要对齐：简单来说，就是方便计算机去读写数据
   2. 对齐的地址一般都是 n（n = 2、4、8）的倍数
   3. 1 个字节的变量，例如 **char** 类型的变量，放在**任意地址**的位置上；
   4. 2 个字节的变量，例如 **short** 类型的变量，放在 **2 的整数倍**的地址上
4. 可以执行的操作(这个类型可以执行的操作)

## 自定义后缀

```c++
//输出6， 讲double类型转为整型*2
int operator ""_dd(long double num) 
{
    return (int)num * 2;
}

int main(int argc, char const *argv[])
{
    std::cout << 3.14_dd << std::endl;
    return 0;
}
```

# 指针

一种间接类型， 存储可以“指向”不同的对象的地址

## 相关操作

1. <b id="blue">&</b> – 取地址操作符
2. <b id="blue">*</b>  – 解引用操作符

```c++
//定义一个指针类型,int*标识指针类型
int* p = &val;

int* p = nullptr;
```

### 定义

```c++
int* p
```

如果定义一个指针，但是没有初始化，那么<b id="blue">*p</b>解引用打印出来可能是随机值，因为这块内存是随机的

### 关于 nullptr

1. 
   一个特殊的对象（类型为 <b id="blue">nullptr_t</b>），表示空指针
2. 类似于 C 中的 NULL ，但更加安全

```c++
//输出0
int* j = nullptr;
std::cout << j << std::endl;
```



## 调用优先级

```c++
int func(int i)
{
    std::cout << "func1" << std::endl;
}

int func(int* i)
{
    std::cout << "func2" << std::endl;
}

int main(int argc, char const *argv[])
{
    //优先调用func1， 因为是整型
    func(1);
    //调用func2，因为是指针类型
    int* i = 0;
    func(i);
    return 0;
}
```

## 主要操作

解引用;

增加、减少;-----*可以对指针指向的地址进行移动*

判等