module.exports = (app) => {
    const express = require('express');
    const router = express.Router()
    const sqlQuery = require('../mudular/mysql');

    router.get('/', async(req, res) => {
        // let sql1 = `select * from cate`

        // let result = await sqlQuery(sql1);
        let ms = +new Date()
        res.send(ms)

    })
    router.get('/:id', async(req, res) => {
        let sql1 = `select * from post where cateid = ${req.params.id}`;

        let result = await sqlQuery(sql1);
        res.send(result)
    })


    // 测试路由接口api
    app.use('/api', router)
}