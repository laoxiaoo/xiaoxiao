

# Environment

## Evironment依赖注入

- 通过EnvironmentAware接口回调
- 通过@Autowired
- ApplicationContext#getEnvironment获取

## Environment依赖查找

```java
@Autowired
private Environment environment;

public static void main(String[] args) {
    AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
    applicationContext.register(LookupEnvironmentDemo.class);
    applicationContext.refresh();
    //依赖查找
    Environment environmentTmp = applicationContext.getBean(ConfigurableApplicationContext.ENVIRONMENT_BEAN_NAME, Environment.class);
    System.out.println(environmentTmp == applicationContext.getBean(LookupEnvironmentDemo.class).environment);
    applicationContext.close();
}
```

## 获取配置文件属性值

- 源码入口方法：ConfigurationClassParser#doProcessConfigurationClass

> 使用@PropertySource注解 

1. 建立配置文件testBean.properties

```pro
testBean.realName=真实的张三
```

2. 建立实体bean，使用${testBean.realName}获取配置文件信息

```java
public class TestBean {

    @Value("张三")
    private String username;
    @Value("#{2+3}")
    private String password;
    @Value("${testBean.realName}")
    private String realname;
```

3. 在配置java类中，获取配置文件信息，不要手贱加空格哈，我就加了，哈哈哈哈。。。。

```java
@Configuration
@PropertySource(value = "classpath:/testBean.properties")
public class MainConfig2 {
    @Bean
    public TestBean testBean(){
       return  new TestBean();
    }
}
```

> 也可以通过applicationContext获取配置信息

打印：

TestBean{username='张三', password='5', realname='真实的张三'}
真实的张三

```java
@Test
public void testBeanConfig1(){
    AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig2.class);
    //获取这个配置类中的容器中的所有bean
    TestBean testBean = (TestBean)applicationContext.getBean("testBean");
    System.out.println(testBean.toString());
    //还可以通过这种方式获取配置信息
    ConfigurableEnvironment environment = applicationContext.getEnvironment();
    String realname =  environment.getProperty("testBean.realName");
    System.out.println(realname);
    applicationContext.close();
}
```

# Value注解注入属性值

## 常用操作方式

 @Value("张三"):直接赋值方式

 @Value("#{2+3}")：SPEL表达方式

 @Value("${}"):直接取配置文件属性值

```java
public class TestBean {

    @Value("张三")
    private String username;
    @Value("#{2+3}")
    private String password;
```

> 示例

```java
//常量
@Value("#{1}")
private int constant;
//从属性源取值
@Value("${test.name}")
private String name;

//从属性源取值
@Value("${test.name2: defaultname}")
private String namedefault;

//从容器中获取bean的的属性值
@Value("#{developerProperty.name}")
private String dname;

//从指定属性源获取属性值(jvm属性)
@Value("#{systemProperties['spring.application.json']}")
private String systemPropertiesjson;

//从指定属性源获取属性值（系统环境属性源）
@Value("#{systemEnvironment['HOME']}")
private String systemEnvironmentHOME;

//从指定属性源获取属性值 默认值
@Value("#{systemEnvironment['HOME22']?:'default'}")
private String systemEnvironmentHOMEdefault;

//获取随机值
@Value("${random.int.5,100;}")
private Integer randomint;
```

## 原理

- 在DefaultListableBeanFactory#doResolveDependency中

```java
String strVal = resolveEmbeddedValue((String) value);//获取@Value的value值
Object value = getAutowireCandidateResolver().getSuggestedValue(descriptor);
//获取解析的值
String strVal = resolveEmbeddedValue((String) value);
```



# 匹配配置文件的前缀

1. 在yml配置文件配置相应属性

```yaml
#自定义注入yaml的属性（com.xiao.bean.TestYaml）
testyaml:
  name: zhangsan
  name2: "zhang \t san"
  name3: 'zhang \t san'
  user1:
    name: zhangsan #对象第一种方式
  user2: {name: zhangsan} #对象第二种方式
  map:
    value: map1 # map第一种方式
  map1: {value: map2}
  lists: #z注意，list的变量定义一定以s结尾
    - a
    - b
```

2. 使用ConfigurationProperties进行属性的匹配，注入其中

```java
@Component
@ConfigurationProperties(prefix = "testyaml")//表示将那个前缀属性注入这个bean中
public class TestYaml {
    private String name;
    private String name2;//测试双引号
    private String name3;//测试单引号

    private User user1;
    private User user2;

    private Map map;
    private Map map1;
    private List lists;
    private List list1s;
    public String getName() {
        return name;
    }
```

# 加载自定义配置文件

`这种方式只能加载properties文件`

1. 在classpath下建立testyaml.properties文件

```properties
testyaml.name=zhangsan
testyaml.name2="zhang \t san"
testyaml.name3='zhang \t san'
testyaml.user1.name=haha
testyaml.map.k1=ll
testyaml.lists=1,2,3
```

2. 使用<b id="blue">@PropertySource</b>注解加载自定义的配置文件

```java
@PropertySource(value = "classpath:testyaml.properties")
@Component
@ConfigurationProperties(prefix = "testyaml")
public class TestYaml
```

# PropertiesFactoryBean

1. 在meta-inf 目录下定义一个文件

/META-INF/test-config.properties

2. 加载属性文件

```java
@Configuration
public class Config {

    @Bean("propertiesFactoryBean")
    public PropertiesFactoryBean propertiesFactoryBean(@Value("classpath:/META-INF/test-config.properties")
                                                            Resource resource) {
        PropertiesFactoryBean propertiesFactoryBean = new PropertiesFactoryBean();
        propertiesFactoryBean.setLocation(resource);
        return propertiesFactoryBean;
    }

    //读取文件中的内容
    @Value("#{propertiesFactoryBean['name']}")
    public String name;
```

# 配置文件的占位符

```properties
#当占位符不存在，使用:后面的补充值
testyaml.name=${testyaml.test:补充值}zhangsan
#使用随机值
testyaml.name2=${randon.uuid}zhang san
#使用配置值
testyaml.name3=${testyaml.name}zhang san

testyaml.user1.name=haha
testyaml.map.k1=ll
testyaml.lists=1,2,3
```

# 生产与开发切换

> 使用文件名的方式

我们在主配置文件编写的时候，文件名可以是   application-{profile}.properties/yml

现在，我们由application.yml、application-dev.yml（开发）、application-prod.yml（生产）三个文件

只需要在application.yml中配置，便可指定对应的配置文件，如指定开发环境

```yaml
spring:
  profiles:
    active: dev 
```

> 使用yaml的document方式

yaml的---表示文档分割线

```yaml
spring:
  profiles:
    active: prod
server:
  port: 8081 #配置端口号


---
server:
  port: 8082 #配置端口号
spring:
  profiles: dev
---
server:
  port: 8083 #配置端口号
spring:
  profiles: prod
```

> 激活环境

在激活profile的模式时，可以在配置文件中

```yaml
spring:
  profiles:
    active: prod
```

**也可以在jar包运行时**

java -jar xx.jar --spring.profiles.active=dev；

**也可以配置虚拟机参数**

-Dspring.profiles.active=dev

# 配置文件的优先级

springboot 启动会扫描以下位置的application.properties或者application.yml文件作为Spring boot的默认配置文件（file表示项目根目录）

–file:./config/

–file:./

–classpath:/config/

–classpath:/

优先级由高到底，高优先级的配置会覆盖低优先级的配置；

SpringBoot会从这四个位置全部加载主配置文件；**互补配置**（高优先级的配置会覆盖低优先级的相同配置属性）；

==我们还可以通过spring.config.location来改变默认的配置文件位置==

**项目打包好以后，我们可以使用命令行参数的形式，启动项目的时候来指定配置文件的新位置；指定配置文件和默认加载的这些配置文件共同起作用形成互补配置；**

java -jar xx.jar --spring.config.location=G:/application.properties
