# 基础

## 线程的三大特性

1. 原子性

每一个线程，都有自己的内核内存

2. 可见性(volatile)

同一个jvm线程，共享堆内存

栈内存是代码片段中局部内存的存储空间

3. 有序性

虚拟机在进行代码编译时，对于那些改变顺序之后不会对最终结果造大影响的代，虚拟机不一定会按照我们写的代码的顺序来执行，有可能将他们重排序。实际上，对于有些代码行重排序之右，虽然对变量的值没有造成影响，但有可能会出现线程安全问题。

## 主线程和守护线程

- 正常情况下，Java会等待所有线程结束，程序才会结束
- 特殊情况：守护线程不管有没有结束，主线程结束，都会强制结束
- 垃圾回收线程就是常见的守护线程

## 线程状态

### 从API层面

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

### 线程状态的转换

> NEW --> RUNNABLEsNEW --> RUNNABLE

> RUNNABLE <--> WAITING

1. 调用 obj.wait() 方法时
2. 调用 obj.notify() ， obj.notifyAll() ， t.interrupt()
3. 当前线程调用 LockSupport.park() 方法会让当前线程从 RUNNABLE --> WAITING

> RUNNABLE <--> WAITING

1. 当前线程调用 t.join() 方法时，当前线程从 RUNNABLE --> WAITING

> RUNNABLE <--> TIMED_WAITING

1. 当前线程调用 Thread.sleep(long n) ，当前线程从 RUNNABLE --> TIMED_WAITING
