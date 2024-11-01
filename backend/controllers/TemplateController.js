const Counter = require("../models/CounterModel");
const Template = require("../models/TemplateModel");
const User = require("../models/UserModel");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API });
const fs = require('fs');
const path = require('path');

const addTemplate = async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { id: "autovalTemplate" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const template = new Template({
      id: counter.seq,
      ...req.body,
    });
    await template.save();
    res.status(201).json({
      status: "success",
      message: "Added Template",
      template,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server Error!" });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const updatedTemplate = await Template.findOneAndUpdate(
      { id: templateId },
      {
        ...req.body,
      },
      { new: true }
    );
    if (!updatedTemplate) {
      return res.status(404).json({ message: "Tempalte not found" });
    }

    res.status(200).json({
      message: "Te successfully updated",
      template: updatedTemplate,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.body;
    await Template.deleteOne({ id: templateId });
    res.status(200).json({
      status: "success",
      message: "Template deleted",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server Error!" });
  }
};

const getUserTemplates = async (req, res) => {
  try {
    const { userId } = req.body;
    const templates = await Template.find({ userId });

    return res.status(200).json({
      status: "success",
      message: "Templates retrieved",
      templates,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

const setUserDefaultTemplate = async (req, res) => {
  try {
    const { userId, templateId } = req.body;
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const template = await Template.findOne({ id: templateId });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    user.defaultTemplateId = templateId;
    template.isDefault = true;
    await template.save();
    await user.save();
    return res.status(200).json({ message: "Default template changed" });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

const generateSummary = async (req, res) => {
  try {
    const { content, transcriptionText } = req.body;

    // Read the prompt template from the file
    const promptFilePath = path.join(__dirname, '../', 'utils', 'prompts', 'promptNoExample.txt');
    let promptTemplate = fs.readFileSync(promptFilePath, 'utf8');

    // Replace placeholders in the prompt
    const prompt = promptTemplate
        .replace('{{TEMPLATE}}', content)
        .replace('{{TRANSCRIPTION}}', transcriptionText);

    console.log("-------------------------------PROMPT----------------------------------")
    console.log("Prompt: ", prompt)
    console.log("-------------------------------PROMPT----------------------------------")


    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      model: "gpt-4o",
    });

    const formattedTranscription = completion.choices[0].message.content;

    console.log("-------------------------------formattedTranscription----------------------------------")
    console.log("formattedTranscription: ", formattedTranscription)
    console.log("-------------------------------formattedTranscription----------------------------------")
    return res
      .status(200)
      .json({ message: "Summary generated", summary: formattedTranscription });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

const getReportAITemplates = async (req, res) => {
  try {
    const templates = await Template.find({ userId: -1 });

    return res.status(200).json({
      status: "success",
      message: "Templates retrieved",
      templates,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

const getAllTemplates = async (req, res) => {
  try {
    const { userId } = req.body;
    const templates = await Template.find({
      $or: [{ userId }, { userId: -1 }],
    });

    return res.status(200).json({
      status: "success",
      message: "Templates retrieved",
      templates,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

module.exports = {
  getUserTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  setUserDefaultTemplate,
  generateSummary,
  getReportAITemplates,
  getAllTemplates,
};
