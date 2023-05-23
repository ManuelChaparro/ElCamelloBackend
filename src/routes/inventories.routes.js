'use strict'

const router = require('express').Router()
const { createProduct, modifyProduct, deleteProduct, getProductList, createInventary, getInventary, getProductPerType, getProductsPerInventary, getInventaryList} = require('../controllers/inventories.controller')
const {verifyToken} = require('../controllers/users.controller')

router.post('/inventary/product/add', verifyToken, createProduct)
router.put('/inventary/product/modify', verifyToken, modifyProduct)
router.post('/inventary/product/delete', verifyToken, deleteProduct)
router.get('/inventary/product/list', verifyToken, getProductList)
router.post('/inventary/product/filter/type', verifyToken, getProductPerType)
router.post('/inventary/create', verifyToken, createInventary)
router.post('/inventary/search', verifyToken, getInventary)
router.post('/inventary/product/filter', verifyToken, getProductsPerInventary)
router.post('/inventary/list', verifyToken, getInventaryList)

module.exports = router