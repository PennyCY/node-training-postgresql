const express = require('express')
const bcrypt = require('bcrypt')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')
const{isUndefined,isNotValidSting,isNotValidInteger} = require('../utils/validUtils')


// 新增使用者
router.post('/signup', async (req, res, next) => {
  try {
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
    const { name, email, password } = req.body
    // 驗證必填欄位
    if (isUndefined(name) || isNotValidSting(name) || isUndefined(email) || isNotValidSting(email) || isUndefined(password) || isNotValidSting(password)) {
      logger.warn('欄位未填寫正確')
      res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
      return
    }
    if (!passwordPattern.test(password)) {
      //測試密碼是否有通過
      logger.warn('建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
      res.status(400).json({
        status: 'failed',
        message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
      })
      return
    }
    const userRepo = dataSource.getRepository('User')
    // 檢查 email 是否已存在
    const existUser = await userRepo.findOne({
      where: { email }
    })

    if (existUser) {
      logger.warn('建立使用者錯誤: Email 已被使用')
      res.status(409).json({
        status: 'failed',
        message: 'Email 已被使用'
      })
      return
    }

    // 建立新使用者
    const hashPassword = await bcrypt.hash(password, saltRounds)
    const newUser = userRepo.create({
      name,
      email,
      role: 'USER',
      password: hashPassword
    })

    const savedUser = await userRepo.save(newUser)
    logger.info('新建立的使用者ID:', savedUser.id)

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: savedUser.id,
          name: savedUser.name
        }
      }
    })
  } catch (error) {
    logger.error('建立使用者錯誤:', error)
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try{
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
    const { email, password } = req.body
    if (isUndefined(email) || isNotValidSting(email) || isUndefined(password) || isNotValidSting(password)) {
      logger.warn('欄位未填寫正確')
      res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
      return
    }
    if (!passwordPattern.test(password)) {
      //測試密碼是否有通過
      logger.warn('建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
      res.status(400).json({
        status: 'failed',
        message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
      })
      return
    }

    const userRepo = dataSource.getRepository('User')
    // 檢查 email 是否已存在
    const existUser = await userRepo.findOne({
      select:['id','name','password'],
      where: { email }
    })

    if (!existUser){
      res.status(400).json({
        status: 'failed',
        message: '使用者不存在或密碼輸入錯誤'
      })
      return
    }

    //如果使用者存在但密碼打錯
    logger.info(`使用者資料: ${JSON.stringify(existUser)}`)
    const isMatch = await bcrypt.compare(password, existUser.password)
    if (!isMatch){
      res.status(400).json({
        status: 'failed',
        message: '使用者不存在或密碼輸入錯誤'
      })
      return
    }

    //假如以上都通過,才會發通行證(id,環境變數,何時過期並取出環境變數)
    const token = await generateJWT(
      {
        id: existUser.id
      },config.get('secret.jwtSecret'),{
        expiresIn: `${config.get(`secret.jwtExpiresDay`)}`
      })

      //將通行證回傳給對方
      res.status(201).json({
        status: 'success',
        data:{
          token,
          user:{
            name: existUser.name
          }
        }
      }) 

  }catch(error){
  logger.error('登入錯誤:',error)
  next(error)
  }
})

router.get('/profile', auth, async (req, res, next) => {
                      //檢查是否為登入狀態，符合才提供資料
})

router.put('/profile', auth, async (req, res, next) => {

})


module.exports = router