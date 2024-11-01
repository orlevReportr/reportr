const mongoose = require("mongoose");

const TemplateSchema = mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    templateTitle: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["ReportAI", "Custom"],
      required: true,
      default: "Custom",
    },
    userId: {
      type: Number,
    },
    content: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", TemplateSchema);

module.exports = Template;
