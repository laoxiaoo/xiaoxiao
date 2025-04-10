# 左值右值

## 定义

[值类别 - cppreference.com](https://zh.cppreference.com/w/cpp/language/value_category)

> 泛左值（glvalue）

标识一个对象、位或函数(与内存关联的)

> 纯右值（prvalue）

1. 用于初始化对象或作为操作数
2. 计算某个运算符的操作数的值
   1. 如 x=1  <b id="gray">=</b>是操作符， 1是操作符的值
   2. 如1+2   <b id="gray">+</b>是操作符。1,2是操作符的值，所以他们是纯右值

> (xvalue)

表示其资源可以被重新使用（通常是因为它即将过期）

## 左值转换成右值

此时，x是左值，但是y=x这个表达式，x转换成了右值

x+y  <b id="gray">+</b>表达式接收的是右值

```c++
int x=3;
int y=x;
x+y
```

# 类型转换



# 关系操作符

## <=>操作符

<b id="gray"><=></b>返回的可能是<b id="gray">std :: strong_ordering</b>(<b id="red">c++20引入</b>)

- 接纳所有六个关系运算符（ == 、 != 、 < 、 <= 、 > 、 >= ）
- 隐含可替换性：若 a 等价于 b ，则 f(a) 亦等价于 f(b) 。这里 f 所指代的函数仅可经由参数的公开 const 成员读取显著的比较状态。换言之，等价的值不可区别（类似java的compare）

`std::strong_ordering` 类型拥有四个合法值，实现为其类型的 const 静态数据成员：

| 成员常量                           | 定义                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| less(inline constexpr)[静态]       | `std::strong_ordering` 类型合法值，指示小于（先序）关系 (公开静态成员常量) |
| equivalent(inline constexpr)[静态] | `std::strong_ordering` 类型合法值，指示等价（既非先序亦非后序），等于 `equal` (公开静态成员常量) |
| equal(inline constexpr)[静态]      | `std::strong_ordering` 类型合法值，指示等价（既非先序亦非后序），等于 `equivalent` (公开静态成员常量) |
| greater(inline constexpr)[静态]    | `std::strong_ordering` 类型合法值，指示大于（后序）关系 (公开静态成员常量) |

```c++
    int a = 1;
    int b = 2;
    auto exp = a <=> b;
    if (exp > 0)
    {
        std::cout << " a大" << std::endl;
    }
    else if (exp < 0)
    {
        std::cout << " b大" << std::endl;
    }
    else
    {
        std::cout << " 相等" << std::endl;
    }
```

