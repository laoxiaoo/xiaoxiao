#
# 编程模型

- 观察者模式拓展
  - 消息发送者：java.util.Observable
  - 观察者：java.util.Observer
- 标准化接口(没有特殊规则，一般都是约束)
  - 事件对象：java.util.EventObject
  - 事件接听器：java.util.EventListener
- java示例

```java
public static void main(String[] args) {
    EventObservable eventObservable = new EventObservable();
    eventObservable.addObserver(new EventObserver());
    eventObservable.notifyObservers("发送某某消息");
}

static class EventObservable extends Observable {
    @Override
    public void notifyObservers(Object arg) {
        //需要将事件打开
        super.setChanged();
        super.notifyObservers(arg);
        super.clearChanged();
    }
}

static class EventObserver implements Observer {
    @Override
    public void update(Observable o, Object arg) {
        System.out.println("收到事件： " + arg);
    }
}
```

# Spring标准事件

- org.springframework.context.ApplicationEvent 
- 拓展：org.springframework.context.event.ApplicationContextEvent

# Spring监听器

## 基于接口

- 基于EventListener扩展
- 扩展接口：org.springframework.context.ApplicationListener
- 处理单一类型事件

- 示例

```java
GenericApplicationContext applicationContext = new GenericApplicationContext();
applicationContext.addApplicationListener(new ApplicationListener<ApplicationEvent>() {
    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        System.out.println("收到事件:"+event);
    }
});
applicationContext.refresh();
applicationContext.start();
applicationContext.close();
```

- 打印日志

```
---
org.springframework.context.event.ContextRefreshedEvent
----
org.springframework.context.event.ContextStartedEvent
-----
org.springframework.context.event.ContextClosedEvent
```

## 基于注解



- 示例

```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
    applicationContext.register(AnnotationListenerDemo.class);

    applicationContext.refresh();
    applicationContext.close();
}

@EventListener
public void commonEvent(ApplicationEvent event) {
    System.out.println("事件:"+event);
}
```

- 专属事件

```java
@EventListener
public void refreshEvent(ContextRefreshedEvent event) {
    System.out.println("refresh事件:"+event);
}
```

# 事件发布器

- org.springframework.context.ApplicationEventPublisher	
  - 依赖注入
  - 示例

```java
public class AnnotationListenerDemo implements ApplicationEventPublisherAware {
    @Override
    public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        applicationEventPublisher.publishEvent(new ApplicationEvent("发布事件") {
        });
    }
}
```

- org.springframework.context.event.ApplicationEventMulticaster
  - 依赖注入
  - 依赖查找

## 注入ApplicationEventPublisher	

- 通过ApplicationEventPublisherAware接口（ApplicationContext是ApplicationEventPublisher的子类，也可以通过它来发布，但是注入顺序可以参考aware执行顺序）
- 通过@Autowired注入ApplicationEventPublisher

# 原理

- 核心类：org.springframework.context.event.SimpleApplicationEventMulticaster
- 添加事件：AbstractApplicationEventMulticaster#addApplicationListener

## 事件发布流程

-  进入refresh()方法，执行finishRefresh();方法，再执行publishEvent(new ContextRefreshedEvent(this));发布事件
-  进入getApplicationEventMulticaster().multicastEvent(applicationEvent, eventType);方法（获取事件的多播器（派发器）：getApplicationEventMulticaster()）
-  进入multicastEvent()方法派发事件

```java
@Override
public void multicastEvent(final ApplicationEvent event, ResolvableType eventType) {
   ResolvableType type = (eventType != null ? eventType : resolveDefaultEventType(event));
   for (final ApplicationListener<?> listener : getApplicationListeners(event, type)) {
      Executor executor = getTaskExecutor();
      if (executor != null) {
         executor.execute(new Runnable() {
            @Override
            public void run() {
               invokeListener(listener, event);
            }
         });
      }
      else {
         invokeListener(listener, event);
      }
   }
}
```

## 事件多播器
拥有监听器对象，提供发布事件的功能，遍历监听器，监听器来处理自己需要处理的事件

在refresh（）方法中，在其他bean创建之前，执行initApplicationEventMulticaster();方法，来初始化事件多播器

# 注解的方式建立监听

```java
@Component
public class MyListener {
    @EventListener(classes = ApplicationEvent.class)
    public void listener(ApplicationEvent event){
        System.out.println("收到注解的事件监听:"+event);
    }
}
```

# 事件异常处理

- 当事件出现异常是，处理信息

- 在SimpleApplicationEventMulticaster中有个ErrorHandler属性
- 需要调用SimpleApplicationEventMulticaster#setErrorHandler方法才会生效

# 内置事件
## ContextRefreshedEvent
在ConfigurableApplicationContext的refresh()执行完成时，会发出ContextRefreshedEvent事件