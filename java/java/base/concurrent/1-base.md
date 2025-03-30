#

# 线程的三大特性

1. 原子性

每一个线程，都有自己的内核内存

2. 可见性(volatile)

同一个jvm线程，共享堆内存

栈内存是代码片段中局部内存的存储空间

3. 有序性

虚拟机在进行代码编译时，对于那些改变顺序之后不会对最终结果造大影响的代，虚琅机不一定会按照我们写的代码的顺序来执行，有可能将他们重排序。实际上，对于有些代码行重排序之右，虽然对变量的值没有造成影响，但有可能会出现线程安全问题。

# 主线程和守护线程

- 正常情况下，Java会等待所有线程结束，程序才会结束
- 特殊情况：守护线程不管有没有结束，主线程结束，都会强制结束
- 垃圾回收线程就是常见的守护线程

# 线程状态

## 从API层面

> NEW

初始状态

> RUNNABLE

保护运行/可运行/阻塞（操作系统的阻塞，如：io的阻塞accept）状态

> BLOCKED

阻塞状态是线程阻塞在进入synchronized关键字修饰的方法或代码块(获取锁)时的状态。

> WAITING

`调用了wating/join`, 处于这种状态的线程不会被分配CPU执行时间，它们要等待被显式地唤醒，否则会处于无限期等待的状态, 

> TIMED_WAITING

`调用sleep`, 处于这种状态的线程不会被分配CPU执行时间，不过无须无限期等待被其他线程显示地唤醒，在达到一定时间后它们会自动唤醒

> TERMINATED

终止状态

## 线程状态的转换

> NEW --> RUNNABLE  

1. NEW --> RUNNABLE  

> RUNNABLE <--> WAITING  

1. 调用 obj.wait() 方法时  
2. 调用 obj.notify() ， obj.notifyAll() ， t.interrupt()  
3. 当前线程调用 LockSupport.park() 方法会让当前线程从 RUNNABLE --> WAITING  

> RUNNABLE <--> WAITING  

1. 当前线程调用 t.join() 方法时，当前线程从 RUNNABLE --> WAITING  

> RUNNABLE <--> TIMED_WAITING  

1. 当前线程调用 Thread.sleep(long n) ，当前线程从 RUNNABLE --> TIMED_WAITING  

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

# 多线程下的特性

## 可见性

- 问题：我们发现，代码中，并没有按照我们设想，线程暂停下来

```java
static boolean bool = true;
public static void main(String[] args) {
    new Thread(() -> {
        while (bool) {

        }
    }).start();
    sleep(1000);
    log.debug("暂停下来..");
    bool = false;
}
```

- 原因: JIT及时编译器会将bool拉到自己线程私有缓存的空间中（TLAB）,主线程修改的只是主堆空间的数据

解决方案

1. 关键字方式：volatile，可以保证获取bool不从高速缓存中获取

```java
volatile static boolean bool = true;
public static void main(String[] args) {
    new Thread(() -> {
        while (bool) {

        }
    }).start();
    sleep(1000);
    log.debug("暂停下来..");
    bool = false;
}
```

2. synchronized方式

```java
static boolean bool = true;
static Object lock = new Object();
public static void main(String[] args) {
    new Thread(() -> {
        while (true) {
            synchronized (lock) {
                if(!bool) {
                    break;
                }
            }
        }
    }).start();
    sleep(1000);
    log.debug("暂停下来..");
    bool = false;
}
```

### 读写屏障

- 写屏障
  - 保证写屏障之前的变量都同步主内存中
  - 能够保证写屏障之前的代码禁止指令重排

- 读屏障、
  - 保证读屏障之后的变量，都从主内存中读取

## 原子性

- volatile并不能保证原子性，它只保证了一个线程能及时的获取其他线程的值，但是并不能保证线程执行过程中，指令交错的问题
- synchronized能保证代码块的原子性，也同时保证了代码块里面的变量的可见性
- 所以volatile适合一个线程写，多个线程读的情况

## 有序性

- 在代码编译成字节码中，可能会产生指令重排的问题（JIT编译器做的优化）
- 如下可能发生指令重拍，因为不会影响执行结果

```java
int a = 1;
boolean b = true;
```

- volatile 可以禁止指令重排
  - 他可以禁止他之前的代码指令重排

```java
volatile boolean b 

int a = 1;
b = true;
```

## DCL(双端检锁)

- DCL是单例模式的一种方案，如下

```java
class SingletonDemo {
    private SingletonDemo singletonDemo;
    private SingletonDemo() {}
    private SingletonDemo getInstance() {
        if(singletonDemo == null) {
            synchronized (SingletonDemo.class) {
                if(singletonDemo == null) {
                    singletonDemo = new SingletonDemo();
                }
            }
        }
        return singletonDemo;
    }
}
```

- 此时，可能会发生指令重排的风险
- 解决方案：添加volatile

```java
class SingletonDemo {
    private volatile SingletonDemo singletonDemo;
    private SingletonDemo() {}
    private SingletonDemo getInstance() {
        if(singletonDemo == null) {
            synchronized (SingletonDemo.class) {
                if(singletonDemo == null) {
                    singletonDemo = new SingletonDemo();
                }
            }
        }
        return singletonDemo;
    }
}
```



# volatile 是什么

volatile时java虚拟机提供的轻量级的同步机制

- 保证可见性（A工作内存改变了a变量，立马写回主内存，主内存通知其他线程， B工作内存能够立马知道）

代码实例：

```java
public class test1 {
    @Test
    public void test1(){
       Runnable runnable =  new Runnable(){
            public void run() {
                try{
                    Thread.sleep(2000l);
                    System.out.println("改变值");
                }catch (Exception e){
                }
                MyData.isrun=true;
            }
        };
        new Thread(runnable).start();

        while (!MyData.isrun){}
        System.out.println("执行完毕"+ MyData.isrun);
    }
}
class MyData {
    public static boolean isrun=false;
}
```

- 不保证原子性（多个线程对同一个变量操作会导致不可预见结果）
  - 完整性，某个线程在做某业务时，不可分割不允许其他线程来更改我这个线程的值
  - 原因：A 线程更改a++变量，写入主内存，这时，B线程也更改了a++变量，但没有加锁，导致a变两同时被修改，写入主内存，造成写覆盖
  - 解决方案，
  1、加synchronized
  2、使用原子类型的包装类，如整形： public static AtomicInteger i= new AtomicInteger();
- 禁止指令重排
  - 指令重排: 一般情况下，编译器会指令重排，比如定义 int i=1; int x=1;  在编译器编译时，可能会重新排序， int x=1; int i=1；z这样的顺序

> volatile在单例中的应用

DCL(双端检锁)机制不一定时线程安全的，原因时有指令重排的机制；

instance = new SingletonDeme()；在指令中大概分三步

memory = allocate(); // 1 分配对象内存空间

instance(memory); // 2 初始化对象

instance = memory; // 3 为 instance指向刚分配的内存

步骤2 和步骤3 不存在数据依赖的关系，因此存在重排优化是允许的

可能排序成这样

memory = allocate(); // 1 分配对象内存空间

instance = memory; // 3 为 instance指向刚分配的内存，此时 instance！=null 的，但对象还没初始化，如果其他线程来获取instance，就会获取到没有初始化的内存地址，这样时有问题的，所以这时候我们需要加volatile来**禁止指令重排**

instance(memory); // 2 初始化对象