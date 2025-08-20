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