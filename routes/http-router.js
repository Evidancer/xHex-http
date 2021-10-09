const express = require('express');
const path = require('path');
const httpRouter = express.Router();

httpRouter.route(/^\/$|^\/index$/)
    .get((req, res)=>{
        res.sendFile(global.__dirname+"/public/index.html");
    });

module.exports = httpRouter;