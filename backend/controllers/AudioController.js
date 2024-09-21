const { default: axios } = require("axios");
const Audio = require("../models/AudioModel");
const Counter = require("../models/CounterModel");
const Template = require("../models/TemplateModel");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const FormData = require("form-data");
const { PassThrough } = require("stream");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const OpenAI = require("openai");
const ClientRecord = require("../models/ClientRecordModel");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API });

const addAudio = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const template = await Template.findOne({ id: req.body.templateId });
    if (!template) {
      return res.status(400).json({ message: "Template not found!" });
    }

    const form = new FormData();
    form.append("file", file.buffer, { filename: "audio.mp3" });
    form.append("model", "whisper-1");

    const formHeaders = form.getHeaders();

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          ...formHeaders,
          Authorization: `Bearer ${process.env.OPENAI_API}`,
        },
      }
    );

    const transcription = response.data;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI assistant tasked with formatting transcriptions. The following text is a transcription of a conversation between two speakers. Please format the text so that each speaker's lines are labeled as 'Consultant:' or 'Client:' with the exact text provided. Do not add any additional content or context. Transcription text: ${transcription.text}`,
        },
      ],
      model: "gpt-4o",
    });

    const formattedTranscription = completion.choices[0].message.content;

    const counter = await Counter.findOneAndUpdate(
      { id: "autovalClientRecord" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const audio = new ClientRecord({
      id: counter.seq,
      transcription: formattedTranscription,
      type: "inPerson",
      note: [
        {
          templateId: req.body.templateId,
          templateName: template.name,
        },
      ],
      ...req.body,
    });

    console.log(formattedTranscription);

    await audio.save();

    return res.status(201).json({
      status: "success",
      message: "Added Audio",
      audio,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server Error!" });
  }
};

const recallFetch = async (audioUrl) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `${process.env.ASSEMBLY_API_TOKEN}`,
  };

  const reqBody = {
    audio_url: audioUrl,
    speaker_labels: true,
    speakers_expected: 2,
    webhook_url: `${process.env.PUBLIC_URL}/transcribe`,
  };

  const res = await axios
    .post(`https://api.assemblyai.com/v2/transcript`, reqBody, {
      headers,
    })
    .catch((err) => console.log(err));

  return res.data;
};

const getUserAudios = async (req, res) => {
  try {
    const { userId } = req.body;
    const audios = await Audio.find({ userId });

    return res.status(200).json({
      status: "success",
      message: "Audios retrieved",
      audios,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

const getOneAudio = async (req, res) => {
  try {
    const { audioId } = req.body;
    const audio = await Audio.findOne({ _id: audioId });

    return res.status(200).json({
      status: "success",
      message: "Audio retrieved",
      audio,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

module.exports = {
  addAudio,
  getOneAudio,
  getUserAudios,
};
