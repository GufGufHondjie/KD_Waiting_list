const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.get("/", contactController.getAllContacts);
router.post("/", contactController.logContact);

module.exports = router;
