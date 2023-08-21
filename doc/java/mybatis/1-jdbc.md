# 原生的Jdbc

# 步骤

```java
Connection connection = null;
Statement statement = null;
ResultSet resultSet = null;
try {
    Class.forName("com.mysql.jdbc.Driver");
    connection = DriverManager.getConnection(url, username, password);
    statement = connection.createStatement();
    resultSet = statement.executeQuery(sql);
    while (resultSet.next()) {
        System.out.println(resultSet.getString(1)+" "
                +resultSet.getString(2));
    }
} finally {
    resultSet.close();
    statement.close();
    connection.close();
}
```

> 1. 加载JDBC驱动程序

*为啥要执行 Class.forName("com.mysql.jdbc.Driver");*

1. 查看Driver源码，得知他只是为了将Driver加载jvm中，执行静态代码块

```java
static {
    try {
        java.sql.DriverManager.registerDriver(new Driver());
    } catch (SQLException E) {
        throw new RuntimeException("Can't register driver!");
    }
}
```

2. ps:JDK不负责和数据库连接打交道，也没必要，只提供一个具体的接口Driver，告诉所有第三方，要连接数据库，就去实现这个接口，然后通过DriverManager注册一下，到时候连接某个数据库的时候，你已经在我这里注册了，我会调用你注册进来的Driver里面的方法去对指定数据库进行连接的。然后Mysql就实现自己的Driver，Oracle就实现自己的Driver，通过static块注册一下，再然后，就没有然后了

> 2. 创建数据库的连接 

*有两种获取数据库连接的方式*

1. DriverManager获取连接
2. DataSource数据源方式获取连接

> 3. 创建一个preparedStatement

要执行SQL语句，必须获得java.sql.Statement实例，Statement实例分为以下3 种类型：    
    1、执行静态SQL语句。通常通过Statement实例实现。    
    2、执行动态SQL语句。通常通过PreparedStatement实例实现。    
    3、执行数据库存储过程。通常通过CallableStatement实例实现。  

> 4. 执行SQL语句 ， Statement接口提供了三种执行SQL语句的方法：executeQuery 、executeUpdate和execute
> 5. 遍历结果集
> 6. 处理异常，关闭JDBC对象资源  

# 原生jdbc存在问题

> 1. 数据库配置信息存在硬编码问题
> 2. 频繁创建释放数据库连接
> 3. .sql语句、设置参数、获取结果集参数均存在硬编码问题
> 4. 手动封装返回结果集，较为繁琐