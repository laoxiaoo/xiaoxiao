# 基础

## 版本

Spring Cloud：Hoxton.SR1

<https://cloud.spring.io/spring-cloud-static/Hoxton.SR1/reference/html/spring-cloud.html>

Spring Boot:2.2.2.RELEASE

<https://cloud.spring.io/spring-cloud-static/Hoxton.SR1/reference/html/spring-cloud.html>

## 热部署

1 在对应的项目中添加依赖

```xml
 <dependency>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-devtools</artifactId>
     <scope>runtime</scope>
     <optional>true</optional>
</dependency>
```



2 父工程添加插件

```xml
 <build>
        <plugins>
            <plugin>                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <fork>true</fork>
                    <addResources>true</addResources>
                </configuration>
            </plugin>
        </plugins>
    </build>
```

3 idea中，将setting中的compiler的a/b/c/d统统勾上

4 按ctrl+shilft+alt+/弹出选择registry,将compiler.automake勾上，将actionSystem.assertfocus勾上

5重启idea

## RunDashboard配置

可以让多个服务在仪表盘显示

在E:\code\cloudparent\.idea\workspace.xml下配置

```XML
 <component name="RunDashboard">
  	<option name="configurationTypes">
	    <set>
	        <option value="SpringBootApplicationConfigurationType" />
	    </set>
	</option>
```

# 注册中心

## Eureka注册中心

### 服务搭建

springcloud的**Hoxton.SR1**对应的eureka版本

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

配置文件

```yaml
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

建立启动类

```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServer7001 {

    public static void main(String[] args) {
        SpringApplication.run(EurekaServer7001.class, args);
    }
}
```

进入<http://127.0.0.1:7001/>服务中心页面

### 服务注册

springcloud的**Hoxton.SR1**对应的eureka客户端版本

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

配置文件

```yaml
eureka:
  client:
    ##是否将自己注册进入EurekaServer
    register-with-eureka: true
    ##是否从EurekaServer抓取已有注册信息，默认为true
    #单节点无所谓，集群必须设置为true才能配合ribbon使用负载均衡
    fetch-registry: true
    service-url:
     defaultZone: http://localhost:7001/eureka
```

主启动类添加client启动配置

```java
@SpringBootApplication
@EnableEurekaClient
public class PaymentMain8001 {
```

### 获取注册服务的信息

开启discoveryClient

```java
@EnableDiscoveryClient
public class PaymentMain8001 {

    public static void main(String[] args) {
```

获取具体信息

```java
	@Autowired
    private DiscoveryClient discoveryClient;
    @GetMapping(value = "/getDiscovery")
    public void getDiscovery(){
        //获取注册服务信息
        List<String> services = discoveryClient.getServices();
        List<ServiceInstance> instances 
            = discoveryClient.getInstances("CLOUD-PAYMENT-SERVICE");
        for(ServiceInstance instance : instances){
            //根据实例名获取其对应信息
            System.out.println(instance.getServiceId()+" "+instance.getHost()+" ");
        }
    }
```

## 在Zookeeper注册

加入jar包

```xml
<!--SpringBoot整合Zookeeper客户端, 这里面已经引入咯ribbon的包 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
    <exclusions>
        <!--先排除自带的zookeeper3.5.3-->
        <exclusion>
            <groupId>org.apache.zookeeper</groupId>
            <artifactId>zookeeper</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<!--添加zookeeper对应版本-->
<dependency>
    <groupId>org.apache.zookeeper</groupId>
    <artifactId>zookeeper</artifactId>
    <version>3.6.0</version>
</dependency>
```

配置文件

```yaml
server:
  port: 8004
spring:
  application:
    name: cloud-payment-service
  cloud:
    zookeeper:
      connect-string: node1:2181
```

获取注册信息,激活Discovery

```java

@SpringBootApplication
@EnableDiscoveryClient
public class PaymentMain8004 {

    public static void main(String[] args) {
        SpringApplication.run(PaymentMain8004.class, args);
    }
}
```

获取注册信息

```java
 @Autowired
    private DiscoveryClient discoveryClient;
    @GetMapping(value = "/getDiscovery")
    public void getDiscovery(){
        //获取注册服务信息
        List<String> services = discoveryClient.getServices();

        List<ServiceInstance> instances = discoveryClient.getInstances("cloud-payment-service");
        for(ServiceInstance instance : instances){
            //根据实例名获取其对应信息
            System.out.println(instance.getServiceId()+" "+instance.getHost()+" ");
        }
    }
```

### zookeeper的注册信息

```shell
[zk: localhost:2181(CONNECTED) 6] ls /services/cloud-payment-service
[57f194ae-27a4-4fec-9e1b-98e5a4aa34ac]

```

### 调用zookeeper注册接口

产生轮询的restTemplate

```java
@Configuration
public class MainConfig {

    @Bean
    @LoadBalanced
    public RestTemplate getRestRemplate() {
        return new RestTemplate();
    }
}
```

将80端口的服务注册进入zookeeper

```yaml
server:
  port: 80
spring:
  application:
    name: cloud-zookeeper-comsumer
  cloud:
    zookeeper:
      connect-string: node1:2181
```

调用

```java
private String url="http://cloud-payment-service";
@Autowired
private RestTemplate restTemplate;
@GetMapping(value = "/getDiscovery")
public void getDiscovery(){
    String forObject = restTemplate.getForObject(url + "/pay/getDiscovery", String.class);
    System.out.println(forObject);
}
```

## Consul注册中心

开源的分布式服务发现和配置管理系统，go语言开发

功能：服务发现/健康检测/kv存储/多数据中心/可视化web界面

<https://www.springcloud.cc/spring-cloud-consul.html>

# openFeign

## 基本使用

新建一个cloud-consumer-feign-80项目用来测试openfeign，可以发现，其在8003和8004的服务端接口轮询调用

- 主启动类开启openfeign

```java
@SpringBootApplication
@EnableFeignClients
public class FeignMain80 {
    public static void main(String[] args) {
        SpringApplication.run(FeignMain80.class,args);
    }
}
```

- 定义一个接口，来调用服务端的接口

服务端接口

```java
@RequestMapping("/pay")
public class PaymentController {

    @Value("${server.port}")
    private String serverPort;
    @Autowired
    private DiscoveryClient discoveryClient;

    @GetMapping(value = "/getDiscovery/{id}")
    public String getDiscovery(@PathVariable("id") Long id){
```

消费端的接口调用

```java
@Component
//调用的微服务名称
@FeignClient(value = "cloud-payment-service")
@RequestMapping("/pay")
public interface FeignService {
    //需要调用的接口
    @GetMapping(value = "/getDiscovery/{id}")
    String getDiscovery(@PathVariable("id") Long id);
}
```

- 定义controller调用openfeign的接口

```java
@GetMapping(value = "/consumer/getDiscovery/{id}")
public String getDiscovery(@PathVariable("id") Long id) {
    return feignService.getDiscovery(id);
}
```

## 超时设置

有些接口，可能调用会很长时间（openfeign默认超时1s）

配置文件中配置超时时间

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

# Gateway新一代网关

## 与zull1.x的区别

- zuul1.x是一个基于阻塞的io网关

- gateway支持websocket



## 三大概念

- 路由(Route)
  - 路由为一组断言与一组过滤器的集合，他是网关的一个基本组件

- 断言(Predicate)
  - 我们匹配的条件，为true就进入相对路由

- 过滤器(Filter)
  - 在pre类型的过滤器可以做参数校验，权限校验、流量监控等，
  - 在post类型可以做响应类容，响应头修改，等作用

## 路由配置方式1

引入jar包，**注意不要引入spring boot的web相关的jar包**

```xml
<dependencies>
    <!--gateway-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>

    <!--SpringBoot整合Zookeeper客户端-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
        <exclusions>
            <!--先排除自带的zookeeper3.5.3-->
            <exclusion>
                <groupId>org.apache.zookeeper</groupId>
                <artifactId>zookeeper</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <!--添加zookeeper对应版本-->
    <dependency>
        <groupId>org.apache.zookeeper</groupId>
        <artifactId>zookeeper</artifactId>
        <version>3.6.0</version>
    </dependency>
</dependencies>
```

增加配置文件，gateway也是要注册进入注册中心的的

```yaml
server:
  port: 9527

spring:
  application:
    name: cloud-gateway
  cloud: ## 注册zookeeper
    zookeeper:
      connect-string: node1:2181
    gateway:
      routes:
        - id: payment_routh #payment_routh    #路由的ID，没有固定规则但要求唯一，简易配合服务名
          uri: http://localhost:8004         #匹配后提供服务的路由地址
          predicates:
            - Path=/pay/getDiscovery/**          #断言，路径相匹配的进行路由
```

启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
public class GateWayMain9527 {
    public static void main(String[] args) {
        SpringApplication.run(GateWayMain9527.class, args);
    }
}
```

然后访问<http://127.0.0.1:9527/pay/getDiscovery/1>就能访问到8004的服务了

## 路由配置方式2

使用代码的方式将地址映射到其他地址

```java
@Configuration
public class GateWayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder routeLocatorBuilder) {
        RouteLocatorBuilder.Builder routes = routeLocatorBuilder.routes();
        routes.route("rout_test", r-> r.path("/csdn").uri("https://blog.csdn.net/"));
        return routes.build();
    }
}
```

访问<http://127.0.0.1:9527/csdn>能进入相应的映射

## 网关实现负载均衡

更改网关两处配置

- 将动态网关打开
- 将路由地址改成微服务配置的

```yaml
spring:
  application:
    name: cloud-gateway
  cloud: ## 注册zookeeper
    zookeeper:
      connect-string: node1:2181
    gateway:
      discovery:
        locator:
          enabled: true   #开启从注册中心动态创建路由的功能，利用微服务名进行路由
      routes:
        - id: payment_routh #payment_routh    #路由的ID，没有固定规则但要求唯一，简易配合服务名
          #uri: http://localhost:8004         #匹配后提供服务的路由地址
          uri: lb://cloud-payment-service  #匹配后提供服务的路由地址
          predicates:
            - Path=/pay/getDiscovery/**          #断言，路径相匹配的进行路由
```

## predicates 断言

- 匹配在after日期之后的请求（在这个时间之后，这个地址才有效）

```yaml
routes:
  - id: payment_routh #payment_routh    #路由的ID，没有固定规则但要求唯一，简易配合服务名
    #uri: http://localhost:8004         #匹配后提供服务的路由地址
    uri: lb://cloud-payment-service  #匹配后提供服务的路由地址
    predicates:
      - Path=/pay/getDiscovery/**          #断言，路径相匹配的进行路由
      - After=2017-01-20T17:42:47.789-07:00[America/Denver]
```

这个时间可以这样获取

```java
public static void main(String[] args) {
    ZonedDateTime now = ZonedDateTime.now();
    System.out.println(now);
}
```

- 带cookie的访问， 只有mycookie=mycookievalue时，才能匹配断言，mycookievalue可以是正则表达

```yaml
predicates:
  - Path=/pay/getDiscovery/**          #断言，路径相匹配的进行路由
  - After=2017-01-20T17:42:47.789-07:00[America/Denver]
  - Cookie=mycookie,mycookievalue
```

- 方法

```yaml
predicates:
  - Path=/pay/getDiscovery/**          #断言，路径相匹配的进行路由
  - After=2017-01-20T17:42:47.789-07:00[America/Denver]
  - Cookie=mycookie,mycookievalue
  - Method=GET,POST
```

## 过滤器

当请求参数不满足条件时，不通过请求

```java
@Component
public class CustomGlobalFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        //过滤器
        String username = exchange.getRequest().getQueryParams().getFirst("username");
        System.out.println(exchange.getRequest().getQueryParams().get("userid"));
        if(username==null){
            //设置状态吗
             exchange.getResponse().setStatusCode(HttpStatus.NOT_IMPLEMENTED);
            //不通过请求
            return exchange.getResponse().setComplete();
        }
        //通过过滤器
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        //过滤器的顺序
        return 0;
    }
}
```

# Config分布式配置中心

为所有微服务配置提供一个中心化的配置，将配置信息已REST的方式进行暴露

此处引入zookeeper是将其作为注册中心

## server构建

引入pom

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-config-server</artifactId>
    </dependency>

    <!--SpringBoot整合Zookeeper客户端-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
        <exclusions>
            <!--先排除自带的zookeeper3.5.3-->
            <exclusion>
                <groupId>org.apache.zookeeper</groupId>
                <artifactId>zookeeper</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <!--添加zookeeper对应版本-->
    <dependency>
        <groupId>org.apache.zookeeper</groupId>
        <artifactId>zookeeper</artifactId>
        <version>3.6.0</version>
    </dependency>
</dependencies>
```

配置

```yaml
server:
  port: 3344


spring:
  application:
    name: cloud-config-center
  cloud:
    zookeeper:
          connect-string: node1:2181
    config:
      server:
        git: #gitee仓库上面的git仓库名字
          uri: https://gitee.com/aloneDr/springcloud-stu-config.git
          ##搜索目录
          search-paths:
            - springcloud-stu-config
      #读取分支
      label: master
```

主启动类

```java
@SpringBootApplication
@EnableConfigServer//启动服务端
public class ConfigCenterMain3344 {
    public static void main(String[] args) {
        SpringApplication.run(ConfigCenterMain3344.class, args);
    }
}
```

## 读取地址方式

- <http://127.0.0.1:3344/master/application-dev.yml>
  - 地址/分支名/application-profile.yml

- <http://127.0.0.1:3344/application-dev.yml>
  - 默认读取配置的label

## client构建

引入pom

```xml
<dependencies>
    <!--spring boot 相关-->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!--引入客户端的包-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
    </dependency>

    <!--SpringBoot整合Zookeeper客户端-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
        <exclusions>
            <!--先排除自带的zookeeper3.5.3-->
            <exclusion>
                <groupId>org.apache.zookeeper</groupId>
                <artifactId>zookeeper</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <!--添加zookeeper对应版本-->
    <dependency>
        <groupId>org.apache.zookeeper</groupId>
        <artifactId>zookeeper</artifactId>
        <version>3.6.0</version>
    </dependency>
</dependencies>
```

建立bootstrap.yml文件

```yaml
server:
  port: 3355

spring:
  application:
    name: config-client
  cloud:
    zookeeper:
      connect-string: node1:2181
    #Config客户端配置
    config:
      label: master #分支名称
      name: config #配置文件名称
      #读取后缀名称 上述3个综合：master分支上config-dev.yml的配置文件被读取 http://127.0.0.1:3344/master/config-dev.yml
      profile: dev
      uri: http://127.0.0.1:3344 #配置中心地址
```

启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
public class ConfigClientMain3355 {
    public static void main(String[] args) {
        SpringApplication.run(ConfigClientMain3355.class, args);
    }
}
```

获取git上配置信息

```java
@RestController
public class TestController {
    @Value("${config.info}")
    private String value;

    @GetMapping("/getConfig")
    public String getConfig(){
        return this.value;
    }
}
```

访问<http://127.0.0.1:3355/getConfig>获取配置信息

# Stream

屏蔽消息中间件的使用差异，降低切换成本，统一消息编程模型

比如两种消息中间件的数据之间的迁移

遵循的订阅发布模式

## 流程图

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/SpringCloud/20200322210442.jpg)

## 生产者

引入jar

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
</dependency>
```

定义yml

```yaml
spring:
  application:
    name: cloud-stream-provider
  cloud:
    zookeeper:
      connect-string: node1:2181
    stream:
      binders: # 在此处配置要绑定的rabbitMQ的服务信息
        defaultRabbit: # 表示定义的名称，用于binding的整合
          type: rabbit # 消息中间件类型
          environment: # 设置rabbitMQ的相关环境配置
            spring:
              rabbitmq:
                host: 192.168.94.134
                port: 5672
                username: guest
                password: guest
      bindings: # 服务的整合处理
        output: # 这个名字是一个通道的名称
          destination: studyExchange # 表示要使用的exchange名称定义
          content-type: application/json # 设置消息类型，本次为json，文本则设为text/plain
          binder: defaultRabbit # 设置要绑定的消息服务的具体设置
```

定义输出的消息发送

```java
//生产者绑定Source
@EnableBinding(Source.class)
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageChannel output;

    @Override
    public String send() {
        String s = UUID.randomUUID().toString();
        output.send(MessageBuilder.withPayload(s).build());
        System.out.println("发送一条消息："+s);
        return null;
    }
}
```

消费者

yml

```yaml
spring:
  application:
    name: cloud-stream-provider
  cloud:
    zookeeper:
      connect-string: node1:2181
    stream:
      binders: # 在此处配置要绑定的rabbitMQ的服务信息
        defaultRabbit: # 表示定义的名称，用于binding的整合
          type: rabbit # 消息中间件类型
          environment: # 设置rabbitMQ的相关环境配置
            spring:
              rabbitmq:
                host: 192.168.94.134
                port: 5672
                username: guest
                password: guest
      bindings: # 服务的整合处理
        input: # 这个名字是一个通道的名称
          destination: studyExchange # 表示要使用的exchange名称定义
          content-type: application/json # 设置消息类型，本次为json，文本则设为text/plain
          binder: defaultRabbit # 设置要绑定的消息服务的具体设置
```

定义订阅者

```java
@EnableBinding(Sink.class)
public class ReceiveMessageListener {
    @Value("${server.port}")
    private String serverPort;

    @StreamListener(Sink.INPUT)
    public void input(Message<String> message){
        System.out.println("消费者1号，------->接收到的消息： "+message.getPayload()+"\t port: "+serverPort);
    }
}
```

## 重复消费

利用steam中的分组

不同组是可以全面消费的（重复消费）

同一组内会发生竞争关系，只有其中一个可以消费

- 配置group
  - 能解决重复消费问题
  - 消息持久丢失问题

```yaml
bindings: # 服务的整合处理
input: # 这个名字是一个通道的名称
destination: studyExchange # 表示要使用的exchange名称定义
content-type: application/json # 设置消息类型，本次为json，文本则设为text/plain
binder: defaultRabbit # 设置要绑定的消息服务的具体设置
group: atguiguA
```

、





- 下载zipKin

<https://dl.bintray.com/openzipkin/maven/io/zipkin/java/zipkin-server/>下载对应版本**zipkin-server-2.12.9-exec.jar**

- 运行zipkin

D:\softinstall>java -jar zipkin-server-2.12.9-exec.jar

- 访问

<http://127.0.0.1:9411/zipkin/>

## sleuth调用监控

以80调用8004为例

- 引入依赖

```xml
<dependencies>
        <!--包含了sleuth+zipkin-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zipkin</artifactId>
        </dependency>
```

两个服务都配置

```yaml
spring:
  application:
    name: cloud-payment-service
  zipkin:
    base-url: http://127.0.0.1:9411
  sleuth:
    sampler:
      # 采样值，介于0-1之间，一般推荐0.5，1标识全部采样
      probability: 1
```

访问zipkin，查询监控

# Spring Cloud Alibaba






### 降级

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/SpringCloud/20200328130846.png)

- RT(平均响应时间、毫秒级)
  - 平均响应时间 超出阈值且这些超过阈值的请求数>=5, 则触发熔断降级
  - 窗口期过后，关闭断路器
  - RT最大4900
- 异常比例（秒级）
  - QPS>=5且这个1秒访问的请求数异常比例（报错的请求）超过阈值，触发降级，时间窗口结束后，关闭熔断降级
- 异常数（分钟级）
  - 当资源近 1 分钟的异常数超过阈值，触发降级，时间窗口（时间窗口配置应该>60s）结束后，关闭熔断降级

### 热点Key限流

- 基本配置

对该资源，每秒传入的第N个参数超过阈值

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/SpringCloud/20200329120459.png)

- 参数例外项

当第N个参数是某个例外值时，可以不受限制，或者限制更改

### 系统规则

对整个系统进行配置

### @SentinelResource 注解

- 当getc触发限流，则进入blockHandler指定的方法

```java
@GetMapping("getc")
@SentinelResource(value = "getc", blockHandler = "blockHandlerc")
public String getc(){
    return "getc";
}

public String blockHandlerc(BlockException exception) {
    //打印执行的方法名
    System.out.println(exception.getClass().getCanonicalName());
    return "exception blockc";
}
```

- 降低代码的耦合度，兜底方法写到另一个类中
  - 建立统一的兜底方法
  - 引入兜底方法

```java
public class GetDHandler {
    public static String blockHandlerD(BlockException excepion) {
        return "blockHandlerD";
    }
}
```

```java
@GetMapping("/getD")
@SentinelResource(value = "getD",
                  blockHandlerClass = GetDHandler.class,//去GetDHandler类
                  blockHandler = "blockHandlerD")//寻找blockHandlerD方法
public String getD() {
    return "getD";
}
```

### 基于openFeign熔断

- 

pom

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    </dependency>
</dependencies>
```

配置文件

```yaml
server:
  port: 80

spring:
  application:
    name: nacos-openfeign-client
  cloud:
    nacos:
      discovery:
        server-addr: 192.168.94.131:8848 #Nacos服务注册中心地址
# 激活sentinel对openfeign的支持
feign:
  sentinel:
    enabled: true
```

主启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class CloudAlibabaOpenFeign80 {
    public static void main(String[] args) {
        SpringApplication.run(CloudAlibabaOpenFeign80.class, args);
    }
}
```

配置访问的service接口 **注意这个mapping注解不能用**

```java
@FeignClient(value = "nacos-provider-payment", fallback = OpenFeignServiceImpl.class)
//@RequestMapping("/pay")
public interface OpenFeignService {
    @GetMapping(value = "/pay/getDiscovery/{id}")
    String getDiscovery(@PathVariable("id") Long id);
}
```

兜底方法，当provide服务断了，则进入这个方法

```java
@Component
public class OpenFeignServiceImpl implements OpenFeignService {
    @Override
    public String getDiscovery(Long id) {
        return "服务端断了,服务降级，openfeign兜底方法";
    }
}
```

调用

```java
@RestController
public class OpenFeignController {
    @Autowired
    private OpenFeignService openFeignService;
    @GetMapping("/getOpenFeign/{id}")
    public String getOpenFeign(@PathVariable("id") Long id){
        System.out.println("进入openFeign--"+id);
        return openFeignService.getDiscovery(id);
    }
}
```

- 持久化
  - 问题：当调用的controller服务停了后，sentinel的配置会消失

一般持久进入nacos

