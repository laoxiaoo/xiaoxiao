# 

# 并发编程

Go语言的并发通过`goroutine`实现。`goroutine`类似于线程，属于用户态的线程，我们可以根据需要创建成千上万个`goroutine`并发工作。`goroutine`是由Go语言的运行时（runtime）调度完成，而线程是由操作系统调度完成。

Go语言还提供`channel`在多个`goroutine`间进行通信。`goroutine`和`channel`是 Go 语言秉承的 CSP（Communicating Sequential Process）并发模式的重要实现基础。

## goroutine

## 开启goroutine

加入go 关键字，开启一个单独的groutine去执行hello函数

```go
func main() {
	go hello()
	fmt.Println("main")
}

func hello() {
	fmt.Println("Hello, world!")
}
```

## runtime包

### Gosched

重新分配任务

```go
go hello()
runtime.Gosched()
fmt.Println("main")
```



### Goexit

终止当前 Goroutine（不会影响其他协程）。

```go
go func() {
    defer fmt.Println("exit")
    runtime.Goexit()  // 协程在此终止
}()
```

# Channel 

1. 用于在 goroutine 之间安全传递数据，避免共享内存的竞态问题
2. 遵循先进先出（FIFO）原则，保证数据收发顺序

## 创建与使用

> 创建语法

```go
// 无缓冲通道（同步）
ch1 := make(chan int) 

// 有缓冲通道（异步，容量为 10）
ch2 := make(chan string, 10) 
```

> 使用语法

发送	ch <- value	将数据发送到通道，缓冲区满时阻塞
接收	value := <-ch	从通道接收数据，缓冲区空时阻塞

## 无缓冲通道

1. 如果我们只定义一个无缓冲通道，并且通道只有发送，没有接收，则会报错
2. 通道发送后会阻塞，等另一端接收数据后才会放行

```go
var ch = make(chan int)
go func(ch chan int) {
    i := <-ch
    fmt.Println(i)
}(ch)
ch <- 1
fmt.Println("main")
```

## 关闭

关闭通道（仅发送方可调用），关闭后接收操作返回零值和 false

可以通过内置的close()函数关闭channel (如果你的管道不往里存值或者取值的时候一定记得关闭管道)

## 优雅的从通道获取值

1. 定义两个管道，ch1 设置10个值， ch2从ch1取值，直到ch1关闭， main从ch2取值，直到关闭
2. 第一种方式，我们通过ok的返回值，判断管道是否关闭，这种不优雅
3. 第二种方式，通过for range 的方式，这种可以优雅的获取值

```go
ch1 := make(chan int, 10)
ch2 := make(chan int, 10)
go func(ch1 chan int) {
    for i := 0; i < 10; i++ {
        ch1 <- i
    }
    close(ch1)
}(ch1)
go func(ch1 chan int, ch2 chan int) {
    for {
        // 第一种方式
        if i, ok := <-ch1; ok {
            ch2 <- i
        } else {
            break
        }
    }
    close(ch2)
}(ch1, ch2)
//第二种方式
for i := range ch2 {
    fmt.Println(i)
}
```

## 单向通道

有的时候我们会将通道作为参数在多个任务函数间传递，很多时候我们在不同的任务函数中使用通道都会对其进行限制，比如限制通道在函数中<b id="red">只能发送或只能接收</b>。

<b id="gray">chan<- int</b>：表示只能流入数据

<b id="gray"><-chan int</b>：表示只能流出数据

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
