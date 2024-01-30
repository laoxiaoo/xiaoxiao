# 函数



# 函数声明与定义

1. 函数声明只包含函数头，不包含函数体，通常置于头文件中

```c++
//声明一个函数
void fun1();

void fun1() {
    
}
```

2. 函数声明可出现多次，但函数定义通常只能出现一次(存在例外)

## 定义一个给C调用的函数

```c++
extern("C")
void fun1() {
    
}
```

# 参数

## 参数的概念

1. 如果没有形参，则可以用void表示

```c++
void fun1(void) 等价于 void fun1()
```

2. 如果某个形参没有使用，可以没有名称

```c++
void fun1(int, int y) {
    std::cout<<y;
}
```

3. 形参的初始化执行顺序是不定的
   1. 如：先初始化x=1 还是初始化y=2，下面的函数是不能确定的由编译器决定

```c++
void fun1(int x, int y){
    
}
void main() {
    fun1(1, 2)
}
```

## 传参的方式

### 传值

```c++
    int op = 1;
    param1(op);
    std::cout << op << std::endl;
```

op的值会改变

```c++
void param1(int op)
{
    ++op;
}
```

### 传地址

```c++
param2(&op);
std::cout << op << std::endl;
```

op值改变，因为函数里面修改的是地址指向的内容

```c++
void param2(int* op)
{
    ++(*op);
}
```

### 传引用

```c++
param3(op);
std::cout << op << std::endl;
```

op值改变，原理同上

```c++
void param3(int& op)
{
    ++op;
}
```

