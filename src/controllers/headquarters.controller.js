'use strict'

const {json} = require('express');
const jwt = require('jsonwebtoken');
const connection = require('../../config/connections.js');

const createSchedule = async(req, res) =>{
    const {headquarter_id, working_day, opening_time_am, closing_time_am, opening_time_pm, closing_time_pm, rol, id_user} = req.body
    jwt.verify(req.token, 'secretkey', async(error)=>{
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`select * from sedes where id_sede = ${connection.escape(headquarter_id)}`, async(error, result, fields) =>{
                    if(!error){
                        if(result.length === 1){
                            await connection.query(`select * from horarios h, horarios_sedes hs, sedes s where h.id_horario = hs.id_horario and hs.id_sede = s.id_sede and s.id_sede = ${connection.escape(headquarter_id)} and h.dia = ${connection.escape(working_day)}`, async(error, result, fields) =>{
                                if(!error){
                                    if(result.length === 0){
                                        await connection.query(`Insert into horarios (dia, hora_apertura_am, hora_cierre_am, hora_apertura_pm, hora_cierre_pm) values (${connection.escape(working_day)}, ${connection.escape(opening_time_am)}, ${connection.escape(closing_time_am)}, ${connection.escape(opening_time_pm)}, ${connection.escape(closing_time_pm)})`, async(err, result, fields) =>{
                                            const scheduleId = result.insertId
                                            if(!err){
                                                await connection.query(`Insert into horarios_sedes (id_sede, id_horario) values (${connection.escape(headquarter_id)}, ${connection.escape(scheduleId)})`, async(error, result, fields) =>{
                                                    if(!error){
                                                        await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Agregacion", "Se agregó el horario ${connection.escape(scheduleId)} a la sede ${connection.escape(headquarter_id)}")`, async(error, info, fields) =>{
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
                                        })
                                    }else{
                                        res.json({message: "2"})
                                    }
                                }else{
                                    res.json({message: "3"})
                                }
                            })
                        }else{
                            res.json({message: "4"})  
                        }
                    }else{
                        res.json({message: "5"})
                    }
                })
            }else{
                res.json({message: "6"})
            }
        }else{
            res.json({message: "7"})
        }
    })
}

const modifySchedule = async(req, res) =>{
    const {id_schedule, new_day, new_opening_time_am, new_closing_time_am, new_opening_time_pm, new_closing_time_pm, rol, id_user} = req.body
    jwt.verify(req.token, 'secretkey', async(error)=>{
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`select * from horarios where id_horario = ${connection.escape(id_schedule)}`, async(err, result, fields) =>{
                    if(!err){
                        if(result.length === 1){
                            await connection.query(`update horarios set dia = ${connection.escape(new_day)}, hora_apertura_am = ${connection.escape(new_opening_time_am)}, hora_cierre_am = ${connection.escape(new_closing_time_am)}, hora_apertura_pm = ${connection.escape(new_opening_time_pm)}, hora_cierre_pm = ${connection.escape(new_closing_time_pm)}`, async(err, result, fields) =>{
                                if(!err){
                                    await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Modificacion", "Se modifico el horario ${connection.escape(id_schedule)} en la tabla de horarios")`, async(error, info, fields) =>{
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
            }else{
                res.json({message: "1"})
            }
        }else{
            res.json({message: "1"})
        }
    })
}

const deleteSchedule = async(req, res) =>{
    const {schedule_id, rol, id_user} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`select * from horarios where id_horario = ${connection.escape(schedule_id)}`, async(error, result, fields) =>{
                    if(!error){
                        if(result.length === 1){
                            await connection.query(`delete from horarios where id_horario = ${connection.escape(schedule_id)}`, async(err, info, fields) =>{
                                if(!err){
                                    await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Eliminacion", "Se elimino el horario ${connection.escape(schedule_id)} de la tabla de horarios")`, async(error, info, fields) =>{
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
            }else{
                res.json({message: "1"})
            }
        }else{
            res.json({message: "1"})
        }
    })
}

const getSchedules = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`Select * from horarios`, async(err, result, fields) =>{
                if(!err){
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

const getSchedulesPerHeadquarter = async(req, res) =>{
    const {id_headquarter} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`select h.id_horario, h.dia, h.hora_apertura_am, h.hora_cierre_am, h.hora_apertura_pm, h.hora_cierre_pm from horarios h, horarios_sedes hs, sedes s where h.id_horario = hs.id_horario and hs.id_sede = s.id_sede and s.id_sede = ${connection.escape(id_headquarter)}`, async(err, result, fields) =>{
                if(!err){
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


const searchSchedule = async(req, res) =>{
    const {day} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`Select * from horarios where dia = ${connection.escape(day)}`, async(error, result, fields) =>{
                if(!error){
                    if(result.length === 1){
                        res.json(result)
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

const createHeadquarter = async(req, res) =>{
    const {headquater_name, description, city, address, rol, id_user} = req.body
    jwt.verify(req.token, 'secretkey', async(error)=>{
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`Select * from sedes where nombre = ${connection.escape(headquater_name)}`, async(error, validation, fields) =>{
                    if(!error){
                        if(validation.length === 0){
                            await connection.query(`Insert into sedes (nombre, descripcion) values (${connection.escape(headquater_name)}, ${connection.escape(description)})`, async(err, result, fields) =>{
                                if(!error){
                                    let idHeadquearter = result.insertId
                                    await connection.query(`Insert into ciudades_sedes (id_ciudad, id_sede, direccion) values (${connection.escape(city)}, ${connection.escape(idHeadquearter)}, ${connection.escape(address)})`, async(error, result, fields) =>{
                                        if(!error){
                                            if(!err){
                                                await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Agregacion", "Se agrego la sede ${connection.escape(headquater_name)} a la tabla de sedes")`, async(error, info, fields) =>{
                                                    if(!error){
                                                        res.json({message: idHeadquearter})
                                                    }else{
                                                        res.json({message: "1"})
                                                    }
                                                })
                                            }else{
                                                res.json({message: "2"})
                                            }
                                        }else{
                                            res.json({message: "3"})
                                        }
                                    })
                                }else{
                                    res.json({message: "4"})
                                }
                            })
                        }else{
                            res.json({message: "5"})
                        }
                    }else{
                        res.json({message: "6"})
                    }
                })
            }else{
                res.json({message: "7"})
            }
        }else{
            res.json({message: "8"})
        }
    })
}

const modifyHeadquarter = async(req, res) =>{
    const {headquarter_id, headquater_new_name, new_adress, new_description, rol, id_user} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`Select * from sedes where id_sede = ${connection.escape(headquarter_id)}`, async(err, result, fields) =>{
                    if(!err){
                        if(result.length === 1){
                            await connection.query(`Update sedes set nombre = ${connection.escape(headquater_new_name)}, descripcion = ${connection.escape(new_description)} where id_sede = ${connection.escape(headquarter_id)}`, async(err, results, fields) =>{
                                if(!err){
                                    await connection.query(`update ciudades_sedes set direccion = ${connection.escape(new_adress)} where id_sede = ${connection.escape(headquarter_id)}`, async(err, results, field) =>{
                                        if(!err){
                                            await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Modificacion", "Se modifico la sede ${connection.escape(headquater_new_name)} de la tabla de sedes")`, async(error, info, fields) =>{
                                                if(!error){
                                                    res.json({message: "0"})
                                                }else{
                                                    res.json({message: 1111})
                                                }
                                            })
                                        }else{
                                            res.json({message: 11})
                                        }
                                    })
                                }else{
                                    res.json({message: err})
                                }
                            })
                        }else{
                            res.json({message: 3})
                        }
                    }else{
                        res.json({message: 4})
                    }
                })
            }else{
                res.json({message: 5})
            }
        }else{
            res.json({message: 6})
        }
    })
}

const deleteHeadquarter = async(req, res) =>{
    const {headquarter_id, rol, id_user} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            if(rol === "A" || rol === "a"){
                await connection.query(`select * from sedes where id_sede = ${connection.escape(headquarter_id)}`, async(err, result, fields) =>{
                    if(!err){
                        if(result.length === 1){
                            await connection.query(`Delete from sedes where id_sede = ${connection.escape(headquarter_id)}`, async(error, finalResult, fields) =>{
                                if(!error){
                                    await connection.query(`Insert into user_logs (id_usuario, fecha, estado, descripcion) values (${id_user}, NOW(), "Eliminacion", "Se elimino la sede ${connection.escape(headquarter_id)} de la tabla de sedes")`, async(error, info, fields) =>{
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
            }else{
                res.json({message: error})
            }
        }else{
            res.json({message: error})
        }
    })
}

const getHeadquarterList = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`select s.id_sede, s.nombre as nombre_sede, s.descripcion, cs.direccion from sedes s, ciudades_sedes cs where s.id_sede = cs.id_sede`, async(err, list, fields) =>{
                if(!err){
                    if(list.length >= 1){
                        res.json(list)
                    }else{
                        res.json({message: "1"})
                    }
                }else{
                    res.json({message: "2"})
                }
            })
        }else{
            res.json({message: "3"})
        }
    })
}

const searchHeadquarter = async(req, res) => {
    const{headquarter_id} = req.body
    jwt.verify(req.token, 'secretkey', async(error) => {
        if(!error){
            await connection.query(`select s.nombre as nombre_sede, s.direccion, h.nombre as horario, h.fecha_inicio as apertura, h.fecha_final as cierre from sedes s, horarios h where s.id_horario = h.id_horario and s.id_sede = ${connection.escape(headquarter_id)}`, async(error, result, fiedls) =>{
                if(!error){
                    if(result.length === 1){
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
    })
}

const getQuantitySpaces = async(req, res) =>{
    const {headquarter_id, rol} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`SELECT COUNT(s.id_sede) as quantity FROM espacios es, sedes s WHERE es.id_sede = s.id_sede AND s.id_sede = ${connection.escape(headquarter_id)}`, async(error, result, fields)=>{
                if(!error){
                    res.json(result)
                }else{
                    res.json({message: "0"})
                }
            })
        }else{
            res.json({message: "1"})
        }
    })
}

const getDepartments = async(req, res) =>{
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`Select * from departamentos`, async(error, result, fields) =>{
                if(!error){
                    if(result.length >= 1){
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
    })
}

const getCities = async(req, res) =>{
    const {department_name} = req.body
    jwt.verify(req.token, 'secretkey', async(error) =>{
        if(!error){
            await connection.query(`select * from ciudades c, departamentos d where d.id_departamento = c.id_departamento and d.nombre = ${connection.escape(department_name)}`, async(error, result, fields) =>{
                if(!error){
                    if(result.length >=1){
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
    })
}

module.exports ={createSchedule, modifySchedule, deleteSchedule, getSchedules, searchSchedule, createHeadquarter, modifyHeadquarter, deleteHeadquarter, getHeadquarterList, searchHeadquarter, getSchedulesPerHeadquarter, getQuantitySpaces, getDepartments, getCities}