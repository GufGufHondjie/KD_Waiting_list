/*
  Warnings:

  - You are about to drop the column `whatsapp_number` on the `Patient` table. All the data in the column will be lost.
  - You are about to alter the column `preferred_times` on the `Patient` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `providers_needed` on the `WaitingList` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birthdate" DATETIME NOT NULL,
    "phone" TEXT NOT NULL,
    "has_whatsapp" BOOLEAN DEFAULT false,
    "preferred_times" JSONB NOT NULL,
    "preferred_language" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT
);
INSERT INTO "new_Patient" ("birthdate", "created_at", "first_name", "id", "last_name", "notes", "phone", "preferred_language", "preferred_times") SELECT "birthdate", "created_at", "first_name", "id", "last_name", "notes", "phone", "preferred_language", "preferred_times" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE TABLE "new_WaitingList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "appointmentTypeId" TEXT NOT NULL,
    "providers_needed" JSONB NOT NULL,
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
