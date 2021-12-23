# @Value注入属性值

> 常用操作方式

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

> 原理

- 在DefaultListableBeanFactory#doResolveDependency中

```java
String strVal = resolveEmbeddedValue((String) value);//获取@Value的value值
Object value = getAutowireCandidateResolver().getSuggestedValue(descriptor);
//获取解析的值
String strVal = resolveEmbeddedValue((String) value);
```

> 操作方式

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

