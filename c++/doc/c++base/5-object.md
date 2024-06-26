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

