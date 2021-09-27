## 介绍

这是一款基于`Electron`、`Koa`、开发的本地云盘

只需要在PC端下载软件，局域网内任何用户都可以在浏览器直接下载云盘文件

另外这也是作为本人入门`Electron`的第一个项目





## 功能

### GUI功能

- 点击`选择`按钮配置云盘的路径
- 服务器将监听在`输入框`输入的端口
- 点击`提交`按钮将会保存配置
- 登陆服务器的用户IP将会列举在`用户列表`
- 用户对云盘文件的一切操作将会记录在右侧`信息栏`
- 服务器开启时，服务器地址将会出现在右上角，点击可打开默认浏览器来登录云盘



### 云盘功能

- 从根路径访问路径下一切文件或文件夹
- 每个文件都可以下载
- 每个文件夹都可以经服务器打包压缩后后单独下载
- 点击导航栏的按钮可切换到任意目录
- 点击文件夹图标将进入该文件夹





## 问题

- 服务器开启时，由于要进行一系列初始化，GUI开启后立即点击开启按钮可能没反应
- 还有一些出乎预料的BUG可能出现





## 下个版本

- 支持不同文件显示不同图标
- 支持对文件夹设置访问权限
- 支持拦截指定IP的访问