const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Stat = new Schema({
    wins: {type: Number, required: false, default: 0},
    looses: {type: Number, required: false, default: 0}
});

const User = new Schema({
    nickname: {type: String, required: true},
    password: {type: String, required: true},
    stat: Stat
});

module.exports = mongoose.model("User", User);