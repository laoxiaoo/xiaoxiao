# 

# 负载均衡的分类

1. 集中式
   1. 即在服务的消费方和提供方之间使用独立的LB设施(可以是硬件，如F5, 也可以是软件，如nginx), 由该设施负责	把访问请求通过某种策略转发至服务的提供方；
2. 进程内LB
   1. 将LB逻辑集成到消费方，消费方从服务注册中心获知有哪些地址可用，然后自己再从这些地址中选择出一个合适的服务器。如：nginx、ribbon
3. 服务器端负载
   1. 如nginx: 客户端将请求发送到nginx服务器，由nginx服务器再根据算法，负载到对应的应用
4. 客户端负载
   1. 如Ribbon: 客户端从注册中心拿到对应的服务提供者的注册信息，再做出算法判断，负载到对应的服务

# Ribbon负载均衡



Ribbon在工作时分成两步
第一步先选择 EurekaServer ,它优先选择在同一个区域内负载较少的server.
第二步再根据用户指定的策略，在从server取到的服务注册列表中选择一个地址。
其中Ribbon提供了多种策略：比如轮询、随机和根据响应时间加权。



## 负载均衡器有三大组件  

1. 负载规则 ，从服务器列表中决定用哪个服务器
2. ping任务 ，后台运行的任务，用来验证服务器是否可用
3. 服务器列表 ，可以是静态也可以是动态，如果是动态  



## Ribbon的基本实现

首先，它集成的是客户端的

在80端口上进行集成

导入jar包

**H.SR1版本之后，只需要引入类似spring-cloud-starter-zookeeper-discovery的jar包**

```xml
<!-- Ribbon相关 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-eureka</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-ribbon</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

配置文件

```yaml
eureka:
  client: #客户端注册进eureka服务列表内
    # 因为时客户端，所以不需要向注册中心注册
    register-with-eureka: false
    service-url:
      #defaultZone: http://localhost:7001/eureka
      defaultZone: http://eureka7001.com:7001/eureka/,http://eureka7002.com:7002/eureka/,http://eureka7003.com:7003/eureka/
```

> ribbion配合RestTemplate使用

config配置更改

```java
@Bean
@LoadBalanced
public RestTemplate getRestTemplate(){
    //RestTemplate提供了多种便捷访问远程Http服务的方法
    return new RestTemplate();
}
```

control更改，这时，直接使用服务端**spring.application.name= provider-dept8001**来访问
此时，使用RestTemplate调用远程服务就能实现负载均衡的策略

```java
// private final String url = "http://localhost:8001";
 private final String url = "http://provider-dept8001";


 @GetMapping("getUser")
 public List getUser(){
     return restTemplate.getForObject(url+"/getUser",List.class);
 }
```

## Ribbon的负载均衡

复制一个与dept-8001相同的项目，该端口为8002，并且配置文件instance-id需要更改，其他不更改，运行80端口地址，发现会轮询的访问这两个dept服务，如果有一个服务挂了，也会去访问，ribbon通过spring.application.name来访问服务端，如果application系统，就会通过负载均衡的方式来访问

```yaml
eureka:
  instance:
    instance-id: provider-dept-8002
```

## Ribbon的内置负载均衡

他们都是IRule接口的实现类

| 策略名                    | 策略描述                                                     | 实现说明                                                     |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| BestAvailableRule         | 选择一个最小的并发请求的server                               | 逐个考察Server，如果Server被tripped了，则忽略，在选择其中ActiveRequestsCount最小的server |
| AvailabilityFilteringRule | 过滤掉那些因为一直连接失败的被标记为circuit tripped的后端server，并过滤掉那些高并发的的后端server（active connections 超过配置的阈值） | 使用一个AvailabilityPredicate来包含过滤server的逻辑，其实就就是检查status里记录的各个server的运行状态 |
| WeightedResponseTimeRule  | 根据相应时间分配一个weight，相应时间越长，weight越小，被选中的可能性越低。 | 一个后台线程定期的从status里面读取评价响应时间，为每个server计算一个weight。Weight的计算也比较简单responsetime 减去每个server自己平均的responsetime是server的权重。当刚开始运行，没有形成statas时，使用roubine策略选择server。 |
| RetryRule                 | 对选定的负载均衡策略机上重试机制。                           | 在一个配置时间段内当选择server不成功，则一直尝试使用subRule的方式选择一个可用的server |
| RoundRobinRule            | roundRobin方式轮询选择server                                 | 轮询index，选择index对应位置的server                         |
| RandomRule                | 随机选择一个server                                           | 在index上随机，选择index对应位置的server                     |
| ZoneAvoidanceRule         | 复合判断server所在区域的性能和server的可用性选择server       | 使用ZoneAvoidancePredicate和AvailabilityPredicate来判断是否选择某个server，前一个判断判定一个zone的运行性能是否可用，剔除不可用的zone（的所有server），AvailabilityPredicate用于过滤掉连接数过多的Server。 |

默认是RoundRobinRule（轮询选择），若想使用其他，为RestTemplate赋予负载均衡功能

```java
@Configuration
public class ConfigBean {
    @Bean
    @LoadBalanced
    public RestTemplate getRestTemplate(){
        //RestTemplate提供了多种便捷访问远程Http服务的方法
        return new RestTemplate();
    }
}
```

## 自定义负载均衡

**自定义的配置类不能放在@ComponentScan所扫描的当前包下**

```java
@Configuration
public class MySelfRule {
    @Bean
    public IRule myRule(){
        //定义随机算法
        return  new RandomRule();
    }
}
```

```java
@RibbonClient(name = "cloud-zookeeper-comsumer", configuration = MySelfRule.class)
public class PaymentMain80 {
    public static void main(String[] args) {
        SpringApplication.run(PaymentMain80.class, args);
    }
}
```

## 轮询算法原理

rest接口第N次请求数%服务器总集群数量=实际调用服务器下标

每次服务重启后rest从1开始计算 
