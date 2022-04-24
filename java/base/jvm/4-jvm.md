# String基本特性

1. Jdk8 char数组存储， Jdk9 byte数组存储
   1. 因为大部分的String存储的是拉丁文，占一个字节
2. 字符串常量池不会存储相同的字符串
   1. String Pool底层是一个固定大小的StringTable
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

# String的equals方法

查看源码得知，String重写了equals方法

- 取出String的字符，一个一个比对

所以，调用equals比对的是String的内容

