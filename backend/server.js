const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const Meeting = require("./models/MeetingModel");
const mongoose = require("mongoose");
const cors = require('cors');

dotenv.config();
const app = express();
const port = 5001;
app.use(cors());

app.use(bodyParser.json());

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


mongoose.connect(process.env.DBURI);

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
