

# 普通的session登录

> session的原理

![](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/message/20220108104719.png)

## 普通session登录问题

1. 不同域名不能共享session
2. 多个后台服务器不能共享session

## 解决方案

> session复制

将a服务器的session同步到B服务器，这个只需要修改tomcat配置

> > 存在问题

1. session同步会占用带宽
2. 占用后台服务器的内存，如果有100个服务器，一个服务器就要存100个服务器的session信息

> hash一致性

只要是同一个ip来源，我们就让他进入同一个服务器

> > 优点

1. 只需要改nginx配置，不需要修改应用代码
2. 可以支持web-server水平扩展

> > 缺点

1. session还是存在web-server中的，所以web-server重启可能导致部分session丢失，影响业务，如部分用户需要重新登录
2. 水平扩展，影响hash一致性

> session统一存储

# 分布式Session 

> 基本使用

1. 引入jar

```xml
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

2. 开启springsession

```java
@SpringBootApplication
@EnableRedisHttpSession
public class SessionApplication
```

3. 使用session: 就像普通的session那样去使用

```
@PostMapping("/login")
public String login(LoginDTO loginDTO, HttpSession session, HttpServletResponse response) {
    session.setAttribute("admin", loginDTO.getUsername());
    return "redirect:http://laoxiao.com";
}
```

可以看到，访问之后有对应的cookie

而且他的作用域是www.laoxiao.com

![image-20220108172138326](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/message/20220108172150.png)

而且redis也有对应的数据

![image-20220108172214157](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/message/20220108172215.png)

> 自定义cookie

修改cookie的name和它的作用域

```java
@Bean
public CookieSerializer cookieSerializer() {
    DefaultCookieSerializer serializer = new DefaultCookieSerializer();
    serializer.setCookieName("LAOXIAOJSESSION");
    serializer.setDomainNamePattern(".laoxiao.com");
    return serializer;
}
```

# sso流程

![](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/message/20220108205559.png)



# 开放平台

- 开放平台网关
  - 请求接入
  - 流量控制
  - 权限控制
- 开发者中心
  - 开发者注册
  - 文档
- 授权中心
  - 哪些app能访问
- 控制后台

## 平台开发者权限验证

- 基于 App key 与 secret实现
  - 防止串改
  - 防止伪造
  - 防止重复使用签名

## 用户权限验证

用户权限值第三方系统是否具备某部分用户指定范围的授权

- 自动授权模式
  - 该模式下第三方必须事web系统，通过重定向方式授权
  - (web应用----web应用)
- 手动授权模式
  - 通过浏览器交互自动生成一个长期有效token，并配置第三方应用中

# OAuth2.0

- 一个开发标准，允许第三方应用访问该用户在某一网站存储的私有资源
- 认证和授权过程各方
  - 服务提供方：开发平台内部 -- 应用体系
  - 用户：商城买家卖家
  - 客户端: 要访问服务提供方资源的第三方应用
  - 资源服务器：开放平台 -- 网关
  - 认证服务器：开放平台 -- 授权中心

## OAuth2.0授权模式

- 授权码模式
  - code授权模式
  - 如qq登录，跳转到qq授权中心，点授权之后，跳转到第三方应用，获取code
- 密码模式
  - 账号密码给第三个
- 客户端模式
  - 内部应用一般采用

## 授权码模式

owner: 用户

user-agent: 浏览器

authorization：认证服务器（只参与授权，没有资源）

client：第三个应用



![](..\image\java\OAuth2\0.png)

> 交互流程

1. 客户端携带 client_id, scope, redirect_uri, state 等信息引导用户请求授权服务器的授权端点下发 code。
2. 授权服务器验证客户端身份，验证通过则询问用户是否同意授权（此时会跳转到用户能够直观看到的授权页面，等待用户点击确认授权）。
3.  假设用户同意授权，此时授权服务器会将 code 和 state（如果客户端传递了该参数）拼接在 redirect_uri 后面，以302(重定向)形式下发 code。
4. 客户端携带 code, redirect_uri, 以及 client_secret 请求授权服务器的令牌端点下发 access_token。
5. 授权服务器验证客户端身份，同时验证 code，以及 redirect_uri 是否与请求 code 时相同，验证通过后下发access_token，并选择性下发 refresh_token，支持令牌的刷新。  

> 简化模式流程

1. 资源拥有者直接通过客户端发起认证请求。
2. 客户端提供用户名和密码， 向认证服务器发起请求认证。
3. 认证服务器通过之后， 客户端（Client）拿到令牌 token 后就可以向第三方的资源服务器请求资源了。 

## 密码模式

1. 资源拥有者直接通过客户端发起认证请求。
2. 客户端提供用户名和密码， 向认证服务器发起请求认证。
3. 认证服务器通过之后， 客户端（Client）拿到令牌 token 后就可以向第三方的资源服务器请求资源了。  