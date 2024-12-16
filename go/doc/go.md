# 基础

## 标准文档

https://studygolang.com/pkgdoc

## 安装

> 下载地址

Go官网下载地址：https://golang.org/dl/

Go官方镜像站（推荐）：https://golang.google.cn/dl/

## 环境变量

1. 配置GOROOT（不是必须）

GOROOT的变量值即为GO的安装目录

2. 配置GOPATH（不是必须）

GOPATH的变量值即为存储Go语言项目的路径

新建几个目录：

bin: 存放编译的二进制文件

pkg：存放编译后的库文件

src：存放源码文件

3. 打开命令行工具，输入命令go env,看环境配置的相关信息

### VsCode安装

在此之前请先设置`GOPROXY`，打开终端执行以下命令（修改代理）：

```bash
go env -w GOPROXY=https://goproxy.cn,direct
```

Windows平台按下`Ctrl+Shift+P`，Mac平台按`Command+Shift+P`，这个时候VS Code界面会弹出一个输入框，我们在这个输入框中输入`>go:install`，
下面会自动搜索相关命令，我们选择`Go:Install/Update Tools`这个命令，按下图选中并会回车执行该命令（或者使用鼠标点击该命令）

![image-20241212113328473](image/go/image-20241212113328473.png)

## hello word

1. 编写代码

```go
package main

import "fmt"

func main() {
	fmt.Printf("hello word")
}

```

2. 编译和运行

- 在当前项目路径下编译

```shell
PS D:\git\gitee\go\src\gofirst\hello> go build .\HelloWord.go
PS D:\git\gitee\go\src\gofirst\hello> .\HelloWord.exe
hello word
```

- 在其他路径编译

gopath 的src下路径编译

```shell
go build github.com/helloword/helloword.go
```

## 基本结构介绍

> package main

编译为一个可执行文件

并且必须要有个main函数

```go
func main() {
}
```

> import "fmt"

导入包

## 变量声明

`go语言的变量必须先声明再使用`

> 格式

var 变量名  变量类型

> 批量声明

var (

变量名1  变量类型

变量名2  变量类型

变量名3  变量类型

)

`变量声明必须要使用`

> 类型推导

通常我们会将变量不声明类型，因为能够跟进赋值类型推导变量类型

```go
var s1 = "老肖";
fmt.Println(s1);
```

> 短变量声明

`只能在函数中使用`

```go
s2 := "laoxiao"
fmt.Println(s2)
```

> 匿名变量

有的时候，方法返回两个值，但是我们只需要其中一个，而go变量赋值又必须使用，所以我们可以采用 _  来接收变量值，

匿名变量不占用命名空间，不占用内存

```go
func main() {
	x, _ := func1()
	fmt.Println("x=", x)
}

func func1() (int, string) {
	return 1, "haha"
}
```

## 常量

> 单个声明

```go
const t1 = 3.14
```

> 批量声明

- 每一个都赋值

```go
const (
   OK  = 200
   NOT = 404
)
```

- 如果下面的不辅助，默认跟随上面的

```go
const (
   n1 = 2
   n2
   n3
)
```

> iota

1. 当const 出现iota时，它赋值为0
2. const每`新增一行`+1

```java
const (
	a1 = iota //0
	a2        //1
	a3 = iota //2
)
```

## 基础数据类型



### 字符串

> 字符串常用操作

| len(str)                            | 求长度         |
| ----------------------------------- | -------------- |
| +或fmt.Sprintf                      | 拼接字符串     |
| strings.Split                       | 分割           |
| strings.contains                    | 判断是否包含   |
| strings.HasPrefix,strings.HasSuffix | 前缀/后缀判断  |
| strings.Index(),strings.LastIndex() | 子串出现的位置 |
| strings.Join(a[]string, sep string) | join操作       |

> 字符编码处理

Go语言中为了处理非AsCII码类型的字符定义了新的rune类型

- 英文字符使用ASCII码老进行处理

> 修改字符串

要修改字符串，需要先将其转换成`[]rune`或`[]byte`，完成后再转换为`string`。无论哪种转换，都会重新分配内存，并复制字节数组。

- rune本质是一个int32类型

```go
func changeString() {
	s1 := "big"
	// 强制类型转换
	byteS1 := []byte(s1)
	byteS1[0] = 'p'
	fmt.Println(string(byteS1))

	s2 := "白萝卜"
	runeS2 := []rune(s2)
    //需要用字符来进行赋值
	runeS2[0] = '红'
	fmt.Println(string(runeS2))
}
```

## 条件判断

> if语句

```go
if 表达式1 {
    分支1
} else if 表达式2 {
    分支2
} else{
    分支3
}
```

- if条件判断还有一种特殊的写法，可以在 if 表达式之前添加一个执行语句，再根据变量值进行判断
- 变量的作用域只在条件判断语句里面

```go
func ifDemo2() {
	if score := 65; score >= 90 {
		fmt.Println("A")
	} else if score > 75 {
		fmt.Println("B")
	} else {
		fmt.Println("C")
	}
}
```

> for循环

- 基本格式

```go
for 初始语句;条件表达式;结束语句{
    循环体语句
}
```

- 死循环

``` go
for {
    循环体语句
}
```

- 使用`for range`遍历数组、切片、字符串、map 及通道（channel）。 通过`for range`遍历的返回值有以下规律：
  1. 数组、切片、字符串返回索引和值。
  2. map返回键和值。
  3. 通道（channel）只返回通道内的值

```go
name := "my name is 老肖"
for index, value := range name {
   fmt.Printf("%d %c \n", index, value)
}
```

## 数组

> 定义

- 存放元素的容器
- 必须制定存放的元素类型和长度

```go
var a1 [2]bool
fmt.Printf("%T ", a1)
```

> 初始化

- 如果没有初始化，默认元素都是0值
  - 如bool：false
  - 整形：0
  - 字符串：“”

```
a1 = [2]bool{true, true}

a2 := [2]int{1, 2}
//跟进数组的长度自动推送长度
a2 := [...]int{1, 2}
//根据索引进行初始化，标识第0初始化=1， 第4初始化=2
a3 := [...]int{0: 1, 4: 2}
```

# 切片

## 创建

- 数组是有局限性的，如：数组定义以后，长度就固定了

如：

定义一个函数，接收参数是固定长度的数组，此时，这个函数将不再能接收其他长度的数组 

- 切片是一个引用类型，它的内部结构包含`地址`、`长度`和`容量`。切片一般用于快速地操作一块数据集合

> 切片定义

```go
var name []T
```

> 切片的长度和容量

我们可以通过使用内置的`len()`函数求长度，使用内置的`cap()`函数求切片的容量、

长度:此时切片的数据长度

容量：此时切片的底层的数组长度

> 通过数组得到切片

- 获取方式为 left <=index<right

```
a4 := [...]int{1, 2, 3, 4, 5, 6, 7}
s1 := a4[1:3]
//2,3
fmt.Println("s1: ", s1)
```

- 特殊方式

```go
a[2:]  // 等同于 a[2:len(a)]
a[:3]  // 等同于 a[0:3]
a[:]   // 等同于 a[0:len(a)]
```

> 创建切片

- 创建一个长度为5，容量为10的int数组类型的切片

```
a1 := make([]int, 5, 10)

fmt.Printf("a1=%d  cap=%d \n", len(a1), cap(a1))
```



> 注意事项

1. 切片不能直接比较

2. 切片的本质就是对底层数组的封装，它包含了三个信息：底层数组的指针、切片的长度（len）和切片的容量（cap）

## 扩容

- 将6追加到a1切片中
- 如果超过则对切片进行扩容

```go
//输出
//[1 2 3 4 5 6]
//10
a1 := []int{1, 2, 3, 4, 5}
a1 = append(a1, 6)
```

## 复制

- 复制一个新的数据到新的容器中

```go
copy(destSlice, srcSlice []T)
```

# 指针

- p1存的内容是a1的内存地址
- v1存的内容是p1记录的内存地址的值

```go
	a1 := 10
	//获取a1的地址
	p1 := &a1
	fmt.Println(p1)
	//获取内存地址对应的值
	v1 := *p1
	fmt.Println(v1)
```

## 指针传值

```go
func modify2(x *int) {
	*x = 100
}
```

## new和make

> new

new是一个内置的函数，它的函数签名如下

```go
func new(Type) *Type
```

- Type表示类型，new函数只接受一个参数，这个参数是一个类型
- *Type表示类型指针，new函数返回一个指向该类型内存地址的指针。

```go
p2 := new(int)
*p2 = 100
//去除p2指向的内存的值
fmt.Println(*p2)
```

> make

make也是用于内存分配的，区别于new，它只用于slice、map以及chan的内存创建

# Map

## 基本使用

- map是一种无序的基于`key-value`的数据结构，Go语言中的map是引用类型，必须初始化才能使用。

```go
//定义一个map类型，他的key是string类型，值是int类型
var m1 map[string]int
m1 = make(map[string]int, 10)
//给map类型赋值
m1["age"] = 20
//如果没有这个key则返回一个bool给ok这个字段
value, ok := m1["name"]
if !ok {
   fmt.Println("没有这个name键")
} else {
   fmt.Println(value)
}
```

> 遍历

```go
//map遍历
for k, v := range m1 {
   fmt.Println(k, v)
}
```

> 删除

```go
//map 删除
delete(m1, "age")
```

# 函数

## 基本使用

- 声明返回变量，则在函数内部可以直接使用

```go
//函数
func main() {
   ret := sum(10, 20)
   fmt.Println(ret)
}

/**
求和计算
*/
func sum(x int, y int) (ret int) {
	ret = x + y
	return
}
```

- 另一种定义方式

```go
func sum1(x int, y int) int {
   return x + y
}
```

- 多个返回值

```go
//多个返回值
func f1(x int, y int) (int, string) {
   return x, ""
}
```

- 参数简写，如果连续两个参数类型一致时，可以将前面的类型进行简写

```go
//参数类型的简写
func f2(x, y int) int {
   return x + y
}
```

- 可变长度参数
- 可变长度的参数必须是函数的最后

```go
//可变长度参数
func f3(x string, y ...int) {

}
```

## defer

`defer`语句会将其后面跟随的语句进行延迟处理。在`defer`归属的函数即将返回时，将延迟处理的语句按`defer`定义的逆序进行执行，也就是说，先被`defer`的语句最后被执行，最后被`defer`的语句，最先被执行

```go
//输出：5421
defer fmt.Println(1)
defer fmt.Println(2)
defer fmt.Println(4)
fmt.Println(5)
```

> 执行时机

![image-20210920111707015](https://gitee.com/xiaojihao/pubImage/raw/master/image/jmeter/20210920111707.png)

```go
//输出5
func f1() int {
   x := 5
   defer func() {
      x++
   }()
   //x赋值5，返回值也赋值5
   //执行defer
   //返回赋值的5
   return x
}

//输出6
func f2() (x int) {
   defer func() {
      x++
   }()
   //此时返回的就是x
   return 5
}

func f3() (y int) {
   x := 5
   defer func() {
      x++
   }()
   return x
}
func f4() (x int) {
   defer func(x int) {
      x++
   }(x)
   return 5
}
```

## 函数作为参数

输出

func() 
func() int 

```go
func main() {
	a1 := f1
	fmt.Printf("%T \n", a1)
	a2 := f2
	fmt.Printf("%T \n", a2)
}

func f1() {
   fmt.Println("函数中输出...")
}

func f2() int {
   return 10
}
```

- 如果我们需要将函数作为参数，可以这么写
- 注意x需要加()才能够被执行

```
func f3(x func() int) {
   a := x()
   fmt.Println(a)
}
```

- 函数也可以被当成返回值

## 匿名函数

- 在函数内部，没办法定义一个有名字的函数，此时，可以定义一个变量接收匿名函数

```go
func main() {
	f1 := func(x int, y int) int {
		return x + y
	}
	fmt.Println(f1(100, 200))
}
```

- 如果函数只调用一次，可以这样写

```go
func(x int) {
   fmt.Println("x=", x)
}(10)
```

> 适配器模式

```go
func main() {
	tmp := fTemp(f2, 10)
	tmp()
}
func f2(x int) {
   fmt.Println("this is f2")
}

//如果f2现定义，后面我们需要对f2进行调整，但是不改变f2的方法，此时我们可以这样操作
//有点类似java的适配器模式
func fTemp(tmpFunc func(int), x int) func() {
   tmp := func() {
      tmpFunc(x)
   }
   return tmp
}
```

## 闭包

闭包相当于，定义了一个常量，供下面的作用域内的函数进行操作



## 内置函数

|    内置函数    |                             介绍                             |
| :------------: | :----------------------------------------------------------: |
|     close      |                     主要用来关闭channel                      |
|      len       |      用来求长度，比如string、array、slice、map、channel      |
|      new       | 用来分配内存，主要用来分配值类型，比如int、struct。返回的是指针 |
|      make      |   用来分配内存，主要用来分配引用类型，比如chan、map、slice   |
|     append     |                 用来追加元素到数组、slice中                  |
| panic和recover |                        用来做错误处理                        |

# 结构体

## 定义

使用`type`和`struct`关键字来定义结构体

```go
type 类型名 struct {
    字段名 字段类型
    字段名 字段类型
    …
}
```

> 示例

```go
func main() {
   var p person
   //给结构体赋值
   p.name = "老肖"
   p.age = 18
   p.hobby = []string{"跑步", "游戏"}
   fmt.Println(p)
}

//定义一个结构体
type person struct {
   name  string
   age   int
   hobby []string
}
```

## 匿名结构体

```go
var coordinates struct {
   x int
   y int
}
coordinates.x = 10
coordinates.y = 20
fmt.Println(coordinates)
```

## 结构体指针

- 结构体是值类型的
- 想要在函数中修改结构体的数据，需要传入指针



```go
fmt.Println(p)

func updatePerson(p *person) {
	//(*p).name = "小小"
	//可以用语法糖的方式进行修改
	p.name = "小小"
}
```

## 初始化方式

```go
//key value赋值
var p4 = person{
   age:  13,
   name: "小小",
}
fmt.Println(p4)

//key的顺序，必须全部赋值
var p5 = person{
   "小小",
   14,
   []string{"girl"},
}
fmt.Println(p5)
```

## 构造函数

- 当字段少，不是很重时，返回值类型

```go
//定义一个构造函数
func newPerson(name string, age int) person {
   return person{
      name: name,
      age:  age,
   }
}
```

- 当字段多，占用内存大时，使用指针类型，因为此时对内存地址进行拷贝不是很消耗资源

```go
//定义一个构造函数
func newPerson(name string, age int) *person {
   return &person{
      name: name,
      age:  age,
   }
}
```

## 方法

- `方法（Method）`是一种作用于特定类型变量的函数
- 规定一个接受者person,可以又person对象调用

```go
func main() {
   var person = newPerson("老肖")
   person.sayHello()
}

type person struct {
   name string
}

func newPerson(name string) person {
   return person{
      name: name,
   }
}

//go中默认方法的调用者参数为首字母第一个
func (p person) sayHello() {
   fmt.Println(p.name, "say hello")
}
```

> 指针接收着

- 需要修改接收者中的值
- 接收者是拷贝代价比较大的大对象
- 证一致性，如果有某个方法使用了指针接收者，那么其他的方法也应该使用指针接收者

时需要使用指针接收者

```go
person.sayHello2()
func (p *person) sayHello2() {
   p.name = "小小"
}
```

> 注意

1. 只能给自己包定义方法

## 匿名结构体

```go
func main() {
   var p = person{
      "老肖",
      22,
   }
   fmt.Println(p)
}

//匿名字段不显示的定义字段名
//适合字段比较少的结构体
type person struct {
   string
   int
}
```

## 嵌套结构体

- 在结构体中嵌套其他的结构体

```got
func main() {
   var person = Person{
      name: "老肖",
      Address: Address{
         "中国",
      },
   }
   fmt.Println(person)
   	//可以直接访问结构体字段
   fmt.Println(person.address)
}

type Address struct {
   address string
}

type Person struct {
   name string
   Address
}
```

>模拟实现继承

- 本来dog是不能调用move方法的
- 因为其嵌套了animal，所以他拥有了animal的一切，可以调用animal的方法

```go
func main() {
   var d = dog{
      animal{
         "旺财",
      },
   }
   d.say()
   d.move()
}

type animal struct {
   name string
}

type dog struct {
   animal
}

func (a animal) move() {
   fmt.Printf("%s 在移动 \n ", a.name)
}

func (d dog) say() {
   fmt.Printf("%s 在狂叫 \n", d.name)
}
```

## json

> 序列化

1. 此时，字段之所以要定义为大写，是因为，type如果需要被其他包使用，则必须首字母大写
2. 但是此时我们发现输出的字符串为：json: {"Name":"老肖","Age":12}

```go
func main() {
   var p = person{
      Name: "老肖",
      Age:  12,
   }
   str, err := json.Marshal(p)
   if err != nil {
      fmt.Println(err)
      return
   }
   fmt.Printf("json: %s", str)
}

type person struct {
   Name string
   Age  int
}
```

3. 为了使序列化的json key为小写，我们可以这么操作

```go
type person struct {
   Name string `json:"name"`
   Age  int    `json:"age"`
}
```

> 反序列化

```go
var p2 person
var str2 = "{\"name\":\"laoxiao\",\"age\":13}"
err1 := json.Unmarshal([]byte(str2), &p2)
if err != nil {
   fmt.Println(err1)
   return
}
fmt.Println(p2)
```

# 接口

## 定义接口

1. 我们看见，cat和dog都可以调用say方法
2. 定义一个接口，定义一个say方法
3. 此时，我们在operation方法中，就可以传入cat和dog调用共同的方法

```go
func main() {
	var c = cat{}
	var d = dog{}
	operation(c)
	operation(d)
}

type speaker interface {
	say()
}

type cat struct {
}

type dog struct {
}

func (c cat) say() {
	fmt.Println("喵喵喵...")
}

func (d dog) say() {
	fmt.Println("汪汪汪...")
}

//调用操作的方法，使其叫唤
func operation(s speaker) {
	s.say()
}
```

1. 接口的定义：结构体必须实现接口中的所有的方法

## 接口接口

1. 动态类型
2. 动态值

## 指针接收者区别

1. 使用值接收者，那么接口必须传的是指针

如：

```go
func (d *dog) say() {
   fmt.Println("汪汪汪...")
}
//此时取出的dog结构体必须用地址赋值给接口类型
var d = dog{}
var sp speaker
sp = &d
operation(sp)
```

## 接口嵌套

1. animal嵌套了两个接口
2. 则实现者必须实现say方法和move方法

```go
type speaker interface {
   say()
}

type movement interface {
   move()
}

type animal interface {
   speaker
   movement
}
```

## 空接口

- 当我们不知道值是什么类型的时候，我们可以使用空接口
- 如：map的value

```go
//定一个了一个值接收类型是空接口的map
var m = make(map[string]interface{}, 10)
m["name"] = "老肖"
m["age"] = 18
m["hobby"] = [...]string{"运动", "唱歌"}
fmt.Println(m)
```

# 包

## 定义

1. 在calculate文件夹下建立一个包，注意，此时包名和文件夹名不一致

```go
package ca

func Add(a int, b int) int {
	return a + b
}
```

2. 在main中引入包
   1. improt 导入的包默认是 GOPATH/src下的目录
   2. 当外部包需要调用函数时，函数需要`大写`，才能够对外部可见
   3. 如果文件夹名与引入的包不一致，则需要取别名，如：ca，如果一致，则默认文件夹就是别名

```go
package main

import (
   "fmt"
   ca "gofirst/pk/calculate"
)

func main() {
   add := ca.Add(1, 2)

   fmt.Println(add)
}
```

## 匿名导包

- 如：我们不需要调用包里面的代码，只需要包里面的自启动代码，如果：init方法
- 每个包导入的时候，都会自动执行init()函数

## 文件

## 打开文件

1. os打开文件
2. 返回file指针和错误信息

```go
file, err := os.Open("./main.go")
if err != nil {
   fmt.Printf("打开文件错误, %s", err)
}
//记得defer中关闭文件
defer file.Close()
```

## 读取文件

1. Read方法返回的n为读取的数组大小

```go
file, err := os.Open("./main.go")
if err != nil {
   fmt.Printf("打开文件错误, %s", err)
}
defer file.Close()

for {
   //定义一个切片，用于存储读取到的文件的数据
   var tmp = make([]byte, 128)
   n, err := file.Read(tmp)
   if err != nil {
      fmt.Printf("文件读取错误, %s", err)
   }
   fmt.Println(string(tmp[:n]))
   if n < 128 {
      return
   }
}
```

## 写入文件

```go
func main() {
   //writer1()
   //writer2()
   writer3()
}

//以拼接的方式创建文件，写入内容
func writer1() {
   file, err := os.OpenFile("./1.txt", os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0666)
   if err != nil {
      fmt.Printf("打开文件失败：%s", err)
   }
   defer file.Close()
   file.Write([]byte("老小老小"))
}

//以清空的方式写入内容
func writer2() {
   file, err := os.OpenFile("./1.txt", os.O_WRONLY|os.O_TRUNC|os.O_CREATE, 0666)
   if err != nil {
      fmt.Printf("打开文件失败：%s", err)
   }
   defer file.Close()
   file.Write([]byte("老小老小"))
}

//已缓存的方式写入内容
func writer3() {
   file, err := os.OpenFile("./1.txt", os.O_WRONLY|os.O_TRUNC|os.O_CREATE, 0666)
   if err != nil {
      fmt.Printf("打开文件失败：%s", err)
   }
   defer file.Close()
   writer := bufio.NewWriter(file)
   for i := 0; i < 10; i++ {
      writer.WriteString("老小老小\n")
   }
   //将内存中的数据刷如磁盘中
   writer.Flush()
}
```

# vscode setting

```json
{
    
    "workbench.editor.enablePreview": false,
    "editor.fontSize": 16,
    "terminal.integrated.profiles.windows": {
        "PowerShell -NoProfile": {
          "source": "PowerShell",
          "args": [
            "-NoProfile"
          ]
        },
        "Git-Bash": {
          "path": "D:\\softinstall\\Git\\bin\\bash.exe",
          "args": []
        }
      },
    "terminal.integrated.defaultProfile.windows": "Git-Bash",
    "terminal.integrated.automationShell.windows": "",
}
```

