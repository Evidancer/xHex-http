const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatMessage = new Schema({
    nickname: {type: String, required: true},
    message: {type:String, required:true}
});

module.exports = mongoose.model("ChatMessage", ChatMessage);