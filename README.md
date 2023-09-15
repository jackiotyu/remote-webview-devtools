# 移动端webview调试
使用最新的 `chrome devtools` 调试移动端 `webview`

![devtools-preview](https://cdn.jsdelivr.net/gh/jackiotyu/remote-webview-devtools@0.2.13/images/devtools-preview.png)

***
### 微信h5调试方法

1. 配置`adb`可执行文件路径
    - 打开配置，设置`RemoteWebviewDevtools.adbPath`为指定路径，
      微信开发者工具上有内置的adb，windows上路径为 `C:\Program Files (x86)\Tencent\微信web开发者工具\bin\adb-win\adb.exe`
    - 已配置`adb`到全局变量可以忽略这一步
1. 打开微信内置调试
    - 用微信访问 [http://debugxweb.qq.com/?inspector=true](http://debugxweb.qq.com/?inspector=true),
    可以通过插件面板的二维码工具快速扫描访问
1. 连接安卓手机
    - 使用`USB`数据线连接，打开开发者模式，启用`USB调试模式`
    - 或者使用远程连接，[参考文档](https://juejin.cn/post/7198041490626576442)
1. 查找可调试的连接
    - 使用微信访问链接，可以通过插件面板的二维码工具生成二维码再扫描访问
    - 在插件面板上`ADB连接WEBVIEW`列表上刷新(可配置自动刷新)
    - 在需要调试的链接上点击，会自动开启调试面板
***

### 配置
```json
{
    // 自动刷新列表间隔(单位：毫秒), 设置为0时禁用自动刷新, 默认为0
    "RemoteWebviewDevtools.refresh": 0,
    // adb可执行文件路径
    "RemoteWebviewDevtools.adbPath": "",
    // adb执行参数
    "RemoteWebviewDevtools.adbArgs": [],
    // 设置搜索debug页面连接的端口, 默认9222
    "RemoteWebviewDevtools.port": 9222,
}
```

### 其他功能
- 自定义端口搜索可用连接，例如调试电脑上的chrome页面
- 自定义拦截流程，修改devtools的各种通信数据

