const crypto = require('crypto');
const cookie = require('cookie');
const { globalAgent } = require('http');
const db = require(global.__dirname + "/db.js");
const User = require(global.__dirname + "/models/user.js");
const GameRecord = require(global.__dirname + "/models/game_record.js");

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

    static saveGameRecord(req, res){
        req = req.body;

        if(!req.room) {
            return;
        }
        new GameRecord({
            room: req.room,
            finishtime: req.time,
            players:{
                red:req.red_player,
                blue:req.blue_player
            },
            result:req.result,
            score: {
                red: req.score_red,
                blue: req.score_blue
            },
            accuracies: {
                red: {
                    hits: req.hits_red,
                    misses: req.misses_red,
                    deflects: req.deflects_red
                },
                blue: {
                    hits: req.hits_blue,
                    misses: req.misses_blue,
                    deflects: req.deflects_blue
                }
            }
        }).save();

        User.find({nickname: req.red_player}, (err, arr)=>{
            if(req.result == 1){
                arr[0].stat.wins++; 
                arr[0].save();
                return;
            }
            arr[0].stat.looses++;
            arr[0].save();
        });
        User.find({nickname: req.blue_player}, (err, arr)=>{
            if(req.result == 0){
                arr[0].stat.wins++; 
                arr[0].save();
                return;
            }
            arr[0].stat.looses++;
            arr[0].save();
        });

        delete global.rooms[req.room];
    }

    //////////////////////


    
    ///////////////////////


}

module.exports = ApiController;