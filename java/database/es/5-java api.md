## 基础配置

```java
@Bean
public RestHighLevelClient restHighLevelClient(){
    return new RestHighLevelClient(
        RestClient.builder(
            new HttpHost("192.168.1.131",9200, "http")
        )
    );
}
```

## RequestOptions

- 请求的设置项
- 如一些安全的头需要设置
- 官方推荐使用静态的方式进行配置

```java
private static final RequestOptions COMMON_OPTIONS;
static {
    RequestOptions.Builder builder = RequestOptions.DEFAULT.toBuilder();
    builder.addHeader("Authorization", "Bearer " + TOKEN); 
    builder.setHttpAsyncResponseConsumerFactory(           
        new HttpAsyncResponseConsumerFactory
            .HeapBufferedResponseConsumerFactory(30 * 1024 * 1024 * 1024));
    COMMON_OPTIONS = builder.build();
}
```

## 创建索引

```java
@Test
void creatIndex() throws IOException {
    //创建索引
    CreateIndexRequest request = new CreateIndexRequest(INDEX_NAME);
//指向客户端请求，获取响应
CreateIndexResponse response = restHighLevelClient.indices().create(request, RequestOptions.DEFAULT);
}
```

## 删除索引

```java
@Test
void deleteIndex() throws IOException {
    DeleteIndexRequest request = new DeleteIndexRequest(INDEX_NAME);
    AcknowledgedResponse response = restHighLevelClient.indices().delete(request, RequestOptions.DEFAULT);
    System.out.println(response.isAcknowledged());
}
```

## 判断索引是否存在

```java
@Test
void getIndex() throws IOException {
   //判断索引是否存在
   GetIndexRequest request = new GetIndexRequest(INDEX_NAME);
   Boolean response = restHighLevelClient.indices().exists(request, RequestOptions.DEFAULT);
   System.out.println(response);
}
```

## 新增文档

```java
@Test
void addDocument() throws IOException {
   User user = new User("小肖", "123456");
   //put /index/_doc/1
   IndexRequest request = new IndexRequest(INDEX_NAME);
   request.id("1")//id
         .timeout(TimeValue.timeValueSeconds(1));//超时时间
   request.source(JSONUtil.toJsonStr(user), XContentType.JSON);
   IndexResponse response = restHighLevelClient.index(request, RequestOptions.DEFAULT);
   System.out.println(response.status());
}
```

## 判断文档是否存在

```java
@Test
public void testIsExists() throws IOException {
    RestHighLevelClient restHighLevelClient = ESUtil.getRestHighLevelClient();

    GetRequest getRequest = new GetRequest("index1", "1");
    // 不获取返回的 _source 的上下文
    getRequest.fetchSourceContext(new FetchSourceContext(false));
    getRequest.storedFields("_none_");
    // 存在
    boolean exists = restHighLevelClient.exists(getRequest, RequestOptions.DEFAULT);
    System.out.println(exists);
}
```
## 批量新增

```java
@Test
void bulkDocument() throws IOException {
   BulkRequest bulkRequest = new BulkRequest();
   bulkRequest.timeout(TimeValue.timeValueSeconds(1));
   for(int i=0; i<10; i++){
      bulkRequest.add(new IndexRequest(INDEX_NAME)
      .source(JSONUtil.toJsonStr(new User("name+"+i, String.valueOf(i))),XContentType.JSON));
   }
   restHighLevelClient.bulk(bulkRequest, RequestOptions.DEFAULT);
}
```

## 普通查询

- 创建一个分页的检索**order**索引的查询

```java
SearchRequest searchRequest = new SearchRequest("order");
SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
sourceBuilder.from(1);
sourceBuilder.size(3);
sourceBuilder.timeout(new TimeValue(30, TimeUnit.SECONDS));
//检索条件
searchRequest.source(sourceBuilder);
SearchResponse search = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
List<Map<String, Object>> list = Arrays.stream(search.getHits().getHits()).map(SearchHit::getSourceAsMap).collect(Collectors.toList());
System.out.println(list);
```