// dashboard-insights.js
// Fetch logs from /api/logs and display summaries for admin users with
// simple charts, filters and CSV export. Functions are exported for tests
// but DOM manipulation only runs in the browser environment.

async function fetchLogs() {
  try {
    const resp = await fetch('/api/logs');
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    console.error('Failed to load logs', e);
    return [];
  }
}

// Convert log entries into a form easier to filter and display.
function parseLogs(logs) {
  return logs.map(l => {
    let parsedDetails;
    try {
      if (l.action === 'anomaly_detected' || l.action === 'booking_forecast') {
        parsedDetails = JSON.parse(l.details);
      } else if (l.action === 'attendance_anomaly') {
        parsedDetails = l.details ? l.details.split(',') : [];
      } else {
        parsedDetails = l.details;
      }
    } catch (_) {
      parsedDetails = l.details;
    }
    return { ...l, parsedDetails };
  });
}

// Apply simple filters to parsed logs.
function filterLogs(logs, opts = {}) {
  const { classType, instructor, startDate, endDate } = opts;
  return logs.filter(l => {
    const t = new Date(l.time);
    if (startDate && t < new Date(startDate)) return false;
    if (endDate && t > new Date(endDate)) return false;
    if (classType) {
      if (l.action === 'booking_forecast') {
        return l.parsedDetails.some(f => f.classType === classType);
      }
      if (l.action === 'anomaly_detected') {
        return l.parsedDetails.some(a => a.dimension === 'class' && a.label === classType);
      }
      return false;
    }
    if (instructor && l.action === 'anomaly_detected') {
      return l.parsedDetails.some(a => a.dimension === 'instructor' && a.label === instructor);
    }
    if (instructor) return false;
    return true;
  });
}

// Turn logs into a CSV string for downloading.
function logsToCsv(logs) {
  const header = 'time,action,details\n';
  const rows = logs.map(l => {
    const det = typeof l.parsedDetails === 'string' ? l.parsedDetails : JSON.stringify(l.parsedDetails);
    return `${l.time},${l.action},${det.replace(/\n/g,' ')}`;
  });
  return header + rows.join('\n');
}

let parsedLogs = [];
let filteredLogs = [];
let locale = (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('de')) ? 'de-DE' : 'en-US';
let attendanceChart, anomalyChart, forecastChart;

// Find the most recent log entry for each action type
function latestByAction(logs, action) {
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].action === action) return logs[i];
  }
  return null;
}

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString(locale);
  } catch (_) {
    return iso;
  }
}

function renderAttendance(log) {
  const list = document.getElementById('attendanceList');
  const canvas = document.getElementById('attendanceChart');
  if (!log) {
    list.innerHTML = '<li>No attendance data found. Run the attendance agent to collect stats.</li>';
    if (attendanceChart) attendanceChart.destroy();
    return;
  }
  const dates = Array.isArray(log.parsedDetails) ? log.parsedDetails : [];
  if (!dates.length) {
    list.innerHTML = '<li>No low attendance dates recorded.</li>';
    if (attendanceChart) attendanceChart.destroy();
    return;
  }
  list.innerHTML = '';
  const counts = {};
  dates.forEach(d => {
    counts[d] = (counts[d] || 0) + 1;
    const li = document.createElement('li');
    li.textContent = `Low attendance on ${d}`;
    list.appendChild(li);
  });
  const labels = Object.keys(counts);
  const data = labels.map(l => counts[l]);
  if (attendanceChart) attendanceChart.destroy();
  attendanceChart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Low Attendance', data, backgroundColor: '#ff6b6b' }] },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

function renderAnomalies(log) {
  const list = document.getElementById('anomalyList');
  const canvas = document.getElementById('anomalyChart');
  if (!log) {
    list.innerHTML = '<li>No anomalies detected.</li>';
    if (anomalyChart) anomalyChart.destroy();
    return;
  }
  const anomalies = Array.isArray(log.parsedDetails) ? log.parsedDetails : [];
  if (!anomalies.length) {
    list.innerHTML = '<li>No anomalies detected.</li>';
    if (anomalyChart) anomalyChart.destroy();
    return;
  }
  list.innerHTML = '';
  const counts = {};
  anomalies.forEach(a => {
    counts[a.label] = (counts[a.label] || 0) + 1;
    const li = document.createElement('li');
    li.textContent = a.reason || `${a.dimension} ${a.label} anomaly`;
    list.appendChild(li);
  });
  const labels = Object.keys(counts);
  const data = labels.map(l => counts[l]);
  if (anomalyChart) anomalyChart.destroy();
  anomalyChart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Anomalies', data, backgroundColor: '#48dbfb' }] },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

function renderForecast(log) {
  const list = document.getElementById('forecastList');
  const canvas = document.getElementById('forecastChart');
  if (!log) {
    list.innerHTML = '<li>No forecast data available.</li>';
    if (forecastChart) forecastChart.destroy();
    return;
  }
  const forecasts = Array.isArray(log.parsedDetails) ? log.parsedDetails : [];
  if (!forecasts.length) {
    list.innerHTML = '<li>No forecast data available.</li>';
    if (forecastChart) forecastChart.destroy();
    return;
  }
  list.innerHTML = '';
  const labels = [];
  const data = [];
  forecasts.forEach(f => {
    const avg = f.forecast && f.forecast[0] ? f.forecast[0] : 0;
    labels.push(f.classType);
    data.push(avg);
    const li = document.createElement('li');
    li.textContent = `${f.classType}: ~${avg} bookings/day (${f.confidence} confidence)`;
    list.appendChild(li);
  });
  if (forecastChart) forecastChart.destroy();
  forecastChart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Forecast Next Day', data, backgroundColor: '#1dd1a1' }] },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

async function init() {
  const raw = await fetchLogs();
  if (!Array.isArray(raw)) return;

  raw.sort((a, b) => new Date(a.time) - new Date(b.time));
  parsedLogs = parseLogs(raw);
  filteredLogs = parsedLogs;
  populateFilters();
  applyFilters();

  const localeSelect = document.getElementById('localeSelect');
  if (localeSelect) localeSelect.value = locale;

  ['filterClass','filterInstructor','filterStart','filterEnd','localeSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFilters);
  });

  const exportBtn = document.getElementById('exportCsv');
  if (exportBtn) exportBtn.addEventListener('click', () => {
    const csv = logsToCsv(filteredLogs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insights.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
}

function populateFilters() {
  const classSet = new Set();
  const instructorSet = new Set();
  parsedLogs.forEach(l => {
    if (l.action === 'booking_forecast') {
      l.parsedDetails.forEach(f => classSet.add(f.classType));
    }
    if (l.action === 'anomaly_detected') {
      l.parsedDetails.forEach(a => {
        if (a.dimension === 'class') classSet.add(a.label);
        if (a.dimension === 'instructor') instructorSet.add(a.label);
      });
    }
  });
  const classSel = document.getElementById('filterClass');
  const instrSel = document.getElementById('filterInstructor');
  if (classSel) {
    classSet.forEach(c => {
      if (!Array.from(classSel.options).some(o => o.value === c)) {
        const opt = document.createElement('option');
        opt.value = c; opt.textContent = c; classSel.appendChild(opt);
      }
    });
  }
  if (instrSel) {
    instructorSet.forEach(i => {
      if (!Array.from(instrSel.options).some(o => o.value === i)) {
        const opt = document.createElement('option');
        opt.value = i; opt.textContent = i; instrSel.appendChild(opt);
      }
    });
  }
}

function applyFilters() {
  const classType = document.getElementById('filterClass')?.value || '';
  const instructor = document.getElementById('filterInstructor')?.value || '';
  const startDate = document.getElementById('filterStart')?.value || '';
  const endDate = document.getElementById('filterEnd')?.value || '';
  const localeSel = document.getElementById('localeSelect');
  if (localeSel) locale = localeSel.value;

  filteredLogs = filterLogs(parsedLogs, { classType: classType || null, instructor: instructor || null, startDate: startDate || null, endDate: endDate || null });

  renderAttendance(latestByAction(filteredLogs, 'attendance_anomaly'));
  renderAnomalies(latestByAction(filteredLogs, 'anomaly_detected'));
  renderForecast(latestByAction(filteredLogs, 'booking_forecast'));

  const ts = latestByAction(filteredLogs, 'booking_forecast')?.time ||
             latestByAction(filteredLogs, 'anomaly_detected')?.time ||
             latestByAction(filteredLogs, 'attendance_anomaly')?.time;
  const p = document.getElementById('lastUpdated');
  if (p) {
    p.textContent = ts ? `Last updated: ${formatDateTime(ts)}` : 'No data available.';
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined') {
  module.exports = { parseLogs, filterLogs, logsToCsv };
}
