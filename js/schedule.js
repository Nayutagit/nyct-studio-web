
// Mock Data (will replace with Supabase fetch later)
const mockSchedule = {};

// Config
const START_HOUR = 10;
const END_HOUR = 22;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

document.addEventListener('DOMContentLoaded', () => {
    renderSchedule();
});

function renderSchedule() {
    const tbody = document.getElementById('scheduleBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Generate Rows (30 min intervals)
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        // :00
        const row1 = createRow(hour, '00');
        tbody.appendChild(row1);

        // :30
        const row2 = createRow(hour, '30');
        tbody.appendChild(row2);
    }
}

function createRow(hour, minute) {
    const tr = document.createElement('tr');

    // Time Column
    const th = document.createElement('th');
    th.className = 'time-col';
    th.innerText = `${hour}:${minute}`;
    tr.appendChild(th);

    // Days Columns
    DAYS.forEach(day => {
        const td = document.createElement('td');
        const status = getMockStatus(day, hour);
        td.className = `slot status-${status}`;

        let icon = '-';
        if (status === 'ok') icon = '◎';
        if (status === 'few') icon = '△';
        if (status === 'full') icon = '×';

        td.innerHTML = `<span class="slot-icon">${icon}</span>`;
        tr.appendChild(td);
    });

    return tr;
}

function getMockStatus(day, hour) {
    // Random mock data
    if (day === 'Sun' || day === 'Sat') {
        if (hour < 12) return 'full';
        if (hour > 18) return 'ok';
    }
    if (hour === 19) return 'few';
    return 'ok';
}
