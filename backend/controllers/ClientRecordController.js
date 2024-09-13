const ClientRecord = require("../models/ClientRecordModel");
const Counter = require("../models/CounterModel");
const axios = require("axios");
const { getSummary, getFormattedSummary } = require("../utils/getSummary");

const createClientRecord = async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { id: "autovalClientRecord" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const clientRecord = new ClientRecord({
      id: counter.seq,
      status: "Waiting",
      ...req.body,
    });

    await clientRecord.save();

    res.status(201).json({
      status: "success",
      message: "Added ClientRecord",
      clientRecord: clientRecord,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error!" });
  }
};

const startRecording = async (req, res) => {
  try {
    const { clientRecordId } = req.body;
    const clientRecord = await ClientRecord.findOne({ id: clientRecordId });
    if (!clientRecord) {
      return res.status(400).json({ error: "ClientRecord not found" });
    }
    clientRecord.clientRecordStartTime = new Date();

    const bot = await recallFetch(clientRecord.meetingUrl);

    clientRecord.botId = bot.id;
    clientRecord.status = "Started";
    await clientRecord.save();
    return res.json({
      botId: bot.id,
    });
  } catch (e) {
    console.log(e.response);

    console.log("lala");
    return res.status(500).json({ error: "Server Error!" });
  }
};

const recallFetch = async (meetingUrl) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Token ${process.env.RECALL_API_TOKEN}`,
  };

  const reqBody = {
    bot_name: `${process.env.BOT_NAME}`,
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
    teams: {
      login_required: true,
    },
  };

  const res = await axios.post(
    `https://us-west-2.recall.ai/api/v1/bot`,
    reqBody,
    {
      headers,
    }
  );
  return res.data;
};

const stopRecording = async (req, res) => {
  try {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Token ${process.env.RECALL_API_TOKEN}`,
    };
    const { clientRecordId } = req.body;
    const clientRecord = await ClientRecord.findOne({ id: clientRecordId });
    if (!clientRecord) {
      return res.status(400).json({ error: "ClientRecord not found" });
    }
    console.log(clientRecord);
    await axios.post(
      `https://us-west-2.recall.ai/api/v1/bot/${clientRecord.botId}/leave_call`,
      {},
      { headers }
    );
    clientRecord.clientRecordEndTime = new Date();
    const transcript = formatTranscript(clientRecord.transcript);
    clientRecord.formattedTranscript = transcript;
    const summary = await getSummary(transcript);
    const formattedSummary = await getFormattedSummary(transcript);

    clientRecord.status = "Stopped";
    clientRecord.formattedSummary = formattedSummary;
    clientRecord.summary = summary;
    await clientRecord.save();

    return res
      .status(200)
      .json({ message: "Recording Stopped ", summary: summary }); // Return the summary
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Server Error" });
  }
};

function formatTranscript(transcript) {
  var formattedTranscript = "";
  let currentSpeaker = null;
  let currentSentence = "";

  transcript.forEach((sentence) => {
    if (sentence.speaker !== currentSpeaker) {
      if (currentSpeaker !== null) {
        formattedTranscript =
          formattedTranscript + `${currentSpeaker}: ${currentSentence.trim()}`;
        currentSentence = "";
      }
      currentSpeaker = sentence.speaker;
    }

    currentSentence += sentence.words.map((word) => word.text).join(" ");
  });

  if (currentSpeaker !== null) {
    formattedTranscript =
      formattedTranscript + `${currentSpeaker}: ${currentSentence.trim()}`;
  }
  console.log(formattedTranscript);
  return formattedTranscript;
}

const getUserClientRecords = async (req, res) => {
  try {
    const { userId } = req.body;
    const clientRecords = await ClientRecord.find({ userId });

    return res.status(200).json({
      status: "success",
      message: "ClientRecords retrieved",
      clientRecords,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

const getOneClientRecord = async (req, res) => {
  try {
    const { clientRecordId } = req.body;
    const clientRecord = await ClientRecord.findOne({ _id: clientRecordId });

    return res.status(200).json({
      status: "success",
      message: "ClientRecord retrieved",
      clientRecord,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

module.exports = {
  startRecording,
  createClientRecord,
  stopRecording,
  getUserClientRecords,
  getOneClientRecord,
};
