const express = require('express');
const app = express();
const path = require('path')
    // 请求参数处理
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//引用session
let cookieParser = require('cookie-parser');
let session = require('express-session');
app.use(session({
        secret: "xzsagjasoigjasoi",
        resave: true, //强制保存session
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, //设置session的有效期为1周
        },
        saveUninitialized: true //是否保存初始化的session
    }))
    // 静态文件托管
app.use('/upload', express.static(__dirname + '/upload'))

// 处理跨域请求
app.use(require('cors')())

// 测试接口
require('./router/api')(app)
    // 登陆注册
require('./router/user')(app)

// 用户列表 包括图片上传
require('./router/userlist')(app)

// 关注被关注
require('./router/follow')(app)
    // 错误处理函数
app.use(async(err, req, res, next) => {
    // console.log(err)
    res.status(err.statusCode || 500).send({
        message: err.message
    })
})

app.listen(3500, () => {
    console.log('http://localhost:3500');
});