const { ipcRenderer } = require('electron')
const { config, getIPAddress, save } = require("../utils")
const $ = require('jquery')
const sm = require("../server/serverManager")

// 读取路径和端口和清空服务器信息
$("#path").text(config.rootPath);
$("#port").val(config.port);
$("#server-info").text('');

// 设置云盘的根路径,但是不设置进配置文件
$('#path-btn').click(() => {
    ipcRenderer.send('openDialog');
    ipcRenderer.on('readed', (e, data) => {
        config.rootPath = data
        $("#path").text(data);
    })
})

// 将路径和端口保存到配置文件
// 成功后有提示信息
// 在运行时提交会重启服务器
$('#submit').click(() => {
    config.port = $("#port").val();
    save();
    ipcRenderer.send('saved');
    sm.restart();
})

// 服务器暂停与启动
let turnon = false;   //默认为关闭，展示启动按钮
$('#switch').click(function () {
    turnon = !turnon
    if (turnon) {
        // 此时为打开状态,应该展示关闭图标
        $("#switch .icon").attr('src', './img/pause.png')
        sm.open();
    } else {
        // 此时为关闭状态,应该展示开启图标
        sm.close();
        $("#switch .icon").attr('src', './img/start.png')
    }
})

// 点击链接打开电脑默认浏览器
$("#server-info").click(() => {
    ipcRenderer.send("openBroswer", `${getIPAddress()}`)
})

// 处理服务器发送的信息
sm.handler = data => {
    switch (data.type) {
        case 'login':
            $("#user-list li").remove();
            data.msg.forEach(item => {
                $("#user-list").append(`<li>${item}</li>`)
            })
            break;
        case 'info':
            $("#user-info").append(`<li>${data.msg}</li>`)
            break;
    }
}

// 服务器开启时的事件
sm.onOpen = () => {
    $("#server-info").text(getIPAddress());
    $("#switch .icon").attr('src', './img/pause.png')
}

// 服务器关闭事件
sm.onclose = () => {
    $("#server-info").text("");
    $("#user-info li").remove()
    $("#user-list li").remove()
    $("#switch .icon").attr('src', './img/start.png')
}

// 告诉主线程，渲染线程加载完毕
ipcRenderer.send('loaded');

// 接受主线程退出通知，此时应该关闭服务器
ipcRenderer.on('closeServer', () => {
    sm.close();
})


