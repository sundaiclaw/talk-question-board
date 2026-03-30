# Design: Talk Question Board

## System
- Node/Express server serving a static frontend and an AI endpoint.
- Browser UI persists question state locally for demoability.
- OpenRouter free model rewrites submitted questions into concise moderator-ready prompts and topic tags.

## Interaction model
1. Attendee submits a question, optionally with a name.
2. App calls AI to polish/reframe the question and assign topic tags.
3. Audience votes questions upward.
4. Speaker marks one as active or moves it into answered / will-not-answer buckets.
5. Color, brightness, and grouping make room state obvious at a glance.
