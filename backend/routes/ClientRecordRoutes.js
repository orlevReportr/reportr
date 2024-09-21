const express = require("express");
const router = express.Router();

const {
  startRecording,
  createClientRecord,
  stopRecording,
  getUserClientRecords,
  getOneClientRecord,
  createAndStartRecording,
  deleteOneClientRecord,
  addTemplateToClientRecord,
  updateNoteContent,
} = require("../controllers/ClientRecordController");

router.post("/add", createClientRecord);
router.post("/get", getUserClientRecords);
router.post("/getOne", getOneClientRecord);
router.post("/delete", deleteOneClientRecord);
router.post("/add-template", addTemplateToClientRecord);
router.post("/update-template", updateNoteContent);

router.post("/start-recording", startRecording);
router.post("/stop-recording", stopRecording);
router.post("/add-and-start", createAndStartRecording);

module.exports = router;
