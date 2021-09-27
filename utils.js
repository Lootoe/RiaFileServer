const os = require('os');
const fs = require("fs");
const path = require("path");

// 读取config.json
const configJson = fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf-8');
let config = JSON.parse(configJson);

// 获取本机IP
function getIPAddress() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                // return alias.address;
                return `http://${alias.address}:${config.port}`
            }
        }
    }
}

// 将配置写进配置文件
function save() {
    const configJson = JSON.stringify(config);
    fs.writeFileSync(path.resolve(__dirname, 'config.json'), configJson, 'utf-8')
}

module.exports = {
    getIPAddress,
    config,
    save,
}
