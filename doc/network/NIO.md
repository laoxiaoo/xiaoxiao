# 三大组件

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/java/Netty/20200731085919.png)

## buffer

当向buffer写入数据时，buffer会记录下写了多少数据。

一旦要读取数据，需要通过flip()方法将Buffer从写模式切换到读模式。

在读模式下，可以读取之前写入到buffer的所有数据

> 以Intbuffer为例

```java
//创建一个buffer，可以存放5个int
IntBuffer intBuffer = IntBuffer.allocate(5);
//将i设置进入buffer，将buffer塞满
for(int i=0; i<intBuffer.capacity(); i++){
    intBuffer.put(i);
}
//转化读操作
intBuffer.flip();
//判读是否还有数据
while (intBuffer.hasRemaining()) {
    log.info("取出数据：{}", intBuffer.get());
}
```

> 几个参数

```java
//标记
private int mark = -1;
//当前下标
private int position = 0;
//操作过程中，下标不能超过limit
//作用：读数据不能超过这个数，flip时，会将position赋值给limit
private int limit;
//容量
private int capacity;
```

![image-20211028231744628](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/network/20211028231744.png)

> 分配内存

```java
//class java.nio.HeapByteBuffer
//使用堆内存，读写效率低，受GC影响
ByteBuffer.allocate(5).getClass();
//class java.nio.DirectByteBuffer
//直接内存，读写效率高（少一次拷贝）
ByteBuffer.allocateDirect(5).getClass();    
```

> 读和存

```java
ByteBuffer buffer = ByteBuffer.allocate(10);
//存入数据，也可以用 channel.read(buffer)
buffer.put(new byte[] {'a', 'b', 'c', 'd', 'e'});
buffer.flip();
buffer.get(new byte[4]);
//[pos=4 lim=5 cap=10]
//位置已经读取到了4位置
System.out.println(buffer);
//获取坐标1的数据，但是pos不会动
System.out.println((char)buffer.get(1));
//读取坐标重置
buffer.rewind();
System.out.println((char)buffer.get());
//标记当前位置
buffer.mark();
//中间做N个读取操作后，指针回到mark标记处
buffer.reset();
```

> 字符串和buffer转换

```java
//这些方式都是直接切换到读模式的
ByteBuffer buffer1 = StandardCharsets.UTF_8.encode("hello");
ByteBuffer buffer2 = ByteBuffer.wrap("hello".getBytes());
```

## Channel

> 简介

- 既可以从通道中读取数据，又可以写数据到通道。但流的读写通常是单向的
- 通道中的数据总是要先读到一个Buffer，或者总是要从一个Buffer中写入

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/java/Netty/20200803231057.jpg)

## Selector

1. 一般称 为选择器 ,也可以翻译为 多路复用器 。

2. 它是用于检查一个或多个NIO Channel（通道）的状态是否处于可读、可写。如此可以实现单线程管理多个channels,也就是可以管理多个网络链接

3. 当有事件发生时，返回select Key 数组，通过selectKey可以获取对应channel

> 对应方法

```java
int select()：阻塞到至少有一个通道在你注册的事件上就绪了。
int select(long timeout)：和select()一样，但最长阻塞时间为timeout毫秒。
int selectNow()：非阻塞，只要有通道就绪就立刻返回。
```

> 编程步骤

1. ServerSocketChannel绑定服务器端口
2.  ServerSocketChannel注册selector，将selector与channel关联、
3.  SelectionKey 注册一个连接事件
4. 一个while循环，去获取事件
   1. 通过 selector.selectedKeys().iterator()获取所有事件的集合
   2. 发现一个事件，则进行处理

# WebSocket

1. 基于TCP的通信协议
2. WebSocket是双向通信协议，模拟Socket协议，可以双向发送或接受信息 