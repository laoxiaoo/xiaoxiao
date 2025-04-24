# 

# 什么是微服务

将单一的应用程序化成小的服务模块，每个服务模块都是独立的进程

将业务区分，分为一个个服务模块，每一个小服务可以拥有自己的数据库，它强调的时个体

# 微服务架构

个个微服务直接相互调用，形成一个架构，它强调的时整体

# dubble与cloud的区别

dubble是基于rpc远程调用，cloud时基于restful的

# 微服务的优缺点

## 优点

- 服务足够小

- 代码易于理解

- 开发效率高，一个服务只做一个事

- 有利于解耦

- 微服务能用不同语言开发 

- 微服务可以有自己的数据库，也可以由统一的数据库

## 缺点
- 增加了运维成本
- 使整体的服务变复杂

# SpringCloud是什么

SpringCloud=分布式微服务架构下的一站式解决方案，
是各个微服务架构落地技术的集合体，俗称微服务全家桶

# CAP 理论


在分布式系统领域有个著名的CAP定理

1. C-数据一致性；
2. A-服务可用性；
3. P-服务对网络分区故障的容错性(单台服务器，或多台服务器出问题（主要是网络问题）后，正常服务的服务器依然能正常提供服务)，这三个特性在任何分布式系统中不能同时满足，最多同时满足两个）

![](./image/1.png)

**CAP理论也就是说在分布式存储系统中，最多只能实现以上两点。而由于当前网络延迟故障会导致丢包等问题，所以我们分区容错性是必须实现的。也就是NoSqL数据库P肯定要有，我们只能在一致性和可用性中进行选择，没有Nosql数据库能同时保证三点。（==>AP 或者 CP）**

## 一般应用遵循的原则

RDBMS==>（MySql,Oracle,SqlServer等关系型数据库）遵循的原则是：ACID原则（A：原子性。C：一致性。I：独立性。D：持久性。）。

NoSql==>   （redis,Mogodb等非关系型数据库）遵循的原则是：CAP原则（C：强一致性。A:可用性。P：分区容错性）。



一般来说 p 是必须满足的，然后我们只能在c和a之间做选择

如在大型网站中，选择的时AP原则，因为服务不能挂，挂了就是很严重的灾难性事故



# 建立公共模块-api

## 建立实体bean

**Lombok**

Lombok能以简单的注解形式来简化java代码，提高开发人员的开发效率。例如开发中经常需要写的javabean

引入jar包

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

```java
public class TUser {
    @Getter
    @Setter
    private String id;
    @Getter
    @Setter
    private String username;
}
```

## 搭建基础环境

这个是微服务提供者（mybatis+controller）：dept-8001

## 新建微服务消费者 

建立微服务 dept-80

配置config

```java
@Configuration
public class ConfigBean {

    @Bean
    public RestTemplate getRestTemplate(){
        //RestTemplate提供了多种便捷访问远程Http服务的方法
        return new RestTemplate();
    }
}
```

### 使用RestTemplate

RestTemplate提供了多种便捷访问远程Http服务的方法， 
是一种简单便捷的访问restful服务模板类，是Spring提供的用于访问Rest服务的客户端模板工具集

```java
@RestController
public class UserController {
    @Autowired
    private RestTemplate restTemplate;
    private final String url = "http://localhost:8001";

    @GetMapping("getUser")
    public List getUser(){
        return restTemplate.getForObject(url+"/getUser",List.class);
    }
}
```