const express = require("express");
const router = express.Router();

const {
  startRecording,
  createClientRecord,
  stopRecording,
  getUserClientRecords,
  getOneClientRecord,
  createAndStartRecording,
} = require("../controllers/ClientRecordController");

router.post("/add", createClientRecord);
router.post("/get", getUserClientRecords);
router.post("/", getOneClientRecord);

router.post("/start-recording", startRecording);
router.post("/stop-recording", stopRecording);
router.post("/add-and-start", createAndStartRecording);

module.exports = router;
