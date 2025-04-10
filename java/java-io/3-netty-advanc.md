#

# Netty高级解决方案



# 简单的Http服务



```java
public static void main(String[] args) {
    new ServerBootstrap()
            .group(new NioEventLoopGroup())
            .channel(NioServerSocketChannel.class)
            .childHandler(new ChannelInitializer<NioSocketChannel>() {
                @Override
                protected void initChannel(NioSocketChannel ch) throws Exception {
                    ch.pipeline().addLast(new LoggingHandler());
                    ch.pipeline().addLast(new HttpServerCodec());
                    ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                        @Override
                        public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                            //会收到两个
                            //请求行：class io.netty.handler.codec.http.DefaultHttpRequest
                            //请求体：class io.netty.handler.codec.http.LastHttpContent$1
                            log.debug("收到客户端请求：{}", msg.getClass());
                            if(msg instanceof DefaultHttpRequest) {
                                DefaultHttpRequest request = (DefaultHttpRequest) msg;
                                log.debug(request.uri());
                                DefaultFullHttpResponse response
                                        = new DefaultFullHttpResponse(request.protocolVersion(), HttpResponseStatus.OK);
                                response.content().writeBytes("<h1>hello</h1>".getBytes(StandardCharsets.UTF_8));
                                ctx.writeAndFlush(response);
                            }
                        }
                    });
                }
            }).bind(80);
}
```

# 自定义协议

## 要素

1. 魔数，用来在第一时间判定是否是无效数据包（如：jvm字节码以cafebaby开头）
2. 版本号，可以支持协议的升级
3. 序列化算法，消息正文到底采用哪种序列化反序列化方式，可以由此扩展，例如：json、protobuf、hessian、jdk
4. 指令类型，是登录、注册、单聊、群聊... 跟业务相关
5. 请求序号，为了双工通信，提供异步能力（如：发送123，消息不一定以123这个顺序来发）
6. 正文长度
6. 消息正文



# 标识线程安全的Handler

*@Sharable*: 这个注解标识，当前handler是线程安全的（<b id="blue">LoggingHandler</b>），可以共享使用，如果不标识这个注解，表示当前handler不是线程安全的

- 如果我们为了防止子类注释*@Sharable*,可以参考`io.netty.channel.ChannelHandlerAdapter#ensureNotSharable`的写法

# 连接假死

> 出现原因

1. 网络设备出现故障，例如网卡，机房等，底层的TCP 连接已经断开了，但应用程序没有感知到，仍然占用着资源。
2. 公网网络不稳定，出现丢包。如果连续出现丢包，这时现象就是客户端数据发不出去，服务端也—直收不到数据，就这么—直耗着
3. 应用程序线程阻塞，无法进行数据读写

> 产生问题

1. 假死的连接占用的资源不能自动释放
2. 向假死的连接发送数据，得到的反馈是发送超时

## IdleStateHandler

使用这个handler可以在没有读写事件后，编写一些操作

*IdleStateHandler*：

-  readerIdleTimeSeconds：表示多少秒没有读就会触发IdleState.READER_IDLE事件
-  writerIdleTimeSeconds： 表示多少秒没有写就会触发事件（**不关注就写0**）
-  allIdleTimeSeconds： 表示多少秒没有读或者写就会触发事件

```java
ch.pipeline().addLast(new IdleStateHandler(5, 0, 0 ));
ch.pipeline().addLast(new ChannelDuplexHandler() {
    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        if(evt instanceof IdleStateEvent) {
            IdleStateEvent event = (IdleStateEvent) evt;
            if(event.state() == IdleState.READER_IDLE) {
                log.debug("已经5s没有读数据了");
            }
        }
    }
});
```

*ChannelDuplexHandler*：入站和出站都会经过

*userEventTriggered*：特殊事件经过方法

## 心跳数据包

服务器端检测到客户端没有发送数据，可能不是客户端网络断了，而是客户端没有用户操作，那么此时服务器端断开客户端的网络是不合适的

所以此时，*客户端*可以定期的向*服务器*端发送心跳数据

客户端写的心跳包时间一般是客户端读的时间一半，如：此时是3s

> 客户端添加代码

```java
ch.pipeline().addLast(new IdleStateHandler(0, 3, 0 ));
ch.pipeline().addLast(new ChannelDuplexHandler() {
    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        if(evt instanceof IdleStateEvent) {
            IdleStateEvent event = (IdleStateEvent) evt;
            if(event.state() == IdleState.WRITER_IDLE) {
                log.debug("已经3s没有写数据了");
            }
        }
    }
});
```



