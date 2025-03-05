


# 不可变对象

- 享元模式等不可变的类是线程安全的（单个方法是线程安全的）

- 采用final修饰
- 采用保护性拷贝

## final

- final的读，直接将final修饰的变量的值，复制一份，到调用的线程的栈中，他没有共享的操作
- 不加final，则直接getstatic，去堆内存（共享内存）获取

# 并发工具

## 自定义线程池

1. 线程池阻塞队列

- 队列的输出存储数组
- 锁
- 生产者条件变量：队列满了需要阻塞
- 消费者条件变量：队列空了需要阻塞
- 容量标记

2. 线程池主类

- 任务队列（存储待执行的线程）
- 线程集合（set集合，存储work，正在工作的线程集合）
- 线程数
- 超时时间：超过这个时间没使用这个线程就停掉这个线程

3. work类设计

- 执行线程的方法（继承Ruanable，重写run方法）
- Ruanable属性（用于通过构造参数接受线程，在run方法里直接调用）

## JDK的线程池

### ThreadPoolExecutor

- 线程池有一个整形参数
- 高三位表示线程池的状态

```java
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));
```





### 饥饿现象

- 一般只有固定大小的线程池才会有饥饿现象
- 如：A B线程都需要等待C线程执行完才能做事情，此时，线程池大小2，如果A B 同时执行，那么C永远不可能执行，则A B线程一直在等待

解决方案：

- 不同类型的线程分给不同的线程池工作

## 线程池配置

### CPU密集型

通常采用cpu核数＋1能够实现最优的CPU利用率，+l是保证当线程由于页缺失故障（操作系统）或其它原因导致暂停时，额外的这个线程就能顶上去，保证CPU时钟周期不被浪费

### IO密集型

CPU不总是处于繁忙状态，例如，当你执行业务计算时，这时候会使用CPU资源，但当你执行IO操作时、远程RPC调用时，包括进行数据库操作时，这时候CPU就闲下来了，你可以利用多线程提高它的利用率。

公式：

线程数=核数*期望CPU利用率 *总时间(CPU计算时间+等待时间)/ CPU 计算时间

## 定时调度

### Timer方式

在『任务调度线程池』功能加入之前，可以使用java.util.Timer来实现定时功能，Timer的优点在于简单易用，但由于所有任务都是由同一个线程来调度，因此所有任务都是串行执行的，同一时间只能有一个任务在执行，前一个任务的延迟或异常都将会影响到之后的任务。

```java
Timer timer = new Timer();

TimerTask timerTask1 = new TimerTask() {
    @Override
    public void run() {
        log.debug("延迟执行1......");
    }
};

timer.schedule(timerTask1, 1000);
```

### 线程池方式

- 延迟执行

```java
ScheduledExecutorService pool = Executors.newScheduledThreadPool(2);
pool.schedule(() -> {
    log.debug("pool1 ....");
}, 1, TimeUnit.SECONDS);
```

- 延迟执行（线程池）

1. 时间间隔：如果时间到了，上个线程池线程没执行完，等待它执行完后立马执行

```java
ScheduledExecutorService pool = Executors.newScheduledThreadPool(2);
pool.scheduleAtFixedRate(() -> {
    log.debug("pool2 ....");
}, 1, 2, TimeUnit.SECONDS);
// 初始延迟，  时间间隔 ，  时间单位
```

2. 时间间隔：从上一个线程执行完毕后，开始算时间

```java
ScheduledExecutorService pool = Executors.newScheduledThreadPool(2);
pool.scheduleWithFixedDelay(() -> {
    log.debug("pool2 ....");
}, 1, 2, TimeUnit.SECONDS);
```

- 定时执行

```java
LocalDateTime now = LocalDateTime.now();
LocalDateTime time = now.withHour(11).withMinute(19).withSecond(0).with(DayOfWeek.WEDNESDAY);
if(now.compareTo(time) > 0) {
    //如果当前时间>需要定时的时间，则定时时间延迟一周
    time.plusWeeks(1);
}
log.debug("下次执行时间：{}", time);
long millis = Duration.between(now, time).toMillis();
//一个星期的时间间隔
long period = 1000*60*24*7;
ScheduledExecutorService pool = Executors.newScheduledThreadPool(2);
//执行定时任务，延迟到定时的时间，然后每次执行
pool.scheduleAtFixedRate(() -> {
    log.debug("执行定时任务...");
}, millis, period, TimeUnit.MILLISECONDS);
```

## Fork/Join

- Fork/Join 是 JDK 1.7 加入的新的线程池实现，它体现的是一种分治思想，适用于能够进行任务拆分的 cpu 密集型运算  

- 所谓的任务拆分，是将一个大任务拆分为算法上相同的小任务，直至不能拆分可以直接求解。跟递归相关的一些计算，如归并排序、斐波那契数列、都可以用分治思想进行求解  
- Fork/Join 默认会创建与 cpu 核心数大小相同的线程池  

```java
public static void main(String[] args) {
    ForkJoinPool pool = new ForkJoinPool(3);
    Integer i = pool.invoke(new MyTask(5));
    log.debug("计算结果：{}", i);
}

static class MyTask extends RecursiveTask<Integer> {
    int i;
    public MyTask(int i) {
        this.i = i;
    }
    @Override
    protected Integer compute() {
        log.debug("开始计算： {}", i);
        if(i==1) {
            return i;
        }
        MyTask task = new MyTask(i - 1);
        //执行任务
        ForkJoinTask<Integer> fork = task.fork();
        return i+fork.join();
    }
}
```




