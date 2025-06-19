// dashboard-insights.js
// Fetch logs from /api/logs and display summaries for admin users.
// The logic intentionally avoids complex frameworks to remain lightweight
// and easy for non-technical staff to read.

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

// Find the most recent log entry for each action type
function latestByAction(logs, action) {
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].action === action) return logs[i];
  }
  return null;
}

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch (_) {
    return iso;
  }
}

function renderAttendance(log) {
  const list = document.getElementById('attendanceList');
  if (!log) {
    list.innerHTML = '<li>No attendance data found.</li>';
    return;
  }
  const dates = log.details ? log.details.split(',') : [];
  if (!dates.length) {
    list.innerHTML = '<li>No low attendance dates recorded.</li>';
    return;
  }
  list.innerHTML = '';
  dates.forEach(d => {
    const li = document.createElement('li');
    li.textContent = `Low attendance on ${d}`;
    list.appendChild(li);
  });
}

function renderAnomalies(log) {
  const list = document.getElementById('anomalyList');
  if (!log) {
    list.innerHTML = '<li>No anomalies detected.</li>';
    return;
  }
  let anomalies;
  try {
    anomalies = JSON.parse(log.details);
  } catch (_) {
    anomalies = [];
  }
  if (!Array.isArray(anomalies) || !anomalies.length) {
    list.innerHTML = '<li>No anomalies detected.</li>';
    return;
  }
  list.innerHTML = '';
  anomalies.forEach(a => {
    const li = document.createElement('li');
    li.textContent = a.reason || `${a.dimension} ${a.label} had an anomaly`;
    list.appendChild(li);
  });
}

function renderForecast(log) {
  const list = document.getElementById('forecastList');
  if (!log) {
    list.innerHTML = '<li>No forecast data available.</li>';
    return;
  }
  let forecasts;
  try {
    forecasts = JSON.parse(log.details);
  } catch (_) {
    forecasts = [];
  }
  if (!Array.isArray(forecasts) || !forecasts.length) {
    list.innerHTML = '<li>No forecast data available.</li>';
    return;
  }
  list.innerHTML = '';
  forecasts.forEach(f => {
    const li = document.createElement('li');
    const avg = f.forecast && f.forecast[0] ? f.forecast[0] : 0;
    li.textContent = `${f.classType}: ~${avg} bookings/day (${f.confidence} confidence)`;
    list.appendChild(li);
  });
}

async function init() {
  const logs = await fetchLogs();
  if (!Array.isArray(logs)) return;

  // Sort by time to ensure latest entries are last
  logs.sort((a, b) => new Date(a.time) - new Date(b.time));

  renderAttendance(latestByAction(logs, 'attendance_anomaly'));
  renderAnomalies(latestByAction(logs, 'anomaly_detected'));
  renderForecast(latestByAction(logs, 'booking_forecast'));

  // Show timestamp of last update
  const ts = latestByAction(logs, 'booking_forecast')?.time ||
             latestByAction(logs, 'anomaly_detected')?.time ||
             latestByAction(logs, 'attendance_anomaly')?.time;
  if (ts) {
    const p = document.getElementById('lastUpdated');
    if (p) p.textContent = `Last updated: ${formatDateTime(ts)}`;
  }
}

document.addEventListener('DOMContentLoaded', init);
