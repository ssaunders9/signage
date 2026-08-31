const DATA_URL = 'data/tutoring_hours.csv';
const REFRESH_MS = 5 * 60 * 1000;

let settings = {};
let schedule = [];
let testDateTime = null;

const $ = (id) => document.getElementById(id);

function parseTime(value) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error(`Invalid time: ${value}`);
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  return hours * 60 + Number(match[2]);
}

function minutesNow() {
  const now = getDisplayDate();
  return now.getHours() * 60 + now.getMinutes();
}

function getDisplayDate() {
  return testDateTime || new Date();
}

function isScheduledForDate(item, date) {
  if (Array.isArray(item.days) && item.days.length) {
    return item.days.includes(date.toLocaleDateString('en-US', { weekday: 'long' }));
  }
  return true;
}

function formatTime(value) {
  const minutes = parseTime(value);
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (const character of line) {
    if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { values.push(value.trim()); value = ''; }
    else value += character;
  }
  values.push(value.trim());
  return values;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const headers = parseCsvLine(lines.shift()).map((header) => header.toLowerCase());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    const item = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    return {
      days: [item.day],
      day_label: item.day,
      start: item.start,
      end: item.end,
      tutor: item.tutor,
      classes: item.courses.split(';').map((course) => course.trim()).filter(Boolean),
      active: !['no', 'false', '0'].includes(item.active.toLowerCase())
    };
  });
}

function renderClock() {
  const now = getDisplayDate();
  $('currentTime').textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  $('currentDate').textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function render() {
  renderClock();
  const current = minutesNow();
  const displayDate = getDisplayDate();
  const windowMinutes = Number(settings.display_window_hours || 6) * 60;
  const visible = schedule
    .filter((item) => item.active !== false && item.start && item.end && Array.isArray(item.classes))
    .filter((item) => isScheduledForDate(item, displayDate))
    .map((item) => ({ ...item, startMinutes: parseTime(item.start), endMinutes: parseTime(item.end) }))
    .filter((item) => item.endMinutes >= current && item.startMinutes <= current + windowMinutes)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  const currentlyAvailable = visible.some((item) => item.startMinutes <= current && item.endMinutes >= current);
  const upcoming = visible.filter((item) => item.startMinutes > current);
  const nowCards = visible.filter((item) => item.startMinutes <= current && item.endMinutes >= current);
  const nowSeparator = '<div class="schedule-separator now-separator" role="separator"><span>Now</span></div>';
  const unavailableCard = currentlyAvailable ? '' : `<article class="card unavailable status-card">
      <div class="session-header">
        <div class="time">No One Available</div>
        <div class="tutor"></div>
      </div>
      <div class="classes"><span class="classes-label">Availability</span><span class="course-list">Tutoring resumes at the next scheduled time.</span></div>
    </article>`;

  const renderCard = (item) => {
    const ongoing = item.startMinutes <= current && item.endMinutes >= current;
    const classes = item.classes.map((course) => `<span class="course">${course}</span>`).join('');
    return `<article class="card ${ongoing ? 'soon' : ''}">
      <div class="session-header">
        <div class="time">${formatTime(item.start)}–${formatTime(item.end)}</div>
        <div class="tutor">${item.tutor}</div>
      </div>
      <div class="classes"><span class="classes-label">Courses</span><span class="course-list">${classes}</span></div>
    </article>`;
  };

  const upcomingSeparator = upcoming.length ? '<div class="schedule-separator" role="separator"><span>Upcoming</span></div>' : '';
  $('schedule').innerHTML = visible.length ? nowSeparator + unavailableCard + nowCards.map(renderCard).join('') + upcomingSeparator + upcoming.map(renderCard).join('') : nowSeparator + `<article class="card unavailable status-card">
      <div class="session-header">
        <div class="time">No One Available</div>
        <div class="tutor"></div>
      </div>
      <div class="classes"><span class="classes-label">Availability</span><span class="course-list">Please check back later.</span></div>
    </article>`;
}

function toDateTimeLocalValue(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function setupTestControls() {
  const input = $('testDateTime');
  input.value = toDateTimeLocalValue(new Date());
  $('applyTestTime').addEventListener('click', () => {
    const selectedDate = input.value ? new Date(input.value) : null;
    testDateTime = selectedDate && !Number.isNaN(selectedDate.getTime()) ? selectedDate : null;
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
    // Do not reuse an older copy of the schedule CSV.
    const scheduleUrl = `${DATA_URL}?v=${Date.now()}`;
    // Keep the request simple for Xibo's embedded Chromium/web-proxy setup.
    // The changing query string handles caches without custom headers or CORS
    // preflight requests.
    const response = await fetch(scheduleUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    schedule = parseCsv(csv);
    $('collegeName').textContent = settings.college_name || $('collegeName').textContent;
    $('pageTitle').textContent = settings.page_title || $('pageTitle').textContent;
    $('staleWarning').hidden = true;
    render();
  } catch (error) {
    $('schedule').innerHTML = '<div class="empty">Schedule unavailable. Check that the site is being served over HTTP and that data/tutoring_hours.csv is present.</div>';
    console.error(error);
  }
}

renderClock();
// Testing controls are disabled in the production display markup.
// setupTestControls();
loadSchedule();
setInterval(render, 30 * 1000);
setInterval(loadSchedule, REFRESH_MS);
