-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birthdate" DATETIME NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp_number" TEXT,
    "preferred_times" TEXT NOT NULL,
    "preferred_language" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "AppointmentType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "default_duration" INTEGER NOT NULL,
    "default_priority" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "specialization" TEXT
);

-- CreateTable
CREATE TABLE "TriageRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentTypeId" TEXT NOT NULL,
    "pain" BOOLEAN NOT NULL,
    "broken_tooth" BOOLEAN NOT NULL,
    "swelling" BOOLEAN NOT NULL,
    "sensitive_temp" BOOLEAN NOT NULL,
    "existing_patient" BOOLEAN NOT NULL,
    "calculated_priority" INTEGER NOT NULL,
    CONSTRAINT "TriageRule_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "AppointmentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaitingList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "appointmentTypeId" TEXT NOT NULL,
    "providers_needed" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "comments" TEXT,
    "pain_level" TEXT,
    "swelling" BOOLEAN NOT NULL DEFAULT false,
    "preferredTimeUnavailable" BOOLEAN NOT NULL DEFAULT false,
    "existing_patient" BOOLEAN NOT NULL DEFAULT false,
    "manual_priority_override" INTEGER,
    CONSTRAINT "WaitingList_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WaitingList_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "AppointmentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "contact_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,
    CONSTRAINT "ContactAttempt_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppointmentLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "waitingListId" TEXT NOT NULL,
    "fulfilled_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_time" DATETIME NOT NULL,
    "notes" TEXT,
    CONSTRAINT "AppointmentLog_waitingListId_fkey" FOREIGN KEY ("waitingListId") REFERENCES "WaitingList" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentType_name_key" ON "AppointmentType"("name");
