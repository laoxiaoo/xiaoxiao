# 入门

## 服务器端

*new ServerBootstrap()*：启动器，负责组装netty组件，启动服务器

*NioEventLoopGroup*：BossEventLoop ,WorkerEventLoop  循环处理事件组

*channel(NioServerSocketChannel.class)*: 选择SocketChannel实现

*childHandler*：告诉WorkerEventLoop ，将来发生事件处理哪些逻辑

*ChannelInitializer*： 根客户端读写的通道，并且添加别的handler

```java
public static void main(String[] args) {
    new ServerBootstrap()
            .group(new NioEventLoopGroup())
            .channel(NioServerSocketChannel.class)
            .childHandler(new ChannelInitializer<NioSocketChannel>() {
                @Override
                protected void initChannel(NioSocketChannel ch) throws Exception {
                    ch.pipeline().addLast(new StringDecoder());
                    ch.pipeline().addLast(new ChannelInboundHandlerAdapter(){
                        @Override
                        public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                            log.info("收到数据：{}",msg);
                        }
                    });
                }
            })
            .bind(80);
}
```

## 客户端

```java
public static void main(String[] args) throws InterruptedException {
    new Bootstrap()
            .group(new NioEventLoopGroup())
            .channel(NioSocketChannel.class)
            .handler(new ChannelInitializer<NioSocketChannel>() {
                @Override
                protected void initChannel(NioSocketChannel ch) throws Exception {
                    ch.pipeline().addLast(new StringEncoder());
                }
            }).connect("127.0.0.1", 80)
            .sync()
            .channel()
            .writeAndFlush("hello word");
}
```