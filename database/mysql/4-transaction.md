# 事务

## 事务概念  

### 原子性（ atomicity)  

原子性的体现在于回滚，innodb操作会产生undo log 文件，记录sql的数据信息

1. 一效性 （ consistency)  
   1. 是数据库追求的最终目标，也就是说数据操作后的状态要是合法的
2. 隔离性（ isolation)  
   1. 写-写：锁方式
   2. 写-读：MVCC

### 持久性（ durability)  

- 指的是事务一旦提交，对数据库的改变就是永久性的

- mysql在查询过程中，会去先查询buffer(一部分数据的缓冲)， 修改数据时，有些数据也会先写入缓冲，再由缓冲写入磁盘io

  - 问题：如果缓冲写入io时，mysql挂了，则数据就可能丢了
  - 这时就引入了redo log概念

  > redo log

  - 修改数据时，有些数据也会先写入缓冲, 并且写入redo log中，再由缓冲写入磁盘io
  - redo log 的数据是append的方式，磁盘也是顺序写入的，所以快

  

## 隔离级别  

### READ UNCOMMITIED （未提交读）  

- 可能出现**脏读**的情况

```tex
在 Read UNCOMMITIED 级别，事务中的修改，即使没有提交，对其他事务也都是可见的。
事务可以读取未提交的数据，这也被称为脏读（Dirty Read ）。这个级别会导致很多问题，
从性能上来说， READ UNCOMMITIED 不会比其他的级别好太多，但却缺乏
其他级别的很多好处，除非真的有非常必要的理由，在实际应用中一般很少使用。
```

### READ COMMITIED （提交读）

- 避免了脏读，但是可能出现**不可重复读**(在同一个事务中执行相同的sql语句，查询到的结果是不同的)
- 读的数据是最新版本

```tex
大多数数据库系统的默认隔离级别都是 READ COMMITTED （但Mysql不是）。
一个事务开始时 ，只能“看见”已经提交的事务所做的修改。
该隔离级别避免了脏读，但是可能出现不可重复读。事务A事先读取了数据，
事务B紧接着更新了数据，并提交了事务，而事务A再次读取该数据时，数据已经发生了改变
```

### Repeatable read(可重复读取)

- 这样避免了不可重复读和脏读
- 但是有时可能会出现**幻读**
- 可重复读主要是针对已经存在的数据(读的数据是事务开启前的版本)

```tex
在一个事务内，多次读同一个数据，在这个事务还没结束时，
其他事务不能访问该数据(包括了读写)，
这样就可以在同一个事务内两次读到的数据是一样的
```

### Serializable(可串行化 )

```tex
提供严格的事务隔离，它要求事务序列化执行，事务只能一个接着一个地执行，但不能并发执行
```

## 脏读

脏读指的是读到了其他事务未提交的数据

## 不可重复读

不可重复读指的是在一个事务内，最开始读到的数据和事务结束前的任意时刻读到的同一批数据出现不一致的情况。

## 幻读

innodb的默认隔离级别是可重复读

```
事务 A 根据条件查询得到了 N 条数据，
但此时事务 B 删除或者增加了 M 条符合事务 A 查询条件的数据，
这样当事务 A 再次进行查询的时候真实的数据集已经发生了变化，
但是A却查询不出来这种变化，因此产生了幻读。
```

# 分布式事务

## 二阶段提交（2PC）





# Spring事务处理

## TransactionTemplate

比注解更加细粒度的事务控制

```java
@Autowired
private TransactionTemplate transactionTemplate;

public void execute() {
    transactionTemplate.execute(transactionStatus -> {
        try {

        } catch (Exception e) {
           // 异常手动设置回滚
           transactionStatus.setRollbackOnly();
        }
        return true;
    });
}
```

## 事务提交后执行

```java
TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
    @Override
    public void afterCommit() {
        try {
            //执行事物提交后的一些方法，可以是发送mq等一些
        } catch (Exception e) {

        }
    }
});
```