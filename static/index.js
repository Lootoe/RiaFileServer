let route = []  // 路由信息,用于导航栏
let files = []  // 文件信息,当前文件夹的所有文件

// 表格的文件模板
function getTemplate(file) {
    let iconSrc = file.type === 0 ? './img/folder.png' : './img/file.png';
    let fileName = file.name;
    let size = file.size;

    return `
    <div class="row file">
    <div class="type-box open">
        <img src="${iconSrc}" class="icon">
    </div>
    <div class="cell">
        <span>${fileName}</span>
    </div>
    <div class="cell">
        <span>${size}</span>
    </div>
    <div class="download-box">
        <div class="download-btn download">
            <img src="./img/download.png" class="icon">
        </div>
    </div>
    </div>
    `
}


// 更新文件夹路由
function updateRoute(param) {
    // 先移除所有子项
    $('#route').empty();

    // 设置UI
    route = param
    route.forEach((item, index) => {
        // 设置好路由的UI显示
        $("#route").append(`<li><a href="#">${item}</a></li>`)
    });

    // 为每个路由绑定backto事件
    $('#route li a').each(function (index) {
        $(this).click(() => {
            $.post(`/backto?f=${route[index]}`, data => {
                updateRoute(data.route);
                updateFiles(data.files);
            })
        })
    })
}


// 更新文件列表
function updateFiles(param) {
    // 先移除所有文件
    $('.file').remove();

    files = param
    files.forEach(item => {
        // 设置好UI样式
        $('#files').append(getTemplate(item));
    })

    // 绑定打开文件夹请求
    $('.open').each(function (index) {
        $(this).click(() => {
            $.post(`/open?f=${files[index].name}`, data => {
                // 请求完毕后，更新路由和文件列表
                updateRoute(data.route);
                updateFiles(data.files);
            })
        })
    })

    // 绑定下载文件请求
    $('.download').each(function (index) {
        $(this).click(() => {
            // console.log(files[index].name);
            // 判断应该下载压缩包还是文件
            if (files[index].type === 0) {
                window.open(`/zip/${files[index].name}`)
            } else {
                window.open(`/download/${files[index].name}`)
            }
        })
    })
}


// 页面初始化时,获取根目录信息
$.get('/init', data => {
    updateRoute(data.route);
    updateFiles(data.files);
})

