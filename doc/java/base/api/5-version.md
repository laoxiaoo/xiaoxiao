# 
# JAVA9

## 新特性

```markmap

# jdk9目录不包含jre
# 模块化系统
# JSHELL
# 多版本兼容jar包

```

## JSHELL

- REPL工具：jShell命令
  - 以交互式的方式，对语句和表达式进行求值
  - 如同scala之类一样
- 帮助文档：/help

```shell
##进入jshell
λ ./jshell
## 执行java代码
jshell> System.out.println("hello word");
hello word

## 导入java包，导入后可以调用对应包下的方法
jshell> import java.util.*
## 查看已导入的包
jshell> /import
|    import java.io.*
|    import java.math.*
|    import java.net.*
|    import java.nio.file.*
|    import java.util.concurrent.*
|    import java.util.function.*
|    import java.util.prefs.*
|    import java.util.regex.*
|    import java.util.stream.*
|    import java.util.*

## 查看已输入的语句
jshell> /list

   1 : System.out.println("hello word");
   2 : import java.util.*;
```

1. 导入java文件

```java
void printHello() {
    System.out.println("hello word! java9");
}
printHello();
```

2. 打开编写的文件

```shell
jshell> /open D:\softinstall\jdk-9\bin\HelloWord.java
hello word! java9
```

## 多版本兼容jar包

多版本兼容 JAR 功能能让你创建仅在特定版本的 Java 环境中运行库程序时选择使用的 class 版本。




## 模块化

- 好处：安全、加载更快一点

1. 建立一个模块exprot-module，这个模块是用来导出的，在根路径下建立module-info.java文件

```java
module exprot.module {
    exports com.xiao.exprot ;
}
```

2. 建立实体类(用于在另一个模块引入)

```java
package com.xiao.exprot;

public class Person {
    private String name;
    private Integer age;
}
```

3. 建立引入模块，建立module-info.java文件

```java
module improt.module{
    requires exprot.module;
}
```

4. test使用

```java
public class Test {
    public static void main(String[] args) {
        Person person = new Person();
    }
}
```


## 接口私有方法

- http://openjdk.java.net/jeps/213
- 为啥会出现：jdk8出现了接口方法可以写deafult 的方法体，方法可以调用，则出现了private类型，能够在接口内直接调用方法

```java
interface MyInterface {
    // jdk7
    void method1();

    //jdk8: 可以定义static方法和default方法
    static void method2() {
        System.out.println("method 2");
    }

    default void method3() {
        System.out.println("method3");
    }
    //jdk9: 可以定义private方法
    private void method4() {
        System.out.println("method4");
    }
}
```

## 钻石操作符提升

```java
public void DiamondMethod() {
    new HashMap<>() {
        //可以在子类的匿名方法中编写代码
        @Override
        public Object get(Object key) {
            //重写父类的方法等操作
            return super.get(key);
        }
    };
}
```



## String 类型由byte数组存储，由**coder**存储字符编码

- 大部分的string存储的是拉丁文，这样char一样占用了两个字节，这样浪费了空间
- 使用byte就不会这样问题
- 如果不是拉丁文，用utf-16存储

## 创建只读集合（不可变集合）

- set、map等，都可以通过of来创建不可变的集合

- java8和java9对比

```java
// java8
List<String> list1 = new ArrayList<>();
list1.add("a");
List<String> list2 = Collections.unmodifiableList(list1);
//java9
List<String> list3 = List.of("a", "b");
```
## Strem提升

- takeWhile操作

```java
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 6);
//如果满足条件则通过，当第一次不满足时，则终止循环
list.stream().takeWhile(num -> num > 3).forEach(System.out::println);
//返回剩余的
list.stream().dropWhile(num -> num>3).forEach(System.out::println);
//iterate多了个重载方法来判断是否停止
Stream.iterate(0, x -> x < 10, x -> x+1).forEach(System.out::println);
//Optional多了一个Stream方法，返回一个集合，可以调用flatmap变为集合操作
Optional.ofNullable(Arrays.asList(1,2,3,4)).stream().forEach(System.out::println);
```




## HTTP/2 Client

- 对应110 http://openjdk.java.net/jeps/110
- 使用姿势

1. 引入模块

```java
module stu.java9 {
    requires jdk.incubator.httpclient;
}
```

2. 使用

```java
public static void main(String[] args) throws IOException, InterruptedException {
    HttpClient httpClient = HttpClient.newHttpClient();
    HttpRequest httpRequest = HttpRequest.newBuilder(URI.create("https://www.baidu.com")).GET().build();

    HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandler.asString());

    System.out.println("status:"+ httpResponse.statusCode());
    System.out.println("Http version: "+ httpResponse.version());
    System.out.println("Http body: \n" + httpResponse.body());
}
```

## 默认使用G1垃圾回收



# JAVA11

## 局部变量的类型推断

- var其实就是从右边推断类型，并不是弱类型（比如： 我们右边定义一个String， 左边直接定义一个var，就可以直接推断出这个变量的类型）
- 它的作用可以看做：定义当一个很长的类名时，我们可以用var来代替

```shell
jshell> var a = "hello";
a ==> "hello"
jshell> System.out.println(a.getClass());
class java.lang.String
```

# JDK15

## 文本块

文本块，是一个多行字符串，它可以避免使用大多数转义符号，自动以可预测的方式格式化字符串，并让开发人员在需要时可以控制格式。

```java
public static void main(String[] args) {
    String query = """
           SELECT * from USER \
           WHERE `id` = 1 \
           ORDER BY `id`, `name`;\
           """;
    System.out.println(query);
}
```

# JDK17 

因为我们引入了`sealed` `class`或`interfaces`，这些class或者interfaces只允许被指定的类或者interface进行扩展和实现。即其他类不允许继承或者实现它

```java
// 添加sealed修饰符，permits后面跟上只能被继承的子类名称
public sealed class Person permits Teacher, Worker, Student{ }
```

