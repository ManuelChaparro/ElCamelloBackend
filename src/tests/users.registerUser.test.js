'use strict'
require('dotenv').config();
const connection = require('../../config/connections')
const {registerUser} = require('../controllers/users.controller')

jest.mock('../../config/connections');

describe('registerUser', () => {
    test('Debería crear un nuevo usuario en la base de datos', async () => {
    const req = {
        body: {
            nombres: 'John',
            apellidos: 'Doe',
            fecha_nacimiento: '1990-01-01',
            email: 'ej@email.com',
            genero: 'M',
            tipo_documento: 'C.C.',
            identificacion: '1234567890',
            telefono: '1234567890',
            rol: 'usuario',
            password: '123456'
        }
    };
    const res = {
        json: jest.fn()
    };

    // Mockear la conexión a la base de datos
    connection.query.mockImplementation((query, callback) => {
        if (query.includes('SELECT')) {
            callback(null, []);
        } else if (query.includes('Insert into usuarios (nombres, apellidos, fecha_nacimiento, email, genero, tipo_documento, identificacion, telefono, rol)')) {
            callback(null, {});
        } else if (query.includes('Insert into passwords (password, indicador)')) {
            callback(null, {});
        } else {
            callback('Query no soportada', null);
        }
    });

    await registerUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: '0' });
    });
});