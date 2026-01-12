# 🧠 AI-Powered Website Builder (Bolt/Lovable-style)

An **AI-driven, fully in-browser development environment** that lets users generate, edit, run, debug, and export React applications — **without any backend execution or cloud VMs**.

Inspired by tools like **Bolt** and **Lovable**, this project demonstrates how far modern browsers can be pushed using **WebContainers**, **LLMs**, and careful system design.

---

## 🚀 What this project does

- 📝 Generate full React applications from natural language prompts
- ✍️ Edit project files directly in a VS Code–like editor
- 🔥 See live previews via a Vite dev server running *inside the browser*
- 🛠️ Detect build errors and automatically ask the AI to fix them
- 📁 Browse and edit a real virtual filesystem
- 📦 Export the entire project as a downloadable ZIP
- 🌍 Runs fully client-side, deployed on Vercel

**No servers. No Docker. No VMs.**  
Everything runs inside the browser.

---

## ✨ Key Features

### 🧩 In-Browser Runtime (WebContainer)
- Uses StackBlitz WebContainers to emulate a Node.js environment
- Supports `npm install`, `npm run dev`, and `npm run build`
- Real filesystem with read/write access

### 🧠 AI-Driven Code Generation & Repair
- User prompts are first **enhanced into a structured specification**
- AI generates full application code (`src/App.jsx`)
- Build failures are captured and sent back to the AI for auto-fixing
- Supports iterative self-healing code generation

### 🧑‍💻 IDE-Like Interface
- File tree with nested directories
- Monaco Editor (VS Code engine) for editing
- Tabbed files, autosave, and keyboard shortcuts
- Terminal output and live preview iframe

### 📦 Project Export
- Download the complete project as a ZIP
- Option to export only build output or specific files
- Client-side ZIP generation (no backend required)

### 🔐 Production-Grade Browser Isolation
- Correct handling of **COOP/COEP headers**
- Ensures `SharedArrayBuffer` support for WebContainers
- Fully compatible with modern browser security requirements

---

## 🛠️ Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- JSZip

**Runtime**
- StackBlitz WebContainer API

**AI**
- Large Language Model (via Groq API)
- Prompt enhancement + code generation
- Error-aware feedback loop

**Deployment**
- Vercel (with COOP/COEP headers enabled)'
- Render (for backend)

---

## 🧠 How it works (High-Level)

1. User enters a natural language prompt  
2. Prompt is enhanced into a detailed application specification  
3. AI generates React code inside `src/App.jsx`  
4. Code is written into the WebContainer filesystem  
5. `npm run build` validates the app  
6. If errors occur:
   - Build output is captured
   - Sent back to the AI
   - AI returns a fixed version of the file
7. Live preview updates via Vite HMR  
8. User can manually edit files or export the project

---

## ⚠️ Important Note on Browser Isolation

This project relies on `SharedArrayBuffer`, which requires **cross-origin isolation**.

The following headers are mandatory in production:
 <br>   `Cross-Origin-Opener-Policy: same-origin`<br>
    `Cross-Origin-Embedder-Policy: require-corp`

These headers are explicitly configured during deployment (e.g. via `vercel.json`).

---

## 📸 Screenshots / Demo

 <img src="https://res.cloudinary.com/dsvgi3ehk/image/upload/v1768247532/Screenshot_from_2026-01-13_01-17-00_zrbknb.png" alt="Screenshot">
<br> <br>
 <img src="https://res.cloudinary.com/dsvgi3ehk/image/upload/v1768247542/Screenshot_from_2026-01-13_01-20-11_heax0a.png" alt="ide" >

---

## 🎯 Why this project matters

This is **not just an AI demo**.

It demonstrates:
- Deep understanding of browser internals
- Real-world use of WebContainers
- Careful handling of browser security constraints
- AI integration beyond “just calling an API”
- System-level thinking applied to frontend engineering

This is effectively a **mini cloud IDE — running entirely in the browser**.

---

## 📌 Possible Future Enhancements

- Diff view before applying AI fixes
- Undo / rollback AI changes
- Multi-file AI edits
- Command palette (Cmd+K)
- Direct deploy to Netlify / Vercel
- Shareable project links

---

## 🧑‍💻 Author

Built by **Vivek Jadhav**

If you’re interested in browser-based runtimes, AI-assisted development, or pushing the limits of frontend engineering — feel free to reach out.

