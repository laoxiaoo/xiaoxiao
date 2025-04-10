#
# 简介

- CAS的全称compare-and-Swap(比较并交换 ), 是一条cpu的并发原语（原语的执行必须时连续的，在执行过程不允许被中断，只有等原语操作完成，别人才有机会去获取或执行） 
- 当设置值的时候，expect值与主内存对比，如果不一样，则会返回失败，并设置失败 

```java
class CASDemo {
    public static void compareAndSet() {       
        AtomicInteger atomicInteger = new AtomicInteger(5);
         //某个线程从主内存拿到5，赋值到自己的工作内存中
        //在刷回主内存的时候，与主内存中的值匹配，如果=5，将值该成20
        System.out.println(atomicInteger.compareAndSet(5,20)+ " " + atomicInteger.get());
        System.out.println(atomicInteger.compareAndSet(5,21)+ " " + atomicInteger.get());
        //输出结果:因为第二个进行匹配时，
        //主内存值已经时20了， 所以不进行替换
        //true 20           false 20
    }
}
```

- cas的操作，需要volatile的支持 
- 如：他的值是用volatile修饰的 

```java
public class AtomicInteger extends Number implements java.io.Serializable {
    private volatile int value;
```

- 为什么无锁的情况下，反而比synchronized要快 
  - 无锁情况下，即使重试失败，线程始终在高速运行，没有停歇，而synchronized会让线程在没有获得锁的时候，发生上下文切换，进入阻塞。 
  - 但是无锁需要cpu性能的支持 

# 特点

1. CAS的全称compare-and-Swap, 是一条cpu的并发原语（原语的执行必须时连续的，在执行过程不允许被中断，只有等原语操作完成，别人才有机会去获取或执行）
2. CAS 是基于乐观锁的思想：最乐观的估计，不怕别的线程来修改共享变量，就算改了也没关系，我吃亏点再重试呗。  
3. synchronized 是基于悲观锁的思想：最悲观的估计，得防着其它线程来修改共享变量，我上了锁你们都别想改，我改完了解开锁，你们才有机会  

# 原子类
## 原子整数
J.U.C 并发包提供了： 
- AtomicBoolean
- AtomicInteger
- AtomicLong  

1. 增加和修改api
```java
AtomicInteger integer = new AtomicInteger(5);
//相当于++i  先计算后获取
integer.incrementAndGet();
//相当于 i++
integer.getAndIncrement();
//先获取，再添加5
integer.getAndAdd(5);
```

2. 复杂运算
   1. 在函数体里做复杂的计算

```java
integer.updateAndGet(x -> x * 10)
```

## 原子引用

- AtomicReference
- AtomicMarkableReference
- AtomicStampedReference  

1. 基本api
   1. 构造原子引用

```java
AtomicReference<BigDecimal> ref = new AtomicReference<>(new BigDecimal("10"));
while (true) {
    BigDecimal expect = ref.get();
    BigDecimal update = expect.subtract(new BigDecimal(5));
    if(ref.compareAndSet(expect, update)) {
        break;
    }
}
log.debug("获取减去的值：{}", ref.get());
```

## ABA问题

- 原子引用会导致ABA问题
- 什么是ABA 问题： 加入主内存有值A， T1和T2线程同时获取在自己的工作内存，T1执行修改4s，t2 时间2s，这时 t2将主内存值改为B，t1线程还没操作完，然后t2将值又该成A，这个时候t1执行，发现值还是A，则以为内存中的值没人动过，将其改成C。t1 的  CAS操作是成功的，但并不代表，这个过程没有问题

```java
AtomicReference<String> ref = new AtomicReference<>("A");
String a = ref.get();
new Thread(() -> {
    //中间有线程修改了它
    ref.compareAndSet("A", "B");
    ref.compareAndSet("B", "A");
}).start();
sleep(1000);
//最终此处还是输出：true 
log.debug("A->C : {}", ref.compareAndSet(a, "C"));
```

- 解决ABA问题可以带上版本号，如下：

```java
AtomicStampedReference<String> ref = new AtomicStampedReference<>("A", 0);
String a = ref.getReference();
int stamp = ref.getStamp();
new Thread(() -> {
    //每一次的修改都带上版本号
    ref.compareAndSet("A", "B",stamp,  stamp+1);
    ref.compareAndSet("B", "A", stamp, stamp+1);
}).start();
sleep(1000);
log.debug("A->C : {}", ref.compareAndSet(a, "C", stamp, stamp+1));
```

- 有的时候，最终交换只关心是否更改过值， 此时可以采用boolean来进行代替

```java
AtomicMarkableReference<String> ref = new AtomicMarkableReference<>("A", true);
String a = ref.getReference();
new Thread(() -> {
    ref.compareAndSet("A", "B", true, false);
}).start();
sleep(1000);
//此时发现标记已更改，则返回false
log.debug("A->C : {}", ref.compareAndSet(a, "C", true, false));
```

## 原子数组

- AtomicIntegerArray
- AtomicLongArray
- AtomicReferenceArray  

它保护的是数组中的元素


## 字段更新器

保护的是字段的安全

AtomicReferenceFieldUpdater // 域 字段
AtomicIntegerFieldUpdater
AtomicLongFieldUpdater  

- 注意修改的字段，必须是public volatile修饰的

```java
public static void testField() {
    //修改的类的类型， 字段类型，  字段名称
    AtomicReferenceFieldUpdater<Student, String> 
        fieldUpdater = 
        AtomicReferenceFieldUpdater.newUpdater(Student.class, String.class, "name");
    Student student = new Student();
    fieldUpdater.compareAndSet(student, null, "张三");
    log.debug("修改后的值： {}", student);
}

@ToString
static class Student {
    public volatile String name;
}
```

## 原子累加器

对一个数字，进行累加

- 这个比atomicLong 更快

```java
LongAdder adder = new LongAdder();
adder.increment();
log.debug("获取结果：{}", adder.longValue());
```
