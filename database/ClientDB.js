const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', true);
const clientDB = mongoose
    .connect(process.env.URI) 
    .then((m) => {
        console.log('BD CONECTADA.');
        mongoose.Promise = global.Promise;
        return m.connection.getClient();
    })
    .catch((e) => console.log(`FALLO EN LA CONECCIÓN. - ${e}`));


module.exports = clientDB;