# EQUINOX — Integrated AI Workspace

> Premium AI chat workspace · React + Vite · Firebase · Groq API · GitHub Pages

🔗 **Live:** `https://crazylegend01.github.io/EQUINOX/`

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router v6 (HashRouter) |
| Styling | Tailwind CSS |
| Auth | Firebase Auth (Email/Password) |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| AI | Groq API (Llama 3, Mixtral, LLaVA) |
| Hosting | **GitHub Pages** (auto-deploy via Actions) |

---

## Features

- **Crimson Noir** dark theme (black + #FF0033) — switchable to Dark / Light
- Streaming AI chat (Groq) with model selector
- Multimodal vision via LLaVA
- Drag-and-drop file uploads → Firebase Storage
- Real-time chat history in Firestore, grouped by date
- Full Markdown + syntax highlighting + copy buttons
- RBAC: Super Admin → Sub-Admin → User
- Admin dashboard: stats, user management, granular Sub-Admin permissions
- Settings: theme picker + profile editor

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/Crazylegend01/EQUINOX.git
cd EQUINOX
npm install
```

### 2. Add your secrets to GitHub

Go to **Settings → Secrets and variables → Actions** in your repo and add:

| Secret name | Where to find it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your Apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_DATABASE_URL` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |
| `VITE_FIREBASE_MEASUREMENT_ID` | same |
| `VITE_GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — free |

### 3. Enable GitHub Pages

Go to **Settings → Pages** → Source: **GitHub Actions**

### 4. Push to main — it deploys automatically ✅

---

## Local Development

```bash
# Create .env.local
cp .env.example .env.local
# Fill in your values, then:
npm run dev
```

---

## Firebase Setup

### Enable Auth
Firebase Console → **Authentication** → Sign-in method → **Email/Password** → Enable

### Deploy security rules
```bash
firebase deploy --only firestore:rules,storage
```

### Make yourself Super Admin
After signing up, open Firestore → **users** → your document → set `role` = `"super_admin"`

---

## Auto-deploy

Every push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. Installs deps
2. Builds with your repo secrets injected as env vars
3. Deploys `dist/` to GitHub Pages

Your site is live at: `https://crazylegend01.github.io/EQUINOX/`
