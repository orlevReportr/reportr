const mongoose = require("mongoose");



const MeetingSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    meetingTitle:{
        type:String,
        required:true,
    },
    filePath: {
        type: Number,
        required: true,
    },

    transcript: [TranscriptSchema], 
}, { timestamps: true });

const Meeting = mongoose.model("Meeting", MeetingSchema);

module.exports = Meeting;
