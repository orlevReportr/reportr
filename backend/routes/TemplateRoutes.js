const express = require("express");
const router = express.Router();

const {
  updateTemplate,
  addTemplate,
  getUserTemplates,
  deleteTemplate,
  setUserDefaultTemplate,
  generateSummary,
  getReportAITemplates,
  getAllTemplates,
} = require("../controllers/TemplateController");

router.post("/add", addTemplate);
router.post("/get", getUserTemplates);
router.get("/get", getReportAITemplates);
router.post("/getAll", getAllTemplates);
router.post("/edit/:templateId", updateTemplate);
router.post("/delete", deleteTemplate);
router.post("/set-default", setUserDefaultTemplate);
router.post("/summary", generateSummary);
module.exports = router;
