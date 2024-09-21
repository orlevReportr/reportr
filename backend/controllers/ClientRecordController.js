const ClientRecord = require("../models/ClientRecordModel");
const Counter = require("../models/CounterModel");
const axios = require("axios");
const { getSummary, getFormattedSummary } = require("../utils/getSummary");
const Template = require("../models/TemplateModel");

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
      type: "online",
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

const createAndStartRecording = async (req, res) => {
  try {
    // Step 1: Create a new client record with auto-increment ID
    const { templateId } = req.body;
    const template = await Template.findOne({ id: templateId });

    if (!template) {
      return res.status(400).json({ error: "Template not found" });
    }

    const counter = await Counter.findOneAndUpdate(
      { id: "autovalClientRecord" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const clientRecord = new ClientRecord({
      id: counter.seq,
      status: "Waiting",
      type: "online",
      notes: [
        {
          templateId: templateId,
          templateName: template.templateTitle,
        },
      ],
      ...req.body,
    });

    await clientRecord.save();

    clientRecord.clientRecordStartTime = new Date();

    const bot = await recallFetch(clientRecord.meetingUrl);

    clientRecord.botId = bot.id;
    clientRecord.status = "Started";
    await clientRecord.save();

    return res.status(201).json({
      status: "success",
      message: "ClientRecord created and recording started",
      clientRecord: clientRecord,
      botId: bot.id,
    });
  } catch (error) {
    console.log(error);
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
    `${process.env.RECALL_API_URL}/api/v1/bot`,
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
    const { botId } = req.body;

    const clientRecord = await ClientRecord.findOne({ botId });
    if (!clientRecord) {
      return res.status(400).json({ error: "ClientRecord not found" });
    }
    await axios.post(
      `https://us-west-2.recall.ai/api/v1/bot/${clientRecord.botId}/leave_call`,
      {},
      { headers }
    );
    clientRecord.clientRecordEndTime = new Date();
    /*
    const transcript = formatTranscript(clientRecord.transcript);
    clientRecord.formattedTranscript = transcript;
    const summary = await getSummary(transcript);
    const formattedSummary = await getFormattedSummary(transcript);

    clientRecord.status = "Stopped";
    clientRecord.formattedSummary = formattedSummary;
    clientRecord.summary = summary;
    */
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

const deleteOneClientRecord = async (req, res) => {
  try {
    const { clientRecordId } = req.body;
    const clientRecord = await ClientRecord.findOneAndDelete({
      _id: clientRecordId,
    });
    return res.status(200).json({
      status: "success",
      message: "ClientRecord deleted",
      clientRecord,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

const addTemplateToClientRecord = async (req, res) => {
  try {
    const { clientRecordId, templateId } = req.body;

    // Find the template by id
    const template = await Template.findOne({ id: templateId });
    if (!template) {
      return res.status(400).json({ error: "Template not found" });
    }

    // Find the client record by id
    const clientRecord = await ClientRecord.findById(clientRecordId);
    if (!clientRecord) {
      return res.status(400).json({ error: "ClientRecord not found" });
    }

    // Add the template info to the notes array
    clientRecord.notes.push({
      templateId: templateId,
      templateName: template.templateTitle,
    });

    // Save the updated client record
    await clientRecord.save();

    return res.status(200).json({
      status: "success",
      message: "Template added to ClientRecord",
      clientRecord,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateNoteContent = async (req, res) => {
  try {
    const { clientRecordId, templateId, content: noteContent } = req.body;

    // Find the client record by id
    const clientRecord = await ClientRecord.findById(clientRecordId);
    if (!clientRecord) {
      return res.status(400).json({ error: "ClientRecord not found" });
    }

    // Find the note to update
    const noteToUpdate = clientRecord.notes.find(
      (note) => note.templateId === templateId
    );
    if (!noteToUpdate) {
      return res.status(400).json({ error: "Note not found" });
    }

    // Update the note content
    console.log(req.body);
    noteToUpdate.noteContent = noteContent;

    // Save the updated client record
    await clientRecord.save();

    return res.status(200).json({
      status: "success",
      message: "Note content updated successfully",
      clientRecord,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  startRecording,
  createClientRecord,
  stopRecording,
  getUserClientRecords,
  getOneClientRecord,
  createAndStartRecording,
  deleteOneClientRecord,
  addTemplateToClientRecord,
  updateNoteContent,
};
