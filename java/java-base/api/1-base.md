# 
# 接口和抽象类

> 区别

1. 抽象类可以存在普通成员函数，而接口中只能存在public abstract方法。
2. 抽象类中的成员变量可以是各种类型的，而接口中的成员变量只能是public static final类型的。
3. 抽象类只能继承一个，接口可以实现多个。

> 使用场景

1. 接口的设计目的，是对类的行为进行约束。 一般我们想约束实现的类，或者将类暴露出去，则使用接口
2. 而抽象类的设计目的，是代码复用。一般通用性的代码，放在abstract中

# 泛型

## 元组里面的应用

- 将一组对象直接打包存储于单一对象中。可以从该对象读取其中的元素，但不允许向其中存储新对象

### get方法的另一种优化

- 下面是一个可以存储两个对象的元组
  - 为什么a1 a2 不是private类型（安装java规范，应该是定义private类型，然后定义getset方法来操作）
  - 元组的使用程序可以读取 `a1` 和 `a2` 然后对它们执行任何操作，但无法对 `a1` 和 `a2` 重新赋值。例子中的 `final` 可以实现同样的效果，并且更为简洁明了。
  - 这里不可以再对元祖赋值了，只有初始化的时候可以赋值，所以可以这样优化代码

```java
public class Tuple2<A, B> {
    public final A a1;
    public final B a2;
    public Tuple2(A a, B b) { a1 = a; a2 = b; }
}
```

## 泛型擦除

### 擦除概念

1. Java的泛型是使用擦除实现的 ，这是因为Java在编译期间，所有的泛型信息都会被擦掉

2. 因此， List<String> 和 List<Integer> 在运行时实际上是相同的类型。它们都被擦除成原生类型 List 

3. 无论两个T无论是啥类型，他们的class都是相同的

```java
//结果输出为：true
public static void main(String[] args) {
    Class c1 = new ArrayList<String>().getClass();
    Class c2 = new ArrayList<Integer>().getClass();
    System.out.println(c1 == c2);
}
```

### 泛型边界

1. 泛型类型参数会擦除到它的第一个边界

2. 如下，编译器是无法通过编译的，因为 obj.f(); obj是不知道什么类型的，只有改成Manipulator2<T extends HasF>，才能通过编译，因为泛型会擦除到边界（HasF），T 擦除到了 HasF 

```java
class Manipulator<T> {
    private T obj;
    
    Manipulator(T x) {
        obj = x;
    }
    public void manipulate() {
        obj.f();
    }
}
public class Manipulation {
    public static void main(String[] args) {
        HasF hf = new HasF();
        Manipulator<HasF> manipulator = new Manipulator<>(hf);
        manipulator.manipulate();
    }
}
```

`字节码指令在set值的时候，编译阶段会进行校验，他的描述符是String`

```java
class Border2<T extends String> {
    T t;
    public T setT(T t){
        this.t = t;
        return this.t;
    }
}
```

方法的描述符：

```tex
<(Ljava/lang/String;)Ljava/lang/String;>
```

## 获取泛型的class

java泛型使用**“擦拭法”** , 导致java的泛型不能直接获取到自身声明的泛型类型,但是可以通过父类的方式获取

```java
public abstract class TypeReference<T> {
    private final Type type;

    protected TypeReference() {
        //获取当前匿名类的对象（即实现类）
        Class<?> parameterizedTypeReferenceSubclass = findParameterizedTypeReferenceSubclass(this.getClass());
        //获取当前 ParameterizedType
        Type type = parameterizedTypeReferenceSubclass.getGenericSuperclass();
        ParameterizedType parameterizedType = (ParameterizedType) type;
        this.type = parameterizedType.getActualTypeArguments()[0];
    }

    public Type getType() {
        return this.type;
    }

    public boolean equals(Object obj) {
        return this == obj || obj instanceof TypeReference && this.type.equals(((TypeReference) obj).type);
    }

    public int hashCode() {
        return this.type.hashCode();
    }

    public String toString() {
        return "TypeReference<" + this.type + ">";
    }

    private static Class<?> findParameterizedTypeReferenceSubclass(Class<?> child) {
        Class<?> parent = child.getSuperclass();
        if (Object.class == parent) {
            throw new IllegalStateException("Expected TypeReference superclass");
        } else {
            return TypeReference.class == parent ? child : findParameterizedTypeReferenceSubclass(parent);
        }
    }
}
```