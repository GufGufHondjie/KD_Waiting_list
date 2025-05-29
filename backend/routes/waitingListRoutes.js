const express = require("express");
const router = express.Router();
const waitingListController = require("../controllers/waitingListController");

router.get("/", waitingListController.getWaitingList);
router.post("/", waitingListController.addToWaitingList);

module.exports = router;
