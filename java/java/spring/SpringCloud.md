

## 添加springboot info信息

父工程添加

```xml
<build>
    <finalName>cloudparent</finalName>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
    </resources>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-resources-plugin</artifactId>
            <configuration>
                <delimiters>
                    <delimit>$</delimit>
                </delimiters>
            </configuration>
        </plugin>
    </plugins>
</build>
```

子工程配置，$开始和$结束，在src/main/resources下，就能取到maven配置文件的信息

```yml
info:
  app.name: xiao-microservicecloud
  company.name: www.xiao.com
  build.artifactId: $project.artifactId$
  build.version: $project.version$
```