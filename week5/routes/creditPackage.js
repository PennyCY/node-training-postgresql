const express = require('express')

const router = express.Router()
//const { dataSource } = require('../db/data-source')
//const logger = require('../utils/logger')('CreditPackage')
const AppDataSource = require("../db")
//需載入資料庫

router.get('/', async (req, res, next) => {
    const packages = await AppDataSource.getRepository("CreditPackage").fing({
                    //typeorm如何取得資料庫的邏輯
        select:["id","name","credit_amout","price"]
    })
    res.status(200).json({
        status:"success",
        data:packages
    })

})

router.post('/', async (req, res, next) => {
})

router.delete('/:creditPackageId', async (req, res, next) => {
})

module.exports = router
