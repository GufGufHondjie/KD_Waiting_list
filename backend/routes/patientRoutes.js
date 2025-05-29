// backend/routes/patientRoutes.js

const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

router.get("/", patientController.getAllPatients);
router.post("/", patientController.createPatient);
router.get("/:id/attempts-count", patientController.getContactAttemptCount);

module.exports = router;
