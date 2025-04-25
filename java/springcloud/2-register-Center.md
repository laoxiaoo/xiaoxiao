
##

# Eureka
## Eureka服务注册与发现

Spring Cloud 封装了 Netflix 公司开发的 Eureka 模块来实现服务注册和发现(请对比Zookeeper)。

Eureka 采用了 C-S 的设计架构。Eureka Server 作为服务注册功能的服务器，它是服务注册中心。

而系统中的其他微服务，使用 Eureka 的客户端连接到 Eureka Server并维持心跳连接。这样系统的维护人员就可以通过 Eureka Server 来监控系统中各个微服务是否正常运行。SpringCloud 的一些其他模块（比如Zuul）就可以通过 Eureka Server 来发现系统中的其他微服务，并执行相关的逻辑。



Eureka包含两个组件：Eureka Server和Eureka Client
Eureka Server提供服务注册服务
各个节点启动后，会在EurekaServer中进行注册，这样EurekaServer中的服务注册表中将会存储所有可用服务节点的信息，服务节点的信息可以在界面中直观的看到


EurekaClient是一个Java客户端，用于简化Eureka Server的交互，客户端同时也具备一个内置的、使用轮询(round-robin)负载算法的负载均衡器。在应用启动后，将会向Eureka Server发送心跳(默认周期为30秒)。如果Eureka Server在多个心跳周期内没有接收到某个节点的心跳，EurekaServer将会从服务注册表中把这个服务节点移除（默认90秒）

#### 三大角色

Eureka Server 提供服务注册和发现

Service Provider服务提供方将自身服务注册到Eureka，从而使服务消费方能够找到

Service Consumer服务消费方从Eureka获取注册服务列表，从而能够消费服务

**EurekaClient:通过注册中心进行访问没如果server多个心跳周期没有收到某个节点，则server会将其从服务注册表移除（默认90秒）**

## Euraka 与zookeeper的区别
zookeeper保证的是cp：在向注册中心注册时，zookeeper可以允许几分钟的注册事件，但不能接收服务down掉不可用

，当master接口与其他节点失去联系时，其余节点重新选择leader，但如果选择leader时间太长，选举期间，整个zk集群是不可用的，这时就会导致注册服务瘫痪。

euraka保证的是ap：eureka各个节点平等，只要有一台在，就能保证注册服务，只不过查到的信息可能不是最新的，此外，它还有一种自我保护机制：在15分钟内，85%节点没有正常心跳，则eureka认为客户端与注册中心网络出现故障，则出现以下几点现象

1 不会从注册表移除没有心跳的过期服务

2 任然接受新的注册与查询，但不同步其他节点

3 网络稳定，再同步到其他节点


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
    hostname: localhost ##eureka服务端的实例名称，后续defaultZone通过这个来关联eureka
  client:
    ##false表示不向注册中心注册自己。
    register-with-eureka: false
    ##false表示自己端就是注册中心，
    ##我的职责就是维护服务实例，并不需要去检索服务
    fetch-registry: false
    service-url:
      ##设置与Eureka Server交互的地址查询服务和注册服务都需要依赖这个地址。
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

#### 基本信息注册

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
  client: ##客户端注册进eureka服务列表内
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



#### 添加服务别名（status）

添加application名称与status别名，能够再Eureka上能够具体的看到对应应用的别名

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
    name: provider-dept ##添加Application名称，可以用与feign和rebbion访问
eureka:
  client: ##客户端注册进eureka服务列表内
    service-url:
      defaultZone: http://localhost:7001/eureka
  instance:
    instance-id: provider-dept-8001 ##每个微服务提供者这个instance-id都必须不同（Status）
    ##访问路径可以显示IP地址
    prefer-ip-address: true
```

结果：

| Application       | AMIs        | Availability Zones | Status                                                       |
| :---------------- | :---------- | :----------------- | :----------------------------------------------------------- |
| **PROVIDER-DEPT** | **n/a** (1) | (1)                | **UP** (1) - [provider-dept-8001](http://192.168.1.101:8001/info) |

## eureka 的集群搭建

1. 修改eureka所在服务的host文件映射

127.0.0.1	eureka7001.com
127.0.0.1   eureka7002.com
127.0.0.1   eureka7003.com

2. 新建两个eureka项目

修改yml配置

```yaml
eureka:
  instance:
    ##hostname: localhost ##eureka服务端的实例名称
     hostname: eureka7001.com ##eureka服务端的实例名称
  client:
    ##false表示不向注册中心注册自己。
    register-with-eureka: false
    ##false表示自己端就是注册中心，
    ##我的职责就是维护服务实例，并不需要去检索服务
    fetch-registry: false
    service-url:
      ##设置与Eureka Server交互的地址查询服务和注册服务都需要依赖这个地址。
      ##defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
      defaultZone: http://eureka7002.com:7002/eureka/,http://eureka7003.com:7003/eureka/
```

3. 修改注册的服务配置（将应用服务注册到eureka集群中）

```yaml
eureka:
  client: ##客户端注册进eureka服务列表内
    service-url:
      ##defaultZone: http://localhost:7001/eureka
      defaultZone: http://eureka7001.com:7001/eureka/,http://eureka7002.com:7002/eureka/,http://eureka7003.com:7003/eureka/
```

访问：<http://eureka7001.com:7001/>能看到集群信息


## eureka自我保护

某时刻某一个微服务不可用了，eureka不会立刻清理，一定时间内（默认90秒）依旧会对该微服务的信息进行保存，这是CAP里面的AP思想


# Nacos

服务注册+服务配置=eureka+config

**Nacos支持ap+cp模式，可自由切换**

## 安装

下载nacos-server-1.1.4.tar.gz，到linux解压，前往bin目录启动（单机模式）

```shell
[root@node1 nacos]# ./bin/startup.sh -m standalone
```

访问

<http://192.168.94.131:8848/nacos/index.html#/login>

nacos/nacos

## 注册

将一个服务注册进入nacos

引入jar

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

配置文件

```yaml
server:
  port: 8081
spring:
  application:
    name: nacos-provider-payment
  cloud:
    nacos:
      discovery:
        server-addr: 192.168.94.131:8848
management:
  endpoints:
    web:
      exposure:
        include: '*'
```

主启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
public class NacosMain9001 {

    public static void main(String[] args) {
        SpringApplication.run(NacosMain9001.class, args);
    }
}
```

进入nacos服务中心，能看到服务管理-服务列表下有这个服务

## Config（统一配置）

- 引入jar包

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

- 新建两个配置文件 bootstrap.yml、application.yml

application.yml配置对应的开发环境

```yaml
spring:
  profiles:
    active: dev #开发环境
```

- bootstrap.yml配置通用配置

在nacos配置的文件名规则

${spring.application.name}-${spring.profile.active}.${spring.cloud.nacos.config.file.extension}

```yaml
server:
  port: 3377

spring:
  application:
    name: nacos-config-client
  cloud:
    nacos:
      discovery:
        server-addr: 192.168.94.131:8848 #Nacos服务注册中心地址
      config:
        server-addr: 192.168.94.131:8848 #Nacos作为配置中心地址
        file-extension: yaml  #指定yaml格式的配置

# ${spring.application.name}-${spring.profile.active}.${spring.cloud.nacos.config.file.extension}
# 配置的nacos的文件名：nacos-config-client-dev.yaml
```

- 登录nacos，在配置列表新增Data Id：nacos-config-client-dev.yaml文件

```yaml
config: 
    info: 'form nacos'
```

- 建立访问类

```java
@RestController
@RefreshScope// 发送post的请求，支持动态刷新
public class ConfigController {

    @Value("${config.info}")
    private String config;

    @GetMapping("/getconfig")
    public String getConfig() {
        return config;
    }
}
```

## 分类配置

这个配置会读取nacos上的TEST_GROUP组的配置，命名空间也是同样配置

```yaml
cloud:
  nacos:
    discovery:
      server-addr: 192.168.94.131:8848 #Nacos服务注册中心地址
    config:
      server-addr: 192.168.94.131:8848 #Nacos作为配置中心地址
      file-extension: yaml #指定yaml格式的配置
      group:  TEST_GROUP
```

## 集群和持久化配置

为了保证数据存储的一致性，nacos采用集中式存储的方式来支持集群化部署，目前只支持mysql的存储

- 前往conf目录，寻找sql脚本,在nacos_config数据库中执行脚本

```shell
[root@node1 conf]# pwd
/home/nacos/conf
[root@node1 conf]# vim nacos-mysql.sql 
```

- 备份properties的文件

```shell
[root@node1 conf]# cp application.properties application.properties.init
```

- 配置mysql库

```mysql
###############在此处新增配置
spring.datasource.platform=mysql

db.num=1
db.url.0=jdbc:mysql://192.168.94.134:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true
db.user=root
db.password=123456
```

- 配置集群文件

```shell
[root@node1 conf]# cp cluster.conf.example cluster.conf
```

ip必须是

```shell
[root@node1 conf]# hostname -i
192.168.94.131
```

```conf
192.168.94.131:3333
192.168.94.131:4444
192.168.94.131:5555
```

- 修改startup.sh启动文件,表示可以自定义启动的端口

```shell
# 备份文件
[root@node1 bin]# cp startup.sh startup.sh.bak
```

- 修改前

```shell
while getopts ":m:f:s:" opt
do
    case $opt in
        m)
            MODE=$OPTARG;;
        f)
            FUNCTION_MODE=$OPTARG;;
        s)
            SERVER=$OPTARG;;
        ?)
        echo "Unknown parameter"
        exit 1;;
    esac
done
```

```shell
##表示传参数p
while getopts ":m:f:s:p:" opt
do
    case $opt in
        m)
            MODE=$OPTARG;;
        f)
            FUNCTION_MODE=$OPTARG;;
        s)
            SERVER=$OPTARG;;
        p)  
        	PORT=$OPTARG;;
        ?)
        echo "Unknown parameter"
        exit 1;;
    esac
done

```

修改前

```shell
# start
echo "$JAVA ${JAVA_OPT}" > ${BASE_DIR}/logs/start.out 2>&1 &
nohup $JAVA ${JAVA_OPT} nacos.nacos >> ${BASE_DIR}/logs/start.out 2>&1 &
echo "nacos is starting，you can check the ${BASE_DIR}/logs/start.out"
```

修改后

```shell
# start
echo "$JAVA ${JAVA_OPT}" > ${BASE_DIR}/logs/start.out 2>&1 &
nohup $JAVA -Dserver.port=${PORT} ${JAVA_OPT} nacos.nacos >> ${BASE_DIR}/logs/start.out 2>&1 &
echo "nacos is starting，you can check the ${BASE_DIR}/logs/start.out"

```

- 启动脚本

```shell
[root@node1 bin]# ./startup.sh -p 3333
[root@node1 bin]# ./startup.sh -p 4444
[root@node1 bin]# ./startup.sh -p 5555
```

- 配置nginx

```conf
 upstream cluster {
          server 192.168.94.131:3333;
          server 192.168.94.131:4444;
          server 192.168.94.131:5555;
        }


        server {
            #监听的端口,这里为80
                listen       80;
                #server_name就是域名,
                server_name  localhost;

                #location域名代理地址
            # / 代表所有请求路径
                location / {
                        #root /home/nginx/html;
                        #index  index.html;
                        proxy_pass http://cluster;
                }
        }

```



- 访问<http://192.168.94.134/nacos/index.html