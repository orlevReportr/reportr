const mongoose = require("mongoose");

// Define the sub-schema for recallData
const RecallDataSchema = mongoose.Schema(
  {
    id: { type: String, required: true },
    oauth_client_id: { type: String, required: true },
    oauth_client_secret: { type: String, required: true },
    oauth_refresh_token: { type: String, required: true },
    platform: { type: String, required: true },
    webhook_url: { type: String, required: true },
    oauth_email: { type: String, default: null },
    platform_email: { type: String, default: null },
    status: { type: String, required: true },
    status_changes: { type: [Object], default: [] },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
  },
  { _id: false }
); // Disable _id for sub-schema

// Define the main schema
const CalendarSchema = mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    recallId: {
      type: String,
      required: true,
    },
    recallData: {
      type: RecallDataSchema, // Use the sub-schema
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Calendar = mongoose.model("Calendar", CalendarSchema);

module.exports = Calendar;
