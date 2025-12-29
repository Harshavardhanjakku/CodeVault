
# 🔐 CodeVault

<p align="center">
  <img src="frontend/public/logo.png" alt="CodeVault Logo" width="180"/>
</p>

<p align="center">
  <b>Instant. Secure. Code-Locked.</b><br/>
  Zero-account, password-locked notes built for speed, privacy, and control.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success"/>
  <img src="https://img.shields.io/badge/Frontend-Next.js-black"/>
  <img src="https://img.shields.io/badge/Backend-Node.js-green"/>
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue"/>
</p>

---

## 🚀 What is CodeVault?

**CodeVault** is a lightweight, code-based note system where users access notes using a **single password** —
**no accounts, no signups, no tracking**.

It’s designed for:

* Developers
* Power users
* Secure note storage
* Quick access without friction

---

## ✨ Key Features

* 🔐 **Password-Locked Access** (no usernames)
* ⚡ **Instant Open / Save**
* 🧠 **Markdown + Code Friendly**
* ⌨️ **Keyboard Shortcuts (Power-User UX)**
* 🖥️ **Fullscreen Editor**
* 🛡️ **Encrypted Password Storage**
* 🧑‍💼 **Admin Moderation Ready**
* 📦 **No cookies, no analytics**

---

## 🧱 System Architecture

```mermaid
flowchart LR
    User[User Browser]
    Frontend[Next.js Frontend]
    API[Node.js / Express API]
    DB[(PostgreSQL - Neon)]

    User -->|Password| Frontend
    Frontend -->|POST /api/note| API
    API -->|Encrypt / Hash| API
    API -->|Read / Write| DB
    DB --> API
    API --> Frontend
```

---

## 🧠 Core Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Enter Password
    F->>B: POST /api/note (password)
    B->>D: Check password hash
    alt Note Exists
        D-->>B: Content
        B-->>F: Decrypted Content
    else New Note
        B-->>F: Empty Editor
    end
```

---

## 🖼️ Screenshots

### 🔑 Home / Unlock

![Home](screenshots/Home.png)

### 🗂️ Vault Editor

![Vault](screenshots/Vault.png)

### 👀 Markdown Preview

![Preview](screenshots/Preview.png)

### ⌨️ Keyboard Shortcuts

![Shortcuts](screenshots/Shortcuts.png)

---

## ⌨️ Keyboard Shortcuts

| Shortcut           | Action       |
| ------------------ | ------------ |
| `Enter`            | Unlock vault |
| `Ctrl + S`         | Save         |
| `Ctrl + Shift + S` | Save & Close |
| `Ctrl + Esc`       | Close vault  |

---

## 🔌 API Reference

### `POST /api/note`

Used for:

* Open note
* Save note
* Create note

#### Request

```json
{
  "password": "my-secret",
  "content": "optional note content"
}
```

#### Responses

**Open existing**

```json
{
  "exists": true,
  "content": "Saved content"
}
```

**Create / Update**

```json
{
  "updated": true
}
```

---

## 🛡️ Security Design

* Password **hashed** for lookup
* Password **encrypted** for validation
* Notes stored securely in PostgreSQL
* No plaintext passwords
* No user accounts
* No sessions

---

## 🧩 Tech Stack

### Frontend

* Next.js (App Router)
* Tailwind CSS
* shadcn/ui
* React Markdown

### Backend

* Node.js
* Express
* PostgreSQL (Neon)
* AES Encryption

---

## 📂 Project Structure

```txt
CodeVault/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   │   └── logo.png
│   └── README.md
├── backend/
│   ├── src/
│   ├── utils/
│   └── index.js
├── screenshots/
│   ├── Home.png
│   ├── Vault.png
│   ├── Preview.png
│   └── Shortcuts.png
```

---

## 🧪 Local Setup

### 1️⃣ Clone

```bash
git clone https://github.com/Harshavardhanjakku/codevault.git
cd codevault
```

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3️⃣ Backend

```bash
cd backend
npm install
npm run dev
```

---

## 🌱 Environment Variables

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend `.env`

```env
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=your_key
```

---

## 🧭 Roadmap

* [ ] Autosave
* [ ] Version history
* [ ] Admin dashboard
* [ ] Cloud deploy
* [ ] Team vaults

---

## 🏁 Philosophy

> **Less friction.
> More control.
> Security by default.**

---

## ⭐ If you like this project

Give it a ⭐
Fork it 🍴
Build something powerful on top 🚀

---