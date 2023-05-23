'use strict'

const router = require('express').Router()
const { clientQuantityPerHeadquarter, moneyPerHeadquarter, bookingPerMonth, spacesPerHeadquarter, avgPerUsersAge, quantityBillState, inventaryValuePerHeadquarter } = require('../controllers/reports.controller.js')
const { verifyToken } = require('../controllers/users.controller')

router.get('/reports/1', verifyToken, clientQuantityPerHeadquarter)
router.get('/reports/2', verifyToken, moneyPerHeadquarter)
router.get('/reports/3', verifyToken, bookingPerMonth)
router.post('/reports/4', verifyToken, spacesPerHeadquarter)
router.get('/reports/5', verifyToken, avgPerUsersAge)
router.get('/reports/6', verifyToken, quantityBillState)
router.get('/reports/7', verifyToken, inventaryValuePerHeadquarter)

module.exports = router