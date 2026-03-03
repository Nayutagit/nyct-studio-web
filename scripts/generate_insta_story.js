const ical = require('node-ical');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CALENDAR_URL_AIRRESERVE = 'https://calendar.google.com/calendar/ical/6f54ce11f97b681070bc5a69d523b453f161b06daaee4005fe97c1f42fa41b57%40group.calendar.google.com/private-4c9613486a17a1634cb2ef536ba855ff/basic.ics';
const TEMPLATE_PATH = path.join(__dirname, '../templates/story_avail.html');
// Updated Output Directory per user request
const OUTPUT_DIR = '/Users/nayuta/.gemini/Nayuta_Brain/01_Projects/Client_chocolat';
const OUTPUT_FILE = path.join(OUTPUT_DIR, `story_${new Date().toISOString().split('T')[0]}.png`);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

const ROOM_A = 'A';
const ROOM_B = 'B';

async function fetchAvailability() {
    console.log('Fetching AirReserve Calendar...');
    try {
        const events = await ical.async.fromURL(CALENDAR_URL_AIRRESERVE);
        const occupancy = {}; // { "YYYY-MM-DD": { "HH": { A: bool, B: bool, Fuzai: bool } } }

        for (const k in events) {
            const ev = events[k];
            if (ev.type !== 'VEVENT') continue;

            // Basic parsing
            const summary = ev.summary || '';
            const desc = ev.description || '';

            // Determine Room or Special Status
            let room = null;
            let isFuzai = false;

            if (summary.includes('フザイ') || desc.includes('フザイ')) {
                isFuzai = true;
            }

            if (summary.includes('A room') || desc.includes('A room')) room = ROOM_A;
            else if (summary.includes('B room') || desc.includes('B room')) room = ROOM_B;

            // If it's not a room booking and not Fuzai, we assume it doesn't block the rental availability?
            // Actually, if "Fuzai" is set, it blocks EVERYTHING according to user.
            // If it's just a room booking, it blocks that room.

            if (!room && !isFuzai) continue;

            // Expand across time range
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

async function generateStory() {
    // 1. Get Data
    const occupancy = await fetchAvailability();

    // 2. Prepare Display Data (Tomorrow ONLY)
    const displayData = [];
    const today = new Date();

    // Target: Tomorrow (i=1)
    const i = 1;
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;

    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

    const slots = [];
    // Hours 10:00 to 22:00
    for (let h = 10; h < 22; h++) {
        const block = (occupancy[dateKey] && occupancy[dateKey][h]) || { A: false, B: false, Fuzai: false };

        let isAvailable = false;

        if (block.Fuzai) {
            isAvailable = false;
        } else if (block.A && block.B) {
            isAvailable = false;
        } else {
            isAvailable = true;
        }

        if (isAvailable) {
            slots.push(`${h}:00`);
        }
    }

    // Push single day object
    displayData.push({
        date: `${Number(m)}/${Number(day)}`, // Remove leading zeros for design (e.g. 2/9)
        weekday: `(${dayOfWeek})`,
        slots: slots
    });

    // 3. Generate Image
    console.log('Generated Display Data:', JSON.stringify(displayData, null, 2));
    console.log('Generating Image with Puppeteer...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1080, height: 1920 });
    await page.goto(`file://${TEMPLATE_PATH}`);

    // Inject Data
    await page.evaluate((data) => {
        const container = document.getElementById('schedule-container');
        container.innerHTML = ''; // Clear example data
        const day = data[0]; // Single day

        // 1. Main Header (Date + Availability Text)
        const header = document.createElement('div');
        header.className = 'main-header';

        // "2/9 (Mon)" part
        const dateText = document.createElement('span');
        dateText.className = 'date-text';
        dateText.innerHTML = `${day.date} <span class="weekday">${day.weekday}</span>`;

        // "の空き状況" part
        const availText = document.createElement('span');
        availText.className = 'avail-text';
        availText.innerText = 'の空き状況';

        // Combine with line break if needed, or just block elements
        header.appendChild(dateText);
        header.appendChild(document.createElement('br'));
        header.appendChild(availText);

        container.appendChild(header);

        // 2. Time Slots
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'time-slots';

        if (day.slots.length > 0) {
            day.slots.forEach(time => {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.innerText = time;
                slotsContainer.appendChild(slot);
            });
        } else {
            const noSlot = document.createElement('div');
            noSlot.className = 'no-slots';
            noSlot.innerHTML = 'Full / Close<br>予約で一杯です';
            slotsContainer.appendChild(noSlot);
        }

        container.appendChild(slotsContainer);
    }, displayData);

    await page.screenshot({ path: OUTPUT_FILE });
    console.log(`Saved story to ${OUTPUT_FILE}`);

    await browser.close();
}

generateStory();
