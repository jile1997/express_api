        // 判断用户是否登陆
        const islogin = async(req, res, next) => {
            let email = req.session.email
            if (email === undefined) {
                return res.send({
                    'err': -1,
                    'msg': '尚未登陆，请登陆'
                })
            }
            next()
        }

        module.exports = islogin