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

