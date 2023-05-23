'use strict'

const jwt = require('jsonwebtoken')
const connection = require('../../config/connections')

const clientQuantityPerHeadquarter = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`SELECT s.nombre AS name, COUNT(su.id_sede) AS value FROM sedes s, sedes_usuarios su WHERE s.id_Sede = su.id_sede GROUP BY s.nombre`, async(error, result, fields) =>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message: "1"})
                }
            })
        }else{
            res.json({message: error})
        }
    })
}

const moneyPerHeadquarter = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`SELECT s.nombre AS name, SUM(f.valor_pago) AS value FROM sedes s, facturas f, reservas r, espacios e WHERE r.id_reserva = f.id_reserva AND r.id_espacio = e.id_espacio AND e.id_sede = s.id_sede AND f.estado = "PAGO" GROUP BY s.nombre`, async(error, result, fields) =>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message: "1"})
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

const bookingPerMonth = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`SELECT MONTHNAME(r.fecha) AS name, COUNT(r.id_Reserva) AS value FROM reservas r GROUP BY MONTH(r.fecha)`, async(error, result, fields) =>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message: "1"})
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

const spacesPerHeadquarter = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            const {headquarter_id} = req.body
            await connection.query(`SELECT e.nombre AS name, (SELECT COUNT(*) FROM reservas r WHERE r.id_espacio = e.id_espacio) AS value FROM espacios e WHERE e.id_sede = ${connection.escape(headquarter_id)}`, async(error, result, fields) =>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message: "1"})
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

const avgPerUsersAge = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`SELECT TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) AS name, COUNT(id_usuario) AS value FROM usuarios GROUP BY name`, async(error, result, fields) =>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message: "1"}) 
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

const quantityBillState = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error)=>{
        if(!error){
            await connection.query(`SELECT f.estado AS name, COUNT(f.id_factura) AS value FROM facturas f GROUP BY f.estado`, async(error, result, fields) =>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message: "1"})
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

const inventaryValuePerHeadquarter = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`SELECT s.nombre AS name, SUM(p.valor_producto) AS value FROM inventarios i, productos p, sedes s WHERE i.id_sede = s.id_sede AND i.id_inventario = p.id_inventario group by i.id_inventario`, async(error, result, fields) =>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message: "1"})
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

module.exports = {clientQuantityPerHeadquarter, moneyPerHeadquarter, bookingPerMonth, spacesPerHeadquarter, avgPerUsersAge, quantityBillState, inventaryValuePerHeadquarter}