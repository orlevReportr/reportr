const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");

const Meeting = require("./models/MeetingModel");
const Audio = require("./models/AudioModel");
const { getSummary,getFormattedSummary } = require('./utils/getSummary');
const mongoose = require("mongoose");
const cors = require('cors');
const path  = require('path')
const fs = require('fs');
const axios=require("axios")
dotenv.config();
const app = express();
const port = 5001;
app.use(cors());

app.use(bodyParser.json());
const _dirname = path.dirname("")
const buildPath = path.join(_dirname  , "../frontend/dist");

app.use(express.static(buildPath))


app.post('/transcribe', async (req, res) => {
  if(req.body.status==="completed"){

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `${process.env.ASSEMBLY_API_TOKEN}`,
    };
    await axios.get(`https://api.assemblyai.com/v2/transcript/${req.body.transcript_id}`,{
      headers
    }).then(async(response)=>{
      const audio=await Audio.findOne({botId:req.body.transcript_id})
      if(audio.status==="processing"){
        console.log("audio already processing")
        return;
      }
      audio.status="processing";
      await audio.save();
      audio.utterances=response.data.utterances
      if(!audio.summary || audio.summary===""){
        console.log("started transcripting")
        const transcript=formatTranscript(response.data.utterances)
        audio.formattedTranscript=transcript;
        audio.summary=await getSummary(transcript)
        audio.formattedSummary=await getFormattedSummary(transcript);

      }
      await audio.save();
    }).catch((err)=>{
      console.log(err)
      console.log("catched error!")
    })
  }else{
    console.log(req.body.transcript_id+"other status")

  }
});

function formatTranscript(utterances) {
  var formattedTranscript="";
  
  utterances.forEach((utterance)=>{
    formattedTranscript=formattedTranscript+`Speaker ${utterance.speaker}: ${utterance.text}`+"\n"
  });
  
  return formattedTranscript;
}

app.post('/transcription', async (req, res) => {
  try {
    const botId = req.body.data.bot_id;
    const words = req.body.data.transcript.words;
    const combinedText = words.map(word => word.text).join(' ');
    
    console.log(`Received transcript for bot ID: ${botId}`);
    console.log(`Transcript: ${combinedText}`);
    
    const meeting = await Meeting.findOne({ botId });

    if (!meeting) {
      console.log("Meeting not found for the provided bot ID.");
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    meeting.transcript.push({
      original_transcript_id: req.body.data.transcript.original_transcript_id,
      speaker: req.body.data.transcript.speaker,
      speaker_id: req.body.data.transcript.speaker_id,
      words: req.body.data.transcript.words,
      is_final: req.body.data.transcript.is_final,
      language: req.body.data.transcript.language,
      source: req.body.data.transcript.source
    });

    // Save the updated meeting
    await meeting.save();

    console.log("Transcript appended to the meeting.");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing transcription:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


const MeetingRouter = require("./routes/MeetingRoutes")
app.use("/meeting", MeetingRouter)

const UserRouter = require("./routes/UserRoutes")
app.use("/user", UserRouter)

const AudioRouter = require("./routes/AudioRoutes");
app.use("/audio", AudioRouter)


mongoose.connect(process.env.DBURI);

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});


app.get("/*", function(req, res){
  res.sendFile(
      path.join(__dirname, "../frontend/dist/index.html"),
      function (err) {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        }
      }
    );

})
// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
