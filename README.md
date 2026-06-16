# ⚖ NyayaTrack — न्याय ट्रैक
### Indian Court Case Tracking System

A full-stack web application for lawyers and legal professionals to manage and track court cases, hearings, clients, and case documents — built for the Indian legal system.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher → [nodejs.org](https://nodejs.org)
- **MongoDB** (local or Atlas) → [mongodb.com](https://www.mongodb.com/try/download/community)

### Step 1 — Clone / Extract Project
```bash
cd NyayaTrack
```

### Step 2 — Install Dependencies
```bash
# Install root dev tools
npm install

# Install backend + frontend
npm run install:all
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 3 — Configure Environment
Edit `backend/.env`:
```env
PORT=5020
MONGO_URI=mongodb://localhost:27017/nyayatrack
JWT_SECRET=your_secret_key_change_this
JWT_EXPIRE=7d
```

**Using MongoDB Atlas (cloud, free)?**  
Replace `MONGO_URI` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/nyayatrack
```

### Step 4 — Start the App

**Option A: Two terminals**
```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend  
cd frontend
npm start
```

**Option B: Single command (from root)**
```bash
npm run dev
```

### Step 5 — Open in Browser
- Frontend → **http://localhost:3010**
- Backend API → **http://localhost:5020/api/health**

Register a new account and start adding cases!

---

## 🌟 Features

| Feature | Description |
|---|---|
| **Dashboard** | Stats overview, today's & upcoming hearings, case-type chart |
| **Case Management** | Add, view, edit, search, filter cases |
| **Hearing Tracker** | Timeline of all hearings with outcomes and next dates |
| **Calendar** | Visual monthly calendar with hearing markers |
| **Notes** | Per-case notes for lawyers |
| **Indian Courts** | Pre-filled with Indian court types, states, CNR numbers |
| **Status Management** | Active, Pending, Disposed, Adjourned, Stayed, etc. |
| **Priority Flags** | High / Medium / Low priority per case |
| **Secure Auth** | JWT-based login with bcrypt password hashing |

---

## 🗂 Project Structure

```
NyayaTrack/
├── backend/
│   ├── models/
│   │   ├── User.js        # Lawyer/Client/Admin model
│   │   ├── Case.js        # Case with parties, court, status
│   │   └── Hearing.js     # Hearing records timeline
│   ├── routes/
│   │   ├── auth.js        # Login, register, profile
│   │   ├── cases.js       # CRUD + stats
│   │   ├── hearings.js    # Hearing management
│   │   └── users.js       # Admin user list
│   ├── middleware/
│   │   └── auth.js        # JWT protect middleware
│   ├── server.js          # Express app entry
│   └── .env               # Config (edit this!)
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.js / Register.js
│       │   ├── Dashboard.js   # Stats + upcoming hearings
│       │   ├── Cases.js       # Filterable case list
│       │   ├── CaseDetail.js  # Details + hearings + notes
│       │   ├── NewCase.js     # Add case form
│       │   ├── Calendar.js    # Monthly calendar
│       │   └── Profile.js     # User profile
│       ├── components/
│       │   └── Layout.js      # Sidebar navigation
│       ├── context/
│       │   └── AuthContext.js # Auth state
│       └── utils/
│           └── api.js         # Axios instance
│
└── README.md
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/cases` | List cases (with filters) |
| GET | `/api/cases/stats` | Dashboard statistics |
| POST | `/api/cases` | Create case |
| GET | `/api/cases/:id` | Case detail + hearings |
| PUT | `/api/cases/:id` | Update case |
| DELETE | `/api/cases/:id` | Delete case |
| POST | `/api/cases/:id/notes` | Add note |
| GET | `/api/hearings/upcoming` | Upcoming hearings |
| POST | `/api/hearings` | Add hearing |
| PUT | `/api/hearings/:id` | Update hearing |

---

## 🛠 Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs  
**Frontend:** React 18, React Router v6, Recharts, Axios, React Toastify  
**Fonts:** Cormorant Garamond (headings) + DM Sans (body)

---

## 🔧 Troubleshooting

**MongoDB connection error?**
- Make sure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Or use MongoDB Atlas free tier

**Port already in use?**
- Backend uses port 5020, frontend uses 3010
- Kill existing processes: `lsof -ti:5020 | xargs kill`

**Frontend can't reach backend?**
- The `"proxy": "http://localhost:5020"` in `frontend/package.json` handles this
- Make sure backend is running first

---

Made with ❤️ for Indian legal professionals
