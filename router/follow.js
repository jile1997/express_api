module.exports = (app) => {

    const express = require('express');
    const router = express.Router()
    const sqlQuery = require('../mudular/mysql');

    const islogin = require('../middleware/islogin')

    router.post('/', async(req, res) => {
        let { followid, userid } = req.body
        let sql1 = `select * from follow where followid = ? and userid = ?`
        let result1 = await sqlQuery(sql1, [followid, userid])
        if (result1.length != 0) {
            return res.send({
                "code": 422,
                'msg': '不能重复关注'
            })
        } else {
            if (followid == userid) {
                return res.send({
                    "code": 422,
                    'msg': '不能关注自己'
                })
            } else {
                let sql2 = `insert into follow (followid,userid,createtime) values (?,?,?)`
                let result2 = await sqlQuery(sql2, [followid, userid, (new Date())])
                if (result2.affectedRows == 1) {
                    res.send({
                        "code": 200,
                        'msg': '关注成功'
                    })
                } else {
                    res.send({
                        "code": 422,
                        'msg': '关注错误'
                    })
                }
            }
        }
    })

    app.use('/follow', islogin, router)
}