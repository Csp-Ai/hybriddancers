import { supabase } from './supabaseClient.js';
import { currentUserId } from './auth.js';

const ADMIN_EMAILS = ['admin@hybriddancers.com'];

const bookingsTableBody = document.querySelector('#bookings-table tbody');
const statsContainer = document.getElementById('stats');
const insightsList = document.getElementById('insights-list');
const chartEl = document.getElementById('trendChart');
const filterStart = document.getElementById('filterStart');
const filterEnd = document.getElementById('filterEnd');
const filterClass = document.getElementById('filterClass');
const exportBtn = document.getElementById('exportCsv');
const logsTableBody = document.querySelector('#logs-table tbody');

let allBookings = [];

function populateBookings(bookings) {
  bookingsTableBody.innerHTML = '';
  bookings.slice(-10).forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${b.name}</td><td>${b.email}</td><td>${b.classType}</td><td>${b.date || ''}</td>`;
    bookingsTableBody.appendChild(tr);
  });
}

function populateStats(bookings) {
  const total = bookings.length;
  statsContainer.textContent = `Total bookings: ${total}`;
}

function populateInsights(logs) {
  insightsList.innerHTML = '';
  logs.filter(l => l.action.includes('insight')).forEach(l => {
    const li = document.createElement('li');
    li.textContent = l.details;
    insightsList.appendChild(li);
  });
}

function populateChart(bookings) {
  if (!chartEl || typeof Chart === 'undefined') return;
  const counts = {};
  bookings.forEach(b => {
    const day = new Date(b.created).toLocaleDateString();
    counts[day] = (counts[day] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  new Chart(chartEl, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Bookings', data }] },
  });
}

async function loadData() {
  const { data: bookings } = await supabase.from('registrations').select('*');
  const { data: logs } = await supabase.from('agent_logs').select('*');
  allBookings = bookings || [];
  populateBookings(allBookings);
  populateStats(allBookings);
  populateInsights(logs || []);
  populateChart(allBookings);
}

async function checkAuth() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    document.querySelector('.admin-page').innerHTML = '<p>Access denied. Admins only.</p>';
    return;
  }
  loadData();
  [filterStart, filterEnd, filterClass].forEach(el => el && el.addEventListener('change', loadData));
  if (exportBtn) exportBtn.addEventListener('click', exportCsv);
}

function exportCsv() {
  if (!allBookings.length) return;
  const header = Object.keys(allBookings[0]).join(',');
  const rows = allBookings.map(b => Object.values(b).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bookings.csv';
  a.click();
  URL.revokeObjectURL(url);
}

checkAuth();

// To plug in deeper AI analysis, send booking data to a Python script or AI API
// and display returned suggestions in the AI Insights section.
