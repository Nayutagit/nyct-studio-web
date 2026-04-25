const ical = require('node-ical');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CALENDAR_URL_AIRRESERVE = 'https://calendar.google.com/calendar/ical/6f54ce11f97b681070bc5a69d523b453f161b06daaee4005fe97c1f42fa41b57%40group.calendar.google.com/private-4c9613486a17a1634cb2ef536ba855ff/basic.ics';
const TEMPLATE_PATH = path.join(__dirname, '../templates/post_avail.html');
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/Users/nayuta/.gemini/Nayuta_Brain/01_Projects/Client_chocolat';
const OUTPUT_FILE = path.join(OUTPUT_DIR, `post_${new Date().toISOString().split('T')[0]}.png`);

if (!fs.existsSync(OUTPUT_DIR)) {
    try {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    } catch (e) {
        console.log("Could not create output directory.", e);
    }
}

const ROOM_A = 'A';
const ROOM_B = 'B';

async function fetchAvailability() {
    console.log('Fetching AirReserve Calendar (Post)...');
    try {
        const events = await ical.async.fromURL(CALENDAR_URL_AIRRESERVE);
        const occupancy = {};

        for (const k in events) {
            const ev = events[k];
            if (ev.type !== 'VEVENT') continue;

            const summary = ev.summary || '';
            const desc = ev.description || '';

            let room = null;
            let isFuzai = false;

            if (summary.includes('フザイ') || desc.includes('フザイ')) isFuzai = true;
            if (summary.includes('A room') || desc.includes('A room')) room = ROOM_A;
            else if (summary.includes('B room') || desc.includes('B room')) room = ROOM_B;

            if (!room && !isFuzai) continue;

            const start = new Date(ev.start);
            const end = new Date(ev.end);
            let current = new Date(start);

            while (current < end) {
                const y = current.getFullYear();
                const m = String(current.getMonth() + 1).padStart(2, '0');
                const d = String(current.getDate()).padStart(2, '0');
                const dateKey = `${y}-${m}-${d}`;
                const h = current.getHours();

                if (!occupancy[dateKey]) occupancy[dateKey] = {};
                if (!occupancy[dateKey][h]) occupancy[dateKey][h] = { A: false, B: false, Fuzai: false };

                if (isFuzai) {
                    occupancy[dateKey][h].Fuzai = true;
                } else if (room) {
                    occupancy[dateKey][h][room] = true;
                }
                current.setHours(current.getHours() + 1);
            }
        }
        return occupancy;
    } catch (e) {
        console.error('Error fetching calendar:', e);
        return {};
    }
}

async function generatePost() {
    const occupancy = await fetchAvailability();
    const today = new Date();

    // Calculate next Monday
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

        let slotsA_available = [];
        let slotsB_available = [];

        for (let h = 10; h < 22; h++) {
            const block = (occupancy[dateKey] && occupancy[dateKey][h]) || { A: false, B: false };
            if (!block.A) slotsA_available.push(h);
            if (!block.B) slotsB_available.push(h);
        }

        let status = '〇';
        const totalAvail = slotsA_available.length + slotsB_available.length;
        
        if (totalAvail === 0) {
            status = '×';
        } else if (totalAvail <= 12) {
            status = '△';
        }
        
        weeklyData.push({
            dateStr: `${Number(m)}/${Number(d)}`,
            weekday: `(${dayOfWeek})`,
            status: status
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

            const statusClass = w.status === '×' ? 'x' : (w.status === '△' ? 'tri' : 'o');
            const statusSpan = document.createElement('div');
            statusSpan.className = `weekly-status status-${statusClass}`;
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
