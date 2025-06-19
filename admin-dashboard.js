import { auth } from './auth.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const ADMIN_EMAILS = ['admin@hybriddancers.com'];

const bookingsTableBody = document.querySelector('#bookings-table tbody');
const statsContainer = document.getElementById('stats');
const insightsList = document.getElementById('insights-list');
const chartEl = document.getElementById('trendChart');

// Mock booking data - replace with backend fetch if available
const mockBookings = [
  { name: 'Alice', classType: 'Hip Hop', date: '2023-09-01' },
  { name: 'Bob', classType: 'Contemporary', date: '2023-09-02' },
  { name: 'Cara', classType: 'Hip Hop', date: '2023-09-02' },
  { name: 'Dave', classType: 'Shuffle', date: '2023-09-03' },
  { name: 'Eve', classType: 'Contemporary', date: '2023-09-04' },
  { name: 'Frank', classType: 'Hip Hop', date: '2023-09-04' },
  { name: 'Grace', classType: 'Shuffle', date: '2023-09-05' },
  { name: 'Henry', classType: 'Hip Hop', date: '2023-09-06' },
  { name: 'Ivy', classType: 'Contemporary', date: '2023-09-06' },
  { name: 'Jack', classType: 'Hip Hop', date: '2023-09-07' }
];

function populateBookings(bookings) {
  bookingsTableBody.innerHTML = '';
  bookings.slice(-10).forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${b.name}</td><td>${b.classType}</td><td>${b.date}</td>`;
    bookingsTableBody.appendChild(tr);
  });
}

function renderStats(bookings) {
  const total = bookings.length;
  const revenue = total * 20; // Assume $20 per booking
  const classCounts = {};
  bookings.forEach(b => {
    classCounts[b.classType] = (classCounts[b.classType] || 0) + 1;
  });
  const popularClass = Object.entries(classCounts).sort((a,b)=>b[1]-a[1])[0][0];

  const cards = [
    { label: 'Total Bookings', value: total },
    { label: 'Revenue ($)', value: revenue },
    { label: 'Most Popular', value: popularClass }
  ];
  statsContainer.innerHTML = '';
  cards.forEach(c => {
    const div = document.createElement('div');
    div.className = 'stat-card';
    div.innerHTML = `<h4>${c.label}</h4><p>${c.value}</p>`;
    statsContainer.appendChild(div);
  });
}

function renderChart(bookings) {
  const counts = {};
  bookings.forEach(b => {
    counts[b.date] = (counts[b.date] || 0) + 1;
  });
  const labels = Object.keys(counts).sort();
  const data = labels.map(d => counts[d]);
  new Chart(chartEl, {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Attendance', data, borderColor: '#feca57', fill: false }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

function generateInsights(bookings) {
  const dayCounts = {};
  bookings.forEach(b => {
    const day = new Date(b.date).toLocaleDateString('en-US', { weekday: 'long' });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const topDay = Object.entries(dayCounts).sort((a,b)=>b[1]-a[1])[0][0];
  const classCounts = {};
  bookings.forEach(b => {
    classCounts[b.classType] = (classCounts[b.classType] || 0) + 1;
  });
  const topClass = Object.entries(classCounts).sort((a,b)=>b[1]-a[1])[0][0];
  insightsList.innerHTML = '';
  const hints = [
    `${topDay}s are your busiest day`,
    `${topClass} classes have highest retention`
  ];
  hints.forEach(h => {
    const li = document.createElement('li');
    li.textContent = h;
    insightsList.appendChild(li);
  });
}

async function loadData() {
  // Replace this with fetch('/api/bookings') if backend is available
  const bookings = mockBookings;
  populateBookings(bookings);
  renderStats(bookings);
  renderChart(bookings);
  generateInsights(bookings);
}

onAuthStateChanged(auth, user => {
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    document.querySelector('.admin-page').innerHTML = '<p>Access denied. Admins only.</p>';
    return;
  }
  loadData();
});

// To plug in deeper AI analysis, send booking data to a Python script or AI API
// and display returned suggestions in the AI Insights section.
