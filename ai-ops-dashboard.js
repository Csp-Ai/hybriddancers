import { supabase } from './supabaseClient.js';
import { currentUserId } from './auth.js';

const ADMIN_EMAILS = ['admin@hybriddancers.com'];

const codeStatsEl = document.getElementById('code-stats');
const codeChartEl = document.getElementById('codeChart');
const kpiStatsEl = document.getElementById('kpi-stats');
const kpiChartEl = document.getElementById('kpiChart');
const logTableBody = document.querySelector('#log-table tbody');
const copilotCodeEl = document.getElementById('copilot-code');
const copilotKpiEl = document.getElementById('copilot-kpi');

function mockAnalyzeRepo() {
  return Promise.resolve({
    files: [
      { type: 'HTML', count: 9, lines: 3500 },
      { type: 'JS', count: 11, lines: 4200 },
      { type: 'CSS', count: 5, lines: 1200 }
    ],
    coverage: 76,
  });
}

function mockKpiStats() {
  return Promise.resolve({
    bookings: 120,
    revenue: 3500,
    signups: 45,
    issues: 2,
  });
}

function populateCodeStats(data) {
  codeStatsEl.textContent = `${data.files.length} files`; // simplified
}

function populateKpiStats(data) {
  kpiStatsEl.textContent = `Bookings: ${data.bookings}`;
}

async function loadLog() {
  const { data } = await supabase.from('agent_logs').select('*').order('time');
  logTableBody.innerHTML = '';
  (data || []).forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${l.time}</td><td>${l.action}</td><td>${l.details}</td>`;
    logTableBody.appendChild(tr);
  });
}

async function showCopilotTemplates() {
  copilotCodeEl.textContent = 'Analyze repo for duplicate code';
  copilotKpiEl.textContent = 'Forecast revenue next quarter';
}

async function init() {
  const codeStats = await mockAnalyzeRepo();
  populateCodeStats(codeStats);
  const kpiStats = await mockKpiStats();
  populateKpiStats(kpiStats);
  loadLog();
  showCopilotTemplates();
}

async function checkAuth() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    window.location.href = 'login.html';
  } else {
    init();
  }
}

checkAuth();
