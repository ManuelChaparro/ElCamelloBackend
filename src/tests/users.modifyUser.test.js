'use strict'
// importar los módulos necesarios
const jwt = require('jsonwebtoken');
const connection = require('../../config/connections'); // suponiendo que connection es el módulo que maneja la conexión a la base de datos
const {modifyUser} = require('../controllers/users.controller'); // suponiendo que modifyUser es el módulo que contiene la función a probar

const req = {
    body: {
        email: 'test@example.com',
        nombres: 'John',
        apellidos: 'Doe',
        genero: 'Masculino',
        telefono: '123456789'
    },
    token: 'token'
};

const res = {
    json: jest.fn()
};

  // Mock de la función 'connection.query' de la base de datos
jest.mock('../../config/connections', () => ({
    query: jest.fn()
}));

describe('modifyUser', () => {
    it('Deberia modificar un usuario', async () => {
        // Mock de la verificación del token
        jwt.verify = jest.fn((token, secret, callback) => {
            callback(null);
        });

        // Mock de la consulta a la base de datos
        const queryMock = jest.fn((query, callback) => {
            callback(null, [{nombres: 'Old', apellidos: 'User'}]);
        });

        // Asignamos la función mock de 'connection.query' al objeto global 'connection'
        require('../../config/connections').query = queryMock;

        await modifyUser(req, res);

        // Verificamos que la respuesta del servidor sea la esperada
        expect(res.json).toHaveBeenCalledWith({message:`Se ha modificado correctamente el usuario`});

        // Verificamos que se haya ejecutado la consulta a la base de datos con los parámetros esperados
        expect(queryMock).toHaveBeenCalledWith(
            `update usuarios set nombres = John, apellidos = Doe, genero = Masculino, telefono = 123456789 where email = test@example.com`,
            expect.any(Function)
        );
    });

    it('Deberia retornar un error si el usuario no existe', async () => {
        jwt.verify = jest.fn((token, secret, callback) => {
            callback(null);
        });
    
        const queryMock = jest.fn((query, callback) => {
            callback(null, []);
        });
    
        require('../../config/connections').query = queryMock;
    
        await modifyUser(req, res);
    
        expect(res.json).toHaveBeenCalledWith({message: "El usuario que intenta modificar, no existe."});
        expect(queryMock).toHaveBeenCalledWith(
            `SELECT nombres FROM usuarios WHERE email = test@example.com;`,
            expect.any(Function)
        );
    });
})