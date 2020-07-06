module.exports = (app) => {
    const express = require('express');
    const router = express.Router()
    const sqlQuery = require('../mudular/mysql');

    // 引入文件上传模块
    const multer = require('multer');
    const upload = multer({ dest: "./upload" })
    const fs = require('fs')

    // 更改文件名称
    const rename = (req) => {
        // destination随机名称没有后缀名 orientation原名称有后缀名
        let oldPath = req.file.destination + "/" + req.file.filename;
        let newPath = req.file.destination + "/" + req.file.filename + req.file.originalname;
        fs.rename(oldPath, newPath, () => {
            //console.log("改名成功")
        })
        return {
            state: 'ok',
            imgUrl: "http://localhost:3500/upload/" + req.file.filename + req.file.originalname
        }
    }
    app.post('/userupload', upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.send({
                err: -1,
                msg: '上传文件不能为空'
            })
        } else {
            let { size, mimetype } = req.file
            let types = ['jpg', 'jpeg', 'png', 'gif']
            console.log(req.file)
                // 因为传上来格式为 image/jpeg image/gif 所以要分割一下
            let tmpType = mimetype.split('/')[1]
            if (size > 5000000) {
                return res.send({
                    err: -2,
                    msg: '文件过大'
                })
            } else if (types.indexOf(tmpType) == -1) {
                return res.send({
                    err: -3,
                    msg: '文件格式不符合规定'
                })
            } else {
                let result = rename(req)
                return res.send(result)

            }


        }

    })

    // 多图上传
    app.post('/useruploads', upload.array('files', 5), (req, res) => {
        let email = req.session.email
        let arr = []
        req.files.forEach(function(ele, index) {
            // console.log(index)
            let oldFile = ele.destination + "/" + ele.filename; //指定旧文件
            let newFile = ele.destination + "/" + ele.filename + ele.originalname; //指定新文件
            fs.renameSync(oldFile, newFile, function(err) {
                if (err) {
                    console.log(err)
                }
            });
            let imgurls = "http://localhost:3500/upload/" + ele.filename + ele.originalname
                // console.log(imgurls)
            arr.push(imgurls)
        });
        arr.map(async(item, i) => {
            let sql = `insert into img (url,email,createtime) values (?,?,?)`
            let result = await sqlQuery(sql, [item, email, (+new Date())])
        })
        return res.send(arr)

    })


    const islogin = require('../middleware/islogin')
        // 获取用户信息
    router.post('/', async(req, res) => {
            let sql = `select * from user where email = ?`
            let result = await sqlQuery(sql, [req.session.email])
            res.send(result)
        })
        //修改用户信息


    // 退出登陆
    router.post('/loginout', (req, res) => {
        req.session.destroy()
        res.send({
            'msg': '已成功退出登陆'
        })
    })

    // 上传视频接口

    router.post('/uppost', async(req, res) => {
        let { email, title, url, path, isopen, postimg } = req.body
        let sql1 = `insert into post (email,title,url,path,isopen,createtime,postimg) values (?,?,?,?,?,?,?)`
        let result = await sqlQuery(sql1, [email, title, url, path, isopen, (+new Date()), postimg])
        if (result.length == 0) {
            return res.send({
                'code': 422,
                'msg': '发布失败'
            })
        } else {
            return res.send({
                data: result,
                'msg': '发布成功'
            })
        }

    })


    app.use('/userlist', islogin, router)

}