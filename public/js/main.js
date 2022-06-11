"use strict";


///////////      MODAL       ///////////

function modal(name){
    return new Modal(
        document.querySelector(".modal-"+name)
        );
}

class Modal {
    constructor(el){
        Modal.last = this;
        this.htmlElement = el;
    }
    hide(){
        Modal.last = this;
        if(this.htmlElement)
            this.htmlElement.classList.remove("active");
    }
    show(){
        Modal.last = this;
        if(this.htmlElement)
        this.htmlElement.classList.add("active");    
    }
    toggle(){
        Modal.last = this;
        if(this.htmlElement)
            this.htmlElement.classList.toggle("active");
    }
    goTo(str){
        this.hide();
        if(this.htmlElement)
            modal(str).show();
    }
    static goTo(str){
        if(Modal.last)
            Modal.last.hide();
        modal(str).show();
    }
}

class Load{
    static le = document.querySelector(".modal-load")
    static show(){
        Load.le.classList.add('active');
    }
    static hide(){
        Load.le.classList.remove('active');
    }
}

/////////////////////////////////////////






////////////     RENDER      /////////////

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
ctx.imgs = loadImages();

/////////////

function drawUnit(ctx, unit){
    let team = (!unit.team)?"blue":"red";
    let charge = (unit.statuses.antiarmor)? "a": "";
    drawImage(ctx, ctx.imgs["b"+team], ...unit.bpos, unit.bang);
    drawImage(ctx, ctx.imgs[charge+"t"+team], ...unit.bpos, unit.tang);
    
    if(unit.statuses.shield){
        drawImage(ctx, ctx.imgs["s"+team], ...unit.bpos, 0);
    }
}

function drawProj(ctx, unit){
    unit.proj.forEach(el=>{
        let team = (!el.team)?"blue":"red";
        let type = el.antiarmor? "a": "";
        drawImage(ctx, ctx.imgs[type+"p"+team], ...el.pos, el.ang);
    });
}

function drawBlocks(ctx, units){
    units.blocks.forEach(el=>{
        drawImage(ctx, ctx.imgs["block"], ...el.pos, el.ang);
    });
}

function drawItems(ctx, units){
    units.items.forEach(el=>{
        let type = el.type? "antiarmor": "heal";
        if(el.status){
            drawImage(ctx, ctx.imgs[type], ...el.pos, el.ang);
        }
    });
}


function drawImage(ctx, img, x, y, rad){
    ctx.translate(x, y);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.width/2, -img.height/2);
    ctx.rotate(-rad);
    ctx.translate(-x, -y);
}

function loadImages(){
    let tred = new Image();
    tred.src = "/public/img/t-red.png";
    let bred = new Image();
    bred.src = "/public/img/b-red.png";
    let tblue = new Image();
    tblue.src = "/public/img/t-blue.png";
    let bblue = new Image();
    bblue.src = "/public/img/b-blue.png";
    let pred = new Image();
    pred.src = "/public/img/p-red.png";
    let pblue = new Image();
    pblue.src = "/public/img/p-blue.png";
    let sblue = new Image();
    sblue.src = "/public/img/s-blue.png";
    let sred = new Image();
    sred.src = "/public/img/s-red.png";
    let block = new Image();
    block.src = "/public/img/block.png";
    let apred = new Image();
    apred.src = "/public/img/ap-red.png";
    let apblue = new Image();
    apblue.src = "/public/img/ap-blue.png";
    let heal = new Image();
    heal.src = "/public/img/heal.png";
    let antiarmor = new Image();
    antiarmor.src = "/public/img/anti-armor.png";
    let atred = new Image();
    atred.src = "/public/img/at-red.png";
    let atblue = new Image();
    atblue.src = "/public/img/at-blue.png";
    return {
        tred,
        bred,
        tblue,
        bblue,
        pred,
        pblue,
        sblue,
        sred,
        block,
        apred,
        apblue,
        heal,
        antiarmor,
        atred,
        atblue,
    };
}

//////////////////////////////////////////////




////////////     USER INPUTS    //////////////

let userInputs = {
    w:0,
    a:0,
    s:0,
    d:0,
    "ц":0,
    "ф":0,
    "ы":0,
    "в":0,
    dir:[0, 0],
    mb0:0,
    mc0:0,
    mb1:0,
    mc1:0,
    mb2:0,
    mc2:0,
    mpos: null,
};
window.addEventListener('keydown', function(e){
    console.log(e.key + " down");
    userInputs[e.key] = 1;
});
window.addEventListener('keyup', function(e){
    console.log(e.key + " up");
    userInputs[e.key] = 0;
});
window.addEventListener('mousedown', function(e){
    console.log(e);                                 // 0 - LMB, 1 - MWB, 2 - RMB
    userInputs["mb"+e.button] = 1;
});
window.addEventListener('contextmenu', function(e) {
    e.preventDefault();
})
window.addEventListener('mouseup', function(e){
    console.log(e);                                 // 0 - LMB, 1 - MWB, 2 - RMB
    userInputs["mc"+e.button] = 1;
    userInputs["mb"+e.button] = 0;
});
window.addEventListener('mousemove', function(e){
    userInputs.mpos = getCoords(canvas, e);
});

////////////

function getCoords(elem, e){
    let b = elem.getBoundingClientRect();
    let bx = b.left + window.scrollX;
    let by = b.top + window.scrollY;
    return [
        e.clientX - bx,
        e.clientY - by
    ];
}

function getAngle(x, y) {
    let a = (x<0||x>0&&y<0)?1: 0, b = (x>0&&y<0)? 2: 1;
    return a*b*Math.PI + Math.atan(y/x);
}

function getRelAngle(ox, oy, x, y){
    return getAngle(x-ox, y-oy);
}

function getAngleDeg(x, y) {
    return 180/Math.PI*getAngle(x, y);
}

function getDir(keys){
    let w = keys.w;
    w += keys["ц"];
    let s = keys.s;
    s += keys["ы"];
    let a = keys.a;
    a += keys["ф"];
    let d = keys.d;
    d += keys["в"];
    
    return [0+w-s, 0+d-a];
}

///////////////////////////////////////////







/////////////     MAIN     ///////////////

let user = {};

let socket = io();
Load.show();
socket.on("connect", ()=>{
    setCookie("socket_id", socket.id, {"max-age": 1800});
})

socket.on("sign-check", (res)=>{ 
    Load.hide();
    if(!res.status){
        modal('sign-in').show();
        showError("sign-in", res.msg);
        return;
    }
    Modal.goTo("main");
    user = res.user;
    showChat();
    setUserData();
})

socket.on("bc-global-chat-msg", (res)=>{
    console.log(res);
    if(!res.status){
        showError("chat-msg", "Ошибка чата");
        return;
    }
    chatAddMsg(res.data);
});

socket.on('init-chat', (res)=>{
    initChat(res);
});

socket.on("bc-room-status", (res)=>{
    if(!res.status){
        showModalError(res.msg);
        return;
    }
    if(res.status==-1){
        Modal.goTo("main");
        return;
    }
    initRoom(res.room);
});

socket.on("bc-init-game", (res)=>{
    if(!res.status){
        showError("room", req.msg);
        return;
    }
    initGame(res.data);
});




/////////////////////////////




function signInRequest(){
    let form = document.forms["sign-in"];
    if(!form.elements.nickname.value || !form.elements.password.value){
        showError("sign-in", "Введите данные")
        return;
    }
    let fd = {
        nickname: form.elements.nickname.value,
        password: form.elements.password.value
    };
    form.reset();
    socket.emit("req-sign-in", fd);
    Load.show();
    socket.on("res-sign-in", (res)=>{
        Load.hide();
        socket.off("res-sign-in");
        if(!res.status){
            showError("sign-in", res.msg);
            return;
        }
        user = res.user;
        Modal.goTo("main");
        showChat();
        setUserData();
    })
}

function signUpRequest(){
    let form = document.forms["sign-up"];
    if(form.elements.password.value != form.elements.cpassword.value){
        showError("sign-up", "Пароли должны совпадать")
        return;
    }
    let fd = {
        nickname: form.elements.nickname.value,
        password: form.elements.password.value
    };
    form.reset();
    socket.emit("req-sign-up", fd)
    Load.show();
    socket.on("res-sign-up", (res)=>{
        Load.hide();
        socket.off("res-sign-up");
        if(!res.status){
            showError("sign-up", res.msg);
            return;
        }
        user = res.user;
        Modal.goTo("main");
        showChat();
        setUserData();
    })
}

function signGuestRequest(){
    socket.emit("req-sign-guest");
    Load.show();
    socket.on("res-sign-guest", (res)=>{
        Load.hide();
        socket.off("res-sign-guest")
        if(!res.status){
            showError("sign-up", res.msg);
            showError("sign-in", res.msg);
            return;
        }
        user = res.user;
        Modal.goTo("main");
        showChat();
        setUserData();
    })
}

function signOutRequest(){
    socket.emit("req-sign-out");
    Load.show();
    socket.on("res-sign-out", (res)=>{
        Load.hide();
        if(!res.status){
            showError("profile", "Ошибка выхода из профиля");
            return;
        }
        user = {};
        Modal.goTo("sign-in");
        hideChat();
    })
}

function chatMsgRequest(){
    let form = document.forms["chat-msg"];
    if(form.elements.msg.value == 0){
        showError("chat-msg", "Заполните поле");
        return;
    }
    if(form.elements.msg.value.length>60){
        showError("chat-msg", "Слишком длинное сообщение");
        return;
    }
    let fd = {
        msg: form.elements.msg.value
    };
    socket.emit("req-global-chat-msg", fd);
    socket.on("res-global-chat-msg", function catchErr(res){
        form.reset();
        socket.off("res-global-chat-msg");
        if(!res.status){
            showError("chat-msg", res.msg);
        }
    })
}

function createRoomRequest(){
    let form = document.forms["create"];
    if(!form.elements.roomname.value){
        showError("Заполните обязательные поля");
        return;
    }
    let fd = {
        roomname: form.elements.roomname.value,
        password: form.elements.password.value
    }
    socket.emit("req-create-room", fd);
    Load.show();
    socket.on("res-create-room", (res)=>{
        socket.off("res-create-room");
        Load.hide()
        console.log(res);
        if(!res.status){
            showError("create", res.msg);
            return;
        }
        initRoom(res.room);
        Modal.goTo("room");
        document.querySelector(".create-btn").classList.add('active');
    });
}

function goToRoomList(){
    socket.emit("req-get-room-list");
    Load.show();
    socket.on("res-get-room-list", (res)=>{
        socket.off("res-get-room-list");
        Load.hide();
        console.log(res);
        if(!res.status){
            showModalError(res.msg);
            return;
        }
        initRoomList(res.rooms);
        Modal.goTo("join");
    })
}

function goToProfile(){
    socket.emit("req-update-info");
    Load.show();
    socket.on("res-update-info", (res)=>{
        socket.off("res-update-info");
        Load.hide();
        console.log(res);
        if(!res.status){
            showModalError(res.msg);
            return;
        }
        user.stat_wins = res.stat_wins;
        user.stat_looses = res.stat_looses;
        user.accuracies = res.accuracies;
        user.matches = res.matches;
        setUserData();
        Modal.goTo('profile');
    })
}


function joinRoomRequest(){
    let form = document.forms["join"];
    if(!form.elements["room-id"].value) {
        showError("join", "Выберите комнату");
        return;
    }
    let fd = {
        id: form.elements["room-id"].value
    }
    socket.emit("req-join-room", fd);
    Load.show();
    socket.on("res-join-room", (res)=>{
        socket.off("res-join-room");
        Load.hide();
        if(!res.status){
            showError("join", res.msg);///////////////////////////////////////////////
            return;
        }
        if(res.status == 1){
            document.forms.password["room-id"].value = fd.id;
            Modal.goTo("password");
            return;
        }
        initRoom(res.room);
        Modal.goTo("room")
    });
}

function roomPasswordRequest(){
    let form = document.forms.password;
    if(!form.elements.password.value){
        showError("password", "Введите пароль");
        return;
    }
    let fd = {
        id: form.elements["room-id"].value,
        password: form.elements.password.value
    }
    socket.emit("req-room-password", fd);
    Load.show();
    socket.on("res-room-password", (res)=>{
        socket.off("res-room-password");
        Load.hide();
        if(!res.status){
            showError("password", res.msg);
            return;
        }
        initRoom(res.room);
        Modal.goTo("room");
    });
}

function leaveRoomRequest(){
    socket.emit("req-leave-room");
    Load.show();
    socket.on("res-leave-room", (res)=>{
        socket.off("res-leave-room");
        Load.hide();
        if(!res.status){
            showError("room", res.msg);
            return;
        }
        Modal.goTo("main");
    });
}

function initGameRequest(){
    socket.emit("req-init-game");
    socket.on("res-init-game", (res)=>{
        socket.off("res-init-game");
        if(!res.status){
            showError("room", res.msg);
            return;
        }
    })
}

//////////////////////////////////////

function initGame(d){
    console.log(d);

    Modal.last.hide();
    hideChat();
    showScore();
    changeScore([0,0], [0, 0]);

    let ws = new WebSocket(d.wss);
    ws.onopen = ()=>{
        ws.send(JSON.stringify({
            type: "req-validate",
            data:{
                player: d.player
            }
        }));
    };

    ws.onmessage = (res)=>{

        console.log(res);

        res = JSON.parse(res.data);
        switch (res.type){
            case "res-await":
                awaitGame();
                break;
            case "res-frame":
                renderFrame(res.data.units);
                changeScore(res.data.score, 
                    [res.data.units.veh[0].hp,
                    res.data.units.veh[1].hp]);
                break;
            case "res-update-data":
                updateData(res.data);
                break;
            
            case "res-start-countdown":
                startCountdown();
                break;
        }
    }

    ws.onclose = ()=>{                      /// Нужно ловить ошибки
        modal("main").show();
        setTimeout(()=>socket.emit("req-update-info"), 500);
        hideScore();
        socket.on("res-update-info", (res)=>{
            if(!res.status) return;
            user.stat_wins = res.stat_wins;
            user.stat_looses = res.stat_looses;
            user.accuracies = res.accuracies;
            setUserData();
        })
        
        showChat();
    }

    function awaitGame(){

    }

    function renderFrame(units){
        ctx.clearRect(0, 0, 800, 800);
        units.veh.forEach(unit=>{
            drawUnit(ctx, unit); 
        });
        drawProj(ctx, units);
        drawBlocks(ctx, units);
        drawItems(ctx, units);

        userInputs.dir = getDir(userInputs);
        console.log(userInputs);
        userInputs.mc0 = 0;
        userInputs.mc1 = 0;
        userInputs.mc2 = 0;
        ws.send(JSON.stringify({
            type: "req-inputs",
            data: userInputs
        }));
    }
    
    function startCountdown(){
        Load.show();
        setTimeout(()=>{Load.hide()}, 3000);
    }

    function updateData(){

    }

}

function selectRoom(r){

    document.querySelectorAll("tr").forEach(element => {
        element.classList.remove("active");     
    });    
    r.classList.add("active");
    document.forms.join["room-id"].value = r.id;
}

function initRoomList(rooms){
    let t = document.querySelector("[name='r-table']")
    console.log(t);
    t.innerHTML = "";
    rooms.forEach((room)=>{
        console.log(room);
        t.innerHTML += `<tr id="${room.id}" onclick="selectRoom(this)"><td>${room.roomname}</td><td>${room.players.length}/2</td><td>${(room.status==1? "Ожидание": "Игра")}</td></tr>`;
    });
}

function initRoom(res){
    document.querySelector("[name=room-roomname]").innerText = res.roomname;
    document.querySelector("[name=room-players]").innerHTML = "";
    res.players.forEach((p)=>{
        document.querySelector("[name=room-players]").innerHTML += "<li>"+p+"</li>";
    })
}

function initChat(res){
    res.forEach((el)=>{
        chatAddMsg(el);
    })
}

function chatAddMsg(data){
    let wrap = document.createElement("div");
    let author = document.createElement("div");
    let text = document.createElement("div");
    author.appendChild(document.createTextNode(data.author));
    text.appendChild(document.createTextNode(data.text));
    wrap.appendChild(author);
    wrap.appendChild(text);
    wrap.classList.add("aside_chat-msg");
    author.classList.add("aside_chat-author");
    text.classList.add("aside_chat-text");
    let scroll = document.querySelector(".aside_chat-scroll");
    scroll.appendChild(wrap).scroll();
    scroll.scrollTop = scroll.scrollHeight;
    if(scroll.children.length > 50){
        scroll.children[0].remove();
    }
}

function showChat(){
    document.querySelector(".aside_chat").classList.add("active");
}

function hideChat(){
    document.querySelector(".aside_chat").classList.remove("active");
}

function showScore(){
    document.querySelector(".aside_score").classList.add("active");
}

function hideScore(){
    document.querySelector(".aside_score").classList.remove("active");
}

function changeScore(scArr, hpArr){
    document.getElementById("score0").innerText = scArr[0];
    document.getElementById("score1").innerText = scArr[1];

    document.getElementById("hp0").innerText = hpArr[0];
    document.getElementById("hp1").innerText = hpArr[1];
}

function setUserData(){
    console.log("!!!!!!!!");
    console.log(user);
    document.querySelector("[name='user_nickname']").innerText = user.nickname;
    document.querySelector("[name='user_stat_wins']").innerText = user.stat_wins;
    document.querySelector("[name='user_stat_losses']").innerText = user.stat_looses;
    document.querySelector("[name='user_hits']").innerText = user.accuracies.hits;
    document.querySelector("[name='user_misses']").innerText = user.accuracies.misses;
    document.querySelector("[name='user_deflects']").innerText = user.accuracies.deflects;
    document.querySelector("[name='user_avrg_accuracy']").innerText = Math.floor((user.accuracies.avrgAccuracy)*100)/100;
    
    
    document.querySelector("[name='user_matches']").innerHTML = "";



    for(let match in user.matches){
        document.querySelector("[name='user_matches']").innerHTML += `
            <li>${user.matches[match].players.blue} vs ${user.matches[match].players.red} |
             Счет: ${user.matches[match].score.blue}:${user.matches[match].score.red}<br>
             Попадания: ${user.matches[match].accuracies.blue.hits}:${user.matches[match].accuracies.red.hits}<br>
             Промахи: ${user.matches[match].accuracies.blue.misses}:${user.matches[match].accuracies.red.misses}<br>
             Отражения: ${user.matches[match].accuracies.blue.deflects}:${user.matches[match].accuracies.red.deflects}<br>
            </li>`;
    }
}

function showError(which, err) {
    let box = document.querySelector(".error-"+which);
    box.classList.add('active');
    setTimeout(()=>{box.classList.remove('active')}, 5000)
    box.innerText = err;
}

function showModalError(err){
    let box = document.querySelector(".error-modal");
    let text = document.querySelector(".error-modal .modal-error");
    text.innerText = err;
    box.classList.add("active");
    setTimeout(()=>box.classList.remove("active"), 3000);
}

function hideError(str) {
    let err = document.querySelector(".form-"+form+" .modal-error");
    err.classList.remove('active');
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
    options = {
        path: '/',
        ...options
    };
    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    document.cookie = updatedCookie;
}

