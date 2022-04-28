# 线程的三大特性

> 原子性



> 可见性

volatile

> 有序性

虚拟机在进行代码编译时，对于那些改变顺序之后不会对最终结果造大影响的代，虚琅机不一定会按照我们写的代码的顺序来执行，有可能将他们重排序。实际上，对于有些代码行重排序之右，虽然对变量的值没有造成影响，但有可能会出现线程安全问题。

# 线程的实现方式

## Thread继承

```java
public static void main(String[] args) {
    new MyThread().start();
    log.debug("主线程运行结束...");
}

static class MyThread extends Thread {
    @Override
    public void run() {
        log.debug("线程运行中....");
    }
}
```

## Runable接口实现(建议使用)

```java
public static void main(String[] args) {
    Runnable runnable = new Runnable() {
        @Override
        public void run() {
            log.debug("线程运行中....");
        }
    };
    new Thread(runnable).start();
    log.debug("主线程运行中.....");
}
```

## Future模式

future模式能够阻塞的等待异步线程的结果，他要配合Callable的方式、

```java
FutureTask<Integer> futureTask = new FutureTask<>(new Callable<Integer>() {
    @Override
    public Integer call() throws Exception {
        log.debug("future执行中.....");
        Thread.sleep(1000);
        return 1000;
    }
});
new Thread(futureTask).start();
log.debug("main 线程执行中.....");
log.debug("获取到future的结果：{}", futureTask.get());
```

## Runable原理

Thread方式中，将Runable的实现类赋值了target;

```java
this.target = target;
```

最终在Thread的run方法中，可以看到，执行的是Runnable的实现的方法

```java
@Override
public void run() {
    if (target != null) {
        target.run();
    }
}
```

Runable方式中，执行的是子类的run方法，也就是我们重写的方法，所以Thread方式Runable方式原理是一样的

# 线程上下文切换原因

1. 线程的cpu时间片用完
2. 垃圾回收
3. 有更高优先级的线程需要运行
4. 线程自己调用了sleep yield等方法
   1. 当线程切换时候，需要**程序计数器**保存当前线程的状态（记录执行指令的地址以及栈帧信息）
   2. 频繁切换上下文会影响性能