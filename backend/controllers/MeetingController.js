const Meeting = require("../models/MeetingModel");
const Counter = require("../models/counterModel");
const axios = require('axios');

const createMeeting=async(req,res)=>{
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

const startRecording = async (req, res) => {
    try {
        const {meetingId}=req.body;
        const meeting=await Meeting.findOne({id:meetingId})
        if (!meeting) {
            return res.status(400).json({ error: 'Meeting not found' });
        }

        const bot = await recallFetch(meeting.meetingUrl);

        meeting.botId = bot.id;
        meeting.status='Started';
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
        teams:{
          login_required:true
        }
      }

      
  const res = await axios.post(
    `https://us-west-2.recall.ai/api/v1/bot`,
    reqBody,{
        headers
    }

    
  );
    return res.data;
}

const stopRecording = async (req, res) => {
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Token ${process.env.RECALL_API_TOKEN}`
    };
    const { meetingId } = req.body;
    const meeting = await Meeting.findOne({ id: meetingId })
    if (!meeting) {
      return res.status(400).json({ error: 'Meeting not found' });
    }

    await axios.post(`https://us-west-2.recall.ai/api/v1/bot/${meeting.botId}/leave_call`, {}, { headers });

    const summary = await getSummary(formatTranscript(meeting.transcript)); // Await the summary here

    meeting.status = 'Stopped';
    meeting.summary = summary; 
    await meeting.save();

    return res.status(200).json({ message: "Recording Stopped ", summary: summary }); // Return the summary
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: "Server Error" });
  }
};

function formatTranscript(transcript) {
  var formattedTranscript="";
  let currentSpeaker = null;
  let currentSentence = '';

  transcript.forEach(sentence => {
    if (sentence.speaker !== currentSpeaker) {

      if (currentSpeaker !== null) {
        formattedTranscript=formattedTranscript + `${currentSpeaker}: ${currentSentence.trim()}`;
        currentSentence = ''; 
      }
      currentSpeaker = sentence.speaker;
    }

    currentSentence += sentence.words.map(word => word.text).join(" ");
  });

  if (currentSpeaker !== null) {
    formattedTranscript=formattedTranscript + `${currentSpeaker}: ${currentSentence.trim()}`;
  }
console.log(formattedTranscript)
  return formattedTranscript;
}

const getSummary = async (transcript, meetingId) => {
  const url = 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_API}`,
    'Content-Type': 'application/json'
  };
  const data = {
    'model': 'gpt-3.5-turbo',
    'messages': [
      { "role": "user", "content": `give me the summary of this meeting ${transcript}` }
    ]
  };

  try {
    const response = await axios.post(url, data, { headers });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.log(error);
    return null; // Return null or handle error accordingly
  }
}


const getUserMeetings=async (req,res)=>{
  try{
      const {userId}=req.body
      const meetings=await Meeting.find({userId})

      return res.status(200).json({
          status: "success",
          message: "Meetings retrieved",
          meetings
        }); 
  }catch(e){
      console.error(e);
    res.status(500).json({
      message: "Server Error!"
    });
  }
}

const getOneMeetings=async (req,res)=>{
  try{
      const meetingId=req.params.meetingId;
      console.log(meetingId);
      const meeting=await Meeting.findOne({_id:meetingId})

      return res.status(200).json({
          status: "success",
          message: "Meeting retrieved",
          meeting
        }); 
  }catch(e){
      console.error(e);
    res.status(500).json({
      message: "Server Error!"
    });
  }
}

module.exports = {
  startRecording,createMeeting,stopRecording,getUserMeetings,getOneMeetings
};
