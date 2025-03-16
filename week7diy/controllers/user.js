const bcrypt = require('bcrypt')

const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('UsersController')
const generateJWT = require('../utils/generateJWT')
    //隨時可建立新簽證供回傳給用戶

const{isUndefined,isNotValidSting,isNotValidInteger} = require('../utils/validUtils')
const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/

async function postSignup(req, res, next) {
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
      const saltRounds = await bcrypt.genSalt(10)
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
  }

async function postLogin(req, res, next) {
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
  
      //假如以上都通過,才會發通行證(132-138)(id,環境變數,何時過期並取出環境變數)
      const token = await generateJWT(
        {
          id: existUser.id
        },config.get('secret.jwtSecret'),{
          expiresIn: `${config.get(`secret.jwtExpiresDay`)}`
        })
  
        //將通行證回傳給對方(140-149)
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
  }

async function getProfile(req, res, next) {
                      //檢查是否為登入狀態，符合才提供資料
  try{
    const { id } = req.user
    const userRepo = dataSource.getRepository('User')
    const user = await userRepo.findOne({
      select: ['name','email','password'],
      where: {id}
      })
      res.status(200).json({
        status: 'success',
        data:{
          user
      }
  })

  }catch(error){
  logger.error('取得使用者資料錯誤:', error)
  next(error)
  }
}

async function putProfile(req, res, next) {
  try{
    const { id } = req.user
    const {name} = req.body
    if(isUndefined(name)||isNotValidSting(name)){
      logger.warn('欄位未填寫正確')
      res.status(400).json({
        status: 'failed',
        message:'欄位未填寫正確'
      })
      return
    }

    const userRepo = dataSource.getRepository('User')
    const user= await userRepo.findOne({
      select:['name'],
      where:{
        id
      }
    })
    if(user.name === name){
      res.status(400).json({
        status: 'failed',
        message:'使用者名稱尚未更改'
      })
      return
    }

    const updateResult = await userRepo.update({
                                        //更新
      id,
      name:user.name
    },{
      name
    })
    if(updateResult.affected === 0){
      res.status(400).json({
        status: 'failed',
        message:'使用者資料更新失敗'
      })
      return
    }
    const result = await userRepo.findOne({
      select:['name'],
      where:{
        id
      }
    })

    res.status(200).json({
      status: 'success',
      data:{
        user: result
      }
    })
  }catch(error){
  logger.error('更新使用者資料錯誤', error)
  next(error)
  }
}

async function putPassword(req, res, next) {
    try{
      const { id } = req.user
      const {password, new_password: newPassword, 
              confirm_new_password: confirmNewPassword} = req.body
      if(isUndefined(password)||isNotValidSting(password)||
        isUndefined(newPassword)||isNotValidSting(newPassword)||
        isUndefined(confirmNewPassword)||isNotValidSting(confirmNewPassword)){
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          status: 'failed',
          message:'欄位未填寫正確'
        })
        return
      }
      if(newPassword === password){
        logger.warn('新密碼不能與舊密碼相同')
        res.status(400).json({
          status: 'failed',
          message:'新密碼不能與舊密碼相同'
        })
        return
      }
  
      if(!passwordPattern.test(password)||!passwordPattern.test(newPassword)||
        !passwordPattern.test( confirmNewPassword)){
          logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
          res.status(400).json({
            status: 'failed',
            message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
          })
          return        
        }
  
      if(newPassword !== confirmNewPassword){
        logger.warn('新密碼與驗證新密碼不一致')
        res.status(400).json({
          status: 'failed',
          message:'新密碼與驗證新密碼不一致'
        })
        return
      }
  
      const userRepository = dataSource.getRepository('User')
      const existingUser = await userRepository.findOne({
        select: ['password'],
        where:{id}
      })
      const isMatch = await bcrypt.compare(password, existingUser.password)
      if(!isMatch){
        res.status(400).json({
          status: 'failed',
          message:'密碼輸入錯誤'
        })
        return
      }
  
      res.status(200).json({
        status: 'success',
        data:null
      })
    }catch(error){
    logger.error('更新使用者密碼錯誤', error)
    next(error)
    }
}

async function getCreditPackage(req, res, next) {
try{
  const { id } = req.user
  const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
  const creditPurchase = await creditPurchaseRepo.find({
    select: {
      purchased_credits: true,
      price_paid: true,
      purchaseAt: true,
      CreditPackage: {
        name: true
      }
    },
    where: {
      user_id: id
    },
    relations: {
      CreditPackage: true
    }
  })
  res.status(200).json({
    status: 'success',
    data: creditPurchase.map((item) => {
      return {
        purchased_credits: item.purchased_credits,
        price_paid:item.price_paid,
        name: item.CreditPackage.name,
        purchase_at: item.purchaseAt
        
      }
    })
  })

}catch(error){
logger.error('取得使用者資料錯誤:', error)
next(error)
}
}

module.exports = {
    postSignup,
    postLogin,
    getProfile,
    putProfile,
    putPassword,
    getCreditPackage
}
