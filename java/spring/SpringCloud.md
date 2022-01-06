# 概念

## 什么是微服务

将单一的应用程序化成小的服务模块，每个服务模块都是独立的进程

将业务区分，分为一个个服务模块，每一个小服务可以拥有自己的数据库，它强调的时个体

## 微服务架构

个个微服务直接相互调用，形成一个架构，它强调的时整体

## dubble与cloud的区别

dubble是基于rpc远程调用，cloud时基于restful的

## 微服务的优缺点

### 优点

- 服务足够小

- 代码易于理解

- 开发效率高，一个服务只做一个事

- 有利于解耦

- 微服务能用不同语言开发 

- 微服务可以有自己的数据库，也可以由统一的数据库

### 缺点
- 增加了运维成本
- 使整体的服务变复杂

## SpringCloud是什么

SpringCloud=分布式微服务架构下的一站式解决方案，
是各个微服务架构落地技术的集合体，俗称微服务全家桶

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

# Eureka服务注册与发现

Spring Cloud 封装了 Netflix 公司开发的 Eureka 模块来实现服务注册和发现(请对比Zookeeper)。

Eureka 采用了 C-S 的设计架构。Eureka Server 作为服务注册功能的服务器，它是服务注册中心。

而系统中的其他微服务，使用 Eureka 的客户端连接到 Eureka Server并维持心跳连接。这样系统的维护人员就可以通过 Eureka Server 来监控系统中各个微服务是否正常运行。SpringCloud 的一些其他模块（比如Zuul）就可以通过 Eureka Server 来发现系统中的其他微服务，并执行相关的逻辑。



Eureka包含两个组件：Eureka Server和Eureka Client
Eureka Server提供服务注册服务
各个节点启动后，会在EurekaServer中进行注册，这样EurekaServer中的服务注册表中将会存储所有可用服务节点的信息，服务节点的信息可以在界面中直观的看到


EurekaClient是一个Java客户端，用于简化Eureka Server的交互，客户端同时也具备一个内置的、使用轮询(round-robin)负载算法的负载均衡器。在应用启动后，将会向Eureka Server发送心跳(默认周期为30秒)。如果Eureka Server在多个心跳周期内没有接收到某个节点的心跳，EurekaServer将会从服务注册表中把这个服务节点移除（默认90秒）

## 三大角色

Eureka Server 提供服务注册和发现

Service Provider服务提供方将自身服务注册到Eureka，从而使服务消费方能够找到

Service Consumer服务消费方从Eureka获取注册服务列表，从而能够消费服务

**EurekaClient:通过注册中心进行访问没如果server多个心跳周期没有收到某个节点，则server会将其从服务注册表移除（默认90秒）**

## 建立eureka服务

新建cloud-eureka-7001服务

引入jar包

```xml
<dependencies>
    <!--eureka-server服务端 -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-eureka-server</artifactId>
    </dependency>
</dependencies>
```

配置文件

```yml
server:
  port: 7001

eureka:
  instance:
    hostname: localhost #eureka服务端的实例名称，后续defaultZone通过这个来关联eureka
  client:
    #false表示不向注册中心注册自己。
    register-with-eureka: false
    #false表示自己端就是注册中心，
    #我的职责就是维护服务实例，并不需要去检索服务
    fetch-registry: false
    service-url:
      #设置与Eureka Server交互的地址查询服务和注册服务都需要依赖这个地址。
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
```

使用EurekaServer开启server

```java
@SpringBootApplication
// EurekaServer服务器端启动类,接受其它微服务注册进来
@EnableEurekaServer
public class Application7001 {
    public static void main(String[] args) {
        SpringApplication.run(Application7001.class,args);
    }
}
```

访问<http://localhost:7001/>

## 微服务注册

微服务注册进eureka服务中心

### 基本信息注册

将cloud-provider-dept-8001注册服务中心

添加依赖

```xml
<!-- 将微服务provider注册进eureka -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-eureka</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

添加配置信息 

```yml
eureka:
  client: #客户端注册进eureka服务列表内
    service-url:
      defaultZone: http://localhost:7001/eureka
```

在启动类添加注解

```java
@SpringBootApplication
@MapperScan("com.xiao.mapper")
//本服务启动后会自动注册进eureka服务中
@EnableEurekaClient
public class Application {
```

测试：

先启动eureka 再启动 被注册的服务

访问：<http://localhost:7001/> 能看到注册信息

| Application | AMIs        | Availability Zones | Status                                                       |
| :---------- | :---------- | :----------------- | :----------------------------------------------------------- |
| **UNKNOWN** | **n/a** (1) | (1)                | **UP** (1) - [192.168.1.101:8001](http://192.168.1.101:8001/info) |

## 添加服务别名（status）

**添加application名称与status别名**

引入包

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

配置文件添加

```yml
spring:
  application:
    name: provider-dept #添加Application名称，可以用与feign和rebbion访问
eureka:
  client: #客户端注册进eureka服务列表内
    service-url:
      defaultZone: http://localhost:7001/eureka
  instance:
    instance-id: provider-dept-8001 #每个微服务提供者这个instance-id都必须不同（Status）
    #访问路径可以显示IP地址
    prefer-ip-address: true
```

结果：

| Application       | AMIs        | Availability Zones | Status                                                       |
| :---------------- | :---------- | :----------------- | :----------------------------------------------------------- |
| **PROVIDER-DEPT** | **n/a** (1) | (1)                | **UP** (1) - [provider-dept-8001](http://192.168.1.101:8001/info) |

## 添加springboot info信息

父工程添加

```xml
<build>
    <finalName>cloudparent</finalName>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
    </resources>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-resources-plugin</artifactId>
            <configuration>
                <delimiters>
                    <delimit>$</delimit>
                </delimiters>
            </configuration>
        </plugin>
    </plugins>
</build>
```

子工程配置，$开始和$结束，在src/main/resources下，就能取到maven配置文件的信息

```yml
info:
  app.name: xiao-microservicecloud
  company.name: www.xiao.com
  build.artifactId: $project.artifactId$
  build.version: $project.version$
```

## eureka自我保护

某时刻某一个微服务不可用了，eureka不会立刻清理，一定时间内（默认90秒）依旧会对该微服务的信息进行保存，这是CAP里面的AP思想

## eureka 的集群

修改host文件映射

127.0.0.1	eureka7001.com
127.0.0.1   eureka7002.com
127.0.0.1   eureka7003.com

新建两个eureka项目

修改yml配置

```yaml
eureka:
  instance:
    #hostname: localhost #eureka服务端的实例名称
     hostname: eureka7001.com #eureka服务端的实例名称
  client:
    #false表示不向注册中心注册自己。
    register-with-eureka: false
    #false表示自己端就是注册中心，
    #我的职责就是维护服务实例，并不需要去检索服务
    fetch-registry: false
    service-url:
      #设置与Eureka Server交互的地址查询服务和注册服务都需要依赖这个地址。
      #defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
      defaultZone: http://eureka7002.com:7002/eureka/,http://eureka7003.com:7003/eureka/
```

修改注册的服务配置

```yaml
eureka:
  client: #客户端注册进eureka服务列表内
    service-url:
      #defaultZone: http://localhost:7001/eureka
      defaultZone: http://eureka7001.com:7001/eureka/,http://eureka7002.com:7002/eureka/,http://eureka7003.com:7003/eureka/
```

访问：<http://eureka7001.com:7001/>能看到集群信息

> Euraka 与zookeeper的区别

 在分布式系统领域有个著名的CAP定理

1. C-数据一致性；

2. A-服务可用性；

3. P-服务对网络分区故障的容错性(单台服务器，或多台服务器出问题（主要是网络问题）后，正常服务的服务器依然能正常提供服务)，这三个特性在任何分布式系统中不能同时满足，最多同时满足两个）

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/SpringCloud/1.png)

**CAP理论也就是说在分布式存储系统中，最多只能实现以上两点。而由于当前网络延迟故障会导致丢包等问题，所以我们分区容错性是必须实现的。也就是NoSqL数据库P肯定要有，我们只能在一致性和可用性中进行选择，没有Nosql数据库能同时保证三点。（==>AP 或者 CP）**



RDBMS==>（MySql,Oracle,SqlServer等关系型数据库）遵循的原则是：ACID原则（A：原子性。C：一致性。I：独立性。D：持久性。）。

NoSql==>    （redis,Mogodb等非关系型数据库）遵循的原则是：CAP原则（C：强一致性。A:可用性。P：分区容错性）。

一般来说 p 是必须满足的，然后我们只能在c和a之间做选择

如在大型网站中，选择的时AP原则，因为服务不能挂，挂了就是很严重的灾难性事故



zookeeper保证的是cp：在向注册中心注册时，zookeeper可以允许几分钟的注册事件，但不能接收服务down掉不可用

，当master接口与其他节点失去联系时，其余节点重新选择leader，但如果选择leader时间太长，选举期间，整个zk集群是不可用的，这时就会导致注册服务瘫痪。

euraka保证的是ap：eureka各个节点平等，只要有一台在，就能保证注册服务，只不过查到的信息可能不是最新的，此外，它还有一种自我保护机制：在15分钟内，85%节点没有正常心跳，则eureka认为客户端与注册中心网络出现故障，则出现以下几点现象

1 不会从注册表移除没有心跳的过期服务

2 任然接受新的注册与查询，但不同步其他节点

3 网络稳定，再同步到其他节点


# Feign负载均衡

Feign是Netflix开发的声明式、模板化的HTTP客户端， Feign可以帮助我们更快捷、优雅地调用HTTP API。

在Spring Cloud中，使用Feign非常简单——创建一个接口，并在接口上添加一些注解，代码就完成了



## 简单部署

建立一个apimaven包，专门用于写feign的接口

pom文件

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-feign</artifactId>
</dependency>
```

建立一个接口，之后，comsumer端就可以通过这个接口访问打provide端了

```java
@FeignClient(value = "PROVIDER-DEPT") //指定provide的注册服务
public interface DeptClientService {
    //方法名和value得与服务端提供的相同
    @RequestMapping(value="getUser", method = RequestMethod.GET)
    public TUser getUser();
}
```

新建一个80端口的comsumer端

pom的配置

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-feign</artifactId>
    </dependency>
</dependencies>
```

配置文件和以前的comsumer一样

建立control类

```java
@RestController
public class UserController {
    @Autowired //只需要引用feign的接口了
    private DeptClientService deptClientService;
    
    @GetMapping("getUser")
    public TUser getUser(){
        return deptClientService.getUser();
    }
}
```

启动类需要@EnableFeignClients来开启feign

```java
@SpringBootApplication
@EnableFeignClients
@EnableEurekaClient
public class DepFeignApplication80 {
    public static void main(String[] args) {
        SpringApplication.run(DepFeignApplication80.class, args);
    }
}
```

# OpenFeign

## 基本使用

> 直连的方式

1. 引入openfeign的jar包

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

2. 编写启动类

```java
@SpringBootApplication
@EnableFeignClients
public class OrderApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderApplication.class, args);
    }

}
```

3. 在服务端编写一个模拟的接口（获取用户的接口）

```java
@RestController
@RequestMapping("/user")
@Slf4j
public class UserController {
    @GetMapping("/get")
    public UserVO getUser(Long userId) {
        log.debug("接收到请求：{}", userId);
        return new UserVO("张三", 20);
    }
}
```

4. 编写消费端的openfeign代码

```java
@Component
@FeignClient("http://127.0.0.1:81")
@RequestMapping("/user")
public interface UserFeign {
    @GetMapping("/get")
    UserVO getUser(Long userId);
}
```

> 使用注册中心模式

1. 添加注册相关的jar包（如nacos）

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

2. 开启注册的注解

```java
@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
public class OrderApplication
```

3. 将调用的地方的name改为服务方的服务名（user-81）

```java
@Component
@FeignClient(name = "user-81")
@RequestMapping("/user")
public interface UserFeign 
```

## 超时配置

- 有些接口，可能调用会很长时间（openfeign默认超时1s）
- 修改超时的配置

```yaml
# 设置feign客户端超时时间(OpenFeign默认支持ribbon)
ribbon:
  # 指的是建立连接所用的时间,适用于网络状态正常的情况下,两端连接所用的时间
  ReadTimeout: 5000
  # 指的是建立连接后从服务器读取到可用资源所用的时间
  ConnectTimeout: 5000
```

## 日志增强

- 定义一个config

```java
@Configuration
public class LevelLog {
    @Bean
    public Logger.Level feignLoggerLevel() {
        // 请求和响应的头信息,请求和响应的正文及元数据
        return Logger.Level.FULL;
    }
}
```

- 配置文件

```yaml
logging:
  level:
    # feign日志以什么级别监控哪个接口
    com.cloud.xiao.controller.FeignController.getDiscovery: debug
```



## 常见错误

- Method Not Allowed
  - 可能是调用的type出错
  - 可能是返回值问题（如返回string， feign接口是实体对象）
  - 可能是服务方式get，消费方使用post调用

在sun.net.www.protocol.http.HttpURLConnection#getOutputStream中，如果 body有值，则自动转为post请求, 而openfeign默认将参数放入body中

所以，如果是get请求，需要带上**RequestParam**


# zuul路由网关

 

# Gateway新一代网关

## 三大概念

- 路由(Route)
  - 路由为一组断言与一组过滤器的集合，他是网关的一个基本组件

- 断言(Predicate)
  - 我们匹配的条件，为true就进入相对路由

- 过滤器(Filter)
  - 在pre类型的过滤器可以做参数校验，权限校验、流量监控等，
  - 在post类型可以做响应类容，响应头修改，等作用

## 配置

> 引入jar包

- 新建gateway模块，引入jar包（包括：starter-web、nacos-discovery），注意，如果引入zookeeper-discovery，则需要exclusion掉他的默认的zoukeeperjar包

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

> 添加配置文件

- 增加配置文件，gateway也是要注册进入注册中心的的
  - id:路由的ID，没有固定规则但要求唯一，简易配合服务名
  - uri:  匹配后提供服务的路由地址
  - predicates: 断言

```yaml
server:
  port: 80

spring:
  application:
    name: gateway-80
  cloud:
    nacos:
      discovery:
        server-addr: 192.168.1.131:8848
    gateway:
      routes:
        - id: renren_fast_route
          #匹配后提供服务的路由地址
          #uri: http://localhost:8004         
          ## 对注册中心的renren-fast进行轮询请求
          uri: lb://renren-fast
          predicates:
            - Path=/api/**   
```

> 添加启动类

- 网关的启动类其实只需要enable注册中心即可

```java
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

> 启动后前往nacos注册中心能看到对应的配置

- 服务名即spring-name

![image-20210703144901029](https://gitee.com/xiaojihao/pubImage/raw/master/image/spring/20210703144908.png)

## 断言

>  地址断言

```yaml
routes:
    - id: renren_fast_route
      uri: lb://renren-fast
      predicates:
        - Path=/api/** 
```

## 过滤器

> 过滤器配置

在过滤器中，可以鉴权

```java
@Component
public class AuthorFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        //模拟获取token
        String token = exchange.getRequest()
            .getHeaders().getFirst("Authorization");
        //模拟获取用户
        String username = exchange.getRequest()
            .getQueryParams().getFirst("username");
        if(token == null) {
            //认证不通过
            exchange.getResponse()
                .setStatusCode(HttpStatus.MULTI_STATUS);
            return exchange.getResponse().setComplete();
        }
        //通过
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        //过滤器执行的顺序，0表示第一个执行
        return 0;
    }
}
```

## 路由

### 重写地址

RewritePath：

相当于访问 http://renren-fast/api,重定向的时候，访问第三方地址为

http://renren-fast/renren-fast

```yaml
routes:
  - id: renren_fast_route
    uri: lb://renren-fast
    predicates:
      - Path=/api/**
    filters:
      - RewritePath=/api/?(?<segment>.*), /renren-fast/$\{segment}
```

## 跨域配置

```java
@Configuration
public class AppCorsConfiguration {
    @Bean
    public CorsWebFilter corsWebFilter() {
        //此处要选择reactive的，因为Gateway是响应式的
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");
        corsConfiguration.addAllowedOrigin("*");
        corsConfiguration.setAllowCredentials(Boolean.TRUE);
        source.registerCorsConfiguration("/**", corsConfiguration);
        return new CorsWebFilter(source);
    }
}
```

- 如果发现类似的错误，测需要将服务端的跨域配置去掉，只需要在网关配置统一跨域

```
header contains multiple values 'http://localhost:8001, http://localhost:8001', but only one is allowed.
```



# 分布式事务

## 概念

多数据源的事务控制

> 1+3组件模型

> > 一个事务id

- Transaction ID（XID）：全局事务id

> > 三个组件

- TC - 事务协调者维护全局和分支事务的状态，驱动全局事务提交或回滚。
- TM - 事务管理器：定义全局事务的范围：开始全局事务、提交或回滚全局事务。
- RM - 资源管理器：管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。

> 处理过程

- TM向TC申请开启一个全局事务，全局事务创建成功并生成一个全局唯一的XID；
- XID在微服务调用链路的上下文中传播；
- RM(**相当于数据源**)向TC注册分支事务，将其纳入XID对应全局事务的管辖；
- TM向TC发起针对XID的全局提交或回滚决议；
- TC调度XID下管辖的全部分支事务完成提交或回滚请求；

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/SpringCloud/20200330231443.png)

**相当于：TM发起事务的开启或者回滚/提交，TC驱动RM对每个分支数据源进行回滚/提交**

## Server安装

1. 解压seata-server-1.0.0.tar.gz文件
2. 修改conf下的配置文件file.conf
   1. 该文件用于配置`存储方式`、`透传事务信息的NIO`等信息

> 修改配置文件

1. 修改自定义事务组名称:fsp_tx_group
   1. my_test_tx_group:我们自定义的事务组
   2. fsp_tx_group事务组名称

```shell
service {
  vgroup_mapping.my_test_tx_group = "fsp_tx_group"
  default.grouplist = "127.0.0.1:8091"
  disableGlobalTransaction = false
}
```

2. 修改事务日志存储模式为db（默认时文件存储）、

```shell
store {
  mode = "db"
  file {
    dir = "sessionStore"
  }
## 设置数据库信息
  db {
    datasource = "dbcp"
    db-type = "mysql"
    driver-class-name = "com.mysql.jdbc.Driver"
    url = "jdbc:mysql://127.0.0.1:3306/seata"
    user = "mysql"
    password = "mysql"
  }
}
```

3. 创建seata数据库的表信息

可以在源码的：[seata](https://github.com/seata/seata)/[script](https://github.com/seata/seata/tree/develop/script)/[server](https://github.com/seata/seata/tree/develop/script/server)/**db**/的目录找到对应版本的sql脚本

4. 修改**registry.conf**文件（配置的是注册机制）

```shell
registry {
    # file 、nacos 、eureka、redis、zk、consul、etcd3、sofa
    type = "nacos"

    nacos {
    serverAddr = "localhost:8848"
    namespace = ""
    cluster = "default"
}
```

## 事务使用

> 新建三个测试数据库

- seata_order：存储订单的数据库
- seata_storage:存储库存的数据库
- seata_account: 存储账户信息的数据库

> 新建三个模块，模拟操作订单，并且减库存

![image-20210705141807885](https://gitee.com/xiaojihao/pubImage/raw/master/image/spring/20210705141815.png)

> 每个数据库都必须添加一个脚本

```sql
-- 此脚本必须初始化在你当前的业务数据库中，用于AT 模式XID记录。与server端无关（注：业务数据库）
-- 注意此处0.3.0+ 增加唯一索引 ux_undo_log
CREATE TABLE `undo_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `branch_id` bigint(20) NOT NULL,
  `xid` varchar(100) NOT NULL,
  `context` varchar(128) NOT NULL,
  `rollback_info` longblob NOT NULL,
  `log_status` int(11) NOT NULL,
  `log_created` datetime NOT NULL,
  `log_modified` datetime NOT NULL,
  `ext` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
```



> 以订单为例说明

1. 引入jar包，每个库都要引入seata 的jar包，和mysql相关的jar包

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
    <exclusions>
        <exclusion>
            <groupId>io.seata</groupId>
            <artifactId>seata-all</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>io.seata</groupId>
    <artifactId>seata-all</artifactId>
    <version>1.0.0</version>
</dependency>
```

2. 配置文件

```yaml
spring:
  application:
    name: seata-order-service
  cloud:
    alibaba:
      seata:
        #与seata server服务器上的对应
        tx-service-group: fsp_tx_group
    nacos:
      discovery:
        server-addr: 192.168.1.131:8848
  datasource:
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://192.168.1.134:3306/seata_order
    username: root
    password: 123456
```

3. 将seata的file.conf、registry.conf复制到classpath下

4. 在service层添加代码

```java
@GlobalTransactional
public void create(TOrder order){
    System.out.println("开始创建订单");
    orderDao.insert(order);
    System.out.println("开始减库存");
    storageService.decrease(order.getProductId(), 1);
    System.out.println("开始减金额");
    accountService.decrease(order.getUserId(), order.getMoney());
    System.out.println("开始修改订单状态");
    orderDao.updateStatus(order.getId());
}
```

访问：<http://127.0.0.1:2001/order/create?userId=1&productId=1&money=10&status=0>，发现事务能够回滚

## 原理

> 概念

- TC:全局协调管理者，可以理解为**seata服务器**，负责全局管控
- TM:谁的方法有事务注解标识，它就是事务发起方
- RM:就是上面三个订单库存账户三个库，相当于事务的参与方

> 执行过程

> > 1阶段，seata拦截业务sql

1. 业务数据更新前，将数据保存到before image中

2. 更新后，保存到after image中，生成行锁

> > 2阶段顺利提交，将before和after删除行锁

因为“业务SQL”在一阶段已经提交至数据库，所以Seata框架只需将一阶段保存的快照数据和行锁删掉，完成数据清理即可。

> > 2阶段回滚

回滚方式便是用“before image”还原业务数据;但在还原前要首先要校验脏写，对比“数据库当前业务数据”和“after image”,如果两份数据完全一致就说明没有脏写，可以还原业务数据，如果不一致就说明有脏写，出现脏写就需要转人工处理。