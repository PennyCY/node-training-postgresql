const express = require('express')

const router = express.Router()
const skill = require('../controllers/skill')

router.get('/', skill.getSkills)

router.post('/', skill.postSkill)

router.delete('/:skillId', skill.deleteSkill)

module.exports = router
