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

    let transcription;
    try {
      const form = new FormData();
      form.append("file", file.buffer, { filename: "audio.mp3" });
      form.append("model", "whisper-1");

      const formStream = form.pipe(new PassThrough());

      transcription = await openai.audio.transcriptions.create({
        data: formStream,
        headers: form.getHeaders(),
      });
    } catch (transcriptionError) {
      console.error(transcriptionError);
      return res
        .status(500)
        .json({ error: "Failed to transcribe audio file!" });
    }

    const counter = await Counter.findOneAndUpdate(
      { id: "autovalAudio" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const audio = new Audio({
      id: counter.seq,
      transcription: transcription.data.text,
      ...req.body,
    });

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
