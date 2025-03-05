# 源码解析

# 服务注册过程

## 服务注册过程图

![image-20221108193619190](image/image-20221108193619190.png)

## 注册过程解析

1. 在org.apache.dubbo.config.ServiceConfig#doExportUrlsFor1Protocol方法中，调用org.apache.dubbo.rpc.ProxyFactory#getInvoker生成Invoker
2. 调用org.apache.dubbo.registry.integration.RegistryProtocol#export方法注册地址

# 服务消费过程

## 服务消费图

![](./image/20221108192658.png)

## 消费过程解析

1. 在org.apache.dubbo.config.ReferenceConfig#init方法中，调用createProxy 方法创建Invoker
2. 调用org.apache.dubbo.rpc.ProxyFactory#getProxy将Invoker变成真正的远程调用代理对象

# URL规则详解

protocol://username:password@host:port/path?key=value&key=value

**protocol：**协议，也就是我们常说的HTTP协议和https协议，当然还有其他协议 FTP和SMTP等。

**username:**password:用户名和密码，一般都为空

**host:port：** ip和端口，IP一般也也域名

**path：**请求的路径

# 服务本地缓存

Dubbo在**服务引用过程**（调用服务方法）中会创建registry对象并加载本地缓存文件，会优先订阅注册中心，订阅注册中心失败后会访问本地缓存文件内容获取服务提供信息。

核心类：

AbstractRegistry