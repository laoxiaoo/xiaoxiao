# 

从MySQL 5.5版本开始默认使用InnoDB作为引擎，它擅长处理事务，具有自动崩溃恢复的特性

# 存储结构

如下图：由内存模块和磁盘模块构成

- 左边表示内存模块
- 右边表示磁盘模块



![image-20250723224129433](image/2-innodb/image-20250723224129433.png)

## Buffer pool

缓冲池，简称BP。BP以Page页为单位，默认大小16K，BP的底层采用链表数据结构管理Page；在InnoDB访问表记录和索引时会在Page页中缓存，以后使用可以减少磁盘IO操作，提升效率；

图中的小方块表示的就是每一个page

## Change Buffer

Change Buffer是针对操作二级索引（非聚簇索引） 的一个优化，针对DML（增改）的一个优化

1. 如果是操作的是二级索引，对应的数据没有在Buffer Pool中，那么不会立刻写到Buffer Pool中，会写入Change Buffer中做一个缓冲；等到后面，被修改的数据被读取的时候，那么将会把Change Buffer里面的数据合并到Buffer Pool中，这样可以减少磁盘IO次数，提高性能；
2. 如果是一级索引，那么不会触发Change Buffer，直接在Buffer Pool中进行修改