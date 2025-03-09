const express = require('express');
const cors = require('cors')
//跨網域用(原const headers..可不用撰寫)
const path = require('path')
//網址路徑
const app = express();

const creditPackageRouter = require('./routes/creditPackage')
const skillRouter = require('./routes/skill');
const { dataSource } = require('../db/data-source');
const dataSource = require("./db")

app.use(cors())
//要用cors跨網域
app.use(express.json())
//要可解析Json資料
app.use(express.urlencoded({extended: false}))
//要可獲得前台傳過來的檔案
app.use(express.static(path.join(__dirname, 'public')))
//有實體檔案要放在public資料夾裡

app.use('/api/credit-package', creditPackageRouter)
//是否有打算在此應用程式掛上creditPackageRouter路由上去
app.use('/api/skill', skillRouter)

app.use(function(req,res,next) => {
    res.status(404).json({
        status:"sucess",
        data:"找不到頁面"
    })
})
//都不符合顯示404

const port = process.env.PORT || 8080;
app.listen(port, async ()=>{
    try{
        await dataSource.initialize()
        //初始化
        console.log(`資料庫連線成功`)
        console.log(`伺服器運作中. port: ${port}`)
    }catch(error){
        console.log(`資料庫連線失敗:${error.message}`)
        process.exit(1)
    }
})