# 环境准备

## 注册



## 获取Openid

登陆公众平台后

开发->开发者设置->获取openid

## 建立项目

使用微信开发者工具，新建项目

## 新建的项目结构

pages

​	index  首页

​	index.js 首页的逻辑文件

​	index.json

app.js 项目入口文件

app.json 全局配置文件

app.wxss 全局样式文件

## 全局配置app.json

### 如何在项目中新增文件

在app.json中，新增一个配置路径，开发者工具自动生成文件

```json
"pages": [
    "pages/index/index",
    "pages/logs/logs",
    "pages/demo01/demo01"
  ],
```

如何让项目一进入就进入新建的demo01,只需要将demo01放到数组的第一个即可

### window

用于设置小程序的状态栏、导航条、标题、窗口背景色

### 底部tab

```json
 "tabBar": {
    "list": [{
      "pagePath": "pages/index/index",
      "text": "个人中心",
      "iconPath": "icon/center.png",
      "selectedIconPath": "icon/selectcenter.png"
    },{
      "pagePath": "pages/demo01/demo01",
      "text": "设置",
      "iconPath": "icon/set.png",
      "selectedIconPath": "icon/selectset.png"
    }
  ]
},
```

## 页面配置文件

每个路径配置下都有json文件

他的配置，和全局json配置一样，能改变局部的顶部样式