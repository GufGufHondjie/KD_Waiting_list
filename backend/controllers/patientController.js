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

/**
 * Creates a new patient.
 * @param {import('express').Request} req - The Express request object.
 * @param {object} req.body - The request body.
 * @param {string} req.body.first_name - Patient's first name.
 * @param {string} req.body.last_name - Patient's last name.
 * @param {string} req.body.birthdate - Patient's birthdate (ISO string).
 * @param {string} req.body.phone - Patient's phone number.
 * @param {boolean} [req.body.has_whatsapp=false] - Whether the patient uses WhatsApp on the provided phone number.
 * @param {object} req.body.preferred_times - JSON object detailing preferred days (monday-friday) and times (morning/afternoon). Example: `{"monday": {"morning": true, "afternoon": false}}`.
 * @param {string} [req.body.preferred_language] - Preferred communication language (e.g., "PAP", "NL", "ES", "EN").
 * @param {string} [req.body.notes] - Optional notes about the patient.
 * @param {import('express').Response} res - The Express response object.
 */
exports.createPatient = async (req, res) => {
  const {
    first_name,
    last_name,
    birthdate,
    phone,
    has_whatsapp,
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
        has_whatsapp,
        preferred_times: preferred_times, // Prisma expects a JSON-compatible object for Json type
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
