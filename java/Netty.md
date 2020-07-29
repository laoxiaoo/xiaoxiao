# IO模型

## BIO

- 阻塞型io
- 一个线程对应一个连接,并发量上来了，线程开销就大了

![](../image/java/Netty/20200729222717.jpg)

## NIO

- 同步非阻塞

- server端启动一个线程，线程维护一个selector
- selector一直轮询，查询通道有没有连接事件
- 也可以有多个线程维护selector
- 适合连接数多且连接比较短，如聊天服务器，弹幕系统，

![](../image/java/Netty/20200729223449.png)

## AIO

- 异步非阻塞