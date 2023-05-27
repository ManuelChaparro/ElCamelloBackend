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
const allowedOrigins = ['https://el-camello-frontend-p3yc.vercel.app'];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};


app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors(corsOptions));

//routes
app.use('/api', userRoutes);
app.use('/api', headquarterRoutes);
app.use('/api', spacesRoutes);
app.use('/api', inventoriesRoutes);
app.use('/api', bookingRoutes);
app.use('/api', reportsRoutes);

module.exports = app;