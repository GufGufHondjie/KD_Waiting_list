# 📘 Prisma Local Appointment App - Documentation

## Overview
This Prisma schema defines the full local data model for your dental practice's appointment and emergency scheduling tool. It is optimized for local-first use with SQLite and is easily extendable.

---

## 🧱 Data Models

### 🧑‍⚕️ Patient
Stores core patient information and preferences.

| Field              | Type      | Notes                                      |
|-------------------|-----------|--------------------------------------------|
| `id`              | String    | UUID Primary Key                           |
| `first_name`      | String    |                                            |
| `last_name`       | String    |                                            |
| `birthdate`       | DateTime  |                                            |
| `phone`           | String    |                                            |
| `whatsapp_number` | String?   | Optional                                   |
| `preferred_times` | String    | JSON-encoded array of preferred time slots |
| `preferred_language` | String? | e.g. "en", "es", "nl", "de"                |
| `created_at`      | DateTime  | Auto-generated                             |
| `notes`           | String?   | Freeform comment field                     |

---

### 📅 WaitingList
Tracks appointment change requests and emergency entries.

| Field              | Type      | Notes                                              |
|-------------------|-----------|----------------------------------------------------|
| `id`              | String    | UUID Primary Key                                   |
| `patientId`       | String    | FK → `Patient.id`                                  |
| `appointmentTypeId` | String  | FK → `AppointmentType.id`                          |
| `providers_needed`| String    | JSON-encoded array of roles (e.g. Dentist, Hygienist) |
| `duration`        | Int       | In minutes                                         |
| `created_at`      | DateTime  | Auto-generated                                     |
| `status`          | String    | "open", "scheduled", "cancelled", etc.            |
| `priority`        | Int       | Used for triage sorting                           |
| `triageId`        | String?   | Optional FK → `TriageRule.id`                      |
| `comments`        | String?   | Freeform                                           |

---

### 📤 AppointmentLog
Tracks successful appointment fulfillment for audit/history.

| Field              | Type      | Notes                              |
|-------------------|-----------|------------------------------------|
| `id`              | String    | UUID Primary Key                   |
| `waitingListId`   | String    | FK → `WaitingList.id`              |
| `scheduled_time`  | DateTime  | When the appointment is scheduled  |
| `fulfilled_at`    | DateTime  | Auto-timestamp of fulfillment time |
| `notes`           | String?   | Optional comments                  |

---

### 📇 ContactAttempt
Tracks calls, WhatsApp messages, or emails to a patient.

| Field              | Type      | Notes                               |
|-------------------|-----------|-------------------------------------|
| `id`              | String    | UUID Primary Key                    |
| `patientId`       | String    | FK → `Patient.id`                   |
| `method`          | String    | "phone", "whatsapp", or "email"     |
| `contact_time`    | DateTime  | Auto-generated                      |
| `comment`         | String?   | Optional notes                      |

**Use this table to calculate `attempts_count` for each patient in the UI.**

---

### 🛠️ AppointmentType
Predefined list of appointment categories.

| Field              | Type      | Notes                                |
|-------------------|-----------|--------------------------------------|
| `id`              | String    | UUID Primary Key                     |
| `name`            | String    | Must be unique (e.g. “Checkup”)      |
| `default_duration`| Int       | In minutes                           |
| `default_priority`| Int       | Base priority                        |

---

### 🚑 TriageRule
Used to auto-prioritize emergencies based on standard inputs.

| Field               | Type      | Notes                      |
|--------------------|-----------|----------------------------|
| `id`               | String    | UUID Primary Key           |
| `appointmentTypeId`| String    | FK → `AppointmentType.id`  |
| `pain`             | Boolean   |                            |
| `broken_tooth`     | Boolean   |                            |
| `swelling`         | Boolean   |                            |
| `sensitive_temp`   | Boolean   |                            |
| `existing_patient` | Boolean   |                            |
| `calculated_priority` | Int   | Resulting triage score     |

---

### 🧑‍⚕️ Provider
Tracks dental providers for scheduling and filtering.

| Field              | Type      | Notes                      |
|-------------------|-----------|----------------------------|
| `id`              | String    | UUID Primary Key           |
| `name`            | String    |                            |
| `specialization`  | String?   | e.g., “Endodontics”        |

---

## 🔗 Relationships Summary

- **Patient** ⟶ has many **WaitingList**, **ContactAttempts**
- **WaitingList** ⟶ belongs to **Patient**, **AppointmentType**, optionally **TriageRule**
- **WaitingList** ⟶ has many **AppointmentLog**
- **AppointmentType** ⟶ has many **TriageRule**, **WaitingList**
- **TriageRule** ⟶ can link to many **WaitingList**
- **Provider** is currently standalone (can later be tied to Appointments directly)

---

## 🛠️ Setup Instructions

### 1. Install Prisma

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
