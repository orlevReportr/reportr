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

    userId: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", TemplateSchema);

module.exports = Template;
