const form = document.getElementById('composerForm');
const input = document.getElementById('messageInput');
const log = document.getElementById('chatLog');

// One id per page load — keeps this learner's history separate from anyone
// else hitting the same server.
const sessionId = crypto.randomUUID();

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
    body: JSON.stringify({ sessionId, message }),
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
  if (!text) return;

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
});