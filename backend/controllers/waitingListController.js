const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getWaitingList = async (req, res) => {
  try {
    // Fetch entries and include related patient data
    const entries = await prisma.waitingList.findMany({
      include: {
        patient: true,
        appointment_type: true,
        triage: true,
      },
      orderBy: { created_at: "asc" },
    });

    // Fetch all contact attempts grouped by patient
    const allAttempts = await prisma.contactAttempt.findMany();

    // Count attempts per patientId
    const attemptsMap = allAttempts.reduce((acc, attempt) => {
      acc[attempt.patientId] = (acc[attempt.patientId] || 0) + 1;
      return acc;
    }, {});

    // Auto-adjust priority for unreachable patients
    const adjustedEntries = entries.map(entry => {
      const attemptCount = attemptsMap[entry.patientId] || 0;
      const adjustedPriority = attemptCount >= 3 ? entry.priority + 3 : entry.priority;
      return {
        ...entry,
        contactAttempts: attemptCount,
        effectivePriority: adjustedPriority
      };
    });

    // Sort by adjusted priority
    adjustedEntries.sort((a, b) => a.effectivePriority - b.effectivePriority);

    res.json(adjustedEntries);
  } catch (error) {
    console.error("Error loading waiting list:", error);
    res.status(500).json({ error: "Failed to load waiting list" });
  }
};

exports.addToWaitingList = async (req, res) => {
  const {
    patientId,
    appointmentTypeId,
    providers_needed,
    duration,
    status,
    priority,
    triageId,
    comments,
  } = req.body;

  try {
    const entry = await prisma.waitingList.create({
      data: {
        patientId,
        appointmentTypeId,
        providers_needed: JSON.stringify(providers_needed || []),
        duration,
        status,
        priority,
        triageId,
        comments,
      },
    });
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error adding to waiting list:", error);
    res.status(500).json({ error: "Failed to add entry" });
  }
};
