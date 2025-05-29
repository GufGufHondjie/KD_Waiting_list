# 🦷 Dental Appointment Scheduler (Local Desktop App)

This is a fully local, desktop-based scheduling system built for dental clinics dealing with overbooked calendars and emergency requests. It replaces unmanageable Excel files with a real-time, triaged waiting list that helps staff prioritize and fill cancellations efficiently.

---

## 📦 Tech Stack

| Layer        | Tech                    |
|--------------|-------------------------|
| Frontend     | React + Electron        |
| Backend      | Node.js + Express       |
| Database     | Prisma ORM + SQLite     |
| UI/UX Dev    | Axios, HTML/CSS, JSX    |
| Desktop Mode | Electron (for offline use) |

---

## ✅ Features

- Patient registry with contact info and preferred times
- Smart waiting list with:
  - Appointment type
  - Required providers
  - Time duration
  - Priority score
- Contact tracking (phone/WhatsApp/email)
- Auto-deprioritization after 3 failed contact attempts
- Real-time view of entries sorted by urgency
- Desktop app interface (React + Electron)
- Fully local database (no cloud dependency)

---

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/waiting-list.git
cd waiting-list
npm install
cd frontend
npm install

# From the root of the project
npx prisma generate
npx prisma db push
node backend/index.js

# You can also view/edit data using
npx prisma studio
```
### 2. Start Frontend + Desktop App
```bash
cd frontend
npm start           # Start React Dev Server
npm run electron    # Launch Electron window
```
### 3. Folder structure

Waiting_list/
├── backend/                 # Express + Prisma backend
│   ├── controllers/         # API logic
│   ├── routes/              # API endpoints
│   └── index.js             # Entry point
├── frontend/                # React + Electron frontend
│   ├── src/                 # React components
│   ├── public/electron.js   # Electron entry
│   └── package.json
├── prisma/                  # Prisma schema + migrations
├── dev.db                   # Local SQLite DB
└── README.md

### 4. Environment Configuration

No special .env setup required for local use.

### 5. Future Enhancements

TBC

### 6. Developer Notes

-   contactAttempts and effectivePriority are injected into the waiting list from backend logic
-   All "preferred time" and "providers" fields are stored as JSON strings in SQLite
-   Avoid more than 3 contact attempts unless it’s urgent

### 7. License

MIT (feel free to adapt and improve for your own clinic)

### 8. Maintainer Notes

Created by Raf Bauduin (rafbauduin@hotmail.com) for a real-world Clinic
Reach out if you find this usefull