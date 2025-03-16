const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const config = require('../config/index')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
const creditPackage = require('../controllers/creditPackage')
//需載入資料庫

router.get('/', creditPackage.getCreditPackage)
router.post('/', creditPackage.postCreditPackage)
router.post('/:creditPackageId', auth, creditPackage.postCreditPackageId)
router.delete('/:creditPackageId', creditPackage.deleteCreditPackageId)

module.exports = router
