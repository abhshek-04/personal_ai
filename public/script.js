const form = document.getElementById('composerForm');
const input = document.getElementById('messageInput');
const log = document.getElementById('chatLog');
const personaSwitch = document.getElementById('personaSwitch');
const headerTagline = document.getElementById('headerTagline');

const PERSONAS = {
  hitesh: {
    label: 'Chai aur Code',
    tagline: 'aapka coding tutor · poochiye kuch bhi',
    greeting: 'Haan ji, swagat hai! Chai taiyar rakhiye — jo bhi coding sawaal hai, poochiye. Shuru karte hain.',
  },
  piyush: {
    label: 'Piyush ke saath',
    tagline: 'concepts clear karte hain, ek analogy se',
    greeting: "Ek kaam karte hain, story se start karte hain. Batao, kya samajhna hai aaj?",
  },
};

// One sessionId per persona per page load. Switching persona starts a
// brand-new session on the backend — it does NOT inject a new system
// prompt into an existing conversation, since mixing two tutor personas
// in one message history confuses the model. Each persona effectively
// gets its own fresh chat.
let currentPersona = 'hitesh';
let sessionId = crypto.randomUUID();
let requestInFlight = false;

function addMessage(text, role) {
  const msg = document.createElement('div');
  msg.className = `msg msg-${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.setAttribute('aria-hidden', 'true');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  msg.append(avatar, bubble);
  log.appendChild(msg);
  log.scrollTop = log.scrollHeight;
  return msg;
}

function startPersonaSession(personaId) {
  currentPersona = personaId;
  sessionId = crypto.randomUUID();
  log.innerHTML = '';
  headerTagline.textContent = PERSONAS[personaId].tagline;
  addMessage(PERSONAS[personaId].greeting, 'bot');
}

function showTyping() {
  const msg = document.createElement('div');
  msg.className = 'msg msg-bot typing';
  msg.innerHTML = `
    <div class="avatar" aria-hidden="true"></div>
    <div class="bubble">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>`;
  log.appendChild(msg);
  log.scrollTop = log.scrollHeight;
  return msg;
}

async function askBackend(message) {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message, personaId: currentPersona }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return data.error || 'Kuch gadbad ho gayi. Thodi der baad try kariye.';
  }

  const data = await res.json();
  return data.reply;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || requestInFlight) return;

  requestInFlight = true;
  addMessage(text, 'user');
  input.value = '';

  const typingEl = showTyping();

  let reply;
  try {
    reply = await askBackend(text);
  } catch (err) {
    console.error('Request failed:', err);
    reply = 'Network issue lag raha hai. Connection check kariye.';
  }

  typingEl.remove();
  addMessage(reply, 'bot');
  requestInFlight = false;
});

personaSwitch.addEventListener('click', (e) => {
  const btn = e.target.closest('.persona-btn');
  if (!btn) return;

  const personaId = btn.dataset.persona;
  if (personaId === currentPersona || requestInFlight) return;

  personaSwitch.querySelectorAll('.persona-btn').forEach((b) => {
    const isActive = b === btn;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', String(isActive));
  });

  startPersonaSession(personaId);
});

// Initial render on page load.
startPersonaSession(currentPersona);