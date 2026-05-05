# HireAI — Smart Job Board 🚀

MERN Stack + AI powered job board with skill matching.

## Tech Stack
- **Frontend:** React + Vite + React Router + Recharts
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **AI:** OpenAI GPT-3.5 API
- **Email:** NodeMailer (Gmail SMTP)
- **Auth:** JWT

---

## Project Structure

```
hireai/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/       # Home, Jobs, JobDetail, PostJob, Dashboard, Profile, MyApplications
│       ├── components/  # Navbar
│       ├── context/     # AuthContext
│       └── utils/       # axios api.js
└── server/          # Express backend
    ├── models/      # User, Job, Application
    ├── routes/      # auth, job, application, user, ai, admin
    ├── controllers/ # auth, job, application
    ├── middleware/  # JWT auth middleware
    └── utils/       # ai.utils, email.utils
```

---

## Setup Instructions

### Step 1 — Clone & Install

```bash
# Backend
cd hireai/server
npm install

# Frontend
cd hireai/client
npm install
```

### Step 2 — Environment Variables

```bash
cd hireai/server
cp .env.example .env
```

Fill in your `.env`:
```
MONGO_URI=mongodb+srv://...        # MongoDB Atlas URI
JWT_SECRET=your_random_secret
OPENAI_API_KEY=sk-...              # OpenAI key
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password       # Gmail App Password
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Step 3 — Run

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend  
cd client
npm run dev
```

Visit: http://localhost:5173

---

## Features

| Feature | Description |
|---|---|
| 🔐 Auth | JWT login for Seekers & Companies |
| 💼 Job Board | Post, browse, filter, search jobs |
| 🤖 AI Skills | AI extracts skills from job description |
| ⚡ Match Score | AI match % shown before applying |
| 📄 Resume AI | Paste resume → get skill gap analysis |
| 📊 Dashboard | Charts, applicant management |
| 📧 Emails | Auto email on apply + status change |
| 📱 Responsive | Works on mobile |

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/jobs              (public)
POST   /api/jobs              (company)
GET    /api/jobs/:id          (public)
PUT    /api/jobs/:id          (company)
DELETE /api/jobs/:id          (company)
GET    /api/jobs/company/my-jobs

POST   /api/applications/:jobId/apply  (seeker)
GET    /api/applications/my-applications
GET    /api/applications/job/:jobId    (company)
PUT    /api/applications/:id/status    (company)

GET    /api/users/profile
PUT    /api/users/profile

POST   /api/ai/extract-skills
POST   /api/ai/analyze-resume

GET    /api/admin/stats
GET    /api/admin/applications-chart
```

---

## Live  
https://hire-ai-six.vercel.app/