
#
# Hystrix断路器

- 服务降级：服务器忙，请稍后再试，不让客户端等待，立刻返回一个友好提示
  - 触发条件：程序运行异常，超时
- 服务熔断：服务器达到最大访问，出发服务降级方法，是应对雪崩效用的一种微服务链路保护机制，当某个微服务不健康了，**不再调用该微服务，等待微服务正常，恢复调用**

## 问题（服务雪崩）

在分布式系统中，可能会有数十个微服务依赖，如：a->b->c ,这个时候，c出现了问题，那么，c微服务所积累的压力越来越大，这个时候导致整个系统发生更多的级联故障，进而引起系统崩溃，所谓的“雪崩效应”.

这些都表示需要对故障和延迟进行隔离和管理，以便单个依赖关系的失败，不能取消整个应用程序或系统。

## Hystrix作用

### 通配服务降级

服务降级：（反正这个降级我找了许多资料，没搞懂，应该是服务端接收的压力达到设定的值，就不进入这个服务计算，进入预定的方法， 或者，这个服务挂了，我们取一个将就的结果，先凑合着用）

代码实现

在之前的feign的api中修改

增加一个回调函数的类，这个类注入容器中，重写consumer调用的接口（想想dubbo的本地存根）

```java
@Component
public class ClientFallbackService implements FallbackFactory<DeptClientService> {
    @Override
    public DeptClientService create(Throwable throwable) {
        return new DeptClientService() {
            @Override
            public TUser getUser() {
                TUser tUser = new TUser();
                tUser.setUsername("给你个假数据缓缓");
                return tUser;
            }
        };
    }
}
```

在接口中增加注解

```java
@FeignClient(value = "PROVIDER-DEPT", fallbackFactory = ClientFallbackService.class)
public interface DeptClientService {
    @RequestMapping(value="getUser", method = RequestMethod.GET)
    public TUser getUser();
}
```

需要将comsumer端把feign的hystrix的服务降级打开

```yaml
feign:
  hystrix:
    enabled: true
```

关闭了服务器端的服务器，模拟网络断了

访问<http://127.0.0.1/getUser>返回

```json
{"id":null,"username":"给你个假数据缓缓","datesource":null}
```

- 新版写法





### 局部服务降级

一般服务降级fallback是在客户端调用的，这些方法既可以在consumer端也可以在provide端

pom新增

```xml
<!--  hystrix -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-hystrix</artifactId>
</dependency>
```

```xml
<!--  HSR1版本 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>
```



```java
@SpringBootApplication
@MapperScan("com.xiao.mapper")
//本服务启动后会自动注册进eureka服务中
@EnableEurekaClient
@EnableCircuitBreaker//开启熔断机制
public class Application8003 {
    public static void main(String[] args) {
        SpringApplication.run(Application8003.class, args);
    }
}
```

```java
@RestController
public class UserController {

    @Autowired
    private UserService userService;
    @GetMapping("getUser")
    //毁掉的方法
    @HystrixCommand(fallbackMethod = "getUserCallable",
            //调用超过1000ms，则进入回调方法，缺省貌似5000ms
            commandProperties = {
                    @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "1000")})
    public TUser getUser() throws Exception{
        Thread.sleep(2000);//模拟超时
        return userService.findUser();
    }

    public TUser getUserCallable(){
        TUser tUser = new TUser();
        tUser.setId("1");
        //取用户出现问题或者超时，
        // 从缓存取出可能错误的以前的数据，将就下
        tUser.setDatesource("我来自缓存");
        return tUser;
    }
}
```

### 全局服务降级

此处在80客户端

```java
@RestController
//标注全局的降级方法
@DefaultProperties(defaultFallback="fallbackMethod")
public class FeignController {
    @GetMapping(value = "/consumer/timeOut/{id}")
    @HystrixCommand(commandProperties = {
        @HystrixProperty(name="execution.isolation.thread.timeoutInMilliseconds", value = "1000")
    })
    public String timeOut(@PathVariable("id") Long id) throws Exception{
        return feignService.timeOut(id);
    }
	//当前类访问
    public String fallbackMethod() throws Exception{
        return "全局服务降级方法";
    }
```

### 服务熔断

为了防止雪崩，hystrix提供了基于断路器的服务熔断机制

当请求发生错误的比例超过一定比例时histrix将打开断路器进入closed状态，这个状态下我们所有针对该服务的请求（以依赖隔离的线程池为隔断单位，同一线程池中的所有hiystrix command都会被熔断）都会默认使用降级策略进行处理。结果一段时间（通常称为睡眠窗口）后，断路器将被置为半打开(half open)状态，这个状态下将对一定数量的请求进行正常处理，同时统计请求成功的数量。这个数量如果能达到指定的比例断路器将自动关闭重新进入打开open状态。这就是hystrix基于断路器的熔断器机制

**保证服务方进程不被长时间占用**



代码实现

从8002的providemaven项目复制一个项目8003

pom新增

```xml
<!--  hystrix -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-hystrix</artifactId>
</dependency>
```
```xml
<!--  HSR1版本 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>
```



```java
@SpringBootApplication
@MapperScan("com.xiao.mapper")
//本服务启动后会自动注册进eureka服务中
@EnableEurekaClient
@EnableCircuitBreaker//开启熔断机制
public class Application8003 {
    public static void main(String[] args) {
        SpringApplication.run(Application8003.class, args);
    }
}
```

```java
/**
     * 在10秒窗口期中10次请求有6次是请求失败的,断路器将起作用(断路器起作用后，就算是正确的也会调用fallback方法，隔一会后才会正常调用)
     顺序：服务降级-》服务熔断-》服务恢复
     * @param id
     * @return
     */
@HystrixCommand(
    fallbackMethod = "paymentCircuitBreaker_fallback", commandProperties = {
        @HystrixProperty(name = "circuitBreaker.enabled", value = "true"),// 是否开启断路器
        @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "10"),// 请求次数
        @HystrixProperty(name = "circuitBreaker.sleepWindowInMilliseconds", value = "10000"),// 时间窗口期/时间范文
        @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "60")// 失败率达到多少后跳闸
    }
)
public String paymentCircuitBreaker(@PathVariable("id") Integer id) {
    if (id < 0) {
        throw new RuntimeException("*****id不能是负数");
    }
    String serialNumber = IdUtil.simpleUUID();
    return Thread.currentThread().getName() + "\t" + "调用成功,流水号:" + serialNumber;
}

public String paymentCircuitBreaker_fallback(@PathVariable("id") Integer id) {
    return "id 不能负数,请稍后重试,o(╥﹏╥)o id:" + id;
}
```

## 服务限流

秒杀等高并发操作，严禁一窝蜂拥挤，排队调用方法

## 服务监控

> hystrixDashboard

能够监控访问的次数与服务是否健康


# Sentinel

- 功能：流量控制、熔断降级、系统负载保护
- Hystrix的升级版

![](./image/20210704154543.png)

## 安装

1. 前往sentinel（https://github.com/alibaba/Sentinel）下载 sentinel-dashboard-1.7.1.jar的安装包
2. 将jar包上传linux，编写一个简单脚本

```shell
#! /bin/bash
start(){
  nohup java -jar sentinel-dashboard-1.8.1.jar  > log.file  2>&1 &
}
start;
```

3. 登录：http://192.168.1.131:8080/#/login 密码 sentinel/sentinel

## 应用注入sentinel管理

> 此处我们将user包注入

1. 引入客户端的jar包

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

2. 配置sentinel的相关配置

```yaml
    sentinel:
      transport:
        dashboard: 192.168.1.131:8080
        #跟控制台交流的端口,随意指定一个未使用的端口即可
        port: 8719
        #客户端的ip，建议配置上
        clientIp: 192.168.1.107
```

启动后能在界面看到对应的配置，也能看到调用的对应接口

**sentinel是懒加载的**

![image-20210704170325027](./image/20210704170325.png)

 ## 流控

进入**簇点链路**菜单，查看对应的接口（只有访问过的接口才会出现在菜单里面）

> 名词解释

![image-20210704172344012](./image/20210704172344.png)

- 资源名：唯一名称，默认是请求路径

- QPS:每秒请求数
- 线程数： 进入以后只执行对应线程数的请求，当线程数（处理该接口的线程）达到阈值，则进行限流

为了方便测试，建立两个接口

![image-20210704172312208](./image/20210704172312.png)

> 测试QPS限制

在对应的地址处点击**流控**

我们对a接口做QPS限制为1，则快速访问A时，发现1秒只能访问1次，如果过多访问，会抛出**Blocked by Sentinel (flow limiting)**异常

> 高级选项
>
> >流控模式-关联

我们对流控做关联调整

![20210704172832212](./image/20210704172832.png)

- a接口关联b接口，B达到阈值，则限流A（**qps的配置还是配置A这里**）

> > 流控效果

- 预热（Warm Up）
  - 有时，一个接口，平时没有访问，一瞬间请求爆发
  - 让通过的流量缓慢增加，在一定时间内逐渐增加到阈值上限，给冷系统一个预热的时间，避免冷系统被压垮。warm up冷启动主要用于启动需要额外开销的场景，例如建立数据库连接等。(如：我们设置qps=100,当流量猛增时，我们不让限制一瞬间是100)

- 排队等待：阈值必须是QPS,一个个匀速排队执行（对应算法：漏桶算法）

## 降级

> RT(平均响应时间、毫秒级)

- 当1s内持续进入5个请求，对应时刻的平均响应时间(秒级）均超过阈值（count，以ms为单位)，那么在接下的时间窗口（DegradeRule中的timewindow，以s为单位)之内，对这个方法的调用都会自动地熔断(抛出 DegradeException )
- RT最大4900

如：此时，对接口做出限制2000秒阻塞，限制RT=1000ms, 时间窗口=1s



> 异常比例（秒级）

QPS>=5且这个1秒访问的请求数异常比例（报错的请求）超过阈值，触发降级，时间窗口结束后，关闭熔断降级

> 异常比例（秒级）

QPS>=5且这个1秒访问的请求数异常比例（报错的请求）超过阈值，触发降级，时间窗口结束后，关闭熔断降级

> 异常数（分钟级）

当资源近 1 分钟的异常数超过阈值，触发降级，时间窗口（时间窗口配置应该>60s）结束后，关闭熔断降级

## 热点Key限流

热点key的限流往往需要配合SentinelResource注解来进行配置

参数必须是基本类型或者**String**

> SentinelResource兜底方法在同一个类

1. 定义一个热点key的方法，一个兜底方法
   1. 当热点value所配置的规则超过时，出发handler方法

```java
@SentinelResource(value = "hotKey", blockHandler = "blockHandler")
@GetMapping("/hotKey")
public String hotKey(String p1, String p2) {
    return "hotkey";
}

public String blockHandler(String p1, String p2, BlockException exception) {
    return "block error";
}
```

2. 前往界面配置规则
   1. 标识value这个规则，第0个参数，即p1qps达到1以上后，触发兜底方法

![image-20210704205944501](./image/20210704205944.png)

> 兜底方法不在同一个类

1. 定义一个类

```java
public class HandlerClass {
    public static String blockHandler(String p1, String p2, BlockException exception) {
        return "block error";
    }
}
```

2. 调整配置
   1. blockHandlerClass标识器配置的类

```java
@SentinelResource(value = "hotKey", blockHandlerClass = HandlerClass.class, blockHandler = "blockHandler")
@GetMapping("/hotKey")
public String hotKey(String p1, String p2) {
    return "hotkey";
}
```

> 特殊值配置

当我们设置了热点key，但是我们还想key在某个特殊值的时候能达到200的阈值，这时，我们可以配置高级选项

![image-20210704210734138](./image/20210704210734.png)



## SentinelResource强化

**SentinelResource**注解，不单单对热点key生效，前面的流控，降级都可以生效，只要将其value配置在对应资源名处，就不是对接口，而是对对应的配置的兜底value生效

> fallback

- fallback针对的是业务上的异常
- blockHandler针对的是sentinel的配置服务

如：此处注意，异常必须是Throwable，因为exceptionsToTrace默认是这个，如果是其他，需要额外配置

```java
@SentinelResource(value = "fallback", fallback = "handlerFallback")
@RequestMapping("/fallback")
public String fallback(String p1) {
    if(Objects.equals(p1, "1")) {
        throw new IllegalArgumentException("发生了异常");
    }
    return "fallback";
}

public String handlerFallback(String p1, Throwable e) {
    return "异常方法....";
}
```

> 整合Openfeign

当我们的服务方网络断了或者挂了，则可以调用兜底方法进行数据的返回

1. 引入注册jar包，sentinel的jar包
2. 前往配置文件开启配置(**激活sentinel对openfeign的支持**)

```yaml
feign:
  sentinel:
    enabled: true
```

3. 更改openfeign的调用类，**注意这个mapping注解不能用**

```java
@FeignClient(name = "user-81", fallback = UserFeignImpl.class)
//@RequestMapping("/user")
public interface UserFeign {
    @GetMapping("/user/get")
    UserVO getUser(@RequestParam("userId") Long userId);
    
}
```

4. 实现兜底方法,这个兜底方法，必须是spring bean

```java
@Component
public class UserFeignImpl implements UserFeign {
    @Override
    public UserVO getUser(Long userId) {
        return new UserVO("服务器凉了，兜底的方法", 20);
    }
}
```

## 系统规则

对整个系统进行配置

## 持久化

如果不配置持久化，则每次服务重启，我们的配置都会消失

此处，我们将持久化配置到nacos中

1. 引入相关jar包

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
</dependency>
```

2. 配置nacos信息

```yaml
sentinel:
  datasource:
    ds1:
      nacos:
        server-addr: 192.168.1.131:8848
        data-id: user-sentinel
        group-id: DEFAULT_GROUP
        data-type: json
        rule-type: flow
```

3. 前往nacos配置相关配置
   1. 注意data-id一定要一致

![image-20210705001425585](./image/20210705001425.png)

resource:资源名称;

limitApp:来源应用;

grade:阈值类型，0表示线程数，1表示QPS;

count:单机阈值;

strategy:流控模式, O表示直接，1表示关联，2表示链路;

controlBehavior:流控效果，0表示快速失败，1表示Warm Up，2表示排队等待;

clusterMode:是否集群。

- 配置代码

```json
[
    {
        "resource": "/user/a",
        "limitApp": "default",
        "grade": 1,
        "count": 5,
        "strategy": 0,
        "controlBehavior": 0,
        "clusterMode": false
    }
]
```

4. 启动服务后，刷新接口，能够在sentinel看到配置好的配置

![image-20210705001801653](./image/20210705001801.png)
