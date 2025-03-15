const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('skill')
const{isUndefined,isNotValidSting,isNotValidInteger} = require('../utils/validUtils')
const skill = require('../controllers/skill')

router.get('/', skill.getSkills)

router.post('/', skill.postSkill)

router.delete('/:skillId', skill.deleteSkill)

module.exports = router
