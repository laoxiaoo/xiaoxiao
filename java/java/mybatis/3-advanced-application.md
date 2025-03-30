# 获取主键

## 获取自增主键值

mysql支持自增主键，自增主键值的获取

<b id="blue">useGeneratedKeys="true"</b>；使用自增主键获取主键值策略

<b id="blue">keyProperty</b>；指定对应的主键属性，也就是mybatis获取到主键值以后，将这个值封装给javaBean的哪个属性

例如：

```xml
<insert id="addEmp" parameterType="com.laoxiao.mybatis.bean.Employee"
	useGeneratedKeys="true" keyProperty="id" databaseId="mysql">
    insert into tbl_employee(last_name,email,gender) 
    values(#{lastName},#{email},#{gender})
</insert>
```

## 获取非自增的主键

Oracle不支持自增；Oracle使用序列来模拟自增

keyProperty:查出的主键值封装给javaBean的哪个属性

order="BEFORE":当前sql在插入sql之前运行
			   AFTER：当前sql在插入sql之后运行

resultType:查出的数据的返回值类型
BEFORE运行顺序：
	先运行selectKey查询id的sql；查出id值封装给javaBean的id属性
	在运行插入的sql；就可以取出id属性对应的值
AFTER运行顺序：
			先运行插入的sql（从序列中取出新值作为id）；
			再运行selectKey查询id的sql；

# 方法参数说明

单个参数：mybatis不会做特殊处理，
*#{参数名/任意名}：取出参数值。*	
	
多个参数：mybatis会做特殊处理。
	多个参数会被封装成 **一个map**，
		key：param1...paramN,或者参数的索引也可以
		value：传入的参数值
	#{}就是从map中获取指定的key的值；

如：

```
方法：public Employee getEmpByIdAndLastName(Integer id,String lastName);
取值方式：#{param1},#{param2}
```

> 【命名参数】：明确指定封装参数时map的key；@Param("id")

	多个参数会被封装成 一个map，
		key：使用@Param注解指定的值
		value：参数值
	#{指定的key}取出对应的参数值

```java
public Employee getEmp(@Param("id")Integer id,String lastName);
	取值：id==>#{id/param1}   lastName==>#{param2}

public Employee getEmp(Integer id,@Param("e")Employee emp);
	取值：id==>#{param1}    lastName===>#{param2.lastName/e.lastName}

##特别注意：如果是Collection（List、Set）类型或者是数组，
		 也会特殊处理。也是把传入的list或者数组封装在map中。
			key：Collection（collection）,如果是List还可以使用这个key(list)
				数组(array)
public Employee getEmpById(List<Integer> ids);
	取值：取出第一个id的值：   #{list[0]}
```

# ResultMap结果集映射

> 多对一的查询 ()

1. 直接封装resultmap

```java
public class User {
    private Long id;
    private String name;
    private Integer age;
    private String email;
    private Dept dept;
```

*第一种方式*：使用**dept.属性**的方式，进行设置

```xml
<resultMap id="user1" type="com.xiao.mybatis.entity.User">
    <id column="id" property="id"></id>
    <result column="name" property="name"></result>
    <result column="age" property="age"></result>
    <result column="email" property="email"></result>
    <!--对user对象的Dept对象属性进行设值-->
    <result column="did" property="dept.id"></result>
    <result column="deptname" property="dept.deptName"></result>
</resultMap>

<select id="selectUser1" resultMap="user1" >
    select tu.id,tu.name,tu.age,td.id did, td.deptname
    from t_user tu INNER JOIN t_dept td on tu.did=td.id
</select>
```

*第二种方式：*使用association定义关联的单个对象

```xml
<resultMap id="user2" type="com.xiao.mybatis.entity.User">
    <id column="id" property="id"></id>
    <result column="name" property="name"></result>
    <result column="age" property="age"></result>
    <result column="email" property="email"></result>
    <!--
		property="user对象的dept对象属性"
	-->
    <association property="dept" javaType="com.xiao.mybatis.entity.Dept" >
        <id column="did" property="id"></id>
        <result column="deptname" property="deptName" ></result>
    </association>
</resultMap>

<select id="selectUser1" resultMap="user2" >
    select tu.id,tu.name,tu.age,td.id did, td.deptname
    from t_user tu INNER JOIN t_dept td on tu.did=td.id
</select>
```

