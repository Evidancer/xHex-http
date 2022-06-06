const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Players = new Schema({
    red: {type: String, required: true},
    blue: {type: String, required: true}
});

const Score = new Schema({
    red: Number,
    blue: Number
});

const Accuracy = new Schema({
    hits: Number,
    misses: Number,
    deflects: Number
});

const Accuracies = new Schema({
    red: Accuracy,
    blue: Accuracy
});

const GameRecord = new Schema({
    room: {type: String, required: true},
    finishtime: {type: String, required: true},
    players: Players,
    result: {type: String, required: true},
    score: Score,
    accuracies: Accuracies
});

module.exports = mongoose.model("GameRecord", GameRecord);