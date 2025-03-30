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

## @SpyBean

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
