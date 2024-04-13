const mongoose = require("mongoose");



const AudioSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
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
}, { timestamps: true });

const Audio = mongoose.model("Audio", AudioSchema);

module.exports = Audio;
