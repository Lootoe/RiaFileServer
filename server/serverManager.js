const fork = require('child_process').fork;
const path = require('path');


class ServerManager {

    handler = null          // 处理服务器信息的处理器
    serverThread = null     // 服务器线程
    serverPath = null       // 服务器文件的路径
    onOpen = null           // 服务器开启事件
    onclose = null          // 服务器关闭事件
    state = false           //服务器状态，开启(true)/关闭(close)

    constructor(serverPath) {
        this.serverPath = serverPath;
    }

    // 开启服务器
    open() {
        this.state = true;
        if (this.onOpen) this.onOpen();
        this.serverThread = fork(this.serverPath);

        this.serverThread.on('message', data => {
            console.log(data.msg);
            if (this.handler) this.handler(data)
        })
    }

    // 关闭服务器
    close() {
        this.state = false;
        if (this.onclose) this.onclose();
        this.serverThread.kill();
    }

    // 重启服务器
    restart() {
        // 如果是关闭状态就直接开启,开启状态需要先关闭
        if (this.state === false) {
            this.open();
        } else {
            this.close();
            this.open();
        }
    }
}

module.exports = new ServerManager(path.join(__dirname, 'server.js'))