# 

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

是Spring Cloud对Feign的扩展，支持Spring MVC注解（如`@RequestMapping`），并深度集成Spring Cloud功能（如服务发现、熔断器等）。通过动态代理生成实现类，简化了与Spring项目的整合

## 基本使用

> 直连的方式

1. 引入Openfeign的jar包

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