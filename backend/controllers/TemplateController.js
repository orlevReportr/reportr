const Counter = require("../models/CounterModel");
const Template = require("../models/TemplateModel");

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

module.exports = {
  getUserTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate,
};
