# 🖥️ System Health Monitoring Dashboard

A cross-platform utility and admin dashboard that helps monitor machine-level system health including:
- Disk encryption status
- OS update status
- Antivirus presence
- Sleep timeout
- And more...

## 🌐 Live Components

- **System Utility** (to be installed on each monitored machine)
- **Backend API** (`Express.js`)
- **Admin Dashboard** (`React.js + TailwindCSS`)

---

## 📦 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express
- **Data Handling:** In-memory (can be swapped with MongoDB/PostgreSQL)
- **Communication:** JSON API over HTTP

---

## ✨ Features

- System utility sends regular machine reports
- Real-time updates every 1 minute
- Color-coded UI for critical states
- REST API to fetch/report machine status
- Refresh button for instant sync

---

## 🗂️ Folder Structure

project-root/
│
├── system-utility/ # Cross-platform script to collect & send system data
│
├── backend-api/ # Express server to collect and serve reports
│ └── index.js
│
└── admin-dashboard/ # React dashboard to monitor machines
├── src/
│ └── App.js
└── package.json


## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/system-health-dashboard.git
cd system-health-dashboard
```
### 2. Start the Backend Server
```
cd backend-api
npm install
node index.js
```
### 3. Start the Admin Dashboard
```
cd admin-dashboard
npm install
npm start
```
### 4. Send Sample Data from Utility
```
curl -X POST http://localhost:5000/api/system-report \
  -H "Content-Type: application/json" \
  -d '{
    "machine_id": "MACHINE-001",
    "os": "Windows 11",
    "disk_encrypted": true,
    "os_update_status": "Updated",
    "antivirus_active": true,
    "sleep_timeout_seconds": 900,
    "timestamp": "2025-05-20T12:00:00Z"
}'
```
