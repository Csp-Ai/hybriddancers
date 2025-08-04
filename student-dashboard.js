import { supabase } from './supabaseClient.js';

const availableClasses = [
  { id: 1, name: 'Hip Hop Basics', type: 'Hip Hop', date: '2024-08-05', time: '6:00 PM', location: 'Studio A' },
  { id: 2, name: 'Shuffle Drills', type: 'Shuffle', date: '2024-08-06', time: '7:00 PM', location: 'Studio B' },
  { id: 3, name: 'Contemporary Flow', type: 'Contemporary', date: '2024-08-07', time: '5:30 PM', location: 'Studio A' },
];

const upcomingEvents = [
  { id: 1, title: 'Community Jam', date: '2024-08-15', location: 'Tempe Park' },
  { id: 2, title: 'Fall Showcase', date: '2024-09-20', location: 'Main Theater' }
];

let schedule = [];
let journalEntries = [];
let currentUser = null;

function getStorageKey(key) {
  return currentUser ? `${key}-${currentUser.id}` : key;
}

async function loadStoredData() {
  const journal = localStorage.getItem(getStorageKey('journal'));
  journalEntries = journal ? JSON.parse(journal) : [];
  const resp = await fetch(`/api/bookings?email=${encodeURIComponent(currentUser.email)}`);
  if (resp.ok) {
    schedule = await resp.json();
  } else {
    schedule = [];
  }
}

function storeJournal() {
  localStorage.setItem(getStorageKey('journal'), JSON.stringify(journalEntries));
}

function renderClasses(classes) {
  const list = document.getElementById('classList');
  list.innerHTML = '';
  classes.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${c.name}</strong> - ${c.date} ${c.time} @ ${c.location}
      <button data-id="${c.id}" class="book-btn">Book</button>`;
    list.appendChild(li);
  });
}

function renderSchedule() {
  const list = document.getElementById('scheduleList');
  list.innerHTML = '';
  if (!schedule.length) {
    list.innerHTML = '<li>No classes booked.</li>';
    return;
  }
  schedule.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `${c.name} - ${c.date} ${c.time} @ ${c.location}
      <button data-id="${c.id}" class="cancel-btn">Cancel</button>`;
    list.appendChild(li);
  });
}

function renderEvents() {
  const list = document.getElementById('eventsList');
  list.innerHTML = '';
  upcomingEvents.forEach(e => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${e.title}</strong> - ${e.date} @ ${e.location}
      <button class="rsvp-btn">RSVP</button>`;
    list.appendChild(li);
  });
}

function renderJournal() {
  const textarea = document.getElementById('journalText');
  textarea.value = '';
}

function updateChart() {
  const ctx = document.getElementById('moodChart');
  if (!ctx) return;
  const labels = journalEntries.map(e => e.date);
  const moods = journalEntries.map(e => e.mood);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Mood', data: moods, borderColor: '#764ba2', fill: false }]
    },
    options: {
      scales: { y: { beginAtZero: true, max: 5 } }
    }
  });
}

function addJournalEntry() {
  const mood = parseInt(document.getElementById('moodSelect').value, 10);
  const text = document.getElementById('journalText').value.trim();
  const date = new Date().toISOString().slice(0,10);
  journalEntries.push({ date, mood, text });
  storeJournal();
  updateChart();
  renderJournal();
}

function generateInsights() {
  const insightsEl = document.getElementById('insights');
  if (!journalEntries.length) {
    insightsEl.textContent = 'Book some classes and log your mood to see insights.';
    return;
  }
  const avgMood = journalEntries.reduce((sum,e)=>sum+e.mood,0)/journalEntries.length;
  const attendance = schedule.length;
  insightsEl.innerHTML = `<p>Average mood: ${avgMood.toFixed(1)}/5</p>
    <p>Classes booked: ${attendance}</p>
    <p>Keep attending regularly and tracking your wellness!</p>`;
}

function setupEventListeners() {
  document.getElementById('classList').addEventListener('click', async e => {
    if (e.target.classList.contains('book-btn')) {
      const id = parseInt(e.target.dataset.id, 10);
      const cls = availableClasses.find(c => c.id === id);
      if (cls && !schedule.find(s => s.id === id)) {
        const resp = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            name: currentUser.email,
            classType: cls.name,
            date: cls.date,
            time: cls.time,
            location: cls.location
          })
        });
        if (resp.ok) {
          schedule.push(await resp.json());
          renderSchedule();
          generateInsights();
        }
      }
    }
  });

  document.getElementById('scheduleList').addEventListener('click', async e => {
    if (e.target.classList.contains('cancel-btn')) {
      const id = parseInt(e.target.dataset.id, 10);
      const booking = schedule.find(c => c.id === id);
      if (booking) {
        await fetch(`/api/bookings/${booking.id}`, { method: 'DELETE' });
        schedule = schedule.filter(c => c.id !== booking.id);
        renderSchedule();
        generateInsights();
      }
    }
  });

  document.getElementById('saveJournal').addEventListener('click', () => {
    addJournalEntry();
    generateInsights();
  });

  document.getElementById('classFilter').addEventListener('change', e => {
    const type = e.target.value;
    const filtered = type === 'All' ? availableClasses : availableClasses.filter(c => c.type === type);
    renderClasses(filtered);
  });
}

async function initDashboard() {
  document.getElementById('userEmail').textContent = currentUser.email;
  document.getElementById('membershipStatus').textContent = 'Active Member';
  await loadStoredData();
  renderClasses(availableClasses);
  renderSchedule();
  renderEvents();
  renderJournal();
  updateChart();
  generateInsights();
  setupEventListeners();
}

async function init() {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  currentUser = session?.user || null;
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  await initDashboard();
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    if (!currentUser) {
      window.location.href = 'login.html';
    }
  });
}

init();
