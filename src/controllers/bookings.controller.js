'use strict'

const jwt = require('jsonwebtoken');
const connection = require('../../config/connections.js');
const moment = require('moment')

const makeBooking = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error)=>{
        const {space_id, client_id, date_booking, hour_start, hour_end, note} = req.body
        if(!error){
            await connection.query(`select id_reserva from reservas where id_espacio = ${connection.escape(space_id)} and fecha = ${connection.escape(date_booking)} and hora_entrada between ${connection.escape(hour_start)} and ${connection.escape(hour_end)} and hora_salida between ${connection.escape(hour_start)} and ${connection.escape(hour_end)}`, async(error, result, fields) =>{
                if(!error){
                    if(result.length === 0){
                        await connection.query(`Insert into reservas (id_espacio, id_usuario, fecha, hora_entrada, hora_salida, notas) values (${connection.escape(space_id)}, ${connection.escape(client_id)}, ${connection.escape(date_booking)}, ${connection.escape(hour_start)}, ${connection.escape(hour_end)}, ${connection.escape(note)})`,async(error, result, fields) =>{
                            if(!error && result.affectedRows > 0){
                                let bookingId = result.insertId
                                await connection.query(`SELECT tarifa FROM espacios WHERE id_espacio = ${connection.escape(space_id)}`, async(error, result, fields) =>{
                                    if(!error && result.length === 1){
                                        let fee = result[0].tarifa
                                        await connection.query(`INSERT INTO facturas (id_reserva, valor_pago, fecha_creacion, estado) VALUES (${connection.escape(bookingId)}, ${connection.escape(calculateTotalFee(fee, hour_start, hour_end))}, NOW(), "PENDIENTE")`, async(error, result, fields) => {
                                            if(!error && result.affectedRows > 0){
                                                await connection.query(`SELECT id_sede FROM espacios WHERE id_espacio = ${connection.escape(space_id)}`, async(error, result, fields) =>{
                                                    let headquarterId = result[0].id_sede
                                                    if(!error){
                                                        await connection.query(`SELECT * FROM sedes_usuarios WHERE id_usuario = ${connection.escape(client_id)} and id_sede = ${connection.escape(headquarterId)}`, async(error, result, fields) =>{
                                                            if(!error && result.length === 0){
                                                                await connection.query(`INSERT INTO sedes_usuarios (id_sede, id_usuario) VALUES (${connection.escape(headquarterId)}, ${connection.escape(client_id)})`, async(error, result, fields) =>{
                                                                    if(!error && result.affectedRows > 0){
                                                                        res.json({message: "0"})
                                                                    }else{
                                                                        res.json({message: error})
                                                                    }
                                                                })
                                                            }else{
                                                                res.json({message: "0"})
                                                            }
                                                        })
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
        }else{
            res.json({message: error})
        }
    })
}

const calculateTotalFee = (fee, hour_start, hour_end) =>{
    const hourStartFormat = moment(hour_start, 'HH:mm');
    const hourEndFormat = moment(hour_end, 'HH:mm');

    const rentalDuration = moment.duration(hourEndFormat.diff(hourStartFormat));
    const hours = rentalDuration.asHours();

    return fee * hours;
}

const deleteBooking = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        const {booking_id} = req.body
        if(!error){
            await connection.query(`select id_reserva from reservas where id_reserva = ${connection.escape(booking_id)}`, async(error, result, fields) =>{
                if(!error){
                    await connection.query(`Delete from reservas where id_reserva = ${connection.escape(booking_id)}`,async(error, result, fields) =>{
                        if(!error && result.affectedRows > 0){
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
    })
}

const getBookingList = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`Select * from reservas`, async(error, result, fields) =>{
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

const searchBooking = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error)=>{
        if(!error){
            const {booking_id} = req.body
            await connection.query(`Select * from reservas where id_reserva = ${connection.escape(booking_id)}`, async(error, result, fields) =>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message:"2"})
                }
            })
        }else{
            res.json({message:"1"})
        }
    })
}

const modifyBooking = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        const {booking_id, space_id, date_booking, hour_start, hour_end, note} = req.body
        if(!error){
            await connection.query(`select id_reserva from reservas where id_reserva = ${connection.escape(booking_id)} `, async(error, result, fields) =>{
                if(!error){
                    if(result.length === 1){
                        await connection.query(`Select * from reservas where id_espacio = ${connection.escape(space_id)} and fecha = ${connection.escape(date_booking)} and (hora_entrada >= ${connection.escape(hour_start)} AND hora_entrada < ${connection.escape(hour_end)}) OR
                        (hora_salida > ${connection.escape(hour_start)} AND hora_salida <= ${connection.escape(hour_end)}) OR
                        (hora_entrada < ${connection.escape(hour_start)} AND hora_salida > ${connection.escape(hour_end)})`, async(error, result, fields) =>{
                            if(!error){
                                if(result.length === 0){
                                    await connection.query(`Update reservas set id_espacio = ${connection.escape(space_id)}, fecha = ${connection.escape(date_booking)}, hora_entrada = ${connection.escape(hour_start)}, hora_salida = ${connection.escape(hour_end)}, notas = ${connection.escape(note)} where id_reserva = ${connection.escape(booking_id)}`, async(error, result, fields) =>{
                                        if(!error){
                                            res.json({message: "0"})
                                        }else{
                                            res.json({message: "3"})
                                        }
                                    })
                                }else{
                                    await connection.query(`Select * from reservas where id_reserva = ${connection.escape(booking_id)}`, async(error, result, fields) =>{
                                        if(!error){
                                            if(result.length === 1){
                                                await connection.query(`Update reservas set id_espacio = ${connection.escape(space_id)}, fecha = ${connection.escape(date_booking)}, hora_entrada = ${connection.escape(hour_start)}, hora_salida = ${connection.escape(hour_end)}, notas = ${connection.escape(note)} where id_reserva = ${connection.escape(booking_id)}`, async(error, result, fields) =>{
                                                    if(!error){
                                                        res.json({message: "0"})
                                                    }else{
                                                        res.json({message: "3"})
                                                    }
                                                })
                                            }else{
                                                res.json({message: "1"})
                                            }
                                        }else{
                                            res.json({message: "2"})
                                        }
                                    })
                                }
                            }else{
                                res.json({message: "4"})
                            }
                        })
                    }else{
                        res.json({message: "3"})
                    }
                }else{
                    res.json({message: "2"})
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

const getBill = async(req, res) => {
    jwt.verify(req.token, 'secretkey', async(error) =>{
        const {booking_id} = req.body
        if(!error){
            await connection.query(`SELECT * FROM facturas WHERE id_reserva = ${connection.escape(booking_id)}`, async(error, result, fields) =>{
                if(!error && result.length === 1){
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

const changeBillState = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            const {bill_id} = req.body
            await connection.query(`UPDATE facturas SET estado = "PAGO" WHERE id_factura = ${connection.escape(bill_id)}`, async(error, result, fields) =>{
                if(!error && result.affectedRows > 0){
                    res.json({message: "0"})
                }else{
                    res.json({message: "1"})
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

const getBillList = async(req, res) => {
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`SELECT * FROM facturas`, async(error, result, fields) =>{
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

const getBookingListWithIdClient = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            const {client_id} = req.body
            await connection.query(`SELECT * FROM reservas WHERE id_usuario = ${connection.escape(client_id)}`, async(error, result, fields) =>{
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

module.exports = {makeBooking, deleteBooking, getBookingList, modifyBooking, searchBooking, changeBillState, getBill, getBillList, getBookingListWithIdClient}