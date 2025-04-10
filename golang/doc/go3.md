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



## channel




## workpool

在工作中我们通常会使用可以指定启动的goroutine数量–`worker pool`模式，控制`goroutine`的数量，防止`goroutine`泄漏和暴涨。

- 此处，我们定义3个work工作
- 给10个任务执行

```go
func main() {

	jobs := make(chan int, 10)
	results := make(chan int, 10)
	for i := 0; i < 3; i++ {
		go work(i, jobs, results)
	}
	for i := 0; i < 10; i++ {
		jobs <- i
	}
	close(jobs)
	for i := 0; i < 10; i++ {
		j := <-results
		fmt.Printf("<== 获取到任务执行后的结果： %v \n", j)
	}

}

func work(i int, jobs <-chan int, results chan<- int) {
	for j := range jobs {
		fmt.Printf("==> 执行任务 %v %v \n", i, j)
		results <- j
	}
}
```

## select

```go
func main() {
	ch := make(chan int, 1)
	for i := 0; i < 10; i++ {
		//随机的寻找两个执行，哪个可以执行，则执行哪一个
		select {
		case ch <- i:

		case data := <-ch:
			fmt.Println(data)
		}
	}
}
```

# 锁

## 互斥锁

```go
func main() {
	wg.Add(2)
	go add()
	go add()
	wg.Wait()
	fmt.Println(i)
}

var i = 1
var wg sync.WaitGroup
var lock sync.Mutex

func add() {
	defer wg.Done()
	for j := 0; j < 10000; j++ {
		lock.Lock()
		i += j
		lock.Unlock()
	}
}
```

## 读写锁

```go
func main() {
	for j := 0; j < 10000; j++ {
		wg.Add(2)
		go writer()
		go read()
	}
	wg.Wait()
	fmt.Println(i)
}

var wg sync.WaitGroup
var i = 0
var rwLock sync.RWMutex

//添加读锁
func read() {
	defer wg.Done()
	rwLock.RLock()
	time.Sleep(time.Microsecond * 10)
	fmt.Printf("read: %v \n", i)
	rwLock.RUnlock()
}

//添加写锁
func writer() {
	defer wg.Done()
	rwLock.Lock()
	time.Sleep(time.Microsecond * 1000)
	i = i + 1
	rwLock.Unlock()
}
```

## sync.Once

在编程的很多场景下我们需要确保某些操作在高并发的场景下只执行一次，例如只加载一次配置文件、只关闭一次通道等

> 实现一个单例模式

```go

//通过输出地址可以发现
//通过单例获取的结构体都是同一个地址
func main() {
	for i := 0; i < 10; i++ {
		wg.Add(2)
		go func() {
			defer wg.Done()
			var a1 = *getInstance()
			fmt.Printf("a1 : %p \n", &a1)
		}()
		go func() {
			defer wg.Done()
			var a2 = *getInstance()
			fmt.Printf("a2 : %p \n", &a2)
		}()
	}
	wg.Wait()
}

type instance struct {
}

var (
	sn     sync.Once
	single *instance
	wg     sync.WaitGroup
)

func getInstance() *instance {
	sn.Do(func() {
		single = &instance{}
	})
	return single
}

```

## sync.Map

- 并发安全的map
- Go语言的`sync`包中提供了一个开箱即用的并发安全版map–`sync.Map`。开箱即用表示不用像内置的map一样使用make函数初始化就能直接使用。同时`sync.Map`内置了诸如`Store`、`Load`、`LoadOrStore`、`Delete`、`Range`等操作方法。

## 原子操作

- ### atomic包

# 网络

![image-20211002153049705](https://gitee.com/xiaojihao/pubImage/raw/master/image/go/20211002153049.png)

## Tcp

> 简单TCP

- 服务器端

```go
func createSimpleServer() {
	listen, err := net.Listen("tcp", "127.0.0.1:80")
	if err != nil {
		return
	}
	//建立连接
	conn, err := listen.Accept()

	if err != nil {
		return
	}
	buff := make([]byte, 128)
	conn.Read(buff)
	fmt.Println(string(buff[:]))
}
```

- 客户端

```go
func createSendMsg() {
	conn, err := net.Dial("tcp", "127.0.0.1:80")
	if err != nil {
		return
	}
	conn.Write([]byte("hello, 老肖"))
}
```

## 简单的http服务端

```go
func main() {
	http.HandleFunc("/test", f1)
	http.ListenAndServe("127.0.0.1:80", nil)
}

func f1(w http.ResponseWriter, r *http.Request) {
	str := make([]byte, 128)
	r.Body.Read(str)
	fmt.Printf("==>收到请求 %s \n", string(str))
	w.Write([]byte("返回数据"))
}
```

# 单元测试

## 测试工具

> 介绍

go test命令是一个按照一定约定和组织的测试代码的驱动程序。在包目录内，所有以`_test.go`为后缀名的源代码文件都是`go test`测试的一部分，不会被`go build`编译到最终的可执行文件中。

在`*_test.go`文件中有三种类型的函数，单元测试函数、基准测试函数和示例函数

|   类型   |         格式          |              作用              |
| :------: | :-------------------: | :----------------------------: |
| 测试函数 |   函数名前缀为Test    | 测试程序的一些逻辑行为是否正确 |
| 基准函数 | 函数名前缀为Benchmark |         测试函数的性能         |
| 示例函数 |  函数名前缀为Example  |       为文档提供示例文档       |

> 示例

```go
//hello_test.go
//测试方法
func TestSayHello(t *testing.T) {
   got := test.SayHello()
   want := "hello"
   if !reflect.DeepEqual(want, got) {
      t.Errorf("expected:%v, got:%v", want, got)
   }
}
```

```go
// SayHello 测试的模拟方法
// hello.go
func SayHello() string {
   return "hello"
}
```

执行命令

```shell
$ go test
PASS
ok      gofirst/test    0.282s

```



## 测试组

- 在测试方法中，可能有很多的参数，需要用来进行测试

> 自测试

```go
func TestSayHello2(t *testing.T) {
   // 定义一个测试用例类型
   type st struct {
      input string
      sep   string
      want  []string
   }
   tests := map[string]st{ // 测试用例使用map存储
      "simple":      {input: "a:b:c", sep: ":", want: []string{"a", "b", "c"}},
      "wrong_sep":   {input: "a:b:c", sep: ",", want: []string{"a:b:c"}},
      "more_sep":    {input: "abcd", sep: "bc", want: []string{"a", "d"}},
      "leading_sep": {input: "沙河有沙又有河", sep: "沙", want: []string{"河有", "又有河"}},
   }
   for name, tc := range tests {
      t.Run(name, func(t *testing.T) { // 使用t.Run()执行子测试
         got := test.SayHello()
         if !reflect.DeepEqual(got, tc.want) {
            t.Errorf("expected:%#v, got:%#v", tc.want, got)
         }
      })
   }
}
```

- 执行某个测试用例

```shell
$ go test -run=TestSayHello2/simple
--- FAIL: TestSayHello2 (0.00s)
    --- FAIL: TestSayHello2/simple (0.00s)
        hello_test.go:36: expected:[]string{"a", "b", "c"}, got:"hello"
FAIL
exit status 1
FAIL    gofirst/test    0.211s

```

## 基准测试

- 基准测试就是在一定的工作负载之下检测程序性能的一种方法

- 基准测试以`Benchmark`为前缀，需要一个`*testing.B`类型的参数b

```go
func BenchmarkName(b *testing.B){
    // ...
}
```

> 示例

```go
//基准测试
func BenchmarkSayHello(b *testing.B) {
   for i := 0; i < b.N; i++ {
      test.SayHello()
   }
}
```

> 测试命令

- 注意bench的名称是 %name%进行匹配的

```shell
$ go test -bench=SayHello
goos: windows
goarch: amd64
pkg: gofirst/test
cpu: AMD Ryzen 5 1400 Quad-Core Processor
BenchmarkSayHello-8     1000000000               0.3260 ns/op
PASS
ok      gofirst/test    0.608s
```

-8: 8核cpu

1000000: 执行的次数

每次消耗的时间

> 基准测试执行时间

每次运行的平均值只有不到一秒。像这种情况下我们应该可以使用`-benchtime`标志增加最小基准时间

```shell
go test -bench=SayHello3 -benchtime=10s
```

# 命令行工具

## flag

> 示例

```go
name := flag.String("name", "肖某", "请输入名称")
//解析使用
flag.Parse()
fmt.Println(*name)
```

> 命令行操作

```shell
$ ./flag.exe --help
Usage of D:\git\gitee\go\src\gofirst\test\flag\flag.exe:
  -name string
        请输入名称 (default "肖某")
        
$ ./flag.exe
肖某

$ ./flag.exe -name=老肖
老肖

```

> 其他函数

```go
flag.Args()  ////返回命令行参数后的其他参数，以[]string类型
flag.NArg()  //返回命令行参数后的其他参数个数
flag.NFlag() //返回使用的命令行参数个数
```

> typevar

- 能够允许先定义变量

```go
var nameTmp string

flag.StringVar(&nameTmp, "name", "肖某", "请输入名称")
flag.Parse()
fmt.Println(nameTmp)
```

# 操作数据库

## 连接

Go语言中的`database/sql`包提供了保证SQL或类SQL数据库的泛用接口，并不提供具体的数据库驱动。使用`database/sql`包时必须注入（至少）一个数据库驱动。

> 下载驱动

```shell
go get -u github.com/go-sql-driver/mysql
```

> 初始化数据库

- Open函数可能只是验证其参数格式是否正确，实际上并不创建与数据库的连接。如果要检查数据源的名称是否真实有效，应该调用Ping方法。
- 返回的DB对象可以安全地被多个goroutine并发使用，并且维护其自己的空闲连接池。因此，Open函数应该仅被调用一次，很少需要关闭这个DB对象。

```go
import (
   "database/sql"
   "fmt"
   _ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func main() {
   err := initDb()
   if err != nil {
      fmt.Printf("==>连接数据库出现异常， %v \n", err)
   }
}

func initDb() (err error) {
   dsn := "root:123456@tcp(192.168.1.134:3306)/my_test"
   //连接一个数据库
   db, err = sql.Open("mysql", dsn)
   if err != nil {
      return err
   }
   //尝试连接数据库
   err = db.Ping()
   if err != nil {
      return err
   }
   return nil
}
```

## 查询

> 查询一行数据

```go
//定义一个结构体
type user struct {
   id   int
   name string
}

//查询一行数据
func queryRow() {
   row := db.QueryRow("select * from t_user where id = ?", 1)
   var u user
   err := row.Scan(&u.id, &u.name)
   if err != nil {
      return
   }
   fmt.Println(u)
}
```

> 查询

`这里一定要close，因为rows有多行，操作可能失败`

```go
//查询多行数据
func query() {
   rows, _ := db.Query("select * from t_user where id >= ?", 1)
    // 非常重要：关闭rows释放持有的数据库链接
   defer rows.Close()
   for rows.Next() {
      var u user
      err := rows.Scan(&u.id, &u.name)
      if err != nil {
         return
      }
      fmt.Println(u)
   }
}
```

## 增删改

> 新增

```go
//插入数据
func insert() {
   ret, err := db.Exec("insert into t_user(name) values (?)", "老肖1号")
   if err != nil {
      fmt.Println(err)
      return
   }
   //最后的id
   id, _ := ret.LastInsertId()
   fmt.Printf("<==新增的id %d", id)
}
```

> 修改

```go
func update() {
   ret, err := db.Exec("update t_user set name=? where id=?", "老肖二号", 1)
   if err != nil {
      fmt.Println(err)
      return
   }
   //影响的行数
   n, _ := ret.RowsAffected()
   fmt.Println(n)
}
```

## 预处理

- 优化MySQL服务器重复执行SQL的方法，可以提升服务器性能，提前让服务器编译，一次编译多次执行

## 事务

Go语言中使用以下三个方法实现MySQL中的事务操作。 

> 开始事务

```go
func (db *DB) Begin() (*Tx, error)
```

> 提交事务

```go
func (tx *Tx) Commit() error
```

> 回滚事务

```go
func (tx *Tx) Rollback() error
```

# Redis

> 安装

```bash
go get -u github.com/go-redis/redis
```

# 依赖管理

## go module

- `go module`是Go1.11版本之后官方推出的版本管理工具，并且从Go1.13版本开始，`go module`将是Go语言默认的依赖管理工具

- 要启用`go module`支持首先要设置环境变量`GO111MODULE`，通过它可以开启或关闭模块支持，它有三个可选值：`off`、`on`、`auto`，默认值是`auto`。

1. `GO111MODULE=off`禁用模块支持，编译时会从`GOPATH`和`vendor`文件夹中查找包。
2. `GO111MODULE=on`启用模块支持，编译时会忽略`GOPATH`和`vendor`文件夹，只根据 `go.mod`下载依赖。
3. `GO111MODULE=auto`，当项目在`$GOPATH/src`外且项目根目录有`go.mod`文件时，开启模块支持。

> 设置GO111MODULE

```shell
## 查看有没有配置
$ go env
set GO111MODULE=auto

## 初始化目录
$ go mod init
go: creating new go.mod: module gofirst/redis
go: to add module requirements and sums:
        go mod tidy
   
## 下载相关依赖
$ go get
go: downloading github.com/go-redis/redis v6.15.9+incompatible
# gofirst/redis
.\main.go:33:19: too many arguments in call to rdb.cmdable.Ping
        have (context.Context)
        want ()
.\main.go:38:25: too many arguments in call to rdb.cmdable.Keys
        have (context.Context, string)
        want (string)
```

> 添加依赖项

```bash
go mod edit -require=golang.org/x/text
```

> 移除依赖项

```bash
go mod edit -droprequire=golang.org/x/text
```

> 添加指定版本

1. 在mod文件中添加依赖

```mod
require github.com/Shopify/sarama v1.19.0
```

2. 执行命令

```shell
$ go mod download
```



# context

优雅的停掉线程

```go
var wg sync.WaitGroup

func main() {
   //传入父级的context
   ctx, cancel := context.WithCancel(context.Background())
   wg.Add(2)
   go work1(ctx)
   time.Sleep(10 * time.Second)
   cancel()
}

func work1(ctx context.Context) {
   defer wg.Done()
   //将context一层一层往下传
   go work2(ctx)
Loop:
   for {
      time.Sleep(1 * time.Second)
      fmt.Println("老肖1号")
      select {
      //当接到顶级的通知，跳出循环
      case <-ctx.Done():
         break Loop
      default:

      }
   }
}

func work2(ctx context.Context) {
   defer wg.Done()
Loop:
   for {
      fmt.Println("老肖2号")
      time.Sleep(1 * time.Second)
      select {
      case <-ctx.Done():
         break Loop
      default:

      }
   }
}
```