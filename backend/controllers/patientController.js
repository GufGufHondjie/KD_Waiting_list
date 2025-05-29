// backend/controllers/patientController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { created_at: "desc" },
    });
    res.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Failed to load patients" });
  }
};

exports.createPatient = async (req, res) => {
  const {
    first_name,
    last_name,
    birthdate,
    phone,
    whatsapp_number,
    preferred_times,
    preferred_language,
    notes,
  } = req.body;

  try {
    const newPatient = await prisma.patient.create({
      data: {
        first_name,
        last_name,
        birthdate: new Date(birthdate),
        phone,
        whatsapp_number,
        preferred_times: JSON.stringify(preferred_times || []),
        preferred_language,
        notes,
      },
    });
    res.status(201).json(newPatient);
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
};

exports.getContactAttemptCount = async (req, res) => {
  const { id } = req.params;

  try {
    const count = await prisma.contactAttempt.count({
      where: { patientId: id },
    });

    res.json({ patientId: id, attempts: count });
  } catch (error) {
    console.error("Error counting attempts:", error);
    res.status(500).json({ error: "Failed to count contact attempts" });
  }
};
