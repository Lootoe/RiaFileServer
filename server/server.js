//koa
const Koa = require("koa")
const Router = require('@koa/router')
const send = require("koa-send")
const static = require("koa-static")

//utils
const path = require('path')
const fs = require('fs')
const archiver = require('archiver');
const { config } = require("../utils")
//core
const ClientManager = require("./file")


process.send({
    type: 'info',
    msg: '正在初始化服务器...'
})

// 服务器初始化
const app = new Koa();
const router = new Router()
app
    .use(static(path.resolve(__dirname, '../', './static')))
    .use(router.routes())
    .use(router.allowedMethods());

let CM = new ClientManager(config.rootPath);

process.send({
    type: 'info',
    msg: '服务器初始化完毕！'
})

// 页面初始化
router.get('/init', ctx => {

    const pak = CM.accept(ctx.ip);
    process.send({
        type: 'login',
        msg: CM.getIPS(),
    })

    if (pak) {
        ctx.body = pak
    } else {
        ctx.status = 403
    }
})

// 打开文件夹
router.post('/open', ctx => {
    // 判断是否是根目录
    let fileName = ctx.query['f']
    const pak = CM.open(ctx.ip, fileName)

    if (!pak) {
        ctx.status = 403
    } else {
        ctx.status = 200
        ctx.body = pak
        process.send({
            type: 'info',
            msg: `${ctx.ip} >> 打开【${fileName}】`
        })
    }
})

// 返回上一级
router.post('/back', ctx => {
    // 判断是否是根目录
    const pak = CM.back(ctx.ip);

    if (!pak) {
        ctx.status = 403
    } else {
        ctx.status = 200
        ctx.body = pak
        process.send({
            type: 'info',
            msg: `${ctx.ip} >> 返回上一级`
        })
    }
})

// 返回指定目标
router.post('/backto', ctx => {
    // 判断是否是根目录
    let fileName = ctx.query['f']
    const pak = CM.backTo(ctx.ip, fileName)

    if (!pak) {
        ctx.status = 403
    } else {
        ctx.status = 200
        ctx.body = pak
        process.send({
            type: 'info',
            msg: `${ctx.ip} >> 返回【${fileName}】`
        })
    }
})

// 下载文件
router.get('/download/:fileName', ctx => {
    const fileName = ctx.params.fileName;
    const fullPath = CM.download(ctx.ip, fileName);

    if (!fullPath) {
        ctx.status = 403
    } else {
        ctx.status = 200;
        ctx.set({ 'Content-Type': 'applciation/octet-stream' });
        ctx.attachment(path.basename(fullPath));
        const stream = fs.createReadStream(fullPath);
        ctx.body = stream;
        process.send({
            type: 'info',
            msg: `${ctx.ip} >> 下载【${fileName}】`
        })
    }
})

// 文件夹压缩下载
router.get('/zip/:fileName', async ctx => {
    const zip = archiver('zip');
    const fileName = ctx.params.fileName;
    let fullPath = CM.download(ctx.ip, fileName);

    if (!fullPath) {
        ctx.status = 403;
    } else {
        let zipName = fileName + '.zip';
        zip.directory(fullPath, '/');
        const zipStream = fs.createWriteStream(path.join(__dirname, '../', zipName));
        zip.pipe(zipStream);
        await zip.finalize();

        ctx.status = 200;
        ctx.set({ 'Content-Type': 'applciation/octet-stream' });
        ctx.attachment(zipName);
        await send(ctx, zipName);

        fs.rm(path.join(__dirname, '../', zipName), () => {
            process.send({
                type: 'info',
                msg: `${ctx.ip} >> 下载【[${fileName}】`
            })
        })
    }
})

// 监听
app.listen(config.port, '0.0.0.0');



