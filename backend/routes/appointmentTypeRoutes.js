const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const types = await prisma.appointmentType.findMany({
      orderBy: { name: "asc" },
    });
    res.json(types);
  } catch (err) {
    console.error("Error loading appointment types:", err);
    res.status(500).json({ error: "Failed to load appointment types" });
  }
});

module.exports = router;
