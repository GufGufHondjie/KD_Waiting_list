// backend/index.js

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("../node_modules/@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Base route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// TODO: Mount routes here (e.g., patients, waiting-list)

const patientRoutes = require("./routes/patientRoutes");
app.use("/patients", patientRoutes);

const waitingListRoutes = require("./routes/waitingListRoutes");
app.use("/waiting-list", waitingListRoutes);

const contactRoutes = require("./routes/contactRoutes");
app.use("/contacts", contactRoutes);

const appointmentTypeRoutes = require("./routes/appointmentTypeRoutes");
app.use("/appointment-types", appointmentTypeRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
