# EQUINOX — Integrated AI Workspace

A premium, production-ready AI workspace application built with **Next.js 14 (App Router)**, **Firebase v10**, **Tailwind CSS**, and **Groq API** (Llama 3 / Mixtral).

---

## ✨ Features

- **Premium Dark Theme** — Crimson Noir (black + red), Dark, and Light modes with real-time switching
- **AI Chat** — Streaming text responses via Groq API (Llama 3 70B, Mixtral 8x7B, Gemma 7B)
- **Multimodal Vision** — Image analysis via LLaVA model
- **File Uploads** — Drag-and-drop images, PDFs, TXT, DOCX → Firebase Storage
- **Chat History** — Persistent sessions in Firestore, grouped by date in collapsible sidebar
- **Markdown Rendering** — Full GFM support with syntax highlighting and copy buttons
- **Firebase Auth** — Email/Password sign-up and login
- **RBAC Admin Panel** — Super Admin → Sub-Admin → User hierarchy with granular permissions
- **Vercel-ready** — Zero-config deployment

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/Crazylegend01/EQUINOX.git
cd EQUINOX
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your values:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project Settings → Your apps |
| `FIREBASE_ADMIN_*` | Firebase Console → Project Settings → Service accounts → Generate new private key |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔐 Firebase Setup

### Authentication

Enable **Email/Password** in Firebase Console → Authentication → Sign-in method.

### Firestore

Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

### Storage

Deploy the storage rules:
```bash
firebase deploy --only storage
```

### Admin Setup

After creating your first account, manually update your user document in Firestore:

```
Collection: users → Document: <your_uid> → Field: role → Value: "super_admin"
```

---

## 📦 Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS, Lucide icons |
| Authentication | Firebase Auth |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| AI | Groq API (Llama 3, Mixtral, LLaVA) |
| Deployment | Vercel / Firebase Hosting |

---

## 🏗 Project Structure

```
equinox/
├── app/
│   ├── (auth)/login/      # Login page
│   ├── (auth)/register/   # Registration page
│   ├── chat/              # Chat layout + new chat home
│   ├── chat/[chatId]/     # Individual chat session
│   ├── admin/             # Super Admin dashboard
│   ├── settings/          # User settings & theme picker
│   └── api/
│       ├── chat/          # Groq streaming endpoint
│       └── admin/         # Role & user management endpoints
├── components/
│   ├── layout/            # Sidebar, Navbar
│   └── chat/              # ChatMessage, MessageInput
├── hooks/                 # useAuth, useChat, useTheme
├── lib/
│   ├── firebase/          # config, auth, firestore, storage, admin
│   └── ai/                # Groq client + model config
└── types/                 # TypeScript types
```

---

## 🎨 Themes

| Theme | Colors | Description |
|---|---|---|
| **Crimson Noir** (default) | #000000 + #FF0033 | Premium dark with crimson accents |
| **Dark Mode** | #0f172a + #3b82f6 | Slate with blue accents |
| **Light Mode** | #ffffff + #ff0033 | Clean white interface |

---

## 🔑 Role-Based Access Control

| Role | Access |
|---|---|
| **Super Admin** | Full platform control, user management, analytics, sub-admin creation |
| **Sub-Admin** | Restricted — only permissions explicitly toggled on by Super Admin |
| **User** | Own chat sessions only |

---

## 📄 License

MIT
