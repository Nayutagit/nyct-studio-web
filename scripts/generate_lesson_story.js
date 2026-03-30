const ical = require('node-ical');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CALENDAR_URL_AIRRESERVE = 'https://calendar.google.com/calendar/ical/6f54ce11f97b681070bc5a69d523b453f161b06daaee4005fe97c1f42fa41b57%40group.calendar.google.com/private-4c9613486a17a1634cb2ef536ba855ff/basic.ics';
const CALENDAR_URL_PERSONAL = 'https://calendar.google.com/calendar/ical/nytaffi%40gmail.com/private-250098ed24a1ac2a7267f5b588c01f25/basic.ics';

const TEMPLATE_PATH = path.join(__dirname, '../templates/story_lesson.html');
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/Users/nayuta/.gemini/Nayuta_Brain/01_Projects/Client_chocolat';
const OUTPUT_FILE = path.join(OUTPUT_DIR, `story_lesson_${new Date().toISOString().split('T')[0]}.png`);

if (!fs.existsSync(OUTPUT_DIR)) {
    try {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    } catch (e) {
        console.log("Could not create output directory, continuing anyway.", e);
    }
}

const ROOM_A = 'A';
const ROOM_B = 'B';

async function fetchAndParseCalendar(url, type) {
    if (!url) return {};
    try {
        const events = await ical.async.fromURL(url);
        const occupancy = {};

        for (const k in events) {
            const ev = events[k];
            if (ev.type !== 'VEVENT') continue;

            let name = 'Private';
            let room = null;

            if (type === 'AIRRESERVE') {
                let summary = ev.summary || '';
                let desc = ev.description || '';

                if (summary.includes('A room')) room = ROOM_A;
                else if (summary.includes('B room')) room = ROOM_B;
                else if (desc.includes('A room')) room = ROOM_A;
                else if (desc.includes('B room')) room = ROOM_B;

                if (!room) continue;

                const nameMatch = desc.match(/フリガナ（セイ）\s*:\s*(.+)/);
                if (nameMatch) {
                    name = nameMatch[1].trim();
                } else if (summary.includes('先生')) {
                    name = summary.split(' ')[0];
                } else {
                    name = 'Booked';
                }

                // Treat Fuzai
                if (summary.includes('フザイ') || desc.includes('フザイ')) {
                    name = 'フザイ';
                }
                if (summary.includes('アキヤマ') || desc.includes('アキヤマ')) {
                    name = 'アキヤマ';
                }

            } else {
                name = 'Nayuta (Personal)';
                room = 'PERSONAL';
            }

            const start = new Date(ev.start);
            const end = new Date(ev.end);
            let current = new Date(start);

            while (current < end) {
                if (current.getFullYear() > 2030) break;

                const y = current.getFullYear();
                const m = String(current.getMonth() + 1).padStart(2, '0');
                const d = String(current.getDate()).padStart(2, '0');
                const dateKey = `${y}-${m}-${d}`;
                const h = current.getHours();

                if (!occupancy[dateKey]) occupancy[dateKey] = {};
                if (!occupancy[dateKey][h]) occupancy[dateKey][h] = {};

                if (type === 'AIRRESERVE') {
                    occupancy[dateKey][h][room] = name;
                } else {
                    occupancy[dateKey][h]['PERSONAL'] = true;
                }

                current.setHours(current.getHours() + 1);
            }
        }
        return occupancy;
    } catch (e) {
        console.error(`Error fetching ${type} calendar:`, e);
        return {};
    }
}

async function generateStory() {
    console.log('Fetching Calendars for Lesson System...');
    const airReserveData = await fetchAndParseCalendar(CALENDAR_URL_AIRRESERVE, 'AIRRESERVE');
    const personalData = await fetchAndParseCalendar(CALENDAR_URL_PERSONAL, 'PERSONAL');

    const displayData = [];
    const today = new Date();

    // 2 Days Later
    const d = new Date(today);
    d.setDate(today.getDate() + 2);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

    const slots = [];

    // Analyze next day's 10:00 - 22:00
    for (let h = 10; h < 22; h++) {
        const isPersonalBusy = personalData[dateKey] && personalData[dateKey][h] && personalData[dateKey][h]['PERSONAL'];

        const arSlot = (airReserveData[dateKey] && airReserveData[dateKey][h]) || {};
        const nameA = arSlot.A;
        const nameB = arSlot.B;

        let isRoomABusy = false;
        let isRoomBBusy = false;
        let isAkiyamaBusy = false;

        if (nameA) {
            if (nameA.includes('フザイ')) {
                // Owner Away -> Studio is essentially booked for everything else but Free for Nayuta!
            } else if (nameA.includes('アキヤマ')) {
                isAkiyamaBusy = true;
                isRoomABusy = true;
            } else {
                isRoomABusy = true;
            }
        }

        if (nameB) {
            if (nameB.includes('フザイ')) {
                // Owner Away -> Free for Nayuta
            } else if (nameB.includes('アキヤマ')) {
                isAkiyamaBusy = true;
                isRoomBBusy = true;
            } else {
                isRoomBBusy = true;
            }
        }

        if (isPersonalBusy || isAkiyamaBusy) {
            // Unvailable completely (Do not add to slots)
            continue;
        }

        if (isRoomABusy && isRoomBBusy) {
            // Both rooms are booked -> Online Only
            slots.push({ hour: h, type: 'online', label: 'オンラインのみ' });
        } else {
            // At least one room is free -> Studio OK (which implies online is also possible)
            slots.push({ hour: h, type: 'studio', label: 'スタジオOK' });
        }
    }

    const formatLessonRanges = (slotsArray) => {
        if (slotsArray.length === 0) return [];
        slotsArray.sort((a,b) => a.hour - b.hour);
        const ranges = [];
        let start = slotsArray[0].hour;
        let prev = start;
        let currentType = slotsArray[0].type;
        let currentLabel = slotsArray[0].label;

        for (let idx = 1; idx < slotsArray.length; idx++) {
            const item = slotsArray[idx];
            if (item.hour === prev + 1 && item.type === currentType) {
                prev = item.hour;
            } else {
                ranges.push({ time: `${start}:00〜${prev + 1}:00`, type: currentType, label: currentLabel });
                start = item.hour;
                prev = start;
                currentType = item.type;
                currentLabel = item.label;
            }
        }
        ranges.push({ time: `${start}:00〜${prev + 1}:00`, type: currentType, label: currentLabel });
        return ranges;
    };

    const formattedSlots = formatLessonRanges(slots);

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
        
        let studioSlots = 0;
        let onlineSlots = 0;
        
        for (let h = 10; h < 22; h++) {
            const isPersonalBusy = personalData[wkey] && personalData[wkey][h] && personalData[wkey][h]['PERSONAL'];
            const arSlot = (airReserveData[wkey] && airReserveData[wkey][h]) || {};
            const nameA = arSlot.A;
            const nameB = arSlot.B;

            let isRoomABusy = false;
            let isRoomBBusy = false;
            let isAkiyamaBusy = false;

            if (nameA) {
                if (nameA.includes('フザイ')) { } 
                else if (nameA.includes('アキヤマ')) { isAkiyamaBusy = true; isRoomABusy = true; }
                else { isRoomABusy = true; }
            }
            if (nameB) {
                if (nameB.includes('フザイ')) { }
                else if (nameB.includes('アキヤマ')) { isAkiyamaBusy = true; isRoomBBusy = true; }
                else { isRoomBBusy = true; }
            }

            if (isPersonalBusy || isAkiyamaBusy) continue;

            if (isRoomABusy && isRoomBBusy) {
                onlineSlots++;
            } else {
                studioSlots++;
            }
        }
        
        let status = '〇';
        let statusType = 'studio'; // fallback color if needed
        if (studioSlots === 0 && onlineSlots === 0) {
            status = '×';
            statusType = 'busy';
        } else if (studioSlots === 0 && onlineSlots > 0) {
            status = '△';
            statusType = 'online';
        } else if (studioSlots + onlineSlots <= 4) {
            status = '△';
            statusType = 'studio';
        }
        
        weeklyData.push({
            dateStr: `${Number(wm)}/${Number(wday)}(${wDayOfWeek})`,
            status: status,
            statusType: statusType
        });
    }

    displayData.push({
        date: `${Number(m)}/${Number(day)}`,
        weekday: `(${dayOfWeek})`,
        slots: formattedSlots,
        weeklyData: weeklyData
    });

    console.log('Generated Lesson Data:', JSON.stringify(displayData, null, 2));

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.goto(`file://${TEMPLATE_PATH}`);

    await page.evaluate((data) => {
        const container = document.getElementById('schedule-container');
        container.innerHTML = '';
        const day = data[0];

        // 1. Header
        const header = document.createElement('div');
        header.className = 'main-header';

        const dateText = document.createElement('span');
        dateText.className = 'date-text';
        dateText.innerHTML = `${day.date}<span class="weekday">${day.weekday}</span>`;

        const availText = document.createElement('div');
        availText.className = 'avail-text';
        availText.innerText = 'レッスン開講可能枠';

        header.appendChild(dateText);
        header.appendChild(availText);
        container.appendChild(header);

        // 2. Time Slots
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'time-slots';

        if (day.slots.length > 0) {
            day.slots.forEach(slotData => {
                const slot = document.createElement('div');
                slot.className = 'slot';

                const timeSpan = document.createElement('div');
                timeSpan.className = 'slot-time';
                timeSpan.innerText = slotData.time;

                const badge = document.createElement('div');
                badge.className = `slot-badge badge-${slotData.type}`;
                badge.innerText = slotData.label;

                slot.appendChild(timeSpan);
                slot.appendChild(badge);
                slotsContainer.appendChild(slot);
            });
        } else {
            const noSlot = document.createElement('div');
            noSlot.className = 'no-slots';
            noSlot.innerHTML = '予約可能枠はありません<br>(別日程をご相談ください)';
            slotsContainer.appendChild(noSlot);
        }

        container.appendChild(slotsContainer);

        // 3. Weekly Summary Section
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
            row.innerHTML = `<span class="weekly-date">${w.dateStr}</span><span class="weekly-status status-${w.statusType}">${w.status}</span>`;
            weeklyList.appendChild(row);
        });

        weeklyContainer.appendChild(weeklyList);
        container.appendChild(weeklyContainer);
    }, displayData);

    await page.screenshot({ path: OUTPUT_FILE });
    console.log(`Saved lesson story to ${OUTPUT_FILE}`);

    await browser.close();
}

generateStory();
