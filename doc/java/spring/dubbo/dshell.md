# Dubbo的shell操作

```shell
telnet ip port
# 进入命令行操作命令
```

# invoke

调用dubbo接口,如果是实体类，则在json里面添加字段class，然后填入classpath

```shell
    invoke com.yunji.laoxiao.user.xxService.xxMethod({"userId":"100173809","startTime":"2023-12-01 01:00:00","endTime":"2023-12-31 01:00:00","upOrDownFlag":1,"class":"com.yunji.laoxiao.xxAO"})
```

