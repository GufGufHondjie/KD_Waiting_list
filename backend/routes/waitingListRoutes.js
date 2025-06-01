// backend/routes/waitingListRoutes.js

const express = require("express");
const router = express.Router();
const waitingListController = require("../controllers/waitingListController");

// Get full waiting list
router.get("/", waitingListController.getWaitingList);

// Add new entry with triage processing
router.post("/", waitingListController.addToWaitingListWithTriage);

module.exports = router;
