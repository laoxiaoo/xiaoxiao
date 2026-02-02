
# MockitoJUnitRunner方式

```java
private AccountDao accountDao;

private HttpServletRequest request;

private LoginController loginController;

@Before
public void before() {
    //提供两个mock对象
    this.accountDao = Mockito.mock(AccountDao.class);
    this.request = Mockito.mock(HttpServletRequest.class);
    loginController = new LoginController();
}


@Test
public void test() {
    Mockito.when(accountDao.getAccount()).thenReturn("laoxioa");
    //当调用getparameter时返回的值
 	Mockito.when(request.getParameter("username")).thenReturn("admin");
    String login = loginController.login(request);
    System.out.println(login);
    System.out.println(accountDao.getAccount());
}
```

*Mockito.when(accountDao.getAccount())*：

如果调用<b id="blue">getAccount</b>方法则返回<b id="blue">thenReturn</b>内容  

## 构建mock类

1. 为<b id="gray">accountDao</b>构造一个虚拟对象（mock对象）

```java
@Before
public void before() {
    //提供两个mock对象
    this.accountDao = Mockito.mock(AccountDao.class);
    this.request = Mockito.mock(HttpServletRequest.class);
    loginController = new LoginController();
}
```

## stub存根

在调用某个方法的时候，调用真是的方法，而调用mock对象的存根方法

> 基础使用

```java
@Test
public void test() {
    Mockito.when(accountDao.getAccount()).thenReturn("laoxioa");
    //当调用getparameter时返回的值
 	Mockito.when(request.getParameter("username")).thenReturn("admin");
    String login = loginController.login(request);
    System.out.println(login);
    System.out.println(accountDao.getAccount());
}
```

>  多次调用返回多种结果
>
> `当第一次和第二次和第三次调用时，调用返回结果不同`

```java
@Test
public void iterateSub() {
    Mockito.when(list.get(0)).thenReturn(0).thenReturn(1).thenReturn(2);
    System.out.println(list.get(0));
    System.out.println(list.get(0));
    System.out.println(list.get(0));
}
```

>   调用真正的方法，而不调用mock的代理方法

当调用<b id="gray">getDeep2</b>方法时，因为<b id="blue">thenCallRealMethod</b>的原因，会调用真实的deepService1方法，而不调用mock的存根方法

```java
@Test
public void subbingRealMethod() {
    Mockito.when(deepService1.getDeep2()).thenCallRealMethod();
    System.out.println(deepService1.getDeep2());
}
```

## spy

spy也是对目标对象进行mock，但是只有设置了stub的方法才会mock，其他方法直接调用目标对象本身的方法

如：当<b id="blue">list.get(1)</b>没有stub时，则返回的是test1,如果stub了返回的是spy1

```
List realList = new ArrayList();
List list = Mockito.spy(realList);
list.add("test1");
list.add("test2");
System.out.println(list.get(0));

Mockito.when(list.get(1)).thenReturn("spy1");
System.out.println(list.get(1));
```

# 注解方式

## @Mock

相当于<b id="blue">Mockito.mock(AccountDao.class)</b>，创建一个mock对象，如下:

```java
 @Mock
private AccountDao accountDao;

@Before
public void init () {
    //如果使用注解，则需要初始化
    MockitoAnnotations.initMocks(this);
}

@Test
public void test() {
    System.out.println(accountDao.getAccount());
}
```

## @Spy

相当于<b id="blue">Mockito.spy</b>

如：

```java
@Spy
private List list = new ArrayList<>();

@Before
public void init() {
    MockitoAnnotations.initMocks(this);
}
```

等同于

```java
List realList = new ArrayList();
List list = Mockito.spy(realList);
```

## @InjectMocks

> 单独使用

 如果使用InjectMocks，则 <b id="blue">@Mock</b>或者<b id="blue">@Spy</b>的对象会注入属性中

如：

1. 定义一个service

```
public class UserServiceImpl implements IUserService {
    private UserManager userManager;
    @Override
    public String getUser() {
        return userManager.getRemoteUser();
    }
}
```

2. 调用<b id="gray">userService.getUser()</b>时访问的是mock对象

```java
@Mock
private UserManager userManager;

@InjectMocks
private UserServiceImpl userService;
```

> 配合spring使用

1. 定义一个service，注意，UserServiceImpl是加入了容器中的

```java
@Service
public class UserServiceImpl implements IUserService {
    @Autowired
    private UserManager userManager;
    @Override
    public String getUser() {
        return userManager.getRemoteUser();
    }
}
```

2. <b id="blue">InjectMocks</b>配合<b id="blue">Autowired</b>使用，当<b id="gray">UserServiceImpl</b>没有mock对象时，则使用spring容器中的对象注入

```java
@Spy
private UserManager userManager = new UserManagerSpy();

@InjectMocks
@Autowired
private UserServiceImpl userService;
```



# Spring环境接入

## @SpyBean

等同于@Spy已换bean

使用@MockBean替换Spring上下文中的Bean（这样会导致Spring上下文重启）

```java
@SpyBean
private DeepService deepService;

@Test
public void getUserInfo() {
    Mockito.when(deepService.getDeep(Mockito.any())).then(var -> "test spy");
    System.out.println(userService.getUser());
}
```

与使用`@MockBean`不同，上节中调用`doReturn("").when(testService).doSomething()` 时`doSomething`方法被打桩。而`when(testService.doSomething()).thenReturn("")`则达不到此效果。原因是：使用`@SpyBean`修饰的`testService`是一个真实对象，所以`testService.doSomething()`会被真实调用

即：**SpyBean会调用一下真实的方法**

## @MockBean

等同于@mock替换spring的bean





## 场景验证

假定有：

```java
@FeignClient(value = "isrm-sup-provider", fallbackFactory = SupplierRemoteServiceImpl.class)

public interface SupplierRemoteService
```

```java
@FeignClient(value = "isrm-sup-provider", fallbackFactory = SupplierCompanyRemoteServiceImpl.class)

public interface SupplierCompanyRemoteService，SupplierCompanyRemoteService
```



SupplierCompanyRemoteService 这个访问是正常访问远程地址，但是SupplierRemoteService 则使用http://127.0.0.1:19012这个地址来访问

> 实现代码:

1. @MockBean 会完全覆盖 Bean，导致所有方法默认返回 null。而 @SpyBean 包装了现有的 Bean（例如 LoadBalancerFeignClient ），默认保留其所有功能。
2. 我们使用 Mockito 的 doAnswer 来动态拦截请求。argThat(request -> ...) 用于区分是哪个接口发起的请求。由于 Request 对象不直接包含接口类信息，我们通常通过 URL 中的 路径特征 （如 /supplier ）来判断。
3. Client directClient = new Client.Default(...)

   - 在 doAnswer 内部，我们不能再次调用 feignClient.execute ，否则可能会陷入递归或者再次触发负载均衡逻辑（而 127.0.0.1 不是服务名，过负载均衡器可能会报错）。
   - 因此，我们实例化一个原生的 Client.Default （这是 Feign 自带的基础 HTTP 客户端），专门用来发送在这个测试中被强制重定向的请求。

```java
@SpringBootTest
class FeignRedirectTest {

    // 1. 使用 @SpyBean 而不是 @MockBean
    // 这样对于未被 Stub (桩) 的调用，会自动执行真实逻辑（即 SupplierCompanyRemoteService 的正常访问）
    @SpyBean
    private Client feignClient;

    @Autowired
    private SupplierRemoteService supplierRemoteService;

    @Autowired
    private SupplierCompanyRemoteService supplierCompanyRemoteService;

    @Test
    void testSpecificRedirect() throws IOException {
        // 创建一个原始的 Feign Client 用于发起重定向后的直连请求
        // (避免再次通过 LoadBalancerClient，因为我们已经有了确定的 IP:Port)
        Client directClient = new Client.Default(null, null);

        // 2. 定义拦截逻辑
        // 假设 SupplierRemoteService 的接口路径中包含 "/supplier/" 这样的特征
        // 你需要根据实际代码中的 @RequestMapping 路径来修改这个匹配规则
        String targetPathIdentifier = "/supplier/"; 

        doAnswer(invocation -> {
            Request originalRequest = invocation.getArgument(0);
            Request.Options options = invocation.getArgument(1);

            String url = originalRequest.url();
            System.out.println("拦截到请求: " + url);

            // 3. 构建新的 URL，替换服务名为本地地址
            // 原始 URL 可能是 "http://isrm-sup-provider/supplier/..."
            // 我们将其替换为 "http://127.0.0.1:19012/supplier/..."
            // 注意：如果使用了 Ribbon/LoadBalancer，这里的 URL host 通常是服务名
            String newUrl = url.replace("isrm-sup-provider", "127.0.0.1:19012");
            
            // 确保协议是 http (防止原始 url 只有 path)
            if (!newUrl.startsWith("http")) {
                newUrl = "http://127.0.0.1:19012" + url;
            }

            // 4. 创建新请求对象
            Request newRequest = Request.create(
                    originalRequest.httpMethod(),
                    newUrl,
                    originalRequest.headers(),
                    originalRequest.body(),
                    originalRequest.charset(),
                    originalRequest.requestTemplate()
            );

            // 5. 使用直连 Client 发起请求
            return directClient.execute(newRequest, options);

        }).when(feignClient).execute(
                // 仅匹配 SupplierRemoteService 的请求路径
                argThat(request -> request.url().contains(targetPathIdentifier)), 
                any()
        );

        // --- 验证 ---

        // 场景 A: SupplierRemoteService 应该被重定向到 127.0.0.1:19012
        // 前提：确保你本地 19012 端口有服务（如 WireMock），否则这里会报 Connection Refused
        try {
            supplierRemoteService.someMethod(); 
        } catch (Exception e) {
            // 如果本地没有起服务，这里报错是正常的，但可以看日志确认 URL 是否已变
            System.out.println("SupplierRemoteService 调用结束: " + e.getMessage());
        }
        // 场景 B: SupplierCompanyRemoteService 应该走正常逻辑 (SpyBean 的默认行为)
        // 它会继续使用原始的 feignClient (通常是 LoadBalancerFeignClient)
        try {
            supplierCompanyRemoteService.someOtherMethod();
        } catch (Exception e) {
            System.out.println("SupplierCompanyRemoteService 调用结束: " + e.getMessage());
        }
    }
}
```