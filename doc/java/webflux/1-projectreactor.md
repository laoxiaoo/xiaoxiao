 Spring Framework从版本5开始，基于Project Reactor支持响应式编程

 Project Reactor由Reactor文档中列出的一组模块组成。

 主要组件是Reactor Core，其中包含响应式类型Flux和Mono，它们实现了Reactive Stream的Publisher接口以及一组可应用于这些类型的运算符。

# 创建响应式流

1.导入jar包

```xml
<dependency>
    <groupId>io.projectreactor</groupId>
    <artifactId>reactor-core</artifactId>
    <version>3.4.21</version>
</dependency>
```



2.  just方式

```java
//创建响应式流
Flux<String> just = Flux.just("laoxiao", "hello");
just.subscribe(System.out::println);
//第一个: 起始数组， 一共生成的数据量
Flux<Integer> range = Flux.range(100, 5);
range.subscribe(System.out::println);
```

```java
Mono<String> just = Mono.just("laoxiao");
just.subscribe(System.out::println);

//避免空指针异常，返回不包含任何值的optiona1对象。
Mono<Object> empty = Mono.justOrEmpty(Optional.empty());
empty.subscribe(System.out::println);
```

# 错误处理

onError 信号是响应式流规范的一个组成部分，一种将异常传播给可以处理它的用户。但是，如果
最终订阅者没有为 onError 信号定义处理程序，那么 onError 抛异常



>为subscribe操作符中的 onError 信号定义处理程序。



当出现error时，进入err方法

```java
Flux.from(new Publisher<String>() {
    @Override
    public void subscribe(Subscriber<? super String> subscriber) {
        subscriber.onError(new RuntimeException("出现异常"));
    }
}).subscribe(var -> System.out.println(var) //处理正常情况
        , err -> System.err.println(err)); //处理异常情况
```



> 如果发送异常流，则用新的流来替换

```java
Flux.from(new Publisher<String>() {
    @Override
    public void subscribe(Subscriber<? super String> subscriber) {
        System.out.println("异常流");
        subscriber.onError(new RuntimeException("出现异常"));
    }
}).onErrorResume(event -> Flux.from(subscriber -> subscriber.onNext("新的正常的流数据"))).subscribe(var -> System.out.println(var) //处理正常情况
        , err -> System.err.println(err) //处理异常情况
                , () -> System.out.println("完成"));
Thread.sleep(10000);
```



>  重试来获取正常的流，如果重试N次还是不能成功，则采用异常处理

```java
CountDownLatch countDownLatch = new CountDownLatch(1);

Flux.from(new Publisher<String>() {
    @Override
    public void subscribe(Subscriber<? super String> subscriber) {
        System.out.println("异常流");
        subscriber.onError(new RuntimeException("出现异常"));
    }
})
        .retry(3) //如果发生异常流，则重试到可以正常，最多重试三次
        .subscribe(var -> {
            System.out.println(var); //处理正常情况
            countDownLatch.countDown();
        }
        , err -> {
            //处理异常情况
            System.err.println(err);
            countDownLatch.countDown();
        });

countDownLatch.await();
```



>  一旦流中出现onError，则使用指定的元素替代

```java
Flux.just("user")
        .flatMap(var -> Flux.error(new RuntimeException("error")))
        .onErrorReturn("新的正常的流数据")
        .subscribe(var -> System.out.println(var) //处理正常情况
                , err -> System.err.println(err) //处理异常情况
                , () -> System.out.println("完成"));
Thread.sleep(10000);
```

