const express = require("express");
const router = express.Router();

const {
  startRecording,
  createClientRecord,
  stopRecording,
  getUserClientRecords,
  getOneClientRecord,
} = require("../controllers/ClientRecordController");

router.post("/add", createClientRecord);
router.post("/get", getUserClientRecords);
router.post("/", getOneClientRecord);

router.post("/start-recording", startRecording);
router.post("/stop-recording", stopRecording);

module.exports = router;
