import { auth } from './auth.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const ADMIN_EMAILS = ['admin@hybriddancers.com'];

const bookingsTableBody = document.querySelector('#bookings-table tbody');
const statsContainer = document.getElementById('stats');
const insightsList = document.getElementById('insights-list');
const chartEl = document.getElementById('trendChart');
const filterStart = document.getElementById('filterStart');
const filterEnd = document.getElementById('filterEnd');
const filterClass = document.getElementById('filterClass');
const exportBtn = document.getElementById('exportCsv');

let allBookings = [];

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

function getFilteredBookings() {
  let filtered = allBookings;
  if (filterClass && filterClass.value && filterClass.value !== 'All') {
    filtered = filtered.filter(b => b.classType === filterClass.value);
  }
  if (filterStart && filterStart.value) {
    filtered = filtered.filter(b => b.date >= filterStart.value);
  }
  if (filterEnd && filterEnd.value) {
    filtered = filtered.filter(b => b.date <= filterEnd.value);
  }
  return filtered;
}

function exportCsv() {
  const rows = getFilteredBookings();
  const header = 'name,classType,date\n';
  const csv = header + rows.map(r => `${r.name},${r.classType},${r.date}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bookings.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function loadData() {
  const resp = await fetch('/api/bookings');
  const bookings = resp.ok ? await resp.json() : [];
  allBookings = bookings;
  const filtered = getFilteredBookings();
  populateBookings(filtered);
  renderStats(filtered);
  renderChart(filtered);
  generateInsights(filtered);
}

onAuthStateChanged(auth, user => {
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    document.querySelector('.admin-page').innerHTML = '<p>Access denied. Admins only.</p>';
    return;
  }
  loadData();
  [filterStart, filterEnd, filterClass].forEach(el => el && el.addEventListener('change', loadData));
  if (exportBtn) exportBtn.addEventListener('click', exportCsv);
});

// To plug in deeper AI analysis, send booking data to a Python script or AI API
// and display returned suggestions in the AI Insights section.
