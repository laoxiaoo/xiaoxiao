# 

# Enable编程模型

## 简单模式

- ps:Configuration如果在componentscan里面，一样会生效，所以不建议这样写
- 定义一个config

```java
@Configuration
public class HelloWordConfig {

    @Bean
    public String helloWord() {
        return "helloWord";
    }
}
```

- 编写enbale注解

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(HelloWordConfig.class)
public @interface EnableHelloWord {

}
```

- 编写启动类，启动enable相关bean

```java
@EnableHelloWord
public class HelloWordBootStrap {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
        applicationContext.register(HelloWordBootStrap.class);
        applicationContext.refresh();
        String bean = applicationContext.getBean("helloWord", String.class);
        System.out.println(bean);
        applicationContext.close();
    }
}
```




## ImportSelector模式

- 模拟启动服务

- 建立一个接口，下面实现两个实现类，分别是ftp服务，http服务

```java
public interface Server {
    /**
     * 启动
     */
    void start();
    /**
     * 停止
     */
    void stop();
    enum Type {
         FTP,
        HTTP,
        ;
    }
}
```

- 定义一个selector,如果启动ftp，则返回ftp的实现类

```java
public class ServerSelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        Map<String, Object> annotationAttributes = importingClassMetadata.getAnnotationAttributes(EnableServer.class.getName());
        Server.Type type = (Server.Type) annotationAttributes.get("type");
        if(Server.Type.FTP.equals(type)) {
            return new String[] {FtpServerImpl.class.getName()};
        } else {
            return new String[] {HttpServerImpl.class.getName()};
        }
    }
}
```

- 定义一个注解

```java
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Target(ElementType.TYPE)
@Import(ServerSelector.class)
public @interface EnableServer {

    Server.Type type();
}
```

## ImportBeanDefinition

- 使用beandefinition的方式

```java
public class ServerBeanDefinition implements ImportBeanDefinitionRegistrar {

    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
        BeanDefinitionBuilder beanDefinitionBuilder = BeanDefinitionBuilder.genericBeanDefinition(HttpServerImpl.class.getName());
        AbstractBeanDefinition beanDefinition = beanDefinitionBuilder.getBeanDefinition();
        BeanDefinitionReaderUtils.registerWithGeneratedName(beanDefinition, registry);
    }
}
```

- 引入

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(HelloWordConfig.class)
```