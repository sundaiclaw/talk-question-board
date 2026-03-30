const STORAGE_KEY = 'talk-question-board-v1';

const seedQuestions = [
  {
    id: crypto.randomUUID(),
    text: 'What part of the current AI tooling stack feels most likely to break in real-world production first?',
    name: 'Maya',
    votes: 12,
    status: 'active',
    createdAt: Date.now() - 1000 * 60 * 18,
  },
  {
    id: crypto.randomUUID(),
    text: 'For local-first agents, what has actually felt reliable enough to use outside demos?',
    name: '',
    votes: 9,
    status: 'open',
    createdAt: Date.now() - 1000 * 60 * 12,
  },
  {
    id: crypto.randomUUID(),
    text: 'How do you decide when a workflow should stay human-in-the-loop versus being fully automated?',
    name: 'Anonymous',
    votes: 6,
    status: 'open',
    createdAt: Date.now() - 1000 * 60 * 8,
  },
  {
    id: crypto.randomUUID(),
    text: 'What surprised you most while building with multimodal models lately?',
    name: 'Jon',
    votes: 3,
    status: 'answered',
    createdAt: Date.now() - 1000 * 60 * 25,
  },
  {
    id: crypto.randomUUID(),
    text: 'Could you compare every major foundation model on one slide right now?',
    name: '',
    votes: 2,
    status: 'dismissed',
    createdAt: Date.now() - 1000 * 60 * 5,
  },
];

const els = {
  form: document.querySelector('#question-form'),
  questionInput: document.querySelector('#question-input'),
  nameInput: document.querySelector('#name-input'),
  openList: document.querySelector('#open-list'),
  answeredList: document.querySelector('#answered-list'),
  dismissedList: document.querySelector('#dismissed-list'),
  metrics: document.querySelector('#metrics'),
  openCount: document.querySelector('#open-count'),
  answeredCount: document.querySelector('#answered-count'),
  dismissedCount: document.querySelector('#dismissed-count'),
  resetDemo: document.querySelector('#reset-demo'),
  template: document.querySelector('#question-card-template'),
};

let state = loadState();

async function fetchAiAssist(question, name) {
  const response = await fetch('/api/question-assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, name })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || payload.error || 'AI request failed');
  }
  return response.json();
}


function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...seedQuestions];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (error) {
    console.warn('Failed to parse local state, resetting.', error);
  }
  return [...seedQuestions];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function relativeTime(timestamp) {
  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

function getVoteVisualTier(votes, maxVotes) {
  if (votes === maxVotes && votes > 0) return 'hot';
  if (votes >= Math.max(5, maxVotes - 2)) return 'warm';
  return 'cool';
}

function getPriorityLabel(question, maxVotes) {
  if (question.status === 'active') return 'Speaker is on this now';
  if (question.votes === maxVotes && question.votes > 0) return 'Top-voted right now';
  if (question.votes >= 6) return 'High audience interest';
  if (question.votes >= 3) return 'Worth surfacing soon';
  return 'Lower-vote / background queue';
}

function sortedOpenQuestions(items) {
  return items
    .filter((question) => question.status === 'open' || question.status === 'active')
    .sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;
      return b.votes - a.votes || a.createdAt - b.createdAt;
    });
}

function sortedResolvedQuestions(items, status) {
  return items
    .filter((question) => question.status === status)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function resetDemoData() {
  state = [...seedQuestions.map((question) => ({ ...question, id: crypto.randomUUID(), createdAt: Date.now() - Math.random() * 1000 * 60 * 30 }))];
  saveState();
  render();
}

function submitQuestion(event) {
  event.preventDefault();
  const text = els.questionInput.value.trim();
  const name = els.nameInput.value.trim();
  if (!text) return;
  const tempId = crypto.randomUUID();
  state.unshift({
    id: tempId,
    text,
    polished: question.polished || question.text,
    tags: question.tags || [],
    moderatorHint: question.moderatorHint || '',
    polished: 'AI is polishing this question…',
    tags: ['Incoming'],
    moderatorHint: 'Waiting for AI assist…',
    name,
    votes: 1,
    status: 'open',
    createdAt: Date.now(),
  });
  saveState();
  els.form.reset();
  render();
  fetchAiAssist(text, name).then((ai) => {
    updateQuestion(tempId, (item) => ({ ...item, polished: ai.polished, tags: ai.tags || [], moderatorHint: ai.moderatorHint || '' }));
  }).catch((error) => {
    updateQuestion(tempId, (item) => ({ ...item, polished: item.text, tags: ['AI unavailable'], moderatorHint: String(error.message || error) }));
  });
}


function updateQuestion(id, updater) {
  state = state.map((question) => (question.id === id ? updater(question) : question));
  saveState();
  render();
}

function setActiveQuestion(id) {
  state = state.map((question) => {
    if (question.id === id) return { ...question, status: 'active' };
    if (question.status === 'active') return { ...question, status: 'open' };
    return question;
  });
  saveState();
  render();
}

function createMetric(label, value) {
  const div = document.createElement('div');
  div.className = 'metric-card';
  div.innerHTML = `<span class="metric-label">${label}</span><strong class="metric-value">${value}</strong>`;
  return div;
}

function createEmptyState(message) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.textContent = message;
  return div;
}

function renderQuestion(question, maxVotes) {
  const fragment = els.template.content.cloneNode(true);
  const card = fragment.querySelector('.question-card');
  const voteButton = fragment.querySelector('.vote-button');
  const voteCount = fragment.querySelector('.vote-count');
  const statusTag = fragment.querySelector('.question-status-tag');
  const author = fragment.querySelector('.question-author');
  const time = fragment.querySelector('.question-time');
  const text = fragment.querySelector('.question-text');
  const priority = fragment.querySelector('.question-priority');
  const activeButton = fragment.querySelector('.active-button');
  const answeredButton = fragment.querySelector('.answered-button');
  const dismissedButton = fragment.querySelector('.dismissed-button');

  card.dataset.status = question.status;
  voteCount.textContent = question.votes;
  statusTag.textContent =
    question.status === 'active' ? 'Active now' : question.status === 'answered' ? 'Answered' : question.status === 'dismissed' ? 'Will not answer' : 'Open';
  author.textContent = question.name ? `Asked by ${question.name}` : 'Asked anonymously';
  time.textContent = relativeTime(question.createdAt);
  text.innerHTML = `<strong class="ai-label">AI-polished:</strong> ${question.polished || question.text}<span class="question-original">Original: ${question.text}</span><span class="moderator-hint">${question.moderatorHint || ''}</span><span class="tag-row">${(question.tags || []).map((tag) => `<span class=\"topic-tag\">${tag}</span>`).join('')}</span>`;
  priority.textContent = getPriorityLabel(question, maxVotes);

  const tier = getVoteVisualTier(question.votes, maxVotes);
  const brightness = tier === 'hot' ? 1.08 : tier === 'warm' ? 0.98 : 0.84;
  const saturation = tier === 'hot' ? 1.3 : tier === 'warm' ? 1.1 : 0.88;
  card.style.opacity = question.status === 'active' ? 1 : brightness;
  card.style.filter = `saturate(${saturation})`;
  card.style.transform = question.status === 'active' ? 'scale(1.005)' : 'scale(1)';

  if (tier === 'hot') {
    card.style.boxShadow = question.status === 'active'
      ? '0 0 0 1px rgba(56,189,248,0.22), 0 24px 60px rgba(14,165,233,0.22), 0 0 36px rgba(245,158,11,0.18)'
      : '0 18px 42px rgba(245, 158, 11, 0.14)';
  }

  voteButton.addEventListener('click', () => updateQuestion(question.id, (item) => ({ ...item, votes: item.votes + 1 })));
  activeButton.addEventListener('click', () => setActiveQuestion(question.id));
  answeredButton.addEventListener('click', () => updateQuestion(question.id, (item) => ({ ...item, status: 'answered' })));
  dismissedButton.addEventListener('click', () => updateQuestion(question.id, (item) => ({ ...item, status: 'dismissed' })));

  if (question.status !== 'open' && question.status !== 'active') {
    activeButton.remove();
    answeredButton.remove();
    dismissedButton.remove();
  }

  return fragment;
}

function render() {
  const openQuestions = sortedOpenQuestions(state);
  const answeredQuestions = sortedResolvedQuestions(state, 'answered');
  const dismissedQuestions = sortedResolvedQuestions(state, 'dismissed');
  const maxVotes = Math.max(0, ...openQuestions.map((question) => question.votes));
  const activeQuestion = openQuestions.find((question) => question.status === 'active');

  els.openList.innerHTML = '';
  els.answeredList.innerHTML = '';
  els.dismissedList.innerHTML = '';
  els.metrics.innerHTML = '';

  if (!openQuestions.length) {
    els.openList.appendChild(createEmptyState('No open questions yet. Ask the first one.'));
  } else {
    openQuestions.forEach((question) => els.openList.appendChild(renderQuestion(question, maxVotes)));
  }

  if (!answeredQuestions.length) {
    els.answeredList.appendChild(createEmptyState('Nothing marked answered yet.'));
  } else {
    answeredQuestions.forEach((question) => els.answeredList.appendChild(renderQuestion(question, maxVotes)));
  }

  if (!dismissedQuestions.length) {
    els.dismissedList.appendChild(createEmptyState('Nothing parked in “will not answer” yet.'));
  } else {
    dismissedQuestions.forEach((question) => els.dismissedList.appendChild(renderQuestion(question, maxVotes)));
  }

  els.metrics.append(
    createMetric('Open queue', openQuestions.length),
    createMetric('Total votes', state.reduce((sum, question) => sum + question.votes, 0)),
    createMetric('Active question', activeQuestion ? '1' : '0'),
    createMetric('Resolved', answeredQuestions.length + dismissedQuestions.length),
  );

  els.openCount.textContent = `${openQuestions.length} open`;
  els.answeredCount.textContent = `${answeredQuestions.length}`;
  els.dismissedCount.textContent = `${dismissedQuestions.length}`;
}

els.form.addEventListener('submit', submitQuestion);
els.resetDemo.addEventListener('click', resetDemoData);
render();
