// --- GLOBAL CONFIG ---
const SUPABASE_URL = 'https://yptegzzukymqotzchgnp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdGVnenp1a3ltcW90emNoZ25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDU1MTYsImV4cCI6MjA3OTQyMTUxNn0.iKWkVYwlKrSBlJKUxRebbGRcgvprzkcyAOgDaCHKLSY';

const ERR_MSG = "初期化エラー: Supabaseの読み込みに失敗しました。";

// --- CONSTANTS ---
const HOURS = [];
for (let i = 8; i <= 22; i++) HOURS.push(i + ":00");

// --- STATE ---
let client;
let scheduleData = {};
let currentMonthStart = new Date();
let bookingModalTarget = null;

// --- INIT ---
window.onload = function () {
    try {
        if (typeof supabase === 'undefined') throw new Error(ERR_MSG);
        client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase initialized (v4.0)");

        // Init Bulk Selects
        initBulkSelects();

        // Init Calendar
        init();
    } catch (err) {
        alert(err.message);
        console.error(err);
    }
};

function initBulkSelects() {
    const startSel = document.getElementById('bulkStartTime');
    const endSel = document.getElementById('bulkEndTime');
    if (!startSel || !endSel) return;

    HOURS.forEach(h => {
        const opt1 = document.createElement('option');
        opt1.value = h; opt1.textContent = h;
        startSel.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = h; opt2.textContent = h;
        endSel.appendChild(opt2);
    });
}

async function init() {
    renderSkeleton();
    await fetchSchedule();
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

// --- DATA FETCHING ---
async function fetchSchedule() {
    try {
        const start = getStartOfWeek(currentMonthStart);

        // Generate 7 Date Keys
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            dates.push(d);
        }
        const dateKeys = dates.map(formatDateKey);

        // 1. Fetch Slots
        const { data: slots, error } = await client
            .from('schedule_slots')
            .select('*')
            .in('date', dateKeys);

        if (error) throw error;

        scheduleData = {};
        if (slots && slots.length > 0) {
            // 2. Extract Student IDs
            const studentIds = [...new Set(slots.map(s => s.student_id).filter(id => id))];

            let studentMap = {};
            if (studentIds.length > 0) {
                const { data: students, error: sErr } = await client
                    .from('students')
                    .select('id, name, first_name, last_name, alias')
                    .in('id', studentIds);

                if (!sErr && students) {
                    students.forEach(s => studentMap[s.id] = s);
                }
            }

            // 3. Merge
            slots.forEach(slot => {
                const t = slot.time_code || slot.time || '';
                const key = `${slot.date}_${t.slice(0, 5)}`;

                if (slot.student_id && studentMap[slot.student_id]) {
                    slot.students = studentMap[slot.student_id];
                }
                scheduleData[key] = slot;
            });
        }
        renderSchedule(start);
        updateHeaderDate(start);
    } catch (err) {
        console.error("Fetch Error:", err);
        alert("データの取得に失敗しました: " + err.message);
    }
}

// --- RENDERING ---
function renderSkeleton() {
    const grid = document.getElementById('schedule-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Header
    const headerRow = document.createElement('div');
    headerRow.className = 'schedule-header';

    const corner = document.createElement('div');
    corner.className = 'header-corner';
    corner.textContent = 'Time';
    headerRow.appendChild(corner);

    const start = getStartOfWeek(currentMonthStart);
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        dates.push(d);

        const col = document.createElement('div');
        col.className = 'header-date';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        col.innerHTML = `${dayNames[d.getDay()]}<br><span style="font-size:1.2rem">${d.getDate()}</span>`;
        if (d.toDateString() === new Date().toDateString()) col.classList.add('today');
        headerRow.appendChild(col);
    }
    grid.appendChild(headerRow);

    // Body
    const body = document.createElement('div');
    body.id = 'schedule-body';
    body.className = 'schedule-body';

    HOURS.forEach(time => {
        const row = document.createElement('div');
        row.className = 'schedule-row';
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = time;
        row.appendChild(label);

        dates.forEach(date => {
            const dateKey = formatDateKey(date);
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.dataset.date = dateKey;
            slot.dataset.time = time;
            slot.onclick = () => openBookingModal(dateKey, time);
            slot.innerHTML = '<span style="color:#666">...</span>';
            row.appendChild(slot);
        });
        body.appendChild(row);
    });
    grid.appendChild(body);
}

function renderSchedule(start) {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
        const key = `${slot.dataset.date}_${slot.dataset.time}`;
        const data = scheduleData[key];

        slot.className = 'slot';
        slot.innerHTML = '';

        if (data) {
            if (data.status === 'status-ng') {
                slot.classList.add('status-ng');
                slot.textContent = '-';
            } else if (data.status === 'status-online') {
                slot.classList.add('status-online');
                slot.textContent = 'Online';
            } else {
                slot.classList.add('status-ok');
                slot.textContent = '◎';
            }

            let displayName = null;
            if (data.students) {
                const s = data.students;
                if (s.last_name && s.first_name) displayName = `${s.last_name} ${s.first_name}`;
                else if (s.name) displayName = s.name;
                else if (s.alias) displayName = s.alias;
            }

            if (displayName || data.memo) {
                const info = document.createElement('div');
                info.className = 'slot-info';
                info.style.fontSize = '0.75rem';
                info.marginTop = '2px';
                info.style.overflow = 'hidden';

                if (displayName) {
                    const nameSpan = document.createElement('div'); // div for block
                    nameSpan.style.color = 'var(--primary-neon)';
                    nameSpan.textContent = displayName;
                    info.appendChild(nameSpan);
                }
                if (data.memo) {
                    const memoSpan = document.createElement('span');
                    memoSpan.textContent = '📝';
                    memoSpan.title = data.memo;
                    info.appendChild(memoSpan);
                }
                slot.appendChild(info);
                slot.classList.add('has-booking');
            }
        } else {
            slot.classList.add('status-ok');
            slot.textContent = '◎';
        }
    });
}

// --- MODAL & ACTIONS ---
function openBookingModal(date, time) {
    bookingModalTarget = { date, time };
    document.getElementById('modalTitle').textContent = `${date} ${time}`;
    document.getElementById('bookingModal').classList.add('active');

    const key = `${date}_${time}`;
    const data = scheduleData[key];

    // Reset
    document.getElementById('studentSearch').value = '';
    document.getElementById('studentSearchResults').style.display = 'none';
    document.getElementById('selectedStudentId').value = '';
    document.getElementById('selectedStudentName').textContent = '';

    if (data) {
        document.getElementById('modalStatus').value = data.status || 'status-ok';
        document.getElementById('modalBookingType').value = data.booking_type || 'Lesson';
        document.getElementById('modalMemo').value = data.memo || '';
        if (data.students) {
            const s = data.students;
            const name = (s.last_name && s.first_name) ? `${s.last_name} ${s.first_name}` : s.name;
            document.getElementById('selectedStudentId').value = data.student_id;
            document.getElementById('selectedStudentName').textContent = name;
        }
    } else {
        document.getElementById('modalStatus').value = 'status-ok';
        document.getElementById('modalBookingType').value = 'Lesson';
        document.getElementById('modalMemo').value = '';
    }
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
    bookingModalTarget = null;
}

async function saveBooking() {
    if (!bookingModalTarget) return;

    const updates = {
        date: bookingModalTarget.date,
        time_code: bookingModalTarget.time,
        status: document.getElementById('modalStatus').value,
        student_id: document.getElementById('selectedStudentId').value || null,
        booking_type: document.getElementById('modalBookingType').value,
        memo: document.getElementById('modalMemo').value,
        updated_at: new Date().toISOString()
    };

    const { error } = await client
        .from('schedule_slots')
        .upsert(updates, { onConflict: 'date, time_code' });

    if (error) {
        alert("保存エラー: " + error.message);
    } else {
        closeBookingModal();
        fetchSchedule();
    }
}

function clearBooking() {
    document.getElementById('selectedStudentId').value = '';
    document.getElementById('selectedStudentName').textContent = '';
    document.getElementById('modalStatus').value = 'status-ok';
}

async function searchStudents() {
    const term = document.getElementById('studentSearch').value;
    const resultsDiv = document.getElementById('studentSearchResults');

    if (term.length < 1) {
        resultsDiv.style.display = 'none';
        return;
    }

    const { data, error } = await client
        .from('students')
        .select('id, name, first_name, last_name, alias')
        .or(`name.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
        .limit(5);

    resultsDiv.innerHTML = '';
    resultsDiv.style.display = 'block';

    if (data) {
        data.forEach(s => {
            const div = document.createElement('div');
            div.style.padding = '8px';
            div.style.borderBottom = '1px solid #333';
            div.style.cursor = 'pointer';
            const nameDisplay = (s.last_name && s.first_name) ? `${s.last_name} ${s.first_name}` : s.name;
            div.textContent = nameDisplay;
            div.onclick = () => {
                document.getElementById('selectedStudentId').value = s.id;
                document.getElementById('selectedStudentName').textContent = nameDisplay;
                resultsDiv.style.display = 'none';
                document.getElementById('studentSearch').value = '';
            };
            resultsDiv.appendChild(div);
        });
    }
}

async function runBulkUpdate() {
    const startDateStr = document.getElementById('bulkStartDate').value;
    const endDateStr = document.getElementById('bulkEndDate').value;
    const startTimeStr = document.getElementById('bulkStartTime').value;
    const endTimeStr = document.getElementById('bulkEndTime').value;
    const status = document.getElementById('bulkStatus').value;

    if (!startDateStr || !endDateStr) {
        alert("期間を選択してください");
        return;
    }

    const startHour = parseInt(startTimeStr.split(':')[0]);
    const endHour = parseInt(endTimeStr.split(':')[0]);
    let updates = [];
    let curr = new Date(startDateStr);
    const end = new Date(endDateStr);

    while (curr <= end) {
        const dateKey = formatDateKey(curr);
        for (let h = startHour; h <= endHour; h++) {
            updates.push({ date: dateKey, time_code: `${h}:00`, status: status });
        }
        curr.setDate(curr.getDate() + 1);
    }

    if (updates.length === 0) { alert("対象の枠がありません"); return; }
    if (!confirm(`${updates.length}件の枠を一括更新しますか？`)) return;

    const { error } = await client.from('schedule_slots').upsert(updates, { onConflict: 'date, time_code' });
    if (error) alert("更新エラー: " + error.message);
    else { alert("完了しました"); fetchSchedule(); }
}

// --- UTILS ---
function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function updateHeaderDate(start) {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    document.querySelector('.current-month').textContent =
        `${start.getFullYear()}.${start.getMonth() + 1} / ${start.getDate()} - ${end.getDate()}`;
}

// Keep Listeners Simple
document.getElementById('prevWeek').onclick = () => {
    currentMonthStart.setDate(currentMonthStart.getDate() - 7);
    init();
};
document.getElementById('nextWeek').onclick = () => {
    currentMonthStart.setDate(currentMonthStart.getDate() + 7);
    init();
};
