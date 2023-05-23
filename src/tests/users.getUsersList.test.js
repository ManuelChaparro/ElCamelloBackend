'use strict'

require('dotenv').config();
const connection = require('../../config/connections')
const {getUsersList} = require('../controllers/users.controller')
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}));

jest.mock('../../config/connections', () => ({
    query: jest.fn()
}));

describe('getUsersList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Debe devolver una lista de usuarios cuando hay usuarios en la base de datos', async () => {
        const req = { token: 'validtoken' };
        const res = { json: jest.fn() };
        const userList = [{ id: 1, nombres: 'John' }, { id: 2, nombres: 'Jane' }];
        jwt.verify.mockImplementation((token, secret, callback) => callback(null));
        connection.query.mockImplementation((query, callback) => callback(null, userList));

        await getUsersList(req, res);

        expect(jwt.verify).toHaveBeenCalledWith(req.token, 'secretkey', expect.any(Function));
        expect(connection.query).toHaveBeenCalledWith('Select * from usuarios', expect.any(Function));
        expect(res.json).toHaveBeenCalledWith(userList);
    });

    it('Debe devolver un mensaje cuando no hay usuarios en la base de datos', async () => {
        const req = { token: 'validtoken' };
        const res = { json: jest.fn() };
        jwt.verify.mockImplementation((token, secret, callback) => callback(null));
        connection.query.mockImplementation((query, callback) => callback(null, []));
    
        await getUsersList(req, res);
    
        expect(jwt.verify).toHaveBeenCalledWith(req.token, 'secretkey', expect.any(Function));
        expect(connection.query).toHaveBeenCalledWith('Select * from usuarios', expect.any(Function));
        expect(res.json).toHaveBeenCalledWith({ message: 'No hay usuarios' });
    });

    it('Debería devolver un mensaje de error cuando el token no es válido', async () => {
        const req = { token: 'invalidtoken' };
        const res = { json: jest.fn() };
        jwt.verify.mockImplementation((token, secret, callback) => callback(new Error('Invalid token')));
        connection.query.mockImplementation((query, callback) => callback(null, []));
    
        await getUsersList(req, res);
    
        expect(jwt.verify).toHaveBeenCalledWith(req.token, 'secretkey', expect.any(Function));
        expect(connection.query).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: 'No tiene autorización para ingresar' });
    });

    it('Debe devolver un mensaje de error cuando hay un error en la consulta de la base de datos', async () => {
        const req = { token: 'validtoken' };
        const res = { json: jest.fn() };
    });
})