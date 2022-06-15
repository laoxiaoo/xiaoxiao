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

