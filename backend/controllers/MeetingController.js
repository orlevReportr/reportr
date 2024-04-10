const Meeting = require("../models/MeetingModel");
const Counter = require("../models/counterModel");
const axios = require('axios');

const createMeeting=async(req,res)=>{
    try {
        const{meetingUrl,userId}=req.body

    const counter = await Counter.findOneAndUpdate(
      { id: "autovalMeeting" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

   
    const meeting = new Meeting({
      id: counter.seq,
      status:'Started',
      userId,
      meetingUrl
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

const startRecording = async (req, res) => {
    try {
        const {meetingId}=req.body;
        const meeting=await Meeting.findOne({id:meetingId})
        if (!meeting) {
            return res.status(400).json({ error: 'Meeting not found' });
        }

        const bot = await recallFetch(meeting.meetingUrl);

        meeting.botId = bot.id;
        await meeting.save();
        return res.json({
            botId: bot.id,
        });
    } catch (e) {
      console.log(e)
        return res.status(500).json({ error: 'Server Error!' });

    }

};


const recallFetch= async (meetingUrl)=>{
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization':`Token ${process.env.RECALL_API_TOKEN}`
      };

      const reqBody = {
        bot_name: `${process.env.BOT_NAME} Notetaker`,
        meeting_url: meetingUrl,
        transcription_options: {
          provider: "default",
        },
        real_time_transcription: {
          destination_url: `${process.env.PUBLIC_URL}/transcription`,
          partial_results: false,
        },
        zoom: {
          request_recording_permission_on_host_join: true,
          require_recording_permission: true,
        },
      }

      
  const res = await axios.post(
    `https://us-west-2.recall.ai/api/v1/bot`,
    reqBody,{
        headers
    }

    
  );
    return res.data;
}

module.exports = {

  startRecording,createMeeting
};
