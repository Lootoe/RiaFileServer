const os = require('os');
const fs = require("fs");
const path = require("path");
const configPath = path.resolve(__dirname, "../", "config.json")

// 获取本机IP
function getIPAddress() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return `http://${alias.address}:${load().port}`
            }
        }
    }
}

// 获取配置文件
function load() {
    // 从整个应用根目录获取
    return JSON.parse(fs.readFileSync(configPath))
}

// 将配置写进配置文件
function save(config) {
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
}


module.exports = {
    getIPAddress,
    load,
    save,
}
