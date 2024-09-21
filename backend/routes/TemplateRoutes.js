const express = require("express");
const router = express.Router();

const {
  updateTemplate,
  addTemplate,
  getUserTemplates,
  deleteTemplate,
  setUserDefaultTemplate,
  generateSummary,
} = require("../controllers/TemplateController");

router.post("/add", addTemplate);
router.post("/get", getUserTemplates);
router.post("/edit/:templateId", updateTemplate);
router.post("/delete", deleteTemplate);
router.post("/set-default", setUserDefaultTemplate);
router.post("/summary", generateSummary);
module.exports = router;
