const ical = require('node-ical');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CALENDAR_URL_AIRRESERVE = 'https://calendar.google.com/calendar/ical/6f54ce11f97b681070bc5a69d523b453f161b06daaee4005fe97c1f42fa41b57%40group.calendar.google.com/private-4c9613486a17a1634cb2ef536ba855ff/basic.ics';
const TEMPLATE_PATH = path.join(__dirname, '../templates/story_avail.html');
// Updated Output Directory per user request, but configurable for Cloud
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/Users/nayuta/.gemini/Nayuta_Brain/01_Projects/Client_chocolat';
const OUTPUT_FILE = path.join(OUTPUT_DIR, `story_${new Date().toISOString().split('T')[0]}.png`);

// Ensure output directory exists (unless it's the absolute hardcoded path that might not exist in CI)
if (!fs.existsSync(OUTPUT_DIR)) {
    try {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    } catch (e) {
        console.log("Could not create output directory, continuing anyway.", e);
    }
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

    // Target: 2 days later (i=2)
    const i = 2;
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;

    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

    // Define beautiful, subtle watercolor-like gradients
    const palettes = [
        // Pink / Blue / Bisque / Plum (Original Elegant)
        'radial-gradient(circle at 10% 20%, rgba(255,192,203,0.4) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(173,216,230,0.4) 0%, transparent 50%), radial-gradient(circle at 30% 80%, rgba(255,228,196,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 90%, rgba(221,160,221,0.3) 0%, transparent 50%)',
        // Mint / Lavender / Peach / Yellow (Soft Nature)
        'radial-gradient(circle at 10% 20%, rgba(152,251,152,0.3) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(230,230,250,0.4) 0%, transparent 50%), radial-gradient(circle at 30% 80%, rgba(255,218,185,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 90%, rgba(255,250,205,0.4) 0%, transparent 50%)',
        // Sky Blue / Rose / Lemon / White (Bright Morning)
        'radial-gradient(circle at 20% 30%, rgba(135,206,250,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,228,225,0.5) 0%, transparent 50%), radial-gradient(circle at 40% 70%, rgba(255,250,205,0.4) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(240,248,255,0.5) 0%, transparent 50%)',
        // Warm Gold / Coral / Ivory / Peach (Sunset Warmth)
        'radial-gradient(circle at 15% 15%, rgba(255,215,0,0.15) 0%, transparent 50%), radial-gradient(circle at 85% 15%, rgba(255,127,80,0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(255,255,240,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 85%, rgba(255,218,185,0.3) 0%, transparent 50%)'
    ];
    const randomBg = palettes[Math.floor(Math.random() * palettes.length)];

    const slotsA = [];
    const slotsB = [];
    // Hours 10:00 to 22:00
    for (let h = 10; h < 22; h++) {
        const block = (occupancy[dateKey] && occupancy[dateKey][h]) || { A: false, B: false, Fuzai: false };

        if (!block.Fuzai) {
            if (!block.A) slotsA.push(h);
            if (!block.B) slotsB.push(h);
        }
    }

    const formatTimeRanges = (hours) => {
        if (hours.length === 0) return [];
        const sorted = hours.slice().sort((a,b) => a-b);
        const ranges = [];
        let start = sorted[0];
        let prev = start;
        for (let idx = 1; idx < sorted.length; idx++) {
            if (sorted[idx] === prev + 1) {
                prev = sorted[idx];
            } else {
                ranges.push(`${start}:00〜${prev + 1}:00`);
                start = sorted[idx];
                prev = start;
            }
        }
        ranges.push(`${start}:00〜${prev + 1}:00`);
        return ranges;
    };

    const formattedSlotsA = formatTimeRanges(slotsA);
    const formattedSlotsB = formatTimeRanges(slotsB);

    // 2.5 Weekly summary (Next 7 days, starting 3 days later)
    const weeklyData = [];
    const weekdaysEng = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let w = 3; w < 10; w++) {
        const wd = new Date(today);
        wd.setDate(today.getDate() + w);
        const wy = wd.getFullYear();
        const wm = String(wd.getMonth() + 1).padStart(2, '0');
        const wday = String(wd.getDate()).padStart(2, '0');
        const wkey = `${wy}-${wm}-${wday}`;
        const wDayOfWeek = weekdaysEng[wd.getDay()];
        
        let slotsA = 0;
        let slotsB = 0;
        let isFuzai = false;
        
        for (let h = 10; h < 22; h++) {
            const block = (occupancy[wkey] && occupancy[wkey][h]) || { A: false, B: false, Fuzai: false };
            if (block.Fuzai) {
                isFuzai = true;
                break; // If Fuzai, the whole day is blocked
            }
            if (!block.A) slotsA++;
            if (!block.B) slotsB++;
        }
        
        let status = '〇';
        if (isFuzai || (slotsA === 0 && slotsB === 0)) status = '×';
        else if (slotsA + slotsB <= 4) status = '△';
        
        weeklyData.push({
            dateStr: `${Number(wm)}/${Number(wday)}(${wDayOfWeek})`,
            status: status
        });
    }

    // Push single day object
    displayData.push({
        date: `${Number(m)}/${Number(day)}`, // Remove leading zeros for design (e.g. 2/9)
        weekday: `(${dayOfWeek})`,
        slotsA: formattedSlotsA,
        slotsB: formattedSlotsB,
        bgGradient: randomBg,
        weeklyData: weeklyData
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

        // Apply Random Background
        document.body.style.backgroundImage = day.bgGradient;

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

        // 2. Room A Header & Slots
        const roomAContainer = document.createElement('div');
        roomAContainer.style.width = '100%';
        roomAContainer.style.display = 'flex';
        roomAContainer.style.flexDirection = 'column';
        roomAContainer.style.alignItems = 'center';
        roomAContainer.style.gap = '20px';

        const roomAHeader = document.createElement('div');
        roomAHeader.className = 'room-header';
        roomAHeader.innerText = 'ROOM A';
        roomAContainer.appendChild(roomAHeader);

        const slotsAContainer = document.createElement('div');
        slotsAContainer.className = 'time-slots';

        if (day.slotsA.length > 0) {
            day.slotsA.forEach(time => {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.innerText = time;
                slotsAContainer.appendChild(slot);
            });
        } else {
            const noSlot = document.createElement('div');
            noSlot.className = 'no-slots';
            noSlot.innerHTML = '予約で一杯です';
            slotsAContainer.appendChild(noSlot);
        }
        roomAContainer.appendChild(slotsAContainer);
        container.appendChild(roomAContainer);

        // 3. Room B Header & Slots
        const roomBContainer = document.createElement('div');
        roomBContainer.style.width = '100%';
        roomBContainer.style.display = 'flex';
        roomBContainer.style.flexDirection = 'column';
        roomBContainer.style.alignItems = 'center';
        roomBContainer.style.gap = '20px';

        const roomBHeader = document.createElement('div');
        roomBHeader.className = 'room-header';
        roomBHeader.innerText = 'ROOM B';
        roomBContainer.appendChild(roomBHeader);

        const slotsBContainer = document.createElement('div');
        slotsBContainer.className = 'time-slots';

        if (day.slotsB.length > 0) {
            day.slotsB.forEach(time => {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.innerText = time;
                slotsBContainer.appendChild(slot);
            });
        } else {
            const noSlot = document.createElement('div');
            noSlot.className = 'no-slots';
            noSlot.innerHTML = '予約で一杯です';
            slotsBContainer.appendChild(noSlot);
        }
        roomBContainer.appendChild(slotsBContainer);
        container.appendChild(roomBContainer);

        // 4. Weekly Summary Section
        const weeklyContainer = document.createElement('div');
        weeklyContainer.className = 'weekly-summary';
        
        const weeklyHeader = document.createElement('div');
        weeklyHeader.className = 'weekly-header';
        weeklyHeader.innerText = '今後の空き状況 (Next 7 days)';
        weeklyContainer.appendChild(weeklyHeader);

        const weeklyList = document.createElement('div');
        weeklyList.className = 'weekly-list';

        day.weeklyData.forEach(w => {
            const row = document.createElement('div');
            row.className = 'weekly-row';
            row.innerHTML = `<span class="weekly-date">${w.dateStr}</span><span class="weekly-status status-${w.status === '×' ? 'x' : (w.status === '△' ? 'tri' : 'o')}">${w.status}</span>`;
            weeklyList.appendChild(row);
        });

        weeklyContainer.appendChild(weeklyList);
        container.appendChild(weeklyContainer);
    }, displayData);

    await page.screenshot({ path: OUTPUT_FILE });
    console.log(`Saved story to ${OUTPUT_FILE}`);

    await browser.close();
}

generateStory();
