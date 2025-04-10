# 面向对象

#  结构体

## 定义

定义一个struct

```c++
struct stuStruct
{
    string name;

    int age;
    //构造方法
    stuStruct() {
        name = "小小";
        age = 18;
    }
	//带参的
    stuStruct(string name, int age) {
        this->age = age;
        this->name = name;
    }

    //定义一个方法
    void toString() {
        cout << name << endl;
        cout << age << endl;
    }
};
```

## 定义与初始化

```c++
//给结构体属性赋值(这里实际调用的就是他的构造方法)
stuStruct ss2 = {"小~", 19};
```

# 枚举

> C++的enum工具提供了另一种创建符号常量的方式，这种方式可以代替const

1. 定义一个枚举

```c++
enum spectrum {blue, green, red};
```

2. 给枚举赋值

```c++
int main()
{
    spectrum se;
    se = green;
    std::cout << se << std::endl;
    return 0;
}
```



# "."与"->"运算符

> 两者使用的区别

<b id="gray">.</b>用于结构名访问属性

<b id="gray">-></b>用于地址访问属性

如：

```c++
stuStruct su = {"laoxiao",2}
su.name;
stuStruct* pSu = &su;
pSu->name;
```

> 如果结构标识符是结构名，则使用句点运算符；如果标识符是指向结构的指针，则使用箭头运算符。 --- <<C++ Primer Plus>> 4.8.3