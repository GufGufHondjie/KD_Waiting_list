/*
  Warnings:

  - You are about to drop the column `broken_tooth` on the `TriageRule` table. All the data in the column will be lost.
  - You are about to drop the column `pain` on the `TriageRule` table. All the data in the column will be lost.
  - You are about to drop the column `sensitive_temp` on the `TriageRule` table. All the data in the column will be lost.
  - You are about to drop the column `swelling` on the `TriageRule` table. All the data in the column will be lost.
  - You are about to drop the column `existing_patient` on the `WaitingList` table. All the data in the column will be lost.
  - You are about to drop the column `manual_priority_override` on the `WaitingList` table. All the data in the column will be lost.
  - You are about to drop the column `pain_level` on the `WaitingList` table. All the data in the column will be lost.
  - You are about to drop the column `preferredTimeUnavailable` on the `WaitingList` table. All the data in the column will be lost.
  - You are about to drop the column `swelling` on the `WaitingList` table. All the data in the column will be lost.
  - Added the required column `fever_present` to the `TriageRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pain_level` to the `TriageRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `request_to_bring_forward` to the `TriageRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swelling_present` to the `TriageRule` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TriageRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentTypeId" TEXT NOT NULL,
    "pain_level" TEXT NOT NULL,
    "swelling_present" BOOLEAN NOT NULL,
    "fever_present" BOOLEAN NOT NULL,
    "existing_patient" BOOLEAN NOT NULL,
    "request_to_bring_forward" BOOLEAN NOT NULL,
    "calculated_priority" INTEGER NOT NULL,
    CONSTRAINT "TriageRule_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "AppointmentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TriageRule" ("appointmentTypeId", "calculated_priority", "existing_patient", "id") SELECT "appointmentTypeId", "calculated_priority", "existing_patient", "id" FROM "TriageRule";
DROP TABLE "TriageRule";
ALTER TABLE "new_TriageRule" RENAME TO "TriageRule";
CREATE TABLE "new_WaitingList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "appointmentTypeId" TEXT NOT NULL,
    "providers_needed" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "comments" TEXT,
    CONSTRAINT "WaitingList_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WaitingList_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "AppointmentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WaitingList" ("appointmentTypeId", "comments", "created_at", "duration", "id", "patientId", "priority", "providers_needed", "status") SELECT "appointmentTypeId", "comments", "created_at", "duration", "id", "patientId", "priority", "providers_needed", "status" FROM "WaitingList";
DROP TABLE "WaitingList";
ALTER TABLE "new_WaitingList" RENAME TO "WaitingList";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
