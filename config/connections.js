require('dotenv').config();
const mysql = require('mysql')
const dbconector = mysql.createConnection(process.env.DATABASE_URL);

dbconector.escape = mysql.escape;

dbconector.connect((err) =>{
    if (err) {
        console.error('Error conectando la base de datos con el servidor: ' + err.stack);
        return;
    }
    console.log('Se ha conectado exitosamente la base de datos con el servidor, id:' + dbconector.threadId);
});

module.exports = dbconector;