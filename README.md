# Chai aur Code — Persona Chat

A chat interface that lets a learner switch between two coding-tutor personas — **Hitesh** (warm, Hindi-forward Hinglish, syntax-after-story teaching style) and **Piyush** (English-heavy Hinglish, analogy-first, demo-driven) — backed by the OpenAI API.

This README covers **local setup only**. It is not a substitute for the separate persona-methodology / prompt-engineering / context-management documentation the assignment also requires — see "What's not in this README" at the bottom.

---

## Prerequisites

- Node.js 18+ (uses native `fetch`/ES modules — check with `node -v`)
- An OpenAI API key with access to `gpt-4o`
- npm

## 1. Clone the repo

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

## 2. Install dependencies

```bash
npm install
```

If you don't have a `package.json` yet, generate one and add the two runtime deps this server actually imports:

```bash
npm init -y
npm install express openai dotenv
```

**Important:** `server.js` uses `import`/`export` syntax (ES modules), not `require`. Your `package.json` needs:

```json
{
  "type": "module"
}
```

If that field is missing, Node will throw `SyntaxError: Cannot use import statement outside a module` the moment you try to run it — this is the single most common reason this exact server fails to start locally. Check for it before opening an issue.

## 3. Set up your environment variable

Create a `.env` file in the project root:

```
OPENAI_API_KEY=your-actual-key-here
```

Do **not** commit this file. Confirm `.env` is listed in `.gitignore` before your first commit — adding it after the fact does not remove it from git history if it was already committed.

## 4. Folder structure this server expects

```
your-repo/
├── server.js
├── package.json
├── .env              (not committed)
├── .gitignore
└── public/
    ├── index.html
    ├── script.js
    └── styles.css
```

`server.js` serves static files from `public/` via `express.static`. If your `index.html`, `script.js`, and `styles.css` are sitting at the repo root instead of inside `public/`, the server will start but the frontend will 404 — move them into `public/` first.

## 5. Run it

```bash
node server.js
```

You should see:

```
Chai aur Code tutor running at http://localhost:3000
```

Open `http://localhost:3000` in a browser. Use the Hitesh / Piyush buttons at the top to switch persona — each switch starts a fresh session (new session ID, cleared chat), it does not swap personas mid-conversation.

## 6. Common failure modes, checked in order

| Symptom | Likely cause |
|---|---|
| `Missing OPENAI_API_KEY` on startup | `.env` missing, misnamed, or not in project root |
| `Cannot use import statement outside a module` | `package.json` missing `"type": "module"` |
| Page loads but is blank / 404s on assets | `public/` folder structure doesn't match what `express.static` expects |
| Chat sends but gets `personaId must be one of...` error | Frontend/backend persona IDs mismatched — must be exactly `hitesh` or `piyush` |
| Server "works" but forgets earlier messages in the same chat after a restart | Expected — `sessions` is an in-memory `Map`, not a database. Restarting the process wipes all active conversations. This is a known limitation, not a bug to chase. |

---

## What's *not* in this README

The assignment separately requires, as distinct deliverables:

- **Live deployed website** — not addressed here. If you're deploying to Vercel, note that this server architecture (long-lived `app.listen()` + in-memory session `Map`) does not map cleanly onto Vercel's default serverless function model — that's a separate architectural problem, not a config typo, and needs to be resolved (either via a persistent-server host like Render/Railway, or by rearchitecting session storage to something external like Redis/a DB if you stay on Vercel).
- **Persona data collection & prep methodology** — this README doesn't explain how the persona system prompts were derived. Write that up separately and honestly: state what sources were actually used (e.g. a small sample of transcripts) rather than implying a scale of research that didn't happen.
- **Prompt engineering strategy** — the reasoning behind the rules in each persona prompt (why analogy-first for one, why syntax-after-story for the other) belongs in its own doc, not buried in code comments.
- **Context management approach** — explain the session-per-persona design (in-memory `Map` keyed by `sessionId`), including its limitations (no persistence, no expiry, memory grows unbounded).
- **Sample conversations** — actual transcripts showing both personas responding to the same or similar prompts, demonstrating persona consistency.

None of that is satisfied by this file. Treat it as a separate deliverable.
