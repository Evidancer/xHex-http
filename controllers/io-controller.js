const io = require('socket.io');
const cookie = require('cookie');
const crypto = require('crypto');
const axios = require('axios');
const pool = require(global.__dirname + "/pool.js");
const wssconfig = require(global.__dirname + "/wssconfig.json");

class IoController {

    ///////////////////////////

    static connection(socket) {

        let cookief = socket.handshake.headers.cookie;
        let emptySession = {status: 0, nickname: "", stat_wins: 0, stat_losses: 0, socket_id: socket.id}

        if(!cookief){                                                // Нет куки, нет сессии
            global.sessions[socket.id] = emptySession;
            socket.emit('sign-check', emptySession);
        } else {   
                                                           // есть куки
            let cookies = cookie.parse(cookief);

            if(cookies.socket_id && cookies.socket_id in global.sessions){
                
                renameKey(global.sessions, cookies.socket_id, socket.id);
                clearTimeout(global.sessions[socket.id].timeout);
                let s = global.sessions[socket.id];
                s.socket_id = socket.id;

                socket.emit('sign-check', {
                    status: s.status,
                    user:{
                        nickname: s.nickname,
                        stat_wins: s.stat_wins,
                        stat_losses: s.stat_losses
                    },
                });

            } else {
                global.sessions[socket.id] = emptySession;
                socket.emit('sign-check', emptySession);
            }
        }


        socket.on('disconnect', ()=>{
            let sid = socket.id;
            global.sessions[socket.id].timeout = setTimeout(()=>{
                delete global.sessions[sid];
                delete global.rooms[sid];
            },1800000)
        });

        socket.emit('init-chat', global.chat);

        socket.join("room-list");
        socket.join("global-chat");

        socket.on("req-sign-in", IoController.signIn.bind(socket));
        socket.on("req-sign-up", IoController.signUp.bind(socket));
        socket.on("req-sign-guest", IoController.signGuest.bind(socket));
        socket.on("req-sign-out", IoController.signOut.bind(socket));
        socket.on("req-global-chat-msg", IoController.globalChatMsg.bind(socket));
        socket.on("req-create-room", IoController.createRoom.bind(socket));
        socket.on("req-get-room-list", IoController.getRoomList.bind(socket));
        socket.on("req-join-room", IoController.joinRoom.bind(socket));
        socket.on("req-room-password", IoController.roomPassword.bind(socket));
        socket.on("req-leave-room", IoController.leaveRoom.bind(socket));
        socket.on("req-init-game", IoController.initGame.bind(socket));
    }

    ////////////////

    static signIn(req) {
        let socket = this;
        if(isEmpty(req) || req.nickname=="" || req.password==""){
            socket.emit("res-sign-in", {status: 0, msg: "Заполните поля"});
            return;
        }

        let filter = [req.nickname, hash(req.password)];

        pool.query(`SELECT * FROM users WHERE nickname=? && password=?`, filter, (err, sqlRes)=>{
            if(err){
                socket.emit("res-sign-in", {status: 0, msg: "Ошибка авторизации. Попробуйте позже"});
            } else if (isEmpty(sqlRes)){
                socket.emit("res-sign-in", {status: 0, msg: "Введены неправильные логин или пароль"});
            } else {
                sqlRes = sqlRes[0];
                let s = global.sessions[socket.id];
                s.status = 1;
                s.nickname = sqlRes["nickname"];
                s.stat_wins = sqlRes["stat_wins"];
                s.stat_losses = sqlRes["stat_losses"];
                socket.emit("res-sign-in", {
                    status: 1, 
                    user:{
                        nickname: sqlRes["nickname"],
                        stat_wins: sqlRes["stat_wins"],
                        stat_losses: sqlRes["stat_losses"]
                    }
                });
            }
        });
    }

    ////////////////

    static signUp(req) {
        let socket = this;
        if(isEmpty(req) || req.nickname=="" || req.password==""){
            socket.emit("res-sign-in", {status: 0, msg: "Заполните поля"});
            return;
        }
        
        pool.query(`SELECT * FROM users WHERE nickname=?`, [req.nickname], (err, sqlRes)=>{
            if(err){
                socket.emit("res-sign-up", {status: 0, msg: "Ошибка создания аккаунта. Попробуйте позже"})
            } else if (!isEmpty(sqlRes)){
                socket.emit("res-sign-up", {status: 0, msg:"Такое имя уже занято"})
            } else {
                createAcc();
            }
        });

        function createAcc(){
            let data = [[req.nickname, hash(req.password)]];
            pool.query(`INSERT INTO users(nickname, password) VALUES (?)`, data, (err, sqlRes)=>{
                if(err || isEmpty(sqlRes)){
                    socket.emit("res-sign-up", {status: 0, msg: "Ошибка создания аккаунта. Попробуйте позже"})
                } else {
                    let s = global.sessions[socket.id];
                    s.status = 1;
                    s.nickname = req.nickname;
                    s.stat_wins = 0;
                    s.stat_losses = 0;
                    console.log(s);
                    socket.emit("res-sign-up", {
                        status: 1, 
                        user:{
                            nickname: req.nickname,
                            stat_wins: 0,
                            stat_losses: 0
                        }
                    });
                }
            });
        }
    }

    ///////////////

    static signGuest(req){
        let socket = this;

        let s = global.sessions[socket.id];
        s.status = 1;
        s.nickname = "Guest-"+hash(socket.id).substr(0, 6);
        s.stat_wins = 0;
        s.stat_losses = 0;
        console.log(s);
        socket.emit("res-sign-guest", {
            status: 1,
            user: {
                nickname: s.nickname,
                stat_wins: 0,
                stat_losses: 0 
            }
        })
    }
    
    //////////////

    static signOut(req){

        let socket = this;
        let s = global.sessions[socket.id];
        s.status = 0;
        s.nickname = "";
        s.stat_wins = 0;
        s.stat_losses = 0;
        socket.emit("res-sign-out", {status: 1});
    }

    ///////////////

    static globalChatMsg(req){

        let socket = this;
    
        console.log(req);

        if(!req.msg || !(socket.id in global.sessions)){
            console.log("rejecting msg");
            socket.emit("res-global-chat-msg", {status: 0, msg:"Авторизируйтесь для отправки сообщений"});
            return;
        }
        
        if(req.msg.length>60){
            req.msg=req.msg.substr(0, 60);
        }

        if(global.chat.length > 50){
            global.chat.shift();
        }

        let s = global.sessions[socket.id];

        global.chat.push({author: s.nickname, text: req.msg});

        socket.emit("res-global-chat-msg", {status: 1});
        global.io.in("global-chat")
            .emit("bc-global-chat-msg", {
                status:1, 
                data:{
                    author: s.nickname, 
                    text: req.msg
                }
            });
    }

    /////////////////////

    static createRoom(req){
        
        let socket = this;

        if(!req.roomname){
            socket.emit("res-create-room", {
                status: 0,
                msg:"У комнаты должно быть имя"
            });
            return;
        }
        if(req.roomname.length > 32) 
            req.roomname.substr(0, 32);
        
        global.rooms[hash(socket.id)] = {
            status: 1,
            id: hash(socket.id),
            roomname: req.roomname,
            password: req.password,
            players: {[socket.id]: global.sessions[socket.id]},
            public:{
                status: 1,
                id: hash(socket.id),
                roomname: req.roomname,
                password: true,
                players: [global.sessions[socket.id].nickname]
            }
        }
        global.sessions[socket.id].room = hash(socket.id);

        socket.emit("res-create-room", {
            status: 1,
            room: global.rooms[hash(socket.id)].public
        });

        socket.join(`room-${hash(socket.id)}`);
    }

    /////////////////////

    static getRoomList(req){
        let socket = this;
        socket.emit("res-get-room-list", {
            status: 1,
            rooms: Object.values(global.rooms).map((e)=>e.public)
        })
    }

    ////////////////////

    static joinRoom(req){
        let socket = this;

        if(!req.id){
            socket.emit("res-join-room", {status: 0, msg:"Выберите комнату"});
            return;
        }

        if(!(req.id in global.rooms)){
            socket.emit("res-join-room", {status: 0, msg:"Такой комнаты уже нет"});
            return;
        }

        if(global.rooms[req.id].password){
            socket.emit("res-join-room", {status: 1});
            return;
        }

        if(global.rooms[req.id].players.length == 2){
            socket.emit("res-join-room", {status: 0, msg: "Комната заполнена"});
            return;
        }

        global.sessions[socket.id].room = req.id;

        global.rooms[req.id].players[socket.id] = global.sessions[socket.id];
        global.rooms[req.id].public.players.push(
            global.sessions[socket.id].nickname
        );
        socket.emit("res-join-room", {status:2, room:global.rooms[req.id].public})
        socket.join(`room-${req.id}`);
        global.io.in(`room-${req.id}`).emit("bc-room-status", {status: 1, room: global.rooms[req.id].public});
    }
    
    static roomPassword(req){
        let socket = this;

        if(!req.id){
            socket.emit("res-room-password", {status: 0, msg:"Выберите комнату"});
            return;
        }

        if(!(req.id in global.rooms)){
            socket.emit("res-room-password", {status: 0, msg:"Такой комнаты уже нет"});
            return;
        }

        if(global.rooms[req.id].password != req.password){
            socket.emit("res-room-password", {status: 0, msg:"Введен неправильный пароль"});
            return;
        }

        if(global.rooms[req.id].players.length == 2){
            socket.emit("res-room-password", {status: 0, msg: "Комната заполнена"});
            return;
        }

        global.sessions[socket.id].room = req.id;

        global.rooms[req.id].players[socket.id] = global.sessions[socket.id];
        global.rooms[req.id].public.players.push(
            global.sessions[socket.id].nickname
        );

        socket.emit("res-room-password", {status:1, room:global.rooms[req.id].public});
        socket.join(`room-${req.id}`);
        global.io.in(`room-${req.id}`).emit("bc-room-status", {status: 1, room: global.rooms[req.id].public});
    }

    static leaveRoom(req){
        let socket = this;

        if(!global.sessions[socket.id].room){
            socket.emit("res-leave-room", {status:0, msg: "Произошла ошибка"});
        }

        let player = global.sessions[socket.id];
        let roomId = player.room;
        let room = global.rooms[roomId];

        if(roomId != hash(socket.id)){
    
            delete room.players[socket.id];

            room.public.players = room.public.players.filter((val)=>{
                if(val == player.nickname) 
                    return false;
                return true;
            });

            player.room = "";
            socket.leave(`room-${roomId}`);
            socket.emit("res-leave-room", {status:1});
            global.io.in(`room-${roomId}`).emit("bc-room-status", {status:1, room: room.public});
            return;

        }

        global.io.in(`room-${roomId}`).emit("bc-room-status", {status: -1})
        room.players.forEach((el)=>{
            global.io.sockets.sockets.get(el.socket_id).leave(`room-${roomId}`);
            el.room = "";
        })
        delete global.rooms[roomId];
        socket.emit("res-leave-room", {status:1});
    }

    //////////////////////

    static initGame(req){
        let socket = this;

        if(!(hash(socket.id) in global.rooms)){
            socket.emit("res-init-game", {status: 0, msg: "Произошла ошибка"});
            return;
        }

        console.log(global.rooms[hash(socket.id)].players);

        if(Object.values(global.rooms[hash(socket.id)].players).length != 2){
            socket.emit("res-init-game", {status: 0, msg: "Недостаточно игроков"});
            return;
        }

        Object.values(global.rooms[hash(socket.id)].players).forEach((el)=>{
            
            el.status = 2;

            global.io.sockets.sockets.get(el.socket_id).emit("bc-init-game", {
                status: 1,
                data: {
                    wss: wssconfig.ws,
                    player: el                    
                }
            });
        })
        
        global.rooms[hash(socket.id)].status = 2;
        global.rooms[hash(socket.id)].public.status = 2; 
    }

    /////////////////////////////////////////////////////////////
}

module.exports = IoController;

function renameKey(obj, oldKey, newKey) {
    if (oldKey !== newKey) {
        Object.defineProperty(obj, newKey,
            Object.getOwnPropertyDescriptor(obj, oldKey));
        delete obj[oldKey];
    }
}


function hash(str){
    if(str)
        return crypto.createHash('md5').update(str).digest('hex');
}


function isEmpty(obj){
    for(let key in obj){
        return false;
    }
    return true;
}
