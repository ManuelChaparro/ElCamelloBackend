'use strict'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conn = require('../config/connections')
const userRoutes = require('../src/routes/users.routes.js');
const headquarterRoutes = require('../src/routes/headquaters.routes.js')
const spacesRoutes = require('../src/routes/spaces.routes.js')
const inventoriesRoutes = require('../src/routes/inventories.routes.js')
const bookingRoutes = require('../src/routes/booking.routes.js')
const reportsRoutes = require('../src/routes/reports.routes.js')

//initialization
const app = express();

//settings
app.set('port', (process.env.PORT));
app.get(conn);

//middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://el-camello-frontend-p3yc.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

//routes
app.use('/api', userRoutes);
app.use('/api', headquarterRoutes);
app.use('/api', spacesRoutes);
app.use('/api', inventoriesRoutes);
app.use('/api', bookingRoutes);
app.use('/api', reportsRoutes);

module.exports = app;