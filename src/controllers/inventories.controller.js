'use strict'

const connection = require('../../config/connections')
const jwt = require('jsonwebtoken')

const createProduct = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        const {product_name, product_type, product_brand, product_description, product_value, inventary_id, space_id, id_user, rol} = req.body
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`Insert Into productos (nombre_producto, tipo_producto, marca, descripcion_producto, valor_producto, id_inventario, id_espacio) values (${connection.escape(product_name)}, ${connection.escape(product_type)}, ${connection.escape(product_brand)}, ${connection.escape(product_description)}, ${connection.escape(product_value)}, ${connection.escape(inventary_id)}, ${connection.escape(space_id)})`, async(error, result, fields) =>{
                    if(!error){
                        await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Agregacion", "Se agregó el producto ${connection.escape(product_name)}")`, async(error, info, fields) =>{
                            if(!error){
                                res.json({message: "0"})
                            }else{
                                res.json({message: "1"})
                            }
                        })
                    }else{
                        res.json({message: error})
                    }
                })
            }
        }else{
            res.json({message: "3"})
        }
    })
}

const modifyProduct = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        const {product_id, product_name, product_type, product_brand, product_description, product_value, inventary_id, space_id, id_user, rol} = req.body
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`Select * from productos where id_producto = ${connection.escape(product_id)}`, async(error, result, fields) =>{
                    if(!error){
                        if(result.length === 1){
                            await connection.query(`Update productos set nombre_producto = ${connection.escape(product_name)}, tipo_producto = ${connection.escape(product_type)}, marca = ${connection.escape(product_brand)}, descripcion_producto = ${connection.escape(product_description)}, valor_producto = ${connection.escape(product_value)}, id_inventario = ${connection.escape(inventary_id)}, id_espacio = ${connection.escape(space_id)}`, async(error, result, fields) =>{
                                if(!error){
                                    await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Modificacion", "Se Modifico el producto ${connection.escape(product_name)}")`, async(error, info, fields) =>{
                                        if(!error){
                                            res.json({message: "0"})
                                        }else{
                                            res.json({message: "1"})
                                        }
                                    })
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
            }
        }else{
            res.json({message: "1"})
        }
    })
}

const deleteProduct = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error)=>{
        const {id_product, rol, id_user} = req.body
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`Select * from productos where id_producto = ${connection.escape(id_product)}`, async(error, result, fields) =>{
                    if(!error){
                        if(result.length === 1){
                            await connection.query(`delete from productos where id_producto = ${id_product}`, async(error, result, fields) =>{
                                if(!error){
                                    await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Eliminacion", "Se elimino el producto numero ${connection.escape(id_product)}")`, async(error, info, fields) =>{
                                        if(!error){
                                            res.json({message: "0"})
                                        }else{
                                            res.json({message: "1"})
                                        }
                                    })
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
            }
        }else{
            res.json({message: "1"})
        }
    })
}

const getProductList = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error)=>{
        if(!error){
            await connection.query(`select * from productos`, async(error, result, fields) =>{
                if(!error){
                    if(result.length >=1 ){
                        res.json(result)
                    }else{
                        res.json({message: error})
                    }
                }else{
                    res.json({message: error})
                }
            })
        }else{
            res.json({message: error})
        }
    })
}

const createInventary = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error)=>{
        const {headquarter_id, description_inventary, id_user, rol} = req.body
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`Select * from inventarios where id_sede = ${connection.escape(headquarter_id)}`, async(error, result, fields) =>{
                    if(!error){
                        if(result.length === 0){
                            await connection.query(`Insert into inventarios (id_sede, descripcion) values (${connection.escape(headquarter_id)}, ${connection.escape(description_inventary)})`, async(error, result, fields) =>{
                                if(!error){
                                    let idInventary = result.insertId
                                    await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${connection.escape(id_user)}, NOW(), "Agregacion", "Se agrego el inventario numero ${connection.escape(idInventary)} a la sede ${connection.escape(headquarter_id)}")`, async(error, info, fields) =>{
                                        if(!error){
                                            res.json({message: "0"})
                                        }else{
                                            res.json({message: error})
                                        }
                                    })
                                }else{
                                    res.json({message: error})
                                }
                            })
                        }else{
                            res.json({message: error})
                        }
                    }else{
                        res.json({message: error})
                    }
                })
            }
        }else{
            res.json({message: error})
        }
    })
}

// No se ha utilizado
const deleteInventary = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        const {inventary_Id, rol, id_user} = req.body
        if(rol === "A"|| rol === "a"){
            if(!error){
                await connection.query(`Delete from inventarios where id_inventario = ${connection.escape(inventary_Id)}`, async(error, result, fields) =>{
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
}

const getInventary = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        const {headquarter_id} = req.body
        if(!error){
            await connection.query(`Select id_inventario from inventarios where id_sede = ${connection.escape(headquarter_id)}`, async(error, result, fields) =>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message: error})
                }
            })
        }else{
            res.json({message: error})
        }
    })
}

const getInventaryList = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        const {rol} = req.body
        if(rol === "a" || rol === "A"){
            if(!error){
                await connection.query(`Select i.id_inventario, s.nombre as nombre_sede, i.descripcion from inventarios i, sedes s where s.id_sede = i.id_sede`, async(error, result, fields) =>{
                    if(!error){
                        res.json(result)
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
}

const getProductPerType = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        const {product_type, rol} = req.body
        if(rol === "A" || rol === "a"){
            if(!error){
                await connection.query(`Select * from productos where tipo_producto = ${connection.escape(product_type)}`, async(error, result, fields) =>{
                    if(!error){
                        if(!error){
                            res.json(result)
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
}

const getProductsPerInventary = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        const {inventary_id, rol} = req.body
        if(rol === "A" || rol === "a"){
            if(!error){
                await connection.query(`Select * from productos where id_inventario = ${connection.escape(inventary_id)}`, async(error, result, fields) =>{
                    if(!error){
                        res.json(result)
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
}

module.exports = {createProduct, modifyProduct, deleteProduct, getProductList, createInventary, getInventary, getProductPerType, getProductsPerInventary, getInventaryList}
