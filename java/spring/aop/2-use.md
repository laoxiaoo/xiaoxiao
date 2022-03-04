# Aop Api整体设计

## Joinpoint

用于执行对应的方法

![image-20220226150100480](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/message/20220226150109.png)

-  CglibMethodInvocation

基于cglib

-  ReflectiveMethodInvocation

基于反射

## Pointcut

- joinpoint 条件接口

两个

```java
public interface Pointcut {
   //判断类是不是符合
   ClassFilter getClassFilter();
   //判断方法是否符合
   MethodMatcher getMethodMatcher();
```

### 便利实现

> 静态：StaticMethodMatcherPointcut

实现他的matches方法，在这个方法里写条件，来判断是否拦截方法

如：

```java
public class EchoMatcherService extends StaticMethodMatcherPointcut {
    @Override
    public boolean matches(Method method, Class<?> targetClass) {
        return true;
    }
}
```

> 正则表达式：JdkRegexpMethodPointcut



> 控制流： ControlFlowPointcut

## AspectJ实现

> 实现类：org.springframework.aop.aspectj.AspectJExpressionPointcut

> 表达式：PointcutExpression

- 里面有两种匹配模式: 方法和构造器
- spring只实现了方法级别

`spring桥接了AspectJ的语法`

## Advice

执行动作接口

>  Interceptor

首先它本身就是Advice

其实他相当于around advice

> BeforeAdvice



> AfterAdvice
