# Spec: Talk Question Board

## Requirements

### Requirement: audience submissions
The system shall allow anonymous question submission with an optional name field.

### Requirement: audience prioritization
The system shall support voting and keep open questions sorted by vote count with the active question pinned first.

### Requirement: speaker triage
The system shall let the speaker mark a question as active, answered, or will-not-answer, and group resolved questions at the bottom.

### Requirement: AI polish
The system shall call a real OpenRouter free model to rewrite each question into a concise stage-ready version and assign user-facing topic tags.
