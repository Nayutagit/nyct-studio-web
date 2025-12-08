
import { supabase } from './supabase.js';

// Config (Same as schedule.js)
const START_HOUR = 10;
const END_HOUR = 22;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

document.addEventListener('DOMContentLoaded', () => {
    renderAdminSchedule();
    // fetchCustomers(); // Placeholder for future implementation
});

function renderAdminSchedule() {
    const tbody = document.getElementById('adminScheduleBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        tbody.appendChild(createAdminRow(hour, '00'));
        tbody.appendChild(createAdminRow(hour, '30'));
    }
}

function createAdminRow(hour, minute) {
    const tr = document.createElement('tr');

    // Time
    const th = document.createElement('th');
    th.className = 'time-col';
    th.innerText = `${hour}:${minute}`;
    tr.appendChild(th);

    // Days
    DAYS.forEach(day => {
        const td = document.createElement('td');
        // Initial mock status
        td.className = `slot status-ok`;
        td.innerHTML = `<span class="slot-icon">◎</span>`;

        // Click to toggle status
        td.onclick = () => toggleStatus(td);

        tr.appendChild(td);
    });
    return tr;
}

function toggleStatus(element) {
    const statuses = ['status-ok', 'status-few', 'status-full', 'status-ng'];
    let current = statuses.find(s => element.classList.contains(s)) || 'status-ok';
    let nextIndex = (statuses.indexOf(current) + 1) % statuses.length;

    element.classList.remove(current);
    element.classList.add(statuses[nextIndex]);

    const nextStatus = statuses[nextIndex];
    let icon = '-';
    if (nextStatus === 'status-ok') icon = '◎';
    if (nextStatus === 'status-few') icon = '△';
    if (nextStatus === 'status-full') icon = '×';
    element.innerHTML = `<span class="slot-icon">${icon}</span>`;

    // TODO: Update Supabase here
    console.log('Update status to', nextStatus);
}
