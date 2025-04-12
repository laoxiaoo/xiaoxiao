

# 索引

## 分类

InnoDB

- 主键索引
  - 设定为主键后数据库会自动建立索引,innodb为聚簇索引
- 单值索引
  - 即一个素引只包含单个列,一个表可以有多个单列索引
- 唯一索引
  - 索引列的值必须唯一，但允许有空值（只能存在一个null）
- 复合索引
  - 即一个素引包含多个列
  - 常用于多个值查询

MYISAM

- 全文索引（FULL TEXT）
  - 全文索引类型为FULLTEXT，在定义索引的列上支持值的全文查找，允许在这些索引列中插入重复值和空值。全文索引可以在CHAR、VARCHAR,TEXT上创建

## 创建

- 查看一个表的索引

```mysql
show index from t_user;
```

- 建表后创建

```mysql
create index idx_st_sname on students(sname); ##创建普通索引
##或者alter方式
Alter table ... add INDEX 索引名称(字段, 字段);

create index idx_st_union on students(sname,sex); ##创建复合索引
create unique index idx_st_sid on students(sid); ##创建唯一索引
```

- 建表前创建

```mysql
create table t_user (id int primary key, name varchar(50), key(name));

create table t_user (id int primary key, name varchar(50), unique(name));
```

# 索引原理

- innodb采用的是B+树
- 如果查普通索引，先会去普通索引上查（普通索引的data存储的是主键id）, 查到主键id后，再去主键索引（聚合索引）上查询数据

### B-树

- 非叶子节点也存储数据

![](https://gitee.com/xiaojihao/pubImage/raw/master/image/spring/20210702112453.jpg)

### B+树理解

- 是*二叉查找树的改良版本*

![](https://gitee.com/xiaojihao/pubImage/raw/master/image/spring/20210702111418.jpg)

- 每页相当于上图的一个磁盘块
- InnoDB存储引擎中页的大小为16KB（操作系统的预读一页是4K，所以存储引擎的页大小应该是4k的整数倍），一般表的主键类型为INT（占用4个字节）或BIGINT（占用8个字节），指针类型也一般为4或8个字节，也就是说一个页（B+Tree中的一个节点）中大概存储16KB/(8B+8B)=1K个键值（因为是估值，为方便计算，这里的K取值为〖10〗^3）。也就是说一个深度为3的B+Tree索引可以维护10^3 * 10^3 * 10^3 = 10亿 条记录。

### 为什么要选择B+

- 磁盘预读：每次读取数据，磁盘都是将一块数据进行返回（也称为页），所以将数据放到节点会使得一页存储的数据减少（我们每次比对，只需要比对key）
- 如果将数据存储在非叶子节点，那么会造成树的层级增加，增加了磁盘IO

### B+与B-树的区别

- 非叶子节点只存储键值信息。
- 所有叶子节点之间都有一个链指针。
- 数据记录都存放在叶子节点中。

### 聚簇索引与非聚簇索引

- 聚集索引与非聚集索引的区别是：叶节点是否存放一整行记录
- InnoDB 主键使用的是聚簇索引和辅助索引，MyISAM 不管是主键索引，还是二级索引使用的都是非聚簇索引。
  下图形象说明了聚簇索引表(InnoDB)和非聚簇索引(MyISAM)的区别：

![](https://gitee.com/xiaojihao/pubImage/raw/master/image/spring/20210702113122.png)

innodb中：

- InnoDB使用的是聚簇索引，将主键组织到一棵B+树中，而行数据就储存在叶子节点上，若使用"where id= 14"这样的条件查找主键，则按照B+树的检索算法即可查找到对应的叶节点，之后获得行数据。
- 若对Name列进行条件搜索，则需要两个步骤:第一步在辅助索引B+树中检索Name，到达其叶子节点获取对应的主键。第二步使用主糖在主索引B+树种再执行一次B+树检索操作，最终到达叶子节点即可获取整行数据。(重点在于通过其他键需要建立辅助索引)
- 聚簇索引默认是主键，如果表中没有定义主键，InnoDB会选择一个唯一且非空的索引代替。如果没有这样的索引，InnoDB会隐式定义一个主键(类似oracle中的Rowld)来作为聚簇索引。如果已经设置了主键为聚簇索引又希望再单独设置聚簇索引，必须先刑除主键，然后添加我们想要的聚簇索引，最后恢复设置主键即可。

MYISAM中:

- 索引和数据是分开的

## 为什么主键通常建议使用自增id

聚簇索引的据的物理存放你序与索引顺序是一致的，即:只要索引是相邻的，那么对应的擞据一定也是相邻地存放在磁盘上的。如果主键不是自增id，那么可以想象，它会干些什么，**不断地调整数据的物理地址、分页**，当然也有其他一些措施来减少这些操作，但却无法彻底避免。但，如果是自增的，那就简单了，它只需要一页一页地写，索引结构相对紧凑，磁盘碎片均效率也高。

## 聚簇索引一定会是主键？

在 InnoDB 中，聚集索引不一定是主键，但是主键一定是聚集索引：原因是如果没有定义主键，聚集索引可能是第一个不允许为 null 的唯一索引，如果也没有这样的唯一索引，InnoDB 会选择内置 6 字节长的 ROWID 作为隐含的聚集索引。

## 什么情况下无法利用索引呢?

- 在查询语句中使用LIKE关键字进行查询时，如果匹配字符串的第一个字符为"%”，索引不会被使用。如果"%"不是在第一个位围，索引就会被使用。
  - 如果使用两个%% 可以使用覆盖索引，如： select phone from user where phone like '%56456%'

> 多列索引是在表的多个字段上创建一个索引，只有查询条件中使用了这些字段中的第一个字段，索引才会被使用。
- 如 索引是：name age sex  , 查询的时候 使用了name 就可以使用索引（最左原则）
- 如： age sex 无法使用索引，  age sex name  可以使用

> > 原理

左边的key是有序的排列在树结构上的

右边的只有在a相等的情况下，b才有序的

![image-20210708102059747](https://gitee.com/xiaojihao/pubImage/raw/master/image/spring/20210708102059.png)

- 查询语句只有OR关键字时，如果OR前后的两个条件的列都是索引，那么查询中将使用索引。**如果OR前后有一个条件的列不是索引，那么查询中将不使用索引**。
- 多列索引，左边使用了范围查询 如：   where  name=''  and age>10 and sex=0  (age索引在sex索引左边)
- 计算，如: +、-、*、/、!=、<>、is null、 is not null、or
- 函数，如: sum(）、 round(）等等
- 手动/自动类型转换，如: id = "1"，本来是数字，给写成字符串了

## hash索引

- mysql 的memory引擎使用hash索引
- InnoDB 引擎有一个特殊的功能叫做“自适应哈希索引。当InnoDB注意到某些索引值被使用得非常频繁时 ，它会在内存中基于 B - Tree 索引之上再创建一个哈希索引，这样就让 B-Tree 索引 也具有哈希索引的一些优点， 比如快速的哈希查找。这是一个完全自动的、内部的行为，用户无战控制或者配置，不过如果有必要，完全可以关闭该功能。

> 为什么不选择hash作为innodb索引

1. hash会有碰撞问题，比如说：很多值计算hash之后，都占用了一个index，那么会导致这个index的链表过长
2. 利用hash存储的话需要将所有的数据文件添加到内存，比较耗费内存空间
3. hash更加适合等值计算

## 索引下推

执行下列sql

```sql
SELECT * from user where  name like '陈%' and age=20
```

> 没有索引下推：

会忽略age这个字段，直接通过name进行查询，然后拿着取到的id值一次次的回表查询

> 有索引下推：

InnoDB并没有忽略age这个字段，而是在索引内部就判断了age是否等于20，对于不等于20的记录直接跳过，因此在(name,age)这棵索引树中只匹配到了一个记录，此时拿着这个id去主键索引树中回表查询全部数据，这个过程只需要回表一次。

## MRR

- 全称「Multi-Range Read Optimization」
- MRR 通过把「随机磁盘读」，转化为「顺序磁盘读」，从而提高了索引查询的性能

> 使用MRR

```sql
mysql > set optimizer_switch='mrr=on';
Query OK, 0 rows affected (0.06 sec)

mysql > explain select * from stu where age between 10 and 20;
+----+-------------+-------+-------+------+---------+------+------+----------------+
| id | select_type | table | type  | key  | key_len | ref  | rows | Extra          |
+----+-------------+-------+-------+------+---------+------+------+----------------+
|  1 | SIMPLE      | tbl   | range | age  |    5    | NULL |  960 | ...; Using MRR |
+----+-------------+-------+-------+------+---------+------+------+----------------+
```

- 我们开启了 MRR，重新执行 sql 语句，发现 Extra 里多了一个「Using MRR」

**对于 Myisam，在去磁盘获取完整数据之前，会先按照 rowid 排好序，再去顺序的读取磁盘。**

**对于 Innodb，则会按照聚簇索引键值排好序，再顺序的读取聚簇索引。**

> 顺序读带来了几个好处

1. 磁盘和磁头不再需要来回做机械运动；
2. 可以充分利用磁盘预读

btree索引的存储是有序的，所以访问索引是顺序io，而通过索引访问数据时确实是随机的


# InnoDb和MyIsam区别

1. InnoDB支持事务，MyISAM不支持事务。这是MSQL将默认存储引擎从MylSAM变成InnoDB的重要原因之一。
2. InnoDB支持外键，而MylSAM不支持。对一个包含外键的InnoDB表转为MYISAM会失败。
3. InnoDB是聚集（聚簇)索引，plylSAM是非聚集(非聚簇）索引.
4. MylSAM支持FULLTEXT类型的全文索引,
5. lnnoDB最小的锁粒度是`行锁`，MylSAM最小的锁粒度是`表锁`。

# 锁的类型

> 表锁和行锁

mysql  如果以索引为条件进行操作的话，则是行锁

如果**索引失效**,则会由行锁上升到表锁

> 间隙锁

如果我在索引列插入： 1,3,5,6,7这些数据

然后我们查找范围： where  id>=1  and id<=7

这个时候，数据库会将 1-7的数据锁上，这时我们插入id=2的数据是插入不了的，因为已经产生了间隙锁

> 获取数据库锁的次数信息

```sql
show status like "innodb_row_locks%";
```

# 性能分析Explain

- 我们常常用到explain这个命令来查看一个这些SQL语句的执行计划

```sql
-- 实际SQL，查找用户名为Jefabc的员工
select * from emp where name = 'Jefabc';
-- 查看SQL是否使用索引，前面加上explain即可
explain select * from emp where name = 'Jefabc';
```



> 描述

id:选择标识符
select_type:表示查询的类型。
table:输出结果集的表
partitions:匹配的分区
type:表示表的连接类型
possible_keys:表示查询时，可能使用的索引
key:表示实际使用的索引
key_len:索引字段的长度
ref:列与索引的比较
rows:扫描出的行数(估算的行数)
filtered:按表条件过滤的行百分比
Extra:执行情况的描述和说明
