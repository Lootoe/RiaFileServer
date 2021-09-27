const { ipcRenderer } = require('electron')
const { getIPAddress, save, load } = require("../utils")
const $ = require('jquery')
const sm = require("../server/serverManager")


let turnon = false;   //默认为关闭，展示启动按钮
let config = load()

// 初始化信息
if (config) {
    $("#path").text(config.rootPath);
    $("#port").val(config.port);
    $("#server-addr").text('');
}

// 设置云盘的根路径,但是不设置进配置文件
$('#path-btn').click(() => {
    ipcRenderer.send('openDialog');
    ipcRenderer.on('readed', (e, data) => {
        config.rootPath = data;
        $("#path").text(data);
    })
})

// 保存配置
$('#submit').click(() => {
    config.port = $("#port").val();
    save(config);
    ipcRenderer.send('saved');
    sm.restart();
})

// 服务器暂停与启动
$('#switch').click(function () {
    turnon = !turnon
    if (turnon) {
        sm.open();
    } else {
        sm.close();
    }
})

// 点击链接打开电脑默认浏览器
$("#server-addr").click(() => {
    console.log(getIPAddress());
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
    $("#server-addr").text(getIPAddress());
    $("#switch .icon").attr('src', './img/pause.png')
    turnon = true
}

// 服务器关闭事件
sm.onClose = () => {
    $("#server-addr").text("");
    $("#user-info li").remove()
    $("#user-list li").remove()
    $("#switch .icon").attr('src', './img/start.png')
    turnon = false
}

// 告诉主线程，渲染线程加载完毕
ipcRenderer.send('loaded');

// 接受主线程退出通知，此时应该关闭服务器
ipcRenderer.on('closeServer', () => {
    sm.close();
})


