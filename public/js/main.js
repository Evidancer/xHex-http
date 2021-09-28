"use strict";
document.addEventListener("DOMContentLoaded", function() {


    // INITIALIZING GRAPHICS

    let c = document.getElementById('canvas');
    let ctx = c.getContext('2d');
    console.log(ctx);

    ctx.imgs = loadImages();

    // GETTING USER INPUTS
    
    let rawInputs = {};
    window.addEventListener('keydown', function(e){
        console.log(e.key);
        rawInputs[e.key] = 1;
    });
    window.addEventListener('keyup', function(e){
        console.log(e.key);
        rawInputs[e.key] = 0;
    });
    window.addEventListener('mousedown', function(e){
        console.log(e);                                 // 0 - LMB, 1 - MWB, 2 - RMB
        rawInputs["mb"+e.button] = 1;
        rawInputs["mc"+e.button] = 1;
    });
    window.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    })
    window.addEventListener('mouseup', function(e){
        console.log(e);                                 // 0 - LMB, 1 - MWB, 2 - RMB
        rawInputs["mb"+e.button] = 0;
    });
    window.addEventListener('mousemove', function(e){
        rawInputs.mpos = getCoords(c, e);
    });


    // WEBSOCKET WITH SERVER

    let socket = new WebSocket("ws://localhost:81");
    socket.onopen = ()=>{
        console.log("GOT IT!");
        //console.log("Sending...");
        //socket.send(JSON.stringify({mdir: "w", mpos:[100, 100]}));
    };

    // WS + RENDER

    socket.onmessage = function(m) {

        let unit = JSON.parse(m.data);
        ctx.clearRect(0, 0, 800, 800);
        drawUnit(ctx, unit);

        rawInputs.dir = getDir(rawInputs);             // ПОМЕНЯТЬ НА ДВИЖЕНИЕ В ВРАЩЕНИЕ, ВМЕСТО НАПРАВЛЕНИЯ!!!!!!!!!
        //console.log(rawInputs);                      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        rawInputs.mc0 = 0;
        rawInputs.mc1 = 0;
        rawInputs.mc2 = 0;
        socket.send(JSON.stringify(rawInputs))
    }

    // setInterval(()=>{
    //    // console.log(ctx.imgs);
    //     ctx.clearRect(0, 0, 800, 800);
    //     ctx.drawImage(ctx.imgs.grid, 0, 0);
    //     ex.units.forEach((val)=>{drawUnit(ctx, val)});
    // }, 100)

    
    // document.onmousemove = function (e) {
    //     ctx.clearRect(0, 0, 800, 800);
    //     ctx.drawImage(imgs.grid, 0, 0);
        
    //     let x = 50, y = 415;

    //     drawImage(ctx, imgs.tred, x, y, getRelAngle(x, y, ...getCoords(c, e)));
    // }

    // let ex = {
    //     status: 0,
    //     scores: {
    //         blue: 0,
    //         red: 0,
    //     },
    //     units: [
    //         {
    //             id: 0,
    //             team: "blue",
    //             bpos: [400, 100],
    //             bang: Math.PI/2,
    //             tang: Math.PI/180 * 54,
    //         },
    //         {
    //             id: 1,
    //             team: "red",
    //             bpos: [400, 700],
    //             bang: -Math.PI/2,
    //             tang: -Math.PI/2,
    //         }
    //     ]
    // };

});










function getDir(keys){
    let dir = ""
    if(keys.w && !keys.s)
        dir += "w";
    else if (keys.s && !keys.w)
        dir += "s";
    if(keys.a && !keys.d)
        dir += "a";
    else if (keys.d && !keys.a)
        dir += "d";
    return dir;
}


function drawUnit(ctx, unit){
    let team = unit.team;
    drawImage(ctx, ctx.imgs["b"+team], ...unit.bpos, unit.bang);
    drawImage(ctx, ctx.imgs["t"+team], ...unit.bpos, unit.tang);
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
    return {
        tred,
        bred,
        tblue,
        bblue,
    };
}








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
