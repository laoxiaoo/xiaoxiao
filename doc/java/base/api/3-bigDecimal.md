# Bigdecimal



# 相关坑

## 浮点类型

```java
BigDecimal a = new BigDecimal(0.01);
BigDecimal b = BigDecimal.valueOf(0.01);
System.out.println("a = " + a);
System.out.println("b = " + b);
```

显示结果：

```java
a = 0.01000000000000000020816681711721685132943093776702880859375
b = 0.01
```

即便是使用BigDecimal，结果依旧会出现精度问题。

结论：

*1. 在使用BigDecimal构造函数时，尽量传递字符串而非浮点类型；*

*2. 如果无法满足第一条，则可采用*  **BigDecimal#valueOf方法** *来构造初始化值*

## 浮点精度

**通常情况，如果比较两个BigDecimal值的大小，采用其实现的compareTo方法；如果严格限制精度的比较，那么则可考虑使用equals方法**

```java
BigDecimal a = new BigDecimal("0.01");
BigDecimal b = new BigDecimal("0.010");
System.out.println(a.equals(b));
System.out.println(a.compareTo(b));
```

## 设置精度

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("3.0");
a.divide(b);
```

执行会发生异常

如果在除法（divide）运算过程中，如果商是一个无限小数（0.333…），而操作的结果预期是一个精确的数字，那么将会抛出`ArithmeticException`异常

结论：

*在使用BigDecimal进行（所有）运算时，一定要明确指定精度和舍入模式*



舍入模式定义在RoundingMode枚举类中，共有8种：

- RoundingMode.UP：舍入远离零的舍入模式。在丢弃非零部分之前始终增加数字(始终对非零舍弃部分前面的数字加1)。注意，此舍入模式始终不会减少计算值的大小。
- RoundingMode.DOWN：接近零的舍入模式。在丢弃某部分之前始终不增加数字(从不对舍弃部分前面的数字加1，即截短)。注意，此舍入模式始终不会增加计算值的大小。
- RoundingMode.CEILING：接近正无穷大的舍入模式。如果 BigDecimal 为正，则舍入行为与 ROUNDUP 相同;如果为负，则舍入行为与 ROUNDDOWN 相同。注意，此舍入模式始终不会减少计算值。
- RoundingMode.FLOOR：接近负无穷大的舍入模式。如果 BigDecimal 为正，则舍入行为与 ROUNDDOWN 相同;如果为负，则舍入行为与 ROUNDUP 相同。注意，此舍入模式始终不会增加计算值。
- RoundingMode.HALF_UP：向“最接近的”数字舍入，如果与两个相邻数字的距离相等，则为向上舍入的舍入模式。如果舍弃部分 >= 0.5，则舍入行为与 ROUND_UP 相同;否则舍入行为与 ROUND_DOWN 相同。注意，这是我们在小学时学过的舍入模式(四舍五入)。
- RoundingMode.HALF_DOWN：向“最接近的”数字舍入，如果与两个相邻数字的距离相等，则为上舍入的舍入模式。如果舍弃部分 > 0.5，则舍入行为与 ROUND_UP 相同;否则舍入行为与 ROUND_DOWN 相同(五舍六入)。
- RoundingMode.HALF_EVEN：向“最接近的”数字舍入，如果与两个相邻数字的距离相等，则向相邻的偶数舍入。如果舍弃部分左边的数字为奇数，则舍入行为与 ROUNDHALFUP 相同;如果为偶数，则舍入行为与 ROUNDHALF_DOWN 相同。注意，在重复进行一系列计算时，此舍入模式可以将累加错误减到最小。此舍入模式也称为“银行家舍入法”，主要在美国使用。四舍六入，五分两种情况。如果前一位为奇数，则入位，否则舍去。以下例子为保留小数点1位，那么这种舍入方式下的结果。1.15 ==> 1.2 ,1.25 ==> 1.2
- RoundingMode.UNNECESSARY：断言请求的操作具有精确的结果，因此不需要舍入。如果对获得精确结果的操作指定此舍入模式，则抛出ArithmeticException。

`在常见的除法运算中，一般采用的都是 RoundingMode.HALF_DOWN(截取)，这样可以最大限度的保证资损问题`

## 三种字符串输出

- toPlainString()：不使用任何科学计数法；
- toString()：在必要的时候使用科学计数法；
- toEngineeringString() ：在必要的时候使用工程计数法。类似于科学计数法，只不过指数的幂都是3的倍数，这样方便工程上的应用，因为在很多单位转换的时候都是10^3；

# DecimalFormat 

DecimalFormat 类是NumberFormat 十进制数字格式的具体子类。旨在解析和格式化任何语言环境中的数字

| 符号 | 地点       | 本地化 | 含义                                         |
| :--- | :--------- | :----- | :------------------------------------------- |
| 0    | 数         | 是     | 数字，被格式化数值不够的位数补零，若够则不变 |
| #    | 数         | 是     | 数字，被格式化数值不够的位数忽略，若够则不变 |
| .    | 数         | 是     | 小数分隔符或货币小数分隔符                   |
| %    | 字首或字尾 | 是     | 乘以100并显示为百分比                        |
| ,    | 数         | 是     | 分组分隔符                                   |

## 百分号的格式化

```java
DecimalFormat d1 = new DecimalFormat();
d1.applyPattern("#0.00%");
log.info("百分号格式化 {} ", d1.format(BigDecimal.valueOf(0.2340576).setScale(4, RoundingMode.DOWN)));
```

## 折扣

```java
DecimalFormat d2 = new DecimalFormat();
d2.applyPattern("0.#");
log.info("折扣格式化 {} ", d2.format(BigDecimal.valueOf(0.2640576).multiply(BigDecimal.valueOf(10)).setScale(1, RoundingMode.DOWN)));
```

