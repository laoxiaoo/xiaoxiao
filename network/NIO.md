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

