'use strict';
global.__dirname = __dirname;
global.sessions = {};
global.rooms = {};
global.chat = [];

const express = require('express');
const {Server: IoServer} = require('socket.io');
const http = require('http');

const IoController = require('./controllers/io-controller.js');
const httpRouter = require('./routes/http-router.js');
const apiRouter = require('./routes/api-router.js');
const db = require(__dirname + "/db.js");

const port =  process.env.PORT || 80;
const app = express();
const server = http.createServer(app);
const io = new IoServer(server);
global.io = io;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser);

app.use("/public", express.static(`${__dirname}/public`));
app.use('/api', apiRouter);
app.use(httpRouter);
app.use(notFound);


io.on("connection", IoController.connection);

server.listen(port, ()=>{
    console.log('Listening at port: ' + port);
});

//////////////////////////////////////////////////////

function notFound(req, res, next) {
    res.send("PAGE NOT FOUND 404");
}

function cookieParser(req, res, next) {
    let cookies = req.headers.cookie;
    if (cookies) {
        req.cookies = cookies.split(";").reduce((obj, c) => {
            let n = c.split("=");
            obj[n[0].trim()] = n[1].trim();
            return obj
        }, {})
    }
    next();
  }