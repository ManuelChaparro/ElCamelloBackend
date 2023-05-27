'use strict'

const {json} = require('express');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const connection = require('../../config/connections.js');
const nodemailer = require('nodemailer');
const { log } = require('console');

const registerUser = async (req, res) =>{
    const userBody = req.body;
    await connection.query(`SELECT nombres FROM usuarios WHERE email = ${connection.escape(userBody.email)};`, async (error, result, fields) =>{
        if(result.length === 0){
            try {
                await connection.query(`Insert into usuarios (nombres, apellidos, fecha_nacimiento, email, genero, tipo_documento, identificacion, telefono, rol, estado) values (${connection.escape(userBody.nombres)}, ${connection.escape(userBody.apellidos)}, ${connection.escape(userBody.fecha_nacimiento)}, ${connection.escape(userBody.email)}, ${connection.escape(userBody.genero)}, ${connection.escape(userBody.tipo_documento)}, ${connection.escape(userBody.identificacion)}, ${connection.escape(userBody.telefono)}, ${connection.escape(userBody.rol)}, 'A')`, async (error, result, fields) =>{
                    if(!error){
                        let pwd_binary = crypto.createHash('sha256').update(userBody.password).digest('hex')
                        let email_binary = crypto.createHash('sha256').update(userBody.email).digest('hex')
                        await connection.query(`Insert into passwords (password, indicador) values (${connection.escape(pwd_binary)}, ${connection.escape(email_binary)})`, (error, result, fields) =>{
                            if(!error){
                                res.json({message: '0'})
                            }else{
                                res.json({message: error})
                            }
                        })
                    }else{
                        res.json({message: error})
                    }
                });
            }catch (error) {
                res.json({message: `Ha ocurrido un error: ${error}`});
            }
        }else{
            res.json({message: '1'})
        }
    })
}

const modifyUser = async(req, res) =>{
    const userBody = req.body
    const {email} = req.body
    jwt.verify(req.token, 'secretkey', async (error) => {
        if(!error){
            await connection.query(`SELECT * FROM usuarios WHERE email = ${connection.escape(email)}`, async (error, result, fields) =>{
                if(!error){
                    if(result.length === 1){
                        try{
                            await connection.query(`update usuarios set nombres = ${connection.escape(userBody.nombres)}, apellidos = ${connection.escape(userBody.apellidos)}, genero = ${connection.escape(userBody.genero)}, telefono = ${connection.escape(userBody.telefono)} where email = ${connection.escape(email)}`, (error, result, fields) =>{
                                if(!error){
                                    res.json({message:`Se ha modificado correctamente el usuario`});
                                }else{
                                    res.json({message: error})
                                }
                            });
                        }catch(error){
                            res.json({message: `Ha ocurrido un error: ${error}`});
                        }
                    }else{
                        res.json({message: "El usuario que intenta modificar, no existe."})
                    }
                }else{
                    res.json({message: "Ha ocurrido un problema al validar la existencai del usuario."})
                }
            })
        }else{
            res.json({message: "No tiene autorización para ingresar"})
        }
    })
}

const loginUser = async (req, res) => {
    const {email, password} = req.body;
    let email_binary = crypto.createHash('sha256').update(email).digest('hex')
    await connection.query(`Select password from passwords where indicador = ${connection.escape(email_binary)}`, async (error, result, fields) =>{
        if(result.length === 1){
            if(result[0].password === crypto.createHash('sha256').update(password).digest('hex')){
                await connection.query(`Select id_usuario, email, rol from usuarios where email = ${connection.escape(email)} and estado = 'A'`, (error, infoUser, fields) =>{
                    if(!error){
                        if(infoUser.length > 0){
                            jwt.sign({infoUser}, 'secretkey',{expiresIn: '1h'}, (err, token) => {
                                res.json({token: token});
                            });
                        }else{
                            res.json({message: "Usuario inactivo"})
                        }     
                    }else{
                        res.json({message: "Hubo un error"})
                    }  
                })
            }else{
                res.json({message: "Contraseña incorrecta"})
            }
        }else{
            res.json({message: "usuario no valido"})
        }
    })
}

const deleteUser = async(req, res) =>{
    const {email, password} = req.body
    jwt.verify(req.token, 'secretkey', async (error) => {
        if(!error){
            let email_binary = crypto.createHash('sha256').update(email).digest('hex')
            await connection.query(`Select password from passwords where indicador = ${connection.escape(email_binary)}`, async (error, result, fields) =>{
            if(result.length === 1){
                if(result[0].password === crypto.createHash('sha256').update(password).digest('hex')){
                    await connection.query(`Select * from usuarios where email = ${connection.escape(email)}`, async (error, infoUser, fields) =>{
                        await connection.query(`update usuarios set estado = 'I' where email = ${connection.escape(email)}`)
                        res.json({message: "0"})
                    })
                }else{
                    res.json({message: "1"})
                }
            }else{
                res.json({message: "1"})
            }  
            })
        }else{
            res.json({message: "2"})
        }
    })
}

const getUsersList = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`Select * from usuarios where estado = 'A'`, async(error, list, fields) =>{
                if(list.length >= 1){
                    res.json(list)
                }else{
                    res.json({message: 'No hay usuarios'})
                }
            })
        }else{
            res.json({message: 'No tiene autorización para ingresar'})
        }
    })
}

const getUser = async(req, res) =>{
    const {email} = req.body
    jwt.verify(req.token, 'secretkey', async(error)=>{
        if(!error){
            await connection.query(`select * from usuarios where email = ${connection.escape(email)}`, async(error, user, fields) =>{
                if(user.length === 1){
                    res.json(user)
                }else{
                    res.json({message: "El usuario que busca, no existe"})
                }
            })
        }else{
            res.json({message: "No tiene autorización para ingresar"})
        }
    })
}

const deleteUserAdmin = async(req, res) =>{
    const {email, rol, id_user} = req.body
    jwt.verify(req.token, 'secretkey', async(error)=>{
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`update usuarios set estado = 'I' where email = ${connection.escape(email)}`, async(error, info, fields) =>{
                    if(!error){
                        await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Eliminacion", "Se inhabilito al usuario ${connection.escape(email)}, de la tabla de usuarios")`, async(error, info, fields) =>{
                            if(!error){
                                res.json({message: "0"})
                            }else{
                                res.json({message: error})
                            }
                        })
                    }else{
                        res.json({message: "No ha sido posible eliminar usuario"})
                    }
                })
            }else{
                res.json({message: "Lo sentimos, no tiene permisos para realizar esta acción"})
            }
        }else{
            res.json({message: "No tiene autorización para realizar esta accíon"})
        }
    })
}

const changePassword = async(req, res) =>{
    const {email, current_password, new_password} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`Select * from usuarios where email = ${connection.escape(email)}`, async(error, result, field) =>{
                if(!error){
                    if(result.length === 1){
                        let email_binary = crypto.createHash('sha256').update(email).digest('hex')
                        let currentPassword = crypto.createHash('sha256').update(current_password).digest('hex')
                        let newPassword = crypto.createHash('sha256').update(new_password).digest('hex')
                        await connection.query(`Select * from passwords where indicador = ${connection.escape(email_binary)} and password = ${connection.escape(currentPassword)}`, async(error, validation, fields) =>{
                            if(!error){
                                if(validation.length === 1){
                                    await connection.query(`update passwords set password = ${connection.escape(newPassword)} where indicador = ${connection.escape(email_binary)}`, async (error, result, fields) =>{
                                        if(!error){
                                            res.json({message: "0"})
                                        }else{
                                            res.json({message: "1"})
                                        }
                                    })
                                }else{
                                    res.json({message: "1"})
                                }
                            }else{
                                res.json({message: "1"})
                            }
                        })
                    }else{
                        res.json({message: "1"})
                    }
                }else{
                    res.json({message: "1"})
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

const recoverPassword = async (req, res) =>{
    const {email, identificacion} = req.body;
    await connection.query(`Select * from usuarios Where email = ${connection.escape(email)} and identificacion = ${connection.escape(identificacion)}`, async (error, result, fields) =>{
        if(!error){
            if(result.length === 1){
                let email_binary = crypto.createHash('sha256').update(email).digest('hex')
                let password = generatePassword(8, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*_-=+");
                let newPassword = crypto.createHash('sha256').update(password).digest('hex')
                await connection.query(`update passwords set password = ${connection.escape(newPassword)} where indicador = ${connection.escape(email_binary)}`, async (error, result, fields) =>{
                    if(!error){
                        console.log(result)
                        if(result.affectedRows === 1){
                            sendRecoveryEmail(email, password)
                            res.json({message: "0"})
                        }else{
                            res.json({message: error})
                        }
                    }else{
                        console.log(error)
                    }
                })
            }
        }
    })
}

const generatePassword = (length, chars) => {
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

const sendRecoveryEmail = (email, password) =>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'coworkingelcamello@gmail.com',
            pass: 'hfcrpacedeetyoyl'
        }
    });
    
    const mailOptions = {
        from: 'coworkingelcamello@gmail.com',
        to: email,
        subject: 'Cambio de contraseña',
        text: `Esta es tu nueva contraseña: ${password}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email enviado: ' + info.response);
        }
    });
} 

const verifyToken = (req, res, next) =>{
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    }else{
        res.sendStatus(403);
    }
}

const validCurrentToken = async(req, res) =>{
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        res.json({message: "true"})
    }else{
        res.json({message: "false"})
    }
}

module.exports = {registerUser, verifyToken, loginUser, modifyUser, deleteUser, getUsersList, recoverPassword, getUser, deleteUserAdmin, changePassword, validCurrentToken};