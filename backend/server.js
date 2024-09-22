const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const socket = require("socket.io");
const Counter = require("./models/CounterModel");

const ClientRecord = require("./models/ClientRecordModel");
const Audio = require("./models/AudioModel");
const { getSummary, getFormattedSummary } = require("./utils/getSummary");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only this origin
    methods: ["GET", "POST"], // Specify allowed methods if needed
    credentials: true, // Include cookies in the request if needed
  })
);
app.use(bodyParser.json());
const _dirname = path.dirname("");
const buildPath = path.join(_dirname, "../frontend/dist");

app.use(express.static(buildPath));

app.post("/webhook2", async (req, res) => {
  console.log(req.body);
  if (req.body.event === "calendar.sync_events") {
    const calendar = await Calendar.findOne({
      recallId: req.body.data.calendar_id,
    });

    const userId = calendar.userId;
    let eventsResponse;
    try {
      eventsResponse = await axios.get(
        `${process.env.RECALL_API_URL}/api/v2/calendar-events/?calendar_id=${req.body.data.calendar_id}&is_deleted=false`,
        {
          headers: {
            accept: "application/json",
            Authorization: `${process.env.RECALL_API_TOKEN}`, // Use Bearer scheme with environment token
          },
        }
      );
    } catch (error) {
      console.log("error");
      console.log(error);
      return res.status(500).json({
        message: "Recall error",
      });
    }

    console.log(eventsResponse.data.results.length);

    for (let i = 0; i < eventsResponse.data.results.length; i++) {
      const event = eventsResponse.data.results[i];
      const scheduledBot = await axios
        .post(
          `${process.env.RECALL_API_URL}/api/v2/calendar-events/${event.id}/bot/`,
          {
            deduplication_key: `${event.start_time}-${event.meeting_url}`,
            bot_config: {
              bot_name: `${process.env.BOT_NAME}`,
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
              teams: {
                login_required: true,
              },
            },
          },
          {
            headers: {
              accept: "application/json",
              Authorization: `${process.env.RECALL_API_TOKEN}`,
              "content-type": "application/json",
            },
          }
        )
        .then(async (response) => {
          console.log("scheduled bot");
          console.log(response.data);

          const counter = await Counter.findOneAndUpdate(
            { id: "autovalClientRecord" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
          );
          const currentClientRecord = await ClientRecord.findOne({
            botId: response.data.bots[0].bot_id,
          });
          if (currentClientRecord) {
            return;
          }
          const clientRecord = new ClientRecord({
            id: counter.seq,
            status: "Waiting",
            clientName: `Client ${counter.seq}`,
            type: "online",
            meetingUrl: response.data.meeting_url,
            botId: response.data.bots[0].bot_id,
            userId,
          });

          await clientRecord.save();
        })
        .catch((err) => {
          console.log(err?.response?.data?.errors || err);
        });
    }
  }
});

app.post("/transcribe", async (req, res) => {
  if (req.body.status === "completed") {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `${process.env.ASSEMBLY_API_TOKEN}`,
    };
    await axios
      .get(
        `https://api.assemblyai.com/v2/transcript/${req.body.transcript_id}`,
        {
          headers,
        }
      )
      .then(async (response) => {
        const audio = await Audio.findOne({ botId: req.body.transcript_id });
        if (audio.status === "processing") {
          console.log("audio already processing");
          return;
        }
        audio.status = "processing";
        await audio.save();
        audio.utterances = response.data.utterances;
        if (!audio.summary || audio.summary === "") {
          console.log("started transcripting");
          const transcript = formatTranscript(response.data.utterances);
          audio.formattedTranscript = transcript;
          audio.summary = await getSummary(transcript);
          audio.formattedSummary = await getFormattedSummary(transcript);
        }
        await audio.save();
      })
      .catch((err) => {
        console.log(err);
        console.log("catched error!");
      });
  } else {
    console.log(req.body.transcript_id + "other status");
  }
});

function formatTranscript(utterances) {
  var formattedTranscript = "";

  utterances.forEach((utterance) => {
    formattedTranscript =
      formattedTranscript +
      `Speaker ${utterance.speaker}: ${utterance.text}` +
      "\n";
  });

  return formattedTranscript;
}

app.post("/transcription", async (req, res) => {
  try {
    const botId = req.body.data.bot_id;
    const words = req.body.data.transcript.words;
    const combinedText = words.map((word) => word.text).join(" ");

    console.log(`Received transcript for bot ID: ${botId}`);
    console.log(`Transcript: ${combinedText}`);

    const clientRecord = await ClientRecord.findOne({ botId });

    if (!clientRecord) {
      console.log("ClientRecord not found for the provided bot ID.");
      return res
        .status(404)
        .json({ success: false, message: "ClientRecord not found" });
    }

    const transcriptionData = {
      original_transcript_id: req.body.data.transcript.original_transcript_id,
      speaker: req.body.data.transcript.speaker,
      speaker_id: req.body.data.transcript.speaker_id,
      words: req.body.data.transcript.words,
      is_final: req.body.data.transcript.is_final,
      language: req.body.data.transcript.language,
      source: req.body.data.transcript.source,
    };
    clientRecord.transcript.push(transcriptionData);

    // Save the updated clientRecord
    await clientRecord.save();

    io.to(botId.toString()).emit("transcriptionAdded", transcriptionData);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing transcription:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const ClientRecordRouter = require("./routes/ClientRecordRoutes");
app.use("/clientRecord", ClientRecordRouter);

const UserRouter = require("./routes/UserRoutes");
app.use("/user", UserRouter);

const AudioRouter = require("./routes/AudioRoutes");
app.use("/audio", AudioRouter);

const TemplateRouter = require("./routes/TemplateRoutes");
app.use("/template", TemplateRouter);

const OauthRouter = require("./routes/OauthRoutes");
const Calendar = require("./models/CalendarModel");
app.use("/oauth", OauthRouter);

mongoose.connect(process.env.DBURI);

const db = mongoose.connection;
db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.get("/*", function (req, res) {
  res.sendFile(
    path.join(__dirname, "../frontend/dist/index.html"),
    function (err) {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }
    }
  );
});
// Start the server
const server = app.listen(process.env.PORT, () => {
  console.log(`server started on port ${process.env.PORT}`);
});

const io = socket(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  socket.on("joinBot", (botId) => {
    socket.join(botId.toString());
  });

  socket.on("addTranscription", async (data) => {
    const botId = data.botId.toString();
    io.to(botId).emit("transcriptionAdded", data.transcription);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
