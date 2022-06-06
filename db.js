const mongoose = require("mongoose");

// const MONGO_USERNAME = '';
// const MONGO_PASSWORD = '';
// const MONGO_HOSTNAME = '127.0.0.1';
// const MONGO_PORT = '27017';
// const MONGO_DB = 'xhex';

// // const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
// const url = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

const url = `mongodb+srv://ega:1234@xhex.lapai41.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(url, {useNewUrlParser: true});

exports = mongoose;