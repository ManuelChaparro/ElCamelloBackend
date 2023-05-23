'use strict'

const jwt = require('jsonwebtoken')
const connection = require('../../config/connections')
const {json} = require('express')

const createSpace = async(req, res) =>{
    const {headquarter_id, space_name, space_fee, space_description, rol, id_user} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`Select * from espacios where nombre = ${connection.escape(space_name)}`, async(error, result, fields)=>{
                    if(!error){
                        if(result.length === 0){
                            await connection.query(`Insert into espacios (id_sede, nombre, tarifa, descripcion) values (${connection.escape(headquarter_id)}, ${connection.escape(space_name)}, ${connection.escape(space_fee)}, ${connection.escape(space_description)})`, async(error, result, fields) =>{
                                if(!error){
                                    await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Agregacion", "Se agrego el espacio ${connection.escape(space_name)} a la tabla de espacios")`, async(error, info, fields) =>{
                                        if(!error){
                                            res.json({message: "Se ha ingresado correctamente el nuevo espacio"})
                                        }else{
                                            res.json({message: "Error log"})
                                        }
                                    })
                                }else{
                                    res.json({message: error})
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
                res.json({message: "No tiene los permisos para realizar esta acción"})
            }
        }else{
            res.json({message: "No tiene autorización para ingresar"})
        }
    })
}

const modifySpace = async(req, res) =>{
    const {space_id, new_headquarter_id, new_space_name, new_space_fee, new_space_description, rol, id_user} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`select * from espacios where id_espacio = ${connection.escape(space_id)}`, async(error, validate, fields) =>{
                    if(!error){
                        if(validate.length === 1){
                            await connection.query(`Update espacios set id_sede = ${connection.escape(new_headquarter_id)}, nombre = ${connection.escape(new_space_name)}, tarifa = ${connection.escape(new_space_fee)}, descripcion = ${connection.escape(new_space_description)}`, async(err, result, fields) =>{
                                if(!err){
                                    await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripción) values (${id_user}, NOW(), "Modificacion", "Se modifico el espacio ${connection.escape(new_space_name)} en la tabla de espacios")`, async(error, info, fields) =>{
                                        if(!error){
                                            res.json({message: "El espacio se modifico correctamente"})
                                        }else{
                                            res.json({message: "Error log"})
                                        }
                                    })
                                }else{
                                    res.json({message: "No se ha podido modificar el espacio"})
                                }
                            })
                        }else{
                            res.json({message: "El espacio que desea modificar no existe"})
                        }
                    }else{
                        res.json({message: "Ha ocurrido un error al intentar modificar uno de los espacios"})
                    }
                })
            }else{
                res.json({message: "No tiene los permisos para realizar esta acción"})
            }
        }else{
            res.json({message: "No tiene autorización para ingresar"})
        }
    })
}

const deleteSpace = async(req, res) => {
    const {space_id, rol, id_user} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`Select * from espacios where id_espacio = ${connection.escape(space_id)}`, async(error, validation, fields) =>{
                    if(!error){
                        if(validation.length === 1){
                            await connection.query(`delete from espacios where id_espacio = ${connection.escape(space_id)}`, async(err, result, fields) =>{
                                if(!err){
                                    await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripción) values (${id_user}, NOW(), "Eliminacion", "Se elimino el espacio ${connection.escape(space_id)} de la tabla de espacios")`, async(error, info, fields) =>{
                                        if(!error){
                                            res.json({message: "Se ha eliminado correctamente el espacio"})
                                        }else{
                                            res.json({message: "Error log"})
                                        }
                                    })
                                }else{
                                    res.json({message: "No se ha podido eliminar el espacio"})
                                }
                            })
                        }else{
                            res.json({message: "El espacio que desea eliminar no existe"})
                        }
                    }else{
                        res.json({message: "Ha ocurrido un error en al buscar el espacio que desea eliminar"})
                    }
                })
            }else{
                res.json({message: "No tiene los permisos para realizar esta acción"})
            }
        }else{
            res.json({message: "No tiene autorización para ingresar"})
        }
    })
}

const getSpacesList = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`select e.id_espacio, e.nombre as espacio, s.nombre as sede, e.tarifa, e.descripcion from espacios e, sedes s where e.id_sede = s.id_sede`, async(error, list, fields) =>{
                if(!error){
                    if(list.length >= 1){
                        res.json(list)
                    }else{
                        res.json({message: "La lista de espacios se encuentra vacia"})
                    }
                }else{
                    res.json({message: "Ha ocurrido un error al buscar la lista de espacios"})
                }
            })
        }else{
            res.json({message: "No tiene autorización para ingresar"})
        }
    }) 
}

const searchSpace = async(req, res) =>{
    const {space_id} = req.body
    jwt.verify(req.token, 'secrectkey', async(error) =>{
        if(!error){
            await connection.query(`select e.id_espacio, e.nombre as espacio, s.nombre as sede, e.tarifa, e.descripcion from espacios e, sedes s where e.id_sede = s.id_sede and e.id_espacio = ${connection.escape(space_id)}`, async(error, result, fields) =>{
                if(!error){
                    if(result.length === 1){
                        res.json(result)
                    }else{
                        res.json({message: "El espacio que busca no existe"})
                    }
                }else{
                    res.json({message: "Ha ocurrido un error en la busqueda del espacio deseado"})
                }
            })
        }else{
            res.json({message: "No tiene autorización para ingresar"})
        }
    })
}

const listSpacesPerHeadquarter = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) => {
        const {headquarter_id} = req.body
        if(!error){
            await connection.query(`select id_espacio, nombre, tarifa, descripcion from espacios where id_sede = ${connection.escape(headquarter_id)}`, async(error, result, fields) =>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message: "2"})
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

module.exports = {createSpace, modifySpace, deleteSpace, getSpacesList, searchSpace, listSpacesPerHeadquarter}