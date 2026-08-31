const DATA_URL = 'data/tutoring_hours.json';
const REFRESH_MS = 5 * 60 * 1000;

let settings = {};
let schedule = [];
let testDateTime = null;

const $ = (id) => document.getElementById(id);

function parseTime(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesNow() {
  const now = getDisplayDate();
  return now.getHours() * 60 + now.getMinutes();
}

function getDisplayDate() {
  return testDateTime || new Date();
}

function formatTime(value) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function renderClock() {
  const now = getDisplayDate();
  $('currentTime').textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  $('currentDate').textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function render() {
  renderClock();
  const current = minutesNow();
  const windowMinutes = Number(settings.display_window_hours || 6) * 60;
  const visible = schedule
    .filter((item) => item.active !== false)
    .map((item) => ({ ...item, startMinutes: parseTime(item.start), endMinutes: parseTime(item.end) }))
    .filter((item) => item.endMinutes >= current && item.startMinutes <= current + windowMinutes)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  $('schedule').innerHTML = visible.length ? visible.map((item) => {
    const ongoing = item.startMinutes <= current && item.endMinutes >= current;
    const classes = item.classes.map((course) => `<span class="course">${course}</span>`).join('');
    return `<article class="card ${ongoing ? 'soon' : ''}">
      <div class="session-details">
        <h2>${ongoing ? 'Now' : 'Upcoming'}</h2>
        <div class="time">${formatTime(item.start)}–${formatTime(item.end)}</div>
        <div class="tutor">${item.tutor}</div>
      </div>
      <div class="classes"><span class="classes-label">Courses</span><span class="course-list">${classes}</span></div>
    </article>`;
  }).join('') : '<div class="empty">No tutoring scheduled during this display window.</div>';
}

function toDateTimeLocalValue(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function setupTestControls() {
  const input = $('testDateTime');
  input.value = toDateTimeLocalValue(new Date());
  $('applyTestTime').addEventListener('click', () => {
    testDateTime = input.value ? new Date(input.value) : null;
    render();
  });
  $('useLiveTime').addEventListener('click', () => {
    testDateTime = null;
    input.value = toDateTimeLocalValue(new Date());
    render();
  });
}

async function loadSchedule() {
  try {
    // Use a changing query string plus cache directives so Xibo/browser proxies
    // do not reuse an older copy of the schedule JSON.
    const scheduleUrl = `${DATA_URL}?v=${Date.now()}`;
    // Keep the request simple for Xibo's embedded Chromium/web-proxy setup.
    // The changing query string handles caches without custom headers or CORS
    // preflight requests.
    const response = await fetch(scheduleUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    settings = data.settings || {};
    schedule = data.schedule || [];
    $('collegeName').textContent = settings.college_name || $('collegeName').textContent;
    $('pageTitle').textContent = settings.page_title || $('pageTitle').textContent;
    $('staleWarning').hidden = data.updated_at ? (Date.now() - new Date(data.updated_at).getTime()) < 7 * 86400000 : true;
    render();
  } catch (error) {
    $('schedule').innerHTML = '<div class="empty">Schedule unavailable. Check that the site is being served over HTTP and that data/tutoring_hours.json is present.</div>';
    console.error(error);
  }
}

renderClock();
setupTestControls();
loadSchedule();
setInterval(render, 30 * 1000);
setInterval(loadSchedule, REFRESH_MS);
