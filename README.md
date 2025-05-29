<h1 align="center">🛡️ Full-Stack Intrusion Detection System (IDS)</h1>

<p align="center">
  A modern IDS web application built with <strong>FastAPI</strong> + <strong>Next.js</strong> + <strong>PostgreSQL</strong>.  
  Detects and reports real-time network attacks with packet capture, JWT-based authentication, and live alert streaming.
</p>

---

## 📚 Table of Contents

- [🔧 Tech Stack](#-tech-stack)
- [⚙️ Installation Guide](#️-installation-guide)
  - [✅ Backend Setup](#-backend-setup)
  - [✅ Frontend Setup](#-frontend-setup-nextjs)
- [🔍 Attack Capture & Detection](#-attack-capture--detection)
- [🛡️ Features](#️-features)
- [🏃 Running the Project](#-running-the-project)
- [🛠️ Configuration Notes](#️-configuration-notes)
- [📁 Project Structure (Simplified)](#-project-structure-simplified)
- [🖼️ Preview](#️-preview)
- [🧪 Future Improvements](#-future-improvements)
- [📜 License](#-license)
- [👤 Author](#-author)


---

## 🔧 Tech Stack

| Layer       | Tools Used                         |
|-------------|------------------------------------|
| Frontend    | ⚛️ Next.js, Axios                  |
| Backend     | 🐍 FastAPI, SQLAlchemy, Pydantic   |
| Database    | 🐘 PostgreSQL                      |
| Auth        | 🔐 JWT (via [`python-jose`](https://pypi.org/project/python-jose/)) |
| Networking  | 📡 Scapy, Threads, Server-Sent Events (SSE) |

---

## ⚙️ Installation Guide

### ✅ Backend Setup

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-jose scapy
```
Then, open `backend/auth_utils.py` and replace the secret key and algorithm with your own:  
SECRET_KEY = "your_secret_key"  
ALGORITHM = "HS256"

Update the PostgreSQL connection URL in `backend/database.py` and in `backend/packet_capture_api.py` (line 21). The URL should look like:  
DATABASE_URL = "postgresql://username:password@localhost/dbname"

---

### 2. Frontend Setup (Next.js)

Navigate to the frontend directory and install dependencies:  
```bash
npx create-next-app@latest
npm install axios
```
Make sure axios and other required packages are installed.

---

## 🔍 Attack Capture & Detection

The IDS captures network packets using **Scapy** running in a separate thread for continuous monitoring without blocking the main application.

### Thresholds used for detecting attacks:

- `PORT_SCAN_THRESHOLD` — Number of ports accessed within a time frame to flag port scans  
- `SYN_FLOOD_THRESHOLD` — Number of SYN packets received to detect SYN flood attacks  
- `DDOS_PACKET_THRESHOLD` — Packet count threshold to detect DDoS  
- `DDOS_TIME_WINDOW` — Time window for counting packets in DDoS detection  

### Real-time alerting:

- Packet capture runs in a background thread  
- Alerts and packet info are pushed to the frontend in real-time using **Server-Sent Events (SSE)** for live updates

---
## 🛡️ Features

- Detects multiple types of cyberattacks in real-time using threshold-based detection  
- Authenticated access using JWT  
- Visual alert and packet logging interface via Next.js frontend  
- PostgreSQL-backed data storage  
- Modular and extensible architecture

---

## 🏃 Running the Project

Start the backend server:  
uvicorn main:app --reload

Start the frontend development server:  
npm run dev

---
## 🛠️ Configuration Notes

- Replace `SECRET_KEY` and `ALGORITHM` in `auth_utils.py`  
- Ensure the correct `DATABASE_URL` is set in backend files  
- Make sure PostgreSQL is running and accessible

---
## 📁 Project Structure (Simplified)

/backend  
├── main.py  
├── auth_utils.py  
├── database.py  
└── packet_capture_api.py  

/frontend  
├── pages/  
├── components/  
└── utils/

---
## 📜 License

MIT License

---

## 👤 Author

[HassanNetSec](https://github.com/HassanNetSec)
---

✅ This version is fully copy-pasteable into your `README.md`. It gives off a **professional impression**, works well for recruiters, open-source contributors, and teachers, and is ready for future scaling.

Want me to also help you create a matching GitHub repository `about` section (short tagline + topics)?

---
