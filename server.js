'use strict';
const express = require('express');
const httpRouter = require('./routes/http-router.js');
const apiRouter = require('./routes/api-router.js');

const app = express();
const port =  process.env.PORT || 80;


app.use("/public", express.static(`${__dirname}/public`));
//app.use('/api', apiRouter);
app.use(httpRouter);
app.use(notFound);


app.listen(port, ()=>{
    console.log('Listening at port: ' + port);
});

//////////////////////////////////////////////////////

function notFound(req, res, next) {
    res.send("PAGE NOT FOUND 404");
}