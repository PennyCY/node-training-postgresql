const jwt = require('jsonwebtoken')

/**
 * create JSON Web Token
 * @param {Object} payload token content
 * @param {String} secret token secret
 * @param {Object} [option] same to npm package - jsonwebtoken
 * @returns {String}
 */
module.exports = (payload, secret, option = {}) => new Promise((resolve, reject) => {
     //圖示的第二步驟:登入後驗證沒問題，簽出(sign)一個臨時通行證(token)
  jwt.sign(payload, secret, option, (err, token) => {
     //簽名   本地  外部資料  預設值(ex:設定過期時間)
    if (err) {
      reject(err)
      return
    }
    resolve(token)
  })
})