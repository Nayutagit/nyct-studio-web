const ical = require('node-ical');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CALENDAR_URL_NAYUTA = 'https://calendar.google.com/calendar/ical/a0d18bc3a5b045330364e72bd0d7f259f9c73550e50fd8de9687e145e54ae889%40group.calendar.google.com/private-637aa6dcab44b93b2a265b3ade782c50/basic.ics';
const CALENDAR_URL_AIRRESERVE = 'https://calendar.google.com/calendar/ical/6f54ce11f97b681070bc5a69d523b453f161b06daaee4005fe97c1f42fa41b57%40group.calendar.google.com/private-4c9613486a17a1634cb2ef536ba855ff/basic.ics';

const TEMPLATE_PATH = path.join(__dirname, '../templates/post_lesson.html');
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/Users/nayuta/.gemini/Nayuta_Brain/01_Projects/Client_chocolat';
const OUTPUT_FILE = path.join(OUTPUT_DIR, `post_lesson_${new Date().toISOString().split('T')[0]}.png`);

if (!fs.existsSync(OUTPUT_DIR)) {
    try {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    } catch (e) {}
}

async function fetchAllCalendars() {
    console.log('Fetching Calendars (Post Lesson)...');
    try {
        let eventsNayuta = {};
        let eventsAir = {};

        try { eventsNayuta = await ical.async.fromURL(CALENDAR_URL_NAYUTA); } catch (e) { console.error('Nayuta cal err', e); }
        try { eventsAir = await ical.async.fromURL(CALENDAR_URL_AIRRESERVE); } catch (e) { console.error('Air cal err', e); }

        const occupancy = {};

        const parseEvent = (events, type) => {
            for (const k in events) {
                const ev = events[k];
                if (ev.type !== 'VEVENT') continue;

                const start = new Date(ev.start);
                const end = new Date(ev.end);
                let current = new Date(start);

                let isBlocker = false;
                if (type === 'nayuta' && ev.summary && (ev.summary.includes('レッスン') || ev.summary.includes('不可'))) {
                    isBlocker = true;
                }
                if (type === 'air') {
                    const desc = ev.description || '';
                    if (ev.summary && (ev.summary.includes('フザイ') || desc.includes('フザイ'))) {
                        isBlocker = true;
                    }
                }

                if (!isBlocker) continue;

                while (current < end) {
                    const y = current.getFullYear();
                    const m = String(current.getMonth() + 1).padStart(2, '0');
                    const d = String(current.getDate()).padStart(2, '0');
                    const dateKey = `${y}-${m}-${d}`;
                    const h = current.getHours();

                    if (!occupancy[dateKey]) occupancy[dateKey] = {};
                    if (!occupancy[dateKey][h]) occupancy[dateKey][h] = { NAYUTA_BUSY: false, STUDIO_FUZAI: false };

                    if (type === 'nayuta') occupancy[dateKey][h].NAYUTA_BUSY = true;
                    if (type === 'air') occupancy[dateKey][h].STUDIO_FUZAI = true;

                    current.setHours(current.getHours() + 1);
                }
            }
        };

        parseEvent(eventsNayuta, 'nayuta');
        parseEvent(eventsAir, 'air');

        return occupancy;
    } catch (e) {
        console.error('Error fetching calendar:', e);
        return {};
    }
}

async function generatePost() {
    const occupancy = await fetchAllCalendars();
    const today = new Date();

    let daysUntilMonday = (1 - today.getDay() + 7) % 7;
    if (daysUntilMonday === 0) daysUntilMonday = 7;

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilMonday);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Sunday

    const dateRangeStr = `${Number(String(startDate.getMonth() + 1))} / ${Number(String(startDate.getDate()))} - ${Number(String(endDate.getMonth() + 1))} / ${Number(String(endDate.getDate()))}`;

    const weeklyData = [];
    const weekdaysEng = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
        const currentd = new Date(startDate);
        currentd.setDate(startDate.getDate() + i);

        const y = currentd.getFullYear();
        const m = String(currentd.getMonth() + 1).padStart(2, '0');
        const d = String(currentd.getDate()).padStart(2, '0');
        const dateKey = `${y}-${m}-${d}`;
        const dayOfWeek = weekdaysEng[currentd.getDay()];

        const availableHours = [];
        let hasStudioHours = false;

        for (let h = 10; h < 22; h++) {
            const block = (occupancy[dateKey] && occupancy[dateKey][h]) || { NAYUTA_BUSY: false, STUDIO_FUZAI: false };
            
            if (!block.NAYUTA_BUSY) {
                availableHours.push(h);
                if (!block.STUDIO_FUZAI) {
                    hasStudioHours = true;
                }
            }
        }

        let status = '〇';
        let statusClass = 'studio';

        if (availableHours.length === 0) {
            status = '×';
            statusClass = 'busy';
        } else {
            if (availableHours.length <= 9) {
                status = '△';
            }
            if (!hasStudioHours) {
                statusClass = 'online';
            }
        }
        
        weeklyData.push({
            dateStr: `${Number(m)}/${Number(d)}`,
            weekday: `(${dayOfWeek})`,
            status: status,
            statusClass: statusClass
        });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350 });
    await page.goto(`file://${TEMPLATE_PATH}`);

    await page.evaluate((data) => {
        document.getElementById('date-range').innerText = data.dateRangeStr;

        const listContainer = document.getElementById('weekly-list');
        listContainer.innerHTML = '';

        data.weeklyData.forEach(w => {
            const row = document.createElement('div');
            row.className = 'weekly-row';
            
            const dateSpan = document.createElement('div');
            dateSpan.className = 'weekly-date';
            dateSpan.innerHTML = `${w.dateStr}<span>${w.weekday}</span>`;

            const statusSpan = document.createElement('div');
            statusSpan.className = `weekly-status status-${w.statusClass}`;
            statusSpan.innerText = w.status;

            row.appendChild(dateSpan);
            row.appendChild(statusSpan);
            listContainer.appendChild(row);
        });
    }, { dateRangeStr, weeklyData });

    await page.screenshot({ path: OUTPUT_FILE });
    console.log(`Saved post to ${OUTPUT_FILE}`);

    await browser.close();
}

generatePost();
