'use strict'

const router = require('express').Router();
const {verifyToken, loginUser, registerUser, modifyUser, deleteUser, getUsersList, recoverPassword, deleteUserAdmin, getUser, changePassword, validCurrentToken} = require('../controllers/users.controller.js')

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.put('/user/modify', verifyToken, modifyUser);
router.post('/user/delete', verifyToken, deleteUser);
router.get('/user/list', verifyToken, getUsersList);
router.post('/user/ad/delete', verifyToken, deleteUserAdmin);
router.post('/user/recovery', recoverPassword);
router.post('/user/search', verifyToken, getUser);
router.put('/user/changepass', verifyToken, changePassword)
router.post('/user/validUser', validCurrentToken)
module.exports = router;