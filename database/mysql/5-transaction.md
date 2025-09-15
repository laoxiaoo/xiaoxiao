# 事务

## 事务概念  

### 原子性（ atomicity)  

原子性的体现在于回滚，innodb操作会产生undo log 文件，记录sql的数据信息

数据写入流程：

新增->Buffer Pool 记录 -> 刷盘

可能会出现一下情况

1. 事务提交了，此时Buffer Pool 没有刷盘，怎么保证数据生效
   1. 刷盘没有成功，数据库挂了，此时可以通过Redo Log进行恢复，保证写的数据不会丢失
2. 事务没有提交，Buffer Pool 刷盘了，怎么保证这条数据撤销
   1. 数据刷盘了，可以通过undo Log 来进行数据回滚

### 一致性 （ consistency)  

1. 是数据库追求的最终目标，也就是说数据操作后的状态要是合法的

### 隔离性（ isolation)  

指一个事务的执行，不受其他事务的干扰

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

  

# 隔离级别  

针对的是innodb引擎

## 读未提交

<b id="blue">READ UNCOMMITIED  </b>

- 可能出现**脏读**的情况
- <b id="gray">脏读</b>：在 Read UNCOMMITIED 级别，事务中的修改，即使没有提交，对其他事务也都是可见的。
  事务可以读取未提交的数据，这也被称为脏读（Dirty Read ）

## 提交读

<b id="blue">READ COMMITIED </b>

- 避免了脏读，但是可能出现**不可重复读**
- 读的数据是最新版本
- <b id="gray">不可重复读</b>：在同一个事务中执行相同的sql语句，针对某条数据，查询到的结果是不同的

## 可重复读

<b id="blue">Repeatable read</b>

- 这样避免了不可重复读和脏读
- 但是有时可能会出现**幻读**
- 可重复读主要是针对已经存在的数据(读的数据是事务开启前的版本
- <b id="gray">幻读</b>：查询一定范围的数据，下次查询多出新增行的数据（幻影行）

## 可串行化

<b id="blue">Serializable</b> 

```tex
提供严格的事务隔离，它要求事务序列化执行，事务只能一个接着一个地执行，但不能并发执行
```

MySQL默认隔离级别：可重复读
Oracle、SQLServer默认隔离级别：读已提交

## 查看事务隔离级别



```sql
show variables like '%isolation%';
```

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



# 锁机制

## 锁分类

读锁（S锁）：共享锁，针对同一份数据，多个读操作可以同时进行而不会互相影响。

- S锁：事务A对记录添加了S锁，可以对记录进行读操作，不能做修改，其他事务可以对该记录追加S锁，但是不能追加X锁，需要追加X锁，需要等记录的S锁全部释放。

写锁（X锁）：排他锁，当前写操作没有完成前，它会阻断其他写锁和读锁。

- X锁：事务A对记录添加了X锁，可以对记录进行读和修改操作，其他事务不能对记录做读和修改操作。

IS锁、IX锁：意向读锁、意向写锁，属于表级锁，S和X主要针对行级锁。在对表记录添加S或X锁之前，会先对表添加IS或IX锁。

- 比如：读取一张表的数据，看到有IS锁，就知道，这个表里面有S锁了，相当于在门口挂了一个标识

## 行锁

在InnoDB引擎中，我们可以使用行锁和表锁，其中行锁又分为共享锁和排他锁。InnoDB行锁是通过对索引数据页上的记录加锁实现的，主要实现算法有 3 种：<b id="blue">Record Lock</b>、<b id="blue">Gap Lock</b> 和 <b id="blue">Next-key Lock</b>。

RecordLock锁：锁定单个行记录的锁。（记录锁，RC、RR隔离级别都支持）
GapLock锁：间隙锁，锁定索引记录间隙，确保索引记录的间隙不变。（范围锁，RR隔离级别支持）
Next-key Lock 锁：记录锁和间隙锁组合，同时锁住数据，并且锁住数据前后范围。（记录锁+范围锁，RR隔离级别支持）

## 行锁举例

在RR隔离级别，InnoDB对于记录加锁行为都是先采用Next-Key Lock，但是当SQL操作含有唯一索引时，Innodb会对Next-Key Lock进行优化，降级为RecordLock，仅锁住索引本身而非范围

1. select ... from 语句：InnoDB引擎采用MVCC机制实现非阻塞读，所以对于普通的select语句，InnoDB不加锁
2. select ... from lock in share mode语句：追加了共享锁，InnoDB会使用Next-Key Lock锁进行处理，如果扫描发现唯一索引，可以降级为RecordLock锁。
3. select ... from for update语句：追加了排他锁，InnoDB会使用Next-Key Lock锁进行处理，如果扫描发现唯一索引，可以降级为RecordLock锁。
4. update ... where 语句：InnoDB会使用Next-Key Lock锁进行处理，如果扫描发现唯一索引，可以降级为RecordLock锁。
5. delete ... where 语句：InnoDB会使用Next-Key Lock锁进行处理，如果扫描发现唯一索引，可以降级为RecordLock锁。
6. insert语句：InnoDB会在将要插入的那一行设置一个排他的RecordLock锁。

## 行锁原理

## 非唯一键加锁

比如， name索引为非唯一索引

有数据

6，a

10, b

12,d

15, c

1. update xxx where name in (b, d)
2. 此时，对会加Next-Key Lock锁
   1. id=10, 12 加RecordLock锁
   2. 6-10, 10-12, 12-15, 加上间隙锁

## 无索引加锁

表里所有行和间隙都会加X锁。（当没有索引时，会导致全表锁定，因为InnoDB引擎
锁机制是基于索引实现的记录锁定）。

## 悲观锁

行锁、表锁、读锁、写锁、共享锁、排他锁等，这些都属于悲观锁
范畴。

### 表级索

1. 手动增加表锁

```sql
lock table 表名称 read|write,表名称2 read|write;
```

2. 查看表上加过的锁

```sql
show open tables;
```

3. 删除表锁

```sql
unlock tables;
```

- 表级读锁：当前表追加read锁，当前连接和其他的连接都可以读操作；但是当前连接增删改操作会报错，其他连接增删改会被阻塞
- 表级写锁：当前表追加write锁，当前连接可以对表做增删改查操作，其他连接对该表所有操作都被阻塞（包括查询）。

### 共享锁

行级锁-读锁：

享锁又称为读锁，简称S锁。共享锁就是多个事务对于同一数据可以共享一把锁，都能访问到数据，但是只能读不能修改。使用共享锁的方法是在select ... lock in share mode，只适用查询语句。

### 排他锁

行级锁-写锁：

使用排他锁的方法是在SQL末尾加上for update，innodb引擎默认会在update，delete语句加上for update。行级锁的实现其实是依靠其对应的索引，所以如果操作没用到索引的查询，那么会锁住全表记录。

## 死锁

### 表锁

用户A--》A表（表锁）--》B表（表锁）
用户B--》B表（表锁）--》A表（表锁）

解决方案：

尽量避免同时锁定两个资源，如操作A和B两张表时，总是按先A后B的顺序处理， 必须同时锁定两个资源时，要保证在任何时刻都应该按照相同的顺序来锁定资源

### 共享锁转换为排他锁

事务A: select * from dept where deptno=1 lock in share mode; //共享锁,1
			update dept set dname='java' where deptno=1;//排他锁,3
事务B: update dept set dname='Java' where deptno=1;//由于1有共享锁，没法获取排他锁，需等待，2

频繁的更新，可能出现这种情况

## 排查死锁

show engine innodb status\G命令查看近期死锁日志信息。
使用方法：1、查看近期死锁日志信息；2、使用explain查看下SQL执行计划
