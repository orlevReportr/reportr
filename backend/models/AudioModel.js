const mongoose = require("mongoose");

const WordsSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Number,
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    speaker: {
        type: String,
        default: null
    }
});


const AudioSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    botId:{
        type: String,
        required: true
    },
    userId: {
        type: Number,
        required: true,
    },
    audioTitle:{
        type:String,
        required:true,
    },
    audioPath: {
        type: String,
        required: true,
    },
    status:{
        type:String,
    },
    utterances:[WordsSchema],
    summary:{
        type:String,
    },
    formattedSummary:{
        type:String
    }
}, { timestamps: true });

const Audio = mongoose.model("Audio", AudioSchema);

module.exports = Audio;
