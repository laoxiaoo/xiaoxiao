# 架构图

## 总体架构

![](image/2022618105503.jpeg)



## 执行顺序

![image-20220618110856530](image/2-architecture/image-20220618110856530.png)

1. *SqlSession*：作为MyBatis工作的主要顶层API，表示和数据库交互的会话，完成必要数据库增删改查功能
2. *Executor*：MyBatis执行器，是MyBatis 调度的核心，负责SQL语句的生成和查询缓存的维护
3. *StatementHandler*：封装了JDBC Statement操作，负责对JDBC statement 的操作，如设置参数、将Statement结果集转换成List集合
4. *ParameterHandler*：负责对用户传递的参数转换成JDBC Statement 所需要的参数
5. *ResultSetHandler*：负责将JDBC返回的ResultSet结果集对象转换成List类型的集合
6. *TypeHandler*： 
7. *MappedStatement*：MappedStatement维护了一条<select|update|delete|insert>节点的封装
8. *SqlSource*：负责根据用户传递的parameterObject，动态地生成SQL语句，将信息封装到BoundSql对象中，并返回
9. *BoundSql*：表示动态生成的SQL语句以及相应的参数信息
10. *Configuration*：MyBatis所有的配置信息都维持在Configuration对象之中
