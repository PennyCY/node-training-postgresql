const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')
const user = require('../controllers/user')
const auth = require('../middlewares/auth')({
    //驗證是否登入註冊的middlewares
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})


// 新增使用者
router.post('/signup', user.postSignup)

router.post('/login', user.postLogin)

router.get('/profile', auth, user.getProfile)

router.put('/profile', auth, user.putProfile)

router.put('/password', auth, user.putPassword)

module.exports = router