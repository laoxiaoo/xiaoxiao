





# 集合

## Set工具Api

- 定义一个set工具

- 前三个方法通过将第一个参数的引用复制到新的 **HashSet** 对象中来复制第一个参数，因此不会直接修改参数集合。因此，返回值是一个新的 **Set** 对象。

```java
public class Sets {
    // 并集
    public static <T> Set<T> union(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.addAll(b);
        return result;
    }
	//交集
    public static <T> Set<T> intersection(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.retainAll(b);
        return result;
    }
	// 从 superset 中减去 subset 的元素
    public static <T> Set<T> difference(Set<T> superset, Set<T> subset) {
        Set<T> result = new HashSet<>(superset);
        result.removeAll(subset);
        return result;
    }

    public static <T> Set<T> complement(Set<T> a, Set<T> b) {
        return difference(union(a, b), intersection(a, b));
    }
}
```



# 文件

## Path

- Paths#get(java.lang.String, java.lang.String...)

- 绝对路径转为相对路径

```java
//toAbsolutePath：获取项目上两层的目录
//normalize：将相对路径转为绝对路径
System.out.println(Paths.get("..", "..").toAbsolutePath().normalize());
```

- 移除path的根路径

```java
//D:\git\gitee
Path path = Paths.get("..", "..").toAbsolutePath().normalize();
//D:\git\gitee\learning\stu-java-base\TestPath.java
Path path1 = Paths.get("TestPath.java").toAbsolutePath();
//learning\stu-java-base\TestPath.java
System.out.println(path.relativize(path1));
```

- 拼接地址, 将原有的地址拼接other字符串，再返回一个新的地址

```java
Path resolve(String other);
```

- 判断起始路径

```java
System.out.println(testTmp.startsWith("D:\\"));
```

## 文件系统

- 获取文件系统

```java
FileSystem fsys = FileSystems.getDefault();
```

- 获取操作系统的盘符：fsys.getFileStores()
- 获取根目录集合：fsys.getRootDirectories()
- 获取系统文件目录分隔符：fsys.getSeparator()

### 路径监听

```java
//监听这个文件夹下的文件
Path resolve = testTmp.resolve("test");
WatchService watcher = FileSystems.getDefault().newWatchService();
resolve.register(watcher, ENTRY_DELETE);
//watcher.take() 将等待并阻塞在这里。当目标事件发生时，会返回一个包含 WatchEvent 的 Watchkey 对象
WatchKey key = watcher.take();
for(WatchEvent evt : key.pollEvents()) {
    System.out.println("evt.context(): " + evt.context() +
            "\nevt.count(): " + evt.count() +
            "\nevt.kind(): " + evt.kind());
    System.exit(0);
}
```

## 文件匹配

```java
//按照glob匹配，也可以regex匹配
PathMatcher pathMatcher = FileSystems.getDefault().getPathMatcher("glob:*.java");
Files.walk(test).filter(pathMatcher::matches).forEach(System.out::println);
```

## 文件读写

### 小文件读取

采用`Files.readAllLines()` 一次读取整个文件

```java
PathMatcher pathMatcher = FileSystems
                .getDefault()
                .getPathMatcher("glob:**/TestPath.java");
Files.readAllLines(Files.walk(test)
                .filter(pathMatcher::matches)
                .findFirst().orElse(null))
                .stream()
                .forEach(System.out::println);
```

### 大文件读取

`Files.lines()`

# IO



# 注解

Java 语言中的类、方法、变量、参数和包等都可以被标注

## 文档类型注解(编写文档)

```java
/**
 *  注解javadoc演示
 *  @author xiao
 *  @version 1.o
 *  @since 1.5
 */
public class AnnoDemo1 {
    /**
     * 计算两个数的和
     * @param a 加数
     * @param b 加数
     * @return 两个数的和
     */
    public int add(int a, int b) {
        return a+b;
    }
}
```

- 使用元组时，你只需要定义一个长度适合的元组，将其作为返回值即可

```java
static Tuple2<String, Integer> f() {
    return new Tuple2<>("hi", 47);
}
public static void main(String[] args) {
    Tuple2<String, Integer> ttsi = f();
    System.out.println(k());
}
```

## 预定义注解

**@Override**

检测方法是否继承父类

**@Deprecated**

标注内容已过时

**@SuppressWarnings**

压制警告，一般传递参数 all

## 自定义注解

### 格式

元注解

public @interface 注解名称 ｛｝

```java
public @interface MyAnno {
}
```

注解本质是一个继承了**Annotation接口**的接口

### 属性

接口可以定义的内容（成员方法）

要求

返回类型必须是：**基本数据类型，String， 枚举，注解，以上数据类型的数组**

定义了属性以后，使用属性时必须赋值

```java
public @interface MyAnno {
    int age();
}
```

```java
@MyAnno(age = 11)
```

如果不想赋值

```java
int age() default 1;
```

如果只有一个属性，则将属性名定义value，则属性值默认就value

```java
public @interface MyAnno {
    int value() default 1;
}
```

```java
@MyAnno(11)
```

### 元注解

用于描述注解的注解

RetentionPolicy一般都是runtime阶段

- @Target:注解的作用目标　　　　　　　　

　　　　@Target(ElementType.TYPE)   //接口、类、枚举、注解

　　　　**@Target(ElementType.FIELD) //字段、枚举的常量**

　　　　**@Target(ElementType.METHOD) //方法**

　　　　**@Target(ElementType.PARAMETER) //方法参数**

　　　　**@Target(ElementType.CONSTRUCTOR)  //构造函数**

　　　　**@Target(ElementType.LOCAL_VARIABLE)//局部变量**

　　　　**@Target(ElementType.ANNOTATION_TYPE)//注解**

　　　　**@Target(ElementType.PACKAGE) ///包**  



```java
@Target(ElementType.METHOD) //注解作用范围
@Retention(RetentionPolicy.SOURCE) //注解被保留的阶段
@Documented//注解是否被抽取到文档api
@Inherited //是否被继承
```

### 程序中解析注解

注解其实就是用来取动态的配置的值得

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnno {
    int value() default 1;

    String className();

    String method();
}
```

获取注入的值

```java
@MyAnno(method = "show", className = "com.xiao.stu_es.annotation.MyAnno")
public class Test {
    public static void main(String[] args) {
        Class<Test> testClass = Test.class;
        MyAnno annotation = testClass.getAnnotation(MyAnno.class);
        //获取注解注入的值
        String className = annotation.className();
        String method = annotation.method();
        System.out.println(className);
        System.out.println(method);
    }
}
```

# 响应式编程

核心类：java.util.concurrent.Flow

> 核心类中定义了几个接口

- Subscription 接口定义了连接发布者和订阅者的方法；
- Publisher<T> 接口定义了发布者的方法；
- Subscriber<T> 接口定义了订阅者的方法；
- Processor<T,R> 接口定义了处理器；

## 发布订阅demo

> 普通模式

- 可以看出，与其他观察者模式不同的是，flow是发布者主动向生产者请求获取数据

```java
//定义一个发布者，发布数据
//此处使用jdk9自带的，他实现了Publisher接口
SubmissionPublisher<Integer> publisher = new SubmissionPublisher<>();

//定义一个订阅者
Flow.Subscriber<Integer> subscriber = new Flow.Subscriber<>() {
    private Flow.Subscription subscription;
    @Override
    public void onSubscribe(Flow.Subscription subscription) {
        //建立订阅关系的时候调用
        //保存订阅关系，用于后面想发布者请求数据
        this.subscription = subscription;
        //向发布者请求一条数据
        subscription.request(1);
    }

    @Override
    public void onNext(Integer item) {
        //接收到数据
        System.out.println(item);
        //获取一条数据后向服务器端请求数据
        subscription.request(1);
        //也可以告诉发布者不再接受数据
        //subscription.cancel();
    }

    @Override
    public void onError(Throwable throwable) {
        //发生异常调用
        System.out.println(throwable);
    }

    @Override
    public void onComplete() {
        //发布者关闭时候调用
        System.out.println("处理完了....");
    }
};
//发布者与订阅者产生关系
publisher.subscribe(subscriber);
//发布数据
publisher.submit(1);
publisher.submit(2);
//关闭发布者
publisher.close();
Thread.sleep(10000);
```

> 添加processor

- Processor相当于一个中间过滤的作用

- Processor,需要继承SubmissionPublisher并实现Processor接口

> > 定义一个自己的processor

- 输入源数据integer，过滤掉小于0的,然后转换成字符串发布出去

```java
class MyProcessor extends SubmissionPublisher<String> implements Flow.Processor<Integer,String> {
    private Flow.Subscription subscription;
    @Override
    public void onSubscribe(Flow.Subscription subscription) {
        this.subscription = subscription;
        subscription.request(1);
    }
    @Override
    public void onNext(Integer item) {
        if(item>0) {
            this.submit("获取到数据："+ item);
        }
        subscription.request(1);
    }
    @Override
    public void onError(Throwable throwable) { 
    }
    @Override
    public void onComplete() {
        this.close();
    }
}
```

> > 调用者调整

- 调用者需要对调整订阅的相关代码
- 发布者直接关联的是processor

```java
MyProcessor processor = new MyProcessor();

//发布者与订阅者产生关系
publisher.subscribe(processor);
processor.subscribe(subscriber);
```


