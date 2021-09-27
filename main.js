const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron')

// 隐藏菜单栏
// Menu.setApplicationMenu(null)

let win = null
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 520,
        title: 'RiaFS',
        // resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    win.loadFile('./app/index.html')
}

app.whenReady().then(() => {

    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })

    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') {
            app.exit();
        }
    })
})

// 渲染线程加载完毕时，绑定事件
ipcMain.on('loaded', () => {
    // 绑定退出事件
    // 关闭服务器
    win.on("close", () => {
        win.webContents.send('closeServer');
    })
})

// 让GUI获取选中的文件夹路径
ipcMain.on('openDialog', (e) => {
    let rootPath = dialog.showOpenDialogSync({
        title: '服务器路径选择',
        buttonLabel: '确认',
        properties: ['openDirectory'],
    })

    if (rootPath) {
        rootPath = rootPath[0];
    }

    e.sender.send('readed', rootPath)
})

// 打开电脑默认浏览器
ipcMain.on('openBroswer', (e, url) => {
    shell.openExternal(url);
})

// 配置保存后的提示
ipcMain.on('saved', () => {
    dialog.showMessageBox(win, {
        message:'配置保存成功',
        type:'info',
        title:'RiaFS'
    })
})