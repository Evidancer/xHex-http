const crypto = require('crypto');
const cookie = require('cookie');
const pool = require(global.__dirname + "/pool.js");

class ApiController {

    ///////////////////////

    static validate(req, res){

        req = req.body;

        console.log(req);

        if(!req.socket_id || !req.room
        || !(req.socket_id in global.sessions)
        ||  global.sessions[req.socket_id].status != 2
        || global.sessions[req.socket_id].room != req.room
        || !(req.room in global.rooms)
        || global.rooms[req.room].status != 2){
            res.send({status: 0}) //  JSON?
            return;
        }

        res.send({status: 1, data:{
            room: global.rooms[req.room]
        }})

    }

    //////////////////////


    
    ///////////////////////


}

module.exports = ApiController;