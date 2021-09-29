# 时间

# 日志

## 自带的日志库

> 简单使用

log包定义了Logger类型，该类型提供了一些格式化输出的方法。本包也提供了一个预定义的“标准”logger，可以通过调用函数`Print系列`(Print|Printf|Println）、`Fatal系列`（Fatal|Fatalf|Fatalln）、和`Panic系列`（Panic|Panicf|Panicln）来使用

```go
for {
   log.Println("一条很简单的日志..")
   log.Fatalln("这是一条会触发fatal的日志。")
   log.Panicln("这是一条会触发panic的日志。")
   time.Sleep(time.Second * 2)
}
```

> 自定义输出位置

```go
file, _ := os.OpenFile("./log.log", os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
log.SetOutput(file)
for {
   log.Println("一条很简单的日志..")
   log.Fatalln("这是一条会触发fatal的日志。")
   log.Panicln("这是一条会触发panic的日志。")
   time.Sleep(time.Second * 2)
}
```

## 约定的日志级别

1. trace
2. debug : 调试日志
3. info
4. warning
5. error
6. fatal

## 获取行号等信息

- 1 表示显示调用本函数外面一层的信息
- 此刻显示的是main方法里面调用的信息

```go
func main() {
   f1()
}

func f1() {
   _, file, line, ok := runtime.Caller(1)

   fmt.Println(file)
   //大印f1()调用的行号
   fmt.Println(line)
   fmt.Println(ok)
}
```

# 反射

## 获取类型

1. 定义一个空接口
2. 使用typeof来获取其类型

```go
func main() {
   var a float64 = 3.14
   reflectType(a)
   var b int = 3
   reflectType(b)
}

//获取传入到空接口的类型
func reflectType(x interface{}) {
   v := reflect.TypeOf(x)
   fmt.Printf("type: %v \n", v)
}
```

## 获取类型名称

1. 定义一个结构体
2. Kind获取一个种类（大类类型）， name获取具体的名称

```go
type cat struct {
}

func reflectType(x interface{}) {
	//name: cat kind: struct
	fmt.Printf("name: %v kind: %v", v.Name(), v.Kind())
}
```

## 反射修改值

```go
func main() {
   var b int64 = 3
   updateReflectValue(&b)
   fmt.Println(b)
}
//通过反射修改值
//必须是传入指针
func updateReflectValue(x interface{}) {
	v := reflect.ValueOf(x)
	//反射通过Elem获取地址修改值
	if v.Elem().Kind() == reflect.Int64 {
		v.Elem().SetInt(12)
	}
}
```

## 常用标准库

## 字符串解析

```go
func main() {
	str := "1000"
	//将字符串转为int (10进制， )
	strInt, err := strconv.ParseInt(str, 10, 0)

	if err != nil {
		fmt.Printf("转换出现错误：%s", err)
	}

	fmt.Printf("转换后的值%T", strInt)
}

```

# 并发编程

Go语言的并发通过`goroutine`实现。`goroutine`类似于线程，属于用户态的线程，我们可以根据需要创建成千上万个`goroutine`并发工作。`goroutine`是由Go语言的运行时（runtime）调度完成，而线程是由操作系统调度完成。

Go语言还提供`channel`在多个`goroutine`间进行通信。`goroutine`和`channel`是 Go 语言秉承的 CSP（Communicating Sequential Process）并发模式的重要实现基础。

## groutine

> 开启groutine

- 相当于开启一个线程

```go
//启动main时候，会主动创建一个主groutine执行
func main() {
	for i := 0; i < 100; i++ {
		//加入go 关键字，开启一个单独的groutine去执行hello函数
		go sayHello(i)
	}
	fmt.Println("main....")
	time.Sleep(time.Second * 10)
}

func sayHello(i int) {
	fmt.Printf("hello: %v \n", i)
}
```

> 多个groutine同步

```go
var wg sync.WaitGroup

func main() {
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(i int) {
			//每次函数调用结束，wg-1
			defer wg.Done()
			fmt.Println(i)
		}(i)
	}
	fmt.Println("main....")
	//当wg减到0的时候，不再阻塞
	wg.Wait()
}
```

## channel

> 语法

1. 定义

```go
var 变量 chan 元素类型
```

2. 创建

```go
ch4 := make(chan int)
ch5 := make(chan bool)
ch6 := make(chan []int)
```

3. 发送接收

```go
ch <- 10 // 把10发送到ch中

x := <- ch // 从ch中接收值并赋值给变量x
<-ch       // 从ch中接收值，忽略结果
```

4. 关闭

```go
close(ch)
```

> 关闭管道后

1. 对一个关闭的通道再发送值就会导致panic。
2. 对一个关闭的通道进行接收会一直获取值直到通道为空。
3. 对一个关闭的并且没有值的通道执行接收操作会得到对应类型的零值。
4. 关闭一个已经关闭的通道会导致panic。

> 示例

```go
var ch chan int
var ch2 chan int
var wg sync.WaitGroup

func main() {
	ch = make(chan int)
    //定义一个有缓冲的管道
	ch2 = make(chan int, 10)
	wg.Add(1)
	go func() {
		defer wg.Done()
		a := <-ch
		fmt.Printf("==> 收到管道值 %v \n", a)
	}()

	ch <- 10
	ch2 <- 10
	fmt.Println("<== 管道输入值完毕")
	wg.Wait()
	defer close(ch)
	defer close(ch2)
} 
```

> 示例2

```go
//定义f1 f2
//使得f1 创建数据，流向f2,再从f2 获取数据
func main() {
	ch1 := make(chan int, 5)
	ch2 := make(chan int, 5)

	go f1(ch1)
	go f2(ch1, ch2)
	for i := range ch2 {
		fmt.Printf("<==获取到ch2管道值 %v \n", i)
	}

}

func f1(ch1 chan int) {
	for i := 0; i < 10; i++ {
		ch1 <- i
	}
	close(ch1)
}

func f2(ch1 chan int, ch2 chan int) {
	for {
		i, ok := <-ch1
		if !ok {
			break
		}
		ch2 <- i + i
	}
	close(ch2)
}
```

## 单向通道

1. 在上述代码中，我们看到f1的ch1只是单纯的 接收数据, f2只是ch1只是单纯的发送数据
2. 此时，如果我们想在方法中加上强制校验，一个方法通道参数只能接收或者发送数据，则可以用单向通道

```go
//ch1 只能流入数据
func f1(ch1 chan<- int) {
	for i := 0; i < 10; i++ {
		ch1 <- i
	}
	close(ch1)
}

//ch1 只能流出数据，ch2只能流入数据
func f2(ch1 <-chan int, ch2 chan<- int) {
	for {
		i, ok := <-ch1
		if !ok {
			break
		}
		ch2 <- i + i
	}
	close(ch2)
}
```

