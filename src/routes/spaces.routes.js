'use strict'

const router = require('express').Router()
const { createSpace, modifySpace, deleteSpace, getSpacesList, searchSpace, listSpacesPerHeadquarter } = require('../controllers/spaces.controller')
const {verifyToken} = require('../controllers/users.controller')

router.post('/spaces/add', verifyToken, createSpace)
router.put('/spaces/modify', verifyToken, modifySpace)
router.delete('/spaces/delete', verifyToken, deleteSpace)
router.get('/spaces/list', verifyToken, getSpacesList)
router.get('/spaces/search', verifyToken, searchSpace)
router.post('/spaces/list/headquarter',verifyToken, listSpacesPerHeadquarter)

module.exports = router