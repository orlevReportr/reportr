const mongoose = require("mongoose");

const WordSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    start_time: {
        type: Number,
        required: true
    },
    end_time: {
        type: Number,
        required: true
    }
});

const TranscriptSchema = mongoose.Schema({
    original_transcript_id: {
        type: Number,
        required: true
    },
    speaker: {
        type: String,
        required: true
    },
    speaker_id: {
        type: Number,
        required: true
    },
    words: [WordSchema], // Array of WordSchema objects
    is_final: {
        type: Boolean,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    source: {
        type: String
    }
});

const MeetingSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    meetingTitle:{
        type:String,
        required:true,
    },
    userId: {
        type: Number,
        required: true,
    },
    botId: {
        type: String,
    },
    status: {
        type: String,
        required: true
    },
    meetingUrl:{
        type: String,
        required: true
    },
    summary:{
        type:String,
    
    },
    formattedSummary:{
        type:String
    },
    meetingStartTime:{
        type:Date
    },
    meetingEndTime:{
        type:Date
    },
    transcript: [TranscriptSchema], 
    formattedTranscript:{
        type:String,
    },
}, { timestamps: true });

const Meeting = mongoose.model("Meeting", MeetingSchema);

module.exports = Meeting;
