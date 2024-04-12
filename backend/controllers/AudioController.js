const Meeting = require("../models/MeetingModel");
const Counter = require("../models/counterModel");
const axios = require('axios');

const addAudio=async(req,res)=>{
    try {
        const{meetingUrl,userId,meetingTitle}=req.body

    const counter = await Counter.findOneAndUpdate(
      { id: "autovalMeeting" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

   
    const meeting = new Meeting({
      id: counter.seq,
      status:'Waiting',
      userId,
      meetingUrl,
      meetingTitle
    });

    await meeting.save();

    res.status(201).json({
      status: "success",
      message: "Added Meeting",
      meeting: meeting
    });
    } catch (error) {
        return res.status(500).json({ error: 'Server Error!' });

    }
}


module.exports = {
  startRecording,createMeeting,stopRecording,getUserMeetings,getOneMeeting
};
