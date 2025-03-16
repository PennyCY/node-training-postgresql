const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Course')
const course = require('../controllers/course')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})


router.get('/', course.getCourse)

router.post('/:courseId', auth, course.postCourseBooking)

router.delete('/:courseId', auth, course.deleteCourseBooking)

module.exports = router
