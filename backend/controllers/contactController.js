const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await prisma.contactAttempt.findMany({
      include: { patient: true },
      orderBy: { contact_time: "desc" },
    });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to load contact attempts" });
  }
};

exports.logContact = async (req, res) => {
  const { patientId, method, comment } = req.body;

  if (!patientId || !method) {
    return res.status(400).json({ error: "patientId and method are required" });
  }

  try {
    const attempt = await prisma.contactAttempt.create({
      data: {
        patientId,
        method,
        comment,
      },
    });
    res.status(201).json(attempt);
  } catch (error) {
    console.error("Error logging contact attempt:", error);
    res.status(500).json({ error: "Failed to log contact attempt" });
  }
};
