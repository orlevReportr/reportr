const express = require("express");
const router = express.Router();

const {
  updateTemplate,
  addTemplate,
  getUserTemplates,
  deleteTemplate,
  setUserDefaultTemplate,
} = require("../controllers/TemplateController");

router.post("/add", addTemplate);
router.post("/get", getUserTemplates);
router.post("/edit/:templateId", updateTemplate);
router.post("/delete", deleteTemplate);
router.post("/set-default", setUserDefaultTemplate);
module.exports = router;
