# JVM基础

## JVM架构模型

- java指令是根据栈来设计的
- 栈
  - 跨平台性，指令集小
  - 指令多，执行性能比寄存器差

## JVM生命周期

- 虚拟机启动
  - java虚拟机启动是通过引导类加载器创建一个初始类来完成的
- 虚拟机的执行
  - 执行一个java程序，真正的执行的是一个java虚拟机的进程
- 虚拟机的退出
  - 正常退出
  - 某线程调用Runtime或者System类的exit方法

**类在JVM中的生命周期为：加载，连接，初始化，使用，卸载**

## JRE JDK关系

- JDK包含了JRE,JDK有编译器等（java开发工具）
  - Java 工具：javac、java、 jsonsole等


```
JDK(Java Development Kit)又称J2SDK(Java2 Software Development Kit)，是Java开发工具包，它提供了Java的开发环境(提供了编译器javac等工具，用于将java文件编译为class文件)和运行环境(提 供了JVM和Runtime辅助包，用于解析class文件使其得到运行)。如果你下载并安装了JDK，那么你不仅可以开发Java程序，也同时拥有了运 行Java程序的平台。JDK是整个Java的核心，包括了Java运行环境(JRE)，一堆Java工具tools.jar和Java标准类库 (rt.jar)。
```

- JRE中包含虚拟机JVM（java运行时环境）
  - bin(jvm)
  - lib(java核心的类库)


```tex
JRE(Java Runtime Enviroment)是Java的运行环境。面向Java程序的使用者，而不是开发者。如果你仅下载并安装了JRE，那么你的系统只能运行Java程序。JRE是运行Java程序所必须环境的集合，包含JVM标准实现及 Java核心类库。它包括Java虚拟机、Java平台核心类和支持文件。它不包含开发工具(编译器、调试器等)
```

- JVM：java虚拟机
  - .class 在jvm上运行

![img](http://127.0.0.1:3000/doc/java/base/jvm/doc/image/2021427224536.jpg)

## JVM结构

- class 文件通过class loader加载到内存中
- 内存中
  - 多线程之间，方法区和堆是共享的
  - 每个线程独有一份计数器和栈
  - java的指令是基于栈实现的（**主要考虑夸平台性**）

## 类加载过程

![img](http://127.0.0.1:3000/doc/java/base/jvm/doc/image/1-jvm/20200618220310.jpg)

> 详细图

![详细图](http://127.0.0.1:3000/doc/java/base/jvm/doc/image/1-jvm/20200620112743.jpg)

# 类加载子系统

## 加载class文件方式

**基本数据类型由虚拟机预先定义，引用数据类型则需要进行类的加载**

将Java类的字节码文件加载到机器内存中，并在内存中构建出]ava类的原型（类模板对象），JVM将从字节码文件中解析出的常量池、类字段、类方法等信息存储到类模板中

- 通过类的全名，获取类的二进制数据流。
  - 从文件系统读取
  - 从jar，zip等中读取
  - 网络读取
  - 运行时计算生成，如动态代理
  - 从加密文件中获取，如一些防止反编译的措施
- 解析类的二进制数据流为方法区内的数据结构（**Java类模型**)
- 创建java.lang.Class类的实例，表示该类型。作为方法区这个类的各种数据的访问入口

> 类模板

- 加载的类在VM中创建相应的类结构，类结构会存储在方法区
- 但是他的class是在堆空间的

![img](http://127.0.0.1:3000/doc/java/base/jvm/doc/image/2-jvm/20210602231930.png)

- 例如加载string：

```java
//局部变量表存储引用指向堆中的Class实例，class实例指向方法区的String模板
Class<?> clazz = Class.forName("java.lang.String");
```

## 加载过程

- 类加载子系统只负责从文件系统加载class文件，
- 加载的类信息存在方法区的内存空间，方法区还存放运行时的常量池信息
- 类加载子系统只负责加载，能不能运行由执行引擎决定

![img](http://127.0.0.1:3000/doc/java/base/jvm/doc/image/202162220201.png)

> 细节图

![img](http://127.0.0.1:3000/doc/java/base/jvm/doc/image/2-jvm/1600746666896567.png)

## 类加载器

## 链接过程

> 验证

- 当类加载系统中后，开始验证，它的目的是保证加载的字节码是合法、合理并符合规范的。
  - 格式检查（其实加载阶段就开始格式检查了）：魔数检查，版本检查，长度检查(*所有的字节码起始开头都是 CA FE BA BE*)
  - 语义检查：
    - 是否所有的类都有父类的存在
    - 是否一些被定义为final的方法或者类被重写或继承了
    - 非抽象类是否实现了所有抽象方法或者接口方法
  - 字节码检查
    - 字节码执行过程是否跳转了了不存在指令
  - 符号引用验证

> 准备

- 为类的静工

  变量

  （不是常量）分配内存，并将其初始化为默认值。

  - 如int类型，一开始才是0
  - 为**类变量**分配内存并且设置该类的初始值

- **这里不包含基本数据类型的字段用static final修饰的情况，因为final在编译的时候就会分配了，准备阶段会显式赋值。**（没有初始化赋值这个代码执行）

- 如果使用字面量方式给String的常量赋值，也是在准备阶段**显示赋值**的

> 解析

- 将符号引用转为对应直接引用
- 一个类可能会引用很多其他类

![img](http://127.0.0.1:3000/doc/java/base/jvm/doc/image/2-jvm/20210429232122.png)

## 初始化阶段

为类的静态变量赋予正确的初始值。

- 初始化阶段的重要工作是执行类的初始化方法:()方法。

```java
class A {
    static{
        //clinit
    }
}  
```

- 他不需要定义，是javac编译器自动收集类中所有变量的赋值动作和静态代码块中的语句合并而来

![img](http://127.0.0.1:3000/doc/java/base/jvm/doc/image/2-jvm/20210429233002.png)

- 他是按照代码的顺序执行的
  - 因为声明的对象在后面，而使用的代码在前面
  - staic里面能赋值是因为jvm会把static赋值过程自己编译成一个clinit方法，在链接阶段赋值

> 例子

1. num的赋值过程 num=0 ---> num = 3 ---->num=4
2. 非法前向应用：因为num下面由在初始化阶段赋值，所以在此处不能引用他

```java
static {
    number = 2;
    num = 3;
    //这里是不允许使用的，非法的前向引用
    System.out.println(num);
}
//这里最终输出的结果是4
private static int num = 4;
```

- 虚拟机保证每个类的clinit在多线程下都是同步加锁的（只会有一个线程加载一个类的clinit方法）
  - **如果加载过程中 出现这个问题，会造成线程加载阻塞 **
- 如果存在父类，会先执行父类的clinit

由代码可见，初始化阶段会执行clinit方法,有静态代码块，或者静态变量，就会有clinit（静态常量不会产生）

```java
public static int i = 1;
public static int j;
static {
    j = 2;
    System.out.println(j);
}
 0 iconst_1
 1 putstatic #2 <com/xiao/classLoader/TestStatic.i>
 4 iconst_2
 5 putstatic #3 <com/xiao/classLoader/TestStatic.j>
 8 getstatic #4 <java/lang/System.out>
11 getstatic #3 <com/xiao/classLoader/TestStatic.j>
14 invokevirtual #5 <java/io/PrintStream.println>
17 return
```

> 注意

```tex
在加载一个类之前，虚拟机总是会试图加载该类的父类，因此父类的<clinit>总是在子类<clinit>之前被调用。也就是说，父类的static块优先级高于子类。
口诀:由父及子，静态先行。
```

引用类型的不管是不是final，是static就是在clinit中赋值

> 没有clinit场景

```java
//非静态变量
public int i;
//静态变量未赋值
public static int j;
//常量
public static final int k = 1;
```

**clinit虚拟机加锁了，是线程安全的**