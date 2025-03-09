const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('skill')

router.get('/', async (req, res, next) => {

    res.status(200).json({
        status:"success",
        data:"取得資料"
    })

})

router.post('/', async (req, res, next) => {
})

router.delete('/:skillId', async (req, res, next) => {
})

module.exports = router
