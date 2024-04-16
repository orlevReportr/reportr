const { default: axios } = require("axios");
const Audio = require("../models/AudioModel");
const Counter = require("../models/CounterModel");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const addAudio = async (req, res) => {
  try {
    const { audioTitle, userId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }
    const counter = await Counter.findOneAndUpdate(
      { id: "autovalAudio" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    console.log(file.path);
    cloudinary.uploader
      .upload(file.path, {
        resource_type: "video",
      })
      .then(async (result) => {
        console.log("object uploaded successfully")
        const bot = await recallFetch(result.secure_url);

        const audio = new Audio({
          id: counter.seq,
          audioTitle,
          userId,
          audioPath: file.path,
          botId: bot.id,
        });

        await audio.save();

        res.status(201).json({
          status: "success",
          message: "Added Audio",
          audio,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "error" });
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

  const res = await axios.post(
    `https://api.assemblyai.com/v2/transcript`,
    reqBody,
    {
      headers,
    }
  ).catch(err =>console.log(err));

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
