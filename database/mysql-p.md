# 

```mysql
CREATE TABLE `user_item` (
  `id` BIGINT(20) NOT NULL,
  `user_id` BIGINT(20) NOT NULL,
  `item_id` BIGINT(20) NOT NULL,
  `status` TINYINT(4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_1` (`user_id`,`item_id`,`status`)
) 
```

https://www.cnblogs.com/hunternet/p/11383360.html