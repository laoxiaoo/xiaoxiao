

# 自定义持久层

## 思路

> 使用端

1. sqlMapConfg.xml:存放数据库配置信息
2. mapper.xml :存放sql配置信息

> 框架本身

1. 加载配置文件的类
2. 创建两个JavaBean
   1. Confguration:核心配置类:存放sqlMapConfg.xml解析出来的内容
   2. MappedStatement:映射配置类:存放mapper.xml解析出来的内容
3. 解析配置文件
   1. 创建类:SqlSessionFactoryBuilder方法:build(InputSteam in)
   2. 第一:使用dom4j解析配置文件，将解析出来的内容封装到容器对象中
   3. 第二︰创建SqlSessionFactory对象;生产sqISession :会话对象（工厂模式)
