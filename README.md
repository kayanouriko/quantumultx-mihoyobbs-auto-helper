# 简介

一个 quantumultx 脚本, 主要用于米游社原神每日签到的自动运行.

![platform](https://img.shields.io/badge/platform-quantumultx-lightgrey.svg) [![](https://img.shields.io/github/v/release/kayanouriko/quantumultx-genshin-autosign-helper)](https://github.com/kayanouriko/quantumultx-genshin-autosign-helper/releases)

## 前言

该脚本只适配了国服账号.

使用脚本前, 你需要提前了解如何使用 quantumultx 创建一个脚本任务.

虽然是参照 quantumultx 编写, 但是使用的模块封装应该也适配 shadowrocket, loon, surge, stash. 

别家应用的用户可以自行测试一下, 行就行, 不行也别找我了Orz

## 更新日志

* v1.1.1
    1. 优化代码逻辑
* v1.1.0 
    1. 新增签到奖励信息
    2. 优化代码逻辑
* v1.0.0 
    1. 初版

## 如何使用

1. 获取 cookie (感谢: [@Finger36](https://github.com/Finger36/genshin-helper))
    1. 打开你的浏览器,进入**无痕/隐身模式**
    2. 由于米哈游修改了 bbs 可以获取的 cookie，导致一次获取的 cookie 缺失，所以需要增加步骤
    3. 打开 http://bbs.mihoyo.com/ys 并进行登入操作
    4. 在上一步登入完成后新建标签页，打开 http://user.mihoyo.com 并进行登入操作
    5. 按下键盘上的 F12 或右键检查,打开开发者工具,点击 Console
    6. 复制以下代码并回车
    ```javascript
    var cookie = document.cookie
    var ask = confirm('Cookie:' + cookie + '\n\nDo you want to copy the cookie to the clipboard?')
    if (ask == true) {
      copy(cookie)
      msg = cookie
    } else {
      msg = 'Cancel'
    }
    ```
    7. 此时`Cookie`已经复制到你的粘贴板上了

2. 下载 js 文件: [releases](https://github.com/kayanouriko/quantumultx-genshin-autosign-helper/releases)
3. 打开 js 文件, 在 `$.cookie = ''` 引号内填入步骤 1 获取到的 cookie, 将 js 文件复制到 quantumultx 的 script 文件夹内. quantumultx 应用配置一个脚本任务引用该 js 文件,设置每天凌晨定时运行一次.
4. quantumultx 配置如下所示类似:
```
[task_local]
1 0 * * * qx-genshin-autosign-helper.js
```

## 感谢

* [@chavyleung/Env.js](https://github.com/chavyleung/scripts): 各家应用环境的统一封装
* [@NobyDa](https://github.com/NobyDa/Script): 一些原生算法解决方案参考
* [@genshin-sign-helper](https://github.com/daye99/genshin-sign-helper): 业务逻辑部分基本来自该仓库, 而该仓库代码又参考了别的仓库, 套娃式, 详情可以去原仓库查找
* [@GenshinPlayerQuery](https://github.com/Azure99/GenshinPlayerQuery/issues/20): 关键算法逻辑部分的来源
