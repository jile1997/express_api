module.exports = (app) => {
    const express = require('express');
    const router = express.Router()
    const sqlQuery = require('../mudular/mysql');
    const email = require('../mudular/email')
        // 加密
        // const secret = 'sfajklfjkgjdfkl'//jwt用的  此处不用 
    const bcryptjs = require('bcryptjs')
        // 储存验证码的地方
    let codes = [];
    // 生成验证码
    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    // 判断是否发送验证码
    let yzms = []
    let issend = (email) => {
            // let ms =  +new Date() + 1000
            for (let item of yzms) {
                if (email == item.email) {
                    return true
                }

            }
            return false
        }
        // 判断验证码和邮箱
    let islogin = (email, code) => {
            for (let item of yzms) {
                if (email == item.email && code == item.code) {
                    return true
                }
            }
            return false
        }
        // 发送验证码
    router.post('/sendcode', async(req, res) => {
            let code = getRandom(1000, 9999)
            let ms = +new Date()
            let email = req.body.email
            // if (issend(email)) {
            //     res.send({
            //         err: -1,
            //         msg: '验证码已发送请稍后重试'
            //     })
            // } else {
            //     yzms.push({
            //         'email': email,
            //         'code': code,
            //         'date': ms
            //     })
            //     res.send({
            //         'code': code,
            //         'msg': '发送成功'
            //     })
            //     console.log(code)
            // }
			if(issend(email)){
			yzms.forEach((item,i)=>{
				 if(item.email == email){
				 yzms.splice(i,1)
				}
			})
			yzms.push({
				'email':email,
				'code':code,
			})
			res.send({
				'code':code,
				'msg':'发送成功'
			})
			}else{
				yzms.push({
					'email':email,
					'code':code,
				})
				res.send({
					'code':code,
					'msg':'发送成功'
			})
			}
        })
        // 登陆验证 废弃 
    router.post('/login', async(req, res) => {
        let { email, code } = req.body
            // 判断是否发送验证码
        if (issend(email)) {
            let login = islogin(email, code)
                // 判断验证码手机号是否正确
            if (login) {
                return res.send({
                    'code': 200,
                    'msg': '登陆成功'
                })
            } else {
                return res.send({
                    'code': 422,
                    'msg': '登陆失败'
                })
            }
        } else {
            res.send({
                err: -2,
                'msg': '未发送验证码'
            })
        }
    })
    router.post('/reguser', async(req, res) => {
        let ms = new Date()
        let userpic = 'http://cdn.loginlm.top/44c451da81cb39dba1574e36df160924ab18303e.jpg'
        let sql1 = `insert into user (username,userpic,password,phone,email,createdate) value (?,?,?,?,?,?)`
        let { username, password, phone, email, code } = req.body
        let isuser = `select * from user where email = ?`
        let isuserserch = await sqlQuery(isuser, [email])
        if (isuserserch.length !== 0) {
            return res.send({
                'code': 422,
                'msg': '您的邮箱重复,请换一个邮箱注册'
            })
        }
        // 判断验证码是否发送
        if (issend(email)) {
            // 判断验证码正确与否
            let login = islogin(email, code)
            if (login) {
                // 对密码加密处理
                let passwords = bcryptjs.hashSync(password, 10)
                    // console.log(ms, passwords)
                let arr = [username, userpic, passwords, phone, email, ms]
                let result = await sqlQuery(sql1, arr)
                if (result.affectedRows == 1) {
                    res.send({
                        'code': 200,
                        'msg': '注册成功'
                    })
                } else {
                    res.send({
                        'code': 400,
                        'msg': '注册失败'
                    })
                }

            } else {
                res.send({
                    'code': 422,
                    'msg': '验证码错误，请重试'
                })
            }
        } else {
            res.send({
                err: -2,
                'msg': '未发送验证码'
            })
        }

    })

    // 有两个登陆接口 下面是需要密码 上面是验证码 上面的废弃了
    router.post('/logins', async(req, res) => {
        let sql1 = `select * from user where email = ?`
        let { email, password } = req.body
        let result = await sqlQuery(sql1, [email]);
        if (result.length == 0) {
            return res.send({
                err: -1,
                msg: '邮箱不存在'
            })
        }
        const ismima = bcryptjs.compareSync(password, result[0].password);
        if (!ismima) {
            return res.send({
                err: '-2',
                msg: '密码错误'
            })
        }
        // 把用户信息存到cookie里面
        req.session.email = email

        res.send(result)
    })

    // 修改密码
    router.post('/setpass', async(req, res) => {
        let email = req.session.email
        if (email == undefined) {
            return res.send({
                'err': '-2',
                'msg': '尚未登陆'
            })
        } else if (issend(email)) {
            let { code, password } = req.body
                // 判断验证码正确与否
            let login = islogin(email, code)

            if (islogin) {

                let passwords = bcryptjs.hashSync(password, 10)
                let sql = `update user set password = ? where email = ?`
                let result = await sqlQuery(sql, [passwords, email])
                if (result.affectedRows == 1) {
                    res.send({
                        'code': 200,
                        'msg': '修改密码成功',
                        'data': result
                    })
                } else {
                    res.send({
                        'code': 400,
                        'msg': '修改密码失败'
                    })
                }
            }

        } else {
            return res.send({
                err: -2,
                'msg': '未发送验证码'
            })
        }
    })



    // 登陆注册接口路由user
    app.use('/user', router)
}