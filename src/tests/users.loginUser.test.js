'use strict'

const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const connection = require('../../config/connections.js');
const {loginUser} = require('../controllers/users.controller'); // import the function to be tested

jest.mock('../../config/connections', () => ({
    query: jest.fn(),
    escape: jest.fn((val) => `"${val}"`)
}));

describe('loginUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'password'
            }
        };
        res = {
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Debe devolver un token si el correo electrónico y la contraseña son correctos', async () => {
        const mockResult = [{ password: crypto.createHash('sha256').update('password').digest('hex') }];
        const mockInfoUser = { id: 1, email: 'test@example.com' };
        const mockToken = 'mock-token';

        // Simulando los resultados de la consulta de la base de datos
        connection.query.mockImplementation((query, callback) => {
            if (query.includes('passwords')) {
                callback(null, mockResult);
            } else {
                callback(null, [mockInfoUser]);
            }
        });

        // simular el método de sign JWT
        jwt.sign = jest.fn().mockImplementationOnce((payload, secretOrPrivateKey, options, callback) => {
            callback(null, mockToken);
        });

        await loginUser(req, res);

        expect(connection.query).toHaveBeenCalledTimes(2);
        expect(jwt.sign).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ token: mockToken });
    });

    it('Debería devolver un mensaje de error si el correo electrónico es incorrecto', async () => {
        const mockResult = [];
        const expectedMessage = 'Email incorrecto';

        // Simulación de los resultados de la consulta de la base de datos
        connection.query.mockImplementation((query, callback) => {
            callback(null, mockResult);
        });

        await loginUser(req, res);

        expect(connection.query).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ message: expectedMessage });
    });

    it('Debería devolver un mensaje de error si la contraseña es incorrecta', async () => {
        const mockResult = [{ password: 'wrong-password' }];
        const expectedMessage = 'Contraseña incorrecta';

        // Simulación de los resultados de la consulta de la base de datos
        connection.query.mockImplementation((query, callback) => {
            callback(null, mockResult);
        });

        await loginUser(req, res);

        expect(connection.query).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ message: expectedMessage });
    });
});