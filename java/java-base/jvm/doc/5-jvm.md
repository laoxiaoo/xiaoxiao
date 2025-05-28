# 

# String基本特性

1. Jdk8的底层采用char数组存储， Jdk9 byte数组存储
   1. 原因：因为大部分的String存储的是拉丁文，占一个字节

2. `字符串常量池不会存储相同的字符串`
   1. String Pool底层是一个固定大小的**HashTable**(StringTable:链表+数组的方式存储)
   2. jvm更改StringTable的大小：-XX:StringTableSize
3. String:代表不可变的字符串序列（不可变性）

> 如下
>
> String  当堆区的字符串常量修改时，会复制一份出来进行修改
>
> 就算是使用replace时，也是复制一份再进行修改

```java
/**
  * 字面量定义的字符串常量
  * 当堆区的字符串常量修改时，会复制一份出来进行修改
 */
@Test
public void test1() {
    String a = "abc";
    String b = "abc";
    //true
    System.out.println(a==b);
    a = "dfe";
    // false
    System.out.println(a==b);
}

/**
 * 使用replace时，也是复制一份再进行修改
*/
@Test
public void test2() {
    String a = "abc";
    String b = "abc";
    b = a.replace('a', 'd');
    //abc
    System.out.println(a);
    //dbc
    System.out.println(b);
}
```

4. JDK6 以前，字符串常量池在永久代中， 7以后放在*堆空间中*

# String的equals方法

查看源码得知，String重写了equals方法

- 取出String的字符，一个一个比对

所以，调用equals比对的是String的内容

# 字符串拼接

1. 常量与常量的拼接结果在常量池，原理是编译器优化

```java
String a = "a" + "b" + "c";
//在反编译之后其实就是
String a = "abc";
//这是在编译期就优化了的
```

1. 只要其中一个是变量，结果就在堆中（相当于new），原理是StringBuilder.append().toString()

```java
String a ="a";
String b = "b";
String c = a + b;

//从字节码可以看出，此处相当于
String c = new StringBuild().append("a").append("b").toString();

//所以拼接字符串的方式会效率很低
//toString ==> new String()
public String toString() {
    return new String(value, 0, count);
}
```

1. 如果拼接的结果调用intern()方法，则主动将常量池**还没有字符串的对象**放入池中，并返回地址

```java
String a = "a"+"b";
String b = "ab";
//true（这里是编译期优化）
System.out.println(a==b);
String c = "a";
String d = c+"b";
//false（这里是因为d出现了变量，则需要去堆空间new String）
System.out.println(b==d);
String f = d.intern();
//true（如果d在常量池存在，则返回常量池的地址）
System.out.println(b==f);
```

1. 使用final修饰的常量是编译期优化
   1. 所以，在代码中，建议 能使用final修饰的使用final修饰

```java
final String a = "a";
final String b = "b";
String c = "ab";
String d = a+b;
//true
System.out.println(c == d);
```

# String对象

new String("ab") 会造几个对象

查看字节码，我们发现是两个

1. 堆空间一个,常量池一个
2. 返回堆空间的对象

```shell
## 先new一个String对象
0 new #2 <java/lang/String>
3 dup
## 从常量池获取 ab （第二次）
4 ldc #3 <ab>
## 调用String的构造方法
6 invokespecial #4 <java/lang/String.<init>>
```



# intern()方法

1. 如果发现常量池有字符串相同，则将常量池的字符串地址返回
2. 如果常量池没有
   1. jdk6：常量池没有，则将当前堆中的String放入常量池，且返回常量池的地址
   2. jdk7以上：常量池没有，在常量池创建一个引用，指向堆区的“ab"，目的是

```java
//StringBuilder的toString不会在常量池产生“ab"
String str = new String("a") + new String("b");
//常量池没有，在常量池创建一个引用，指向堆区的“ab"
str.intern();
String b = "ab";
//true(jdk7以上，此时str的地址和b的地址一样)
System.out.println(str == b);
```

3. 对于字符串，如果有大量存在的重复字符串时，使用intern能够节省内存空间
   1. 如"a"+"b"等这样的操作

#  常见面试题

> new String("ab")  会创建几个对象？

1. 一个是堆空间的对象
2. 一个是字符串常量池的对象（字节码指令LDC）

> new String("a") + new String("b"); 会创建几个对象？

1. new StringBuilder()  //对象1，  有字符串拼接就会有new StringBuilder
2. new String(“a”)； //对象2和对象3， 堆空间和字符串常量池“a”
3. new String("b") //对象4和对象5， 堆空间和字符串常量池“b”
4. new String(“ab”) //对象6，StringBuilder的toString不会在常量池产生“ab"



> java输出结果？

```java
String java = "ja" + new String("va");
String jTmp = java.intern();
System.out.println(java == jTmp);
```

1. 输出为true，因为java是jvm初始化时（加载sun.misc.Version）就将字符串放入了常量池
2. 源码部分

```java
public class Version {
    private static final String launcher_name = "java";
    private static final String java_version = "1.8.0_131";
    private static final String java_runtime_name = "Java(TM) SE Runtime Environment";
```

他在java.lang.System#initializeSystemClass的静态方法sun.misc.Version.init();汇总调用了
