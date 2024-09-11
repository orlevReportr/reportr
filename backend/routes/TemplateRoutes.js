const express = require("express");
const router = express.Router();

const {
  updateTemplate,
  addTemplate,
  getUserTemplates,
  deleteTemplate,
} = require("../controllers/TemplateController");

router.post("/add", addTemplate);
router.post("/get", getUserTemplates);
router.post("/edit/:templateId", updateTemplate);
router.post("/delete", deleteTemplate);
module.exports = router;
