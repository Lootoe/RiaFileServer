const fs = require('fs');
const path = require('path');


// 文件
class File {
    static FILETYPE = {
        FOLDER: 0,
        FILE: 1,
    }

    name = ''                       // 用于UI显示的名称，不包含扩展名
    ext = ''                        // 文件扩展名
    fullPath = ''                   // fs文件流下载链接
    type = File.FILETYPE.FOLDER     // 根据文件类型在UI中显示不同图标
    size = ''                       // 文件大小，MB单位

    constructor(fileName, parentPath) {
        // 文件的全名
        this.fullPath = path.join(parentPath, fileName);

        // 分离文件扩展名和名称
        let pathObj = path.parse(fileName);
        this.name = pathObj.name;
        this.ext = pathObj.ext;

        // 判断文件类型
        let stat = fs.statSync(path.join(parentPath, fileName))
        this.type = stat.isDirectory() ? File.FILETYPE.FOLDER : File.FILETYPE.FILE

        // 将Byte转换为MB表示
        this.size = Math.ceil(stat.size / (1024 * 1024)) + 'MB';
    }
}


// 文件管理器
// 文件的读取及文件夹路由
class FileManager {

    static OPERATE = {
        OPEN: 0,
        BACK: 1,
        BACKTO: 2,
    }

    root = ''             // 文件服务器的根目录：C:\Users\87033\Desktop\云盘
    files = []          // 当前文件夹下的所有子文件:["文件夹1","文件夹2","文件3"]
    route = []            // 文件夹路由,是一个栈结构


    constructor(root) {
        this.root = root;
        // 绕过检验器直接打开并读取根目录
        this.route.push('root');
        this.readFolder();
    }

    // 返回客户端的包
    get pak() {
        return {
            files: this.files,
            route: this.route,
        };
    }

    //根据当前路由读取文件夹
    readFolder() {
        let files = []
        fs.readdirSync(this.fullPath).forEach(fileName => {
            files.push(new File(fileName, this.fullPath));
        })
        this.files = files;
    }

    // 拼接根路径和路由路径得到即将打开的文件夹路径
    // 但是不包含根目录别名root
    get fullPath() {
        let route = this.route.slice(1, this.route.length);
        let routeString = ''
        if (route.length === 0) {
            routeString = '\\'
        } else {
            routeString = route.reduce((preV, curV) => {
                return path.join(preV, curV);
            })
        }
        return path.join(this.root, routeString);
    }

    // 判断文件是否存在于当前目录
    contain(fileName) {
        return this.files.some(v => {
            return v.name == fileName;
        })
    }

    // 根据名称返回第一个匹配的file
    getFile(fileName) {
        return this.files.filter(v => {
            return v.name === fileName
        })[0]
    }

    // 判断能否进行文件夹操作
    validate(operate, fileName) {
        switch (operate) {
            // #region open
            // 打开目录的两个条件:
            // 1、目标必须包含在当前文件列表中
            // 2、目标必须是文件夹
            case 0:
                if (!this.contain(fileName)) return false;

                let isDir = this.getFile(fileName).type === File.FILETYPE.FOLDER;
                if (!isDir) return false

                return true;
            // #endregion

            // #region back
            // 返回上一级的条件:当前目录不能是根目录
            case 1:
                let current = this.route[this.route.length - 1];
                if (current === 'root') return false;

                return true
            // #endregion

            // #region backTo
            // 返回指定目录的条件:目标必须包含于route
            case 2:
                let index = this.route.indexOf(fileName);
                if (index === -1) return false;

                return true;
            // #endregion
        }
    }

    // 打开文件夹
    open(fileName) {
        let ok = this.validate(FileManager.OPERATE.OPEN, fileName);
        if (ok) {
            this.route.push(fileName);
            this.readFolder();
        }
        return ok
    }

    //返回上一级
    back() {
        let ok = this.validate(FileManager.OPERATE.BACK);
        if (ok) {
            this.route.pop();
            this.readFolder();
        }
        return ok
    }

    // 返回指定目录
    backTo(fileName) {
        let ok = this.validate(FileManager.OPERATE.BACK, fileName);
        let index = this.route.indexOf(fileName);
        if (ok) {
            this.route = this.route.slice(0, index + 1);
            this.readFolder();
        }
        return ok
    }
}


// 客户端管理器
module.exports = class ClientManager {
    // 文件服务器的根目录
    root = ''

    // 每次服务器启动都会重置
    // 相同IP访问服务器都会获得同一FM
    clietFM = new Map()

    constructor(root) {
        this.root = root
    }

    // 页面初始化
    accept(ip) {
        let fm = new FileManager(this.root);
        this.clietFM.set(ip, fm);

        return fm.pak
    }

    // 打开文件
    open(ip, fileName) {
        let fm = this.clietFM.get(ip);

        if (fm.open(fileName)) {
            return fm.pak
        }

        return null
    }

    // 返回上一级
    back(ip) {
        let fm = this.clietFM.get(ip);

        if (fm.back()) {
            return fm.pak
        }

        return null
    }

    // 返回指定目标
    backTo(ip, fileName) {
        let fm = this.clietFM.get(ip);

        if (fm.backTo(fileName)) {
            return fm.pak
        }

        return null
    }

    // 下载文件
    download(ip, fileName) {
        let fm = this.clietFM.get(ip);
        if (fm && fm.contain(fileName)) {
            return fm.getFile(fileName).fullPath;
        }

        return null
    }

    getIPS() {
        let ips = []
        for (let item of this.clietFM.keys()) {
            ips.push(item)
        }
        return ips
    }
}