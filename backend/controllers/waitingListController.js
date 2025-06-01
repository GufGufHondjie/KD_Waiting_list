const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ Fetch the full waiting list with adjusted priorities
exports.getWaitingList = async (req, res) => {
  try {
    const entries = await prisma.waitingList.findMany({
      include: {
        patient: true,
        appointment_type: true,
      },
      orderBy: { created_at: "asc" },
    });

    const allAttempts = await prisma.contactAttempt.findMany();
    const attemptsMap = allAttempts.reduce((acc, attempt) => {
      acc[attempt.patientId] = (acc[attempt.patientId] || 0) + 1;
      return acc;
    }, {});

    const adjustedEntries = entries.map((entry) => {
      const attemptCount = attemptsMap[entry.patientId] || 0;
      const adjustedPriority = attemptCount >= 3 ? entry.priority + 3 : entry.priority;

      return {
        ...entry,
        contactAttempts: attemptCount,
        effectivePriority: adjustedPriority,
      };
    });

    adjustedEntries.sort((a, b) => a.effectivePriority - b.effectivePriority);

    res.json(adjustedEntries);
  } catch (error) {
    console.error("Error loading waiting list:", error);
    res.status(500).json({ error: "Failed to load waiting list" });
  }
};

// ✅ Add a new entry with embedded triage logic
exports.addToWaitingListWithTriage = async (req, res) => {
  const {
    patientId,
    appointmentTypeId,
    providers_needed,
    duration,
    status,
    comments,
    triage = {},
  } = req.body;

  const {
    pain_level = "none",
    swelling_present = false,
    fever_present = false,
    existing_patient = false,
    request_to_bring_forward = false,
  } = triage;

  try {
    const painScores = {
      none: 0,
      sensitive: 1,
      pain: 2,
      lot: 3,
    };

    const painScore = painScores[pain_level];
    if (painScore === undefined) {
      throw new Error(`Invalid pain_level: "${pain_level}"`);
    }

    let score = painScore;
    if (swelling_present) score += 2;
    if (fever_present) score += 2;
    if (existing_patient) score += 1;
    if (request_to_bring_forward) score += 1;

    console.log("[DEBUG] Triage Score:", score);

    // Save triage rule record
    const triageRule = await prisma.triageRule.create({
      data: {
        appointmentTypeId,
        pain_level,
        swelling_present,
        fever_present,
        existing_patient,
        request_to_bring_forward,
        calculated_priority: score,
      },
    });

    console.log("[DEBUG] TriageRule created:", triageRule.id);

    // Save waiting list entry
    const entry = await prisma.waitingList.create({
      data: {
        patientId,
        appointmentTypeId,
        providers_needed: JSON.stringify(providers_needed || []),
        duration,
        status,
        priority: score,
        comments,
      },
    });

    console.log("[DEBUG] WaitingList entry created:", entry.id);
    res.status(201).json(entry);
  } catch (error) {
    console.error("❌ Error adding triaged waiting list entry:", error);
    res.status(500).json({ error: error.message });
  }
};
