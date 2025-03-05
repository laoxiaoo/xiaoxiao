# 常用的一些api


# logback

- 模块

1. logback-core：其它两个模块的基础模块
2. logback-classic：它是log4j的一个改良版本，同时它完整实现了slf4j API使你可以很方便地更换成其它日志系统如log4j或JDK14 Logging
3. logback-access：访问模块与Servlet容器集成提供通过Http来访问日志的功能

## 有效级别及级别的继承

 Logger 可以被分配级别。级别包括：TRACE、DEBUG、INFO、WARN 和 ERROR，定义于ch.qos.logback.classic.Level类。如果 logger没有被分配级别，那么它将从有被分配级别的最近的祖先那里继承级别。root logger 默认级别是 DEBUG

## Logback的配置文件

- 根节点<configuration>,包含下面三个属性
  - scan: 当此属性设置为true时，配置文件如果发生改变，将会被重新加载，默认值为true。
  - scanPeriod: 设置监测配置文件是否有修改的时间间隔，如果没有给出时间单位，默认单位是毫秒。当scan为true时，此属性生效。默认的时间间隔为1分钟。
  - debug: 当此属性设置为true时，将打印出logback内部日志信息，实时查看logback运行状态。默认值为false。

```xml
<configuration scan="true" scanPeriod="60 seconds" debug="false"> 
　　　　　　<!--其他配置省略--> 
</configuration>
```

- 子节点配置
  - <contextName>,用来设置上下文名称
  - <property>: 用来定义变量值
  - **<timestamp>：获取时间戳字符串**，他有两个属性key和datePattern
  - **<appender>：负责写日志的组件**，它有两个必要属性name和class

```xml
<configuration scan="true" scanPeriod="60 seconds" debug="false"> 
　　　　　　<property name="APP_Name" value="myAppName" /> 
　　　　　　<contextName>${APP_Name}</contextName> 
　　　　　　<!--其他配置省略--> 
</configuration>
```

```xml

<configuration scan="true" scanPeriod="60 seconds" debug="false"> 
　　　　　　<timestamp key="bySecond" datePattern="yyyyMMdd'T'HHmmss"/> 
　　　　　　<contextName>${bySecond}</contextName> 
　　　　　　<!-- 其他配置省略--> 
</configuration>
```

## **ConsoleAppender** 

- 把日志输出到控制台，有以下子节点

### filter

- <filter>

1. 过滤器，在Logback-classic中提供两个类型的 filters , 一种是 regular filters ，另一种是 turbo filter

## 示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <!--格式化输出：%d表示日期，%thread表示线程名，%-5level：级别从左显示5个字符宽度%msg：日志消息，%n是换行符-->
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>


    <appender name="file" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/debug.log</file>
        <!-- 滚动策略-->
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <!-- 自动压缩-->
            <fileNamePattern>logs/debug_log.%d{yyyy-MM}.%i.log.gz</fileNamePattern>
            <!-- 每100mb进行一次压缩-->
            <maxFileSize>500MB</maxFileSize>
            <!-- 最多保留720个小时内的日志 即30天-->
            <!--<maxHistory>720</maxHistory>-->
            <!-- 总日志超过5gb 会自动清除历史日志文件-->
            <totalSizeCap>5gb</totalSizeCap>
        </rollingPolicy>

        <encoder>
            <pattern>%d{HH:mm:ss.SSS} %-4relative [%thread] %-5level %logger{35} - %msg%n</pattern>
        </encoder>
    </appender>


    <!--文件输出error日志的配置-->
    <appender name="fileErrorLog" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!--为了在error日志中没有info日志，所以我们设置一个过滤器 记住是ThresholdFilter，不是levelFilter-->
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>ERROR</level>
        </filter>

        <encoder>
            <pattern>%d{HH:mm:ss.SSS} %-4relative [%thread] %-5level %logger{35} - %msg%n</pattern>
        </encoder>
        <file>logs/error.log</file>
        <!--滚动策略 按照时间来滚动-->
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <!-- 自动压缩-->
            <fileNamePattern>logs/mq_contract_error.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <!-- 每100mb进行一次压缩-->
            <maxFileSize>100MB</maxFileSize>
            <!-- 最多保留30天日志-->
            <maxHistory>30</maxHistory>
            <!-- 总日志超过5gb 会自动清除历史日志文件-->
            <totalSizeCap>5gb</totalSizeCap>
        </rollingPolicy>
    </appender>

    <logger name="org.apache.http.impl.conn.PoolingHttpClientConnectionManager" level="error"/>
    <root level="error">
        <appender-ref ref="console"/>
        <appender-ref ref="file"/>
        <appender-ref ref="fileErrorLog"/>
    </root>
</configuration>

```

# ASM

ASM是一种通用Java字节码操作和分析框架。它可以用于修改现有的class文件或动态生成class文件。
官网地址：https://asm.ow2.io/

## ASM作用

1. ASM 可以直接产生二进制 class 文件，也可以在类被加载入 Java 虚拟机之前动态改变类行为
2. ASM从类文件中读入信息后，能够改变类行为，分析类信息，甚至能够根据用户要求生成新类

## ASM核心类

主要在:org.objectweb.asm包下

1. ClassReader：解析编译过的class字节码文件
2. ClassWriter：重新构建编译后的类，比如说修改类名、属性以及方法，甚至可以生成新的类的字节码文件
3. ClassAdapter：该类也实现了ClassVisitor接口，它将对它的方法调用委托给另一个ClassVisitor对象

## ClassVisitor方法

- visit:访问类的头部

```java
public void visit(
    final int version,
    final int access,
    final String name,
    final String signature,
    final String superName,
    final String[] interfaces)
    
其中version指的是类的版本；
acess指的是类的修饰符；
name类的名称；
signature类的签名，如果类不是泛型或者没有继承泛型类，那么signature为空；
superName类的父类名称；
```

## 解析Class

- 想要解析一个类，先试下ClassVisitor类
- 这里采用了访问者模式，当访问到字节码的一般信息是，调用visit方法
- 如果访问到字段，调用field方法

```java
public class ClassPrinter extends ClassVisitor {
    public ClassPrinter() {
        super(Opcodes.ASM4);
    }

    @Override
    public void visit(int version, int access, String name, String signature, String superName, String[] interfaces) {
        System.out.println("版本:"+version);
        System.out.println("名字："+name);
    }

    @Override
    public FieldVisitor visitField(int access, String name, String desc, String signature, Object value) {
        System.out.println("读取到字段："+name);
        return super.visitField(access, name, desc, signature, value);
    }

    public static void main(String[] args) throws Exception {
        ClassPrinter printer = new ClassPrinter();
        ClassReader reader = new ClassReader("java.lang.String");
        reader.accept(printer, 0);
    }
}
```

- 输出

```tex
版本:52
名字：java/lang/String
读取到字段：value
读取到字段：hash
读取到字段：serialVersionUID
读取到字段：serialPersistentFields
读取到字段：CASE_INSENSITIVE_ORDER
```

## 生成类

- 通过visit方法，生成一个class的byte
- 再通过自定义的类加载器进行加载，就可以正常的调用了

```java
ClassWriter writer = new ClassWriter(0);
//类基本信息
writer.visit(V1_5, ACC_PUBLIC + ACC_ABSTRACT + ACC_INTERFACE,
        "pkg/Comparable", null, "java/lang/Object",
        null);
//添加字段
writer.visitField(ACC_PUBLIC + ACC_FINAL + ACC_STATIC, "LESS", "I",
        null, new Integer(-1)).visitEnd();
writer.visitField(ACC_PUBLIC + ACC_FINAL + ACC_STATIC, "EQUAL", "I",
        null, new Integer(0)).visitEnd();
writer.visitField(ACC_PUBLIC + ACC_FINAL + ACC_STATIC, "GREATER", "I",
        null, new Integer(1)).visitEnd();
//添加方法
writer.visitMethod(ACC_PUBLIC + ACC_ABSTRACT, "compareTo",
        "(Ljava/lang/Object;)I", null, null).visitEnd();
writer.visitEnd();
byte[] b = writer.toByteArray();
//使用自定义类加载器加载
MyClassLoader loader = new MyClassLoader();
Class newClass = loader.defineClass("pkg.Comparable", b);
System.out.println(newClass.getMethods()[0].getName());
```

## 给Class添加字段

- 反编译ClassPrinter_0可以发现多了一个String类型的Str字段

```java
byte[] bytes = FileUtil.readBytes(ClassLoader.getSystemClassLoader()
        .getResource("")
        .getPath() + "/com/xiao/asm/ClassPrinter.class");

ClassWriter writer = new ClassWriter(0);
ClassVisitor visitor = new ClassVisitor(Opcodes.ASM4, writer) {
    @Override
    public void visitEnd() {
        //添加一个字段
       FieldVisitor field = cv.visitField(Opcodes.ACC_PUBLIC, "str", "Ljava/lang/String;", null, null);
                field.visitEnd();
    }
};
ClassReader reader = new ClassReader(bytes);
reader.accept(visitor, 0);
byte[] byteArray = writer.toByteArray();
FileUtil.writeBytes(byteArray, "ClassPrinter_0.class");
```