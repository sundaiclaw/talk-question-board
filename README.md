# Talk Question Board

Live Q&A board for talks with audience voting, speaker triage, and AI-assisted question polishing.

## What it does

Talk Question Board is a live audience Q&A board for talks and meetups. It captures questions, lets the room vote them up, and gives the speaker fast triage controls plus AI-polished question summaries.

## How to Run (from zero)

### Prerequisites
- Node.js 22+
- npm

### Steps
1. `git clone https://github.com/sundaiclaw/talk-question-board.git`
2. `cd talk-question-board/app`
3. `npm install`
4. Set `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, and `OPENROUTER_MODEL` in your shell
5. `npm run start`
6. Open `http://localhost:8080`

## Limitations / known gaps

- Question state is local to the browser in this MVP, not shared through a database.
- Voting is intentionally anonymous and not anti-abuse hardened.
- AI polishing depends on OpenRouter availability and model quality.

Build on Sundai Club on March 30, 2026  
Sundai Project: https://www.sundai.club/projects/80999ff3-58ce-4ce5-ac9a-35a31cc57129
