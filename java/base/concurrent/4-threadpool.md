# 自定义连接池

## 分析

1. 连接池是享元模式的提现
2. 定义一个连接池Pool
   1. 拥有连接池大小定义
   2. 连接对象的数组

# 自定义线程池

## 分析

> 阻塞队列：线程池可能一下子有很多任务，也可能任务很少，这个任务丢给线程则需要阻塞队列来进行平衡

1. 队列的存储数组
2. 锁（如果有多个线程，那么肯定只能有一个线程来获取头部的任务，则这个时候需要一把锁）
3. 生产者条件变量和消费者条件变量（如果线程池工作满了，则消费者阻塞，如果队列满了，则生产者阻塞）
4. 容量上限（队列的容量上限）

> 线程池主类：

1. 任务队列：用于存储待执行的线程
2. 线程集合：使用set集合，用于存储work（正在工作的线程集合）
3. 核心线程数
4. 超时时间：超过这个时间没有使用这个线程就停掉这个线程

> > 线程池主类方法

1. execute方法：接收runable参数，提交给work对象执行/加入任务队列暂存任务

> work类设计

1. 定义一个class继承Thread，这里这个Thread是用于线程的start执行
2. 定义一个属性Runable，这里是用于接收线程的参数，到时直接调用run方法，不会直接作为多线程执行

## 代码部分

```java
public class MyThreadPool {

    //存储待执行的线程
    private Queue<Runnable> queue;
    //存储正在工作的线程
    private Set<Worker> workers = new HashSet<>();
    //核心线程大小
    private int coreSize;

    public MyThreadPool(int coreSize, int queueSize) {
        queue = new ArrayBlockingQueue<Runnable>(queueSize);
        this.coreSize = coreSize;
    }

    public void execute(Runnable task) {
        synchronized (workers) {
            if(workers.size() < coreSize) {
                //当核心线程没满，交给work对象执行线程任务
                Worker worker = new Worker(task);
                workers.add(worker);
                worker.start();
            } else {
                queue.add(task);
            }
        }
    }

    class Worker extends Thread {
        private Runnable task;
        public Worker(Runnable task) {
            this.task = task;
        }
        @Override
        public void run() {
            //当任务不为空，则执行当前任务，任务为空，则从队列获取任务
            while (task != null || (task = queue.poll()) != null ) {
                try {
                    task.run();
                    task = null;
                }catch (Exception e) {

                }
            }
        }
    }
}
```
