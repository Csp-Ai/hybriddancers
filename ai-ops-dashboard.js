import { auth } from './auth.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const ADMIN_EMAILS = ['admin@hybriddancers.com'];

const codeStatsEl = document.getElementById('code-stats');
const codeChartEl = document.getElementById('codeChart');
const kpiStatsEl = document.getElementById('kpi-stats');
const kpiChartEl = document.getElementById('kpiChart');
const logTableBody = document.querySelector('#log-table tbody');
const copilotCodeEl = document.getElementById('copilot-code');
const copilotKpiEl = document.getElementById('copilot-kpi');

function mockAnalyzeRepo() {
  // Ideally this would read files using a backend service or Cloud Function.
  // The mock data represents counts for each file type and other metrics.
  return Promise.resolve({
    files: [
      { type: 'HTML', count: 9, lines: 3500 },
      { type: 'JS', count: 11, lines: 4200 },
      { type: 'CSS', count: 1, lines: 2100 },
      { type: 'Python', count: 2, lines: 150 },
      { type: 'Docs', count: 4, lines: 120 }
    ],
    recentChanges: 5,
    testCoverage: '60%',
    complexity: ['booking.js', 'site_analyzer.py'],
    deploymentStatus: 'Deployed 2023-10-01'
  });
}

function mockKpis() {
  // Replace with real analytics from your database or analytics provider.
  return Promise.resolve({
    bookings: 142,
    attendance: 97,
    revenue: 2840,
    openIssues: 3,
    signups: 27,
    support: 4
  });
}

function renderCodeStats(data) {
  codeStatsEl.innerHTML = '';
  data.files.forEach(f => {
    const div = document.createElement('div');
    div.className = 'stat-card';
    div.innerHTML = `<h4>${f.type}</h4><p>${f.count} files<br>${f.lines} lines</p>`;
    codeStatsEl.appendChild(div);
  });
  const labels = data.files.map(f => f.type);
  const counts = data.files.map(f => f.lines);
  new Chart(codeChartEl, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Lines of Code', data: counts, backgroundColor: '#54a0ff' }] },
    options: { scales: { y: { beginAtZero: true } } }
  });
  const insights = [
    `Recent changes: ${data.recentChanges}`,
    `Coverage: ${data.testCoverage}`,
    `Complexity hotspots: ${data.complexity.join(', ')}`,
    `Deployment: ${data.deploymentStatus}`
  ];
  copilotCodeEl.innerHTML = insights.map(i => `<p>${i}</p>`).join('');
}

function renderKpis(data) {
  const cards = [
    { label: 'Bookings', value: data.bookings },
    { label: 'Attendance', value: data.attendance },
    { label: 'Revenue', value: `$${data.revenue}` },
    { label: 'Open Issues', value: data.openIssues },
    { label: 'Signups', value: data.signups },
    { label: 'Support Requests', value: data.support }
  ];
  kpiStatsEl.innerHTML = '';
  cards.forEach(c => {
    const div = document.createElement('div');
    div.className = 'stat-card';
    div.innerHTML = `<h4>${c.label}</h4><p>${c.value}</p>`;
    kpiStatsEl.appendChild(div);
  });
  new Chart(kpiChartEl, {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{ label: 'Bookings', data: [20,22,18,19,23,26,14], borderColor: '#1dd1a1', fill: false }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
  const insights = [
    data.revenue > 3000 ? 'Great revenue this week!' : 'Consider marketing push.',
    data.openIssues > 5 ? 'Too many open issues.' : 'Issue count under control.'
  ];
  copilotKpiEl.innerHTML = insights.map(i => `<p>${i}</p>`).join('');
}

function loadLog() {
  const logs = JSON.parse(localStorage.getItem('hd_admin_log') || '[]');
  logTableBody.innerHTML = '';
  logs.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${l.time}</td><td>${l.admin}</td><td>${l.action}</td><td>${l.details}</td>`;
    logTableBody.appendChild(tr);
  });
}

export function logAction(action, details) {
  const user = auth.currentUser;
  const entry = {
    time: new Date().toISOString(),
    admin: user ? user.email : 'unknown',
    action,
    details
  };
  const logs = JSON.parse(localStorage.getItem('hd_admin_log') || '[]');
  logs.push(entry);
  localStorage.setItem('hd_admin_log', JSON.stringify(logs));
  loadLog();
}

function showCopilotTemplates() {
  const logs = JSON.parse(localStorage.getItem('hd_admin_log') || '[]');
  const templates = logs.slice(-3).map(l => `Generate tests for ${l.details}`);
  const container = document.createElement('div');
  templates.forEach(t => {
    const p = document.createElement('p');
    p.textContent = t;
    container.appendChild(p);
  });
  copilotCodeEl.appendChild(container);
}

async function init() {
  const codeData = await mockAnalyzeRepo();
  const kpiData = await mockKpis();
  renderCodeStats(codeData);
  renderKpis(kpiData);
  loadLog();
  showCopilotTemplates();
}

onAuthStateChanged(auth, user => {
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    window.location.href = 'login.html';
  } else {
    init();
  }
});
