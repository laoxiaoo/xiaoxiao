# 类与接口

## 在公有域中使用方法

1. 如果类可以被其他包访问，就提供访问方法

## 不可变类遵循原则

1. 不提供修改状态方法
2. 不可继承
3. 声明的域是final的
4. 声明的域是private
5. 确保对于任何可变组件的互斥访问
   1. 注意构造器 访问方法 和 readObject中使用保护性拷贝，可以重新创造一个对象，不要几个方法共同产生一个对象。

## 接口优于抽象类

### 骨架类实现

1. 简单实现： AbstractMap.SimpleEntry

### 接口只用于定义类型
