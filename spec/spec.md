# Talk Question Board

OpenSpec change: talk-question-board

## What it does
This app captures audience questions during a Boston AI Tinkerers talk, lets anonymous attendees vote them up, and gives the speaker fast controls to mark a question as active, answered, or declined. Each submitted question also gets an AI-polished version and topic tags so the speaker sees a cleaner, sharper phrasing on stage.

## Tech stack
- Node.js + Express server
- Static HTML/CSS/vanilla JS frontend
- OpenRouter free model via server endpoint `/api/question-assist`
- Cloud Run deployment

## AI integration
When a question is submitted, the app calls OpenRouter and returns:
- a concise polished version of the question
- 2-3 topic tags
- a short moderation hint
These are shown directly in the UI and are core to how the speaker triages the queue.

## Demo flow
1. Submit a question with or without a name.
2. Watch the AI-polished version appear on the card.
3. Vote questions up and see ordering + color intensity change.
4. Mark one question active.
5. Move questions to Answered or Will not answer.
