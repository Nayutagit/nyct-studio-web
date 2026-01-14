
const ical = require('node-ical');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const CALENDAR_URL_AIRRESERVE = 'https://calendar.google.com/calendar/ical/6f54ce11f97b681070bc5a69d523b453f161b06daaee4005fe97c1f42fa41b57%40group.calendar.google.com/private-4c9613486a17a1634cb2ef536ba855ff/basic.ics';

// Placeholder for Personal Calendar (Will be replaced by user input)
const CALENDAR_URL_PERSONAL = 'https://calendar.google.com/calendar/ical/nytaffi%40gmail.com/private-250098ed24a1ac2a7267f5b588c01f25/basic.ics'; // To be filled

// Supabase Config
const SUPABASE_URL = 'https://yptegzzukymqotzchgnp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdGVnenp1a3ltcW90emNoZ25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDU1MTYsImV4cCI6MjA3OTQyMTUxNn0.iKWkVYwlKrSBlJKUxRebbGRcgvprzkcyAOgDaCHKLSY';
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

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

            // Name Extraction Logic
            let name = 'Private';
            let room = null;

            if (type === 'AIRRESERVE') {
                // AirReserve Logic
                let summary = ev.summary || '';
                let desc = ev.description || '';

                if (summary.includes('A room')) room = ROOM_A;
                else if (summary.includes('B room')) room = ROOM_B;
                else if (desc.includes('A room')) room = ROOM_A;
                else if (desc.includes('B room')) room = ROOM_B;

                if (!room) continue; // Ignore non-room events in AirReserve

                const nameMatch = desc.match(/フリガナ（セイ）\s*:\s*(.+)/);
                if (nameMatch) {
                    name = nameMatch[1].trim();
                } else if (summary.includes('先生')) {
                    name = summary.split(' ')[0];
                } else {
                    name = 'Booked';
                }
            } else {
                // Personal Logic
                name = 'Nayuta (Personal)';
                room = 'PERSONAL'; // Special flag
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

async function syncCalendar() {
    console.log('Fetching Calendars...');

    // Fetch both
    const airReserveData = await fetchAndParseCalendar(CALENDAR_URL_AIRRESERVE, 'AIRRESERVE');
    const personalData = await fetchAndParseCalendar(CALENDAR_URL_PERSONAL, 'PERSONAL');

    // Combine Data
    // We treat Personal Calendar as an overlay that might block everything?
    // User Requirement: "Personal schedule -> Block (NG)"?
    // Let's assume yes.

    console.log('Merging Data and Preparing Upsert...');

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 90);

    const upsertBuffer = [];

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateKey = `${y}-${m}-${day}`;

        for (let hour = 8; hour <= 22; hour++) {
            // Check Personal Block
            const isPersonalBusy = personalData[dateKey] && personalData[dateKey][hour] && personalData[dateKey][hour]['PERSONAL'];

            // Check AirReserve
            const arSlot = (airReserveData[dateKey] && airReserveData[dateKey][hour]) || {};
            const userA = arSlot.A;
            const userB = arSlot.B;

            let status = 'status-ok';
            let memo = [];

            if (userA) memo.push(`A: ${userA}`);
            if (userB) memo.push(`B: ${userB}`);
            if (isPersonalBusy) memo.push(`Personal: Busy`);

            // --- Determination Logic ---

            if (isPersonalBusy) {
                // Personal busy -> Completely NG
                status = 'status-ng';
            } else if (userA && userB) {
                // Both rooms full -> Online Only
                status = 'status-online';
            } else if (userA || userB) {
                // One room free -> Still OK (Face-to-face possible in the other room)
                status = 'status-ok';
            } else {
                // Both free -> OK
                status = 'status-ok';
            }

            // Note about Status Overwrite:
            // If the slot WAS 'status-ng' manually, this script might overwrite it to 'status-ok' if purely based on Calendar.
            // But we usually want the Calendar to be the Source of Truth + Manual blocks.
            // If we assume the script runs hourly, it imposes the Calendar state.

            const memoStr = memo.length > 0 ? memo.join(', ') : null;

            // Only push if there's a reason to update (or just update everything to be safe/consistent)
            // Updating everything ensures cleared events become free again.

            upsertBuffer.push({
                date: dateKey,
                time_code: `${hour}:00`,
                status: status,
                memo: memoStr
            });
        }
    }

    // Batch Upsert
    const BATCH_SIZE = 100;
    for (let i = 0; i < upsertBuffer.length; i += BATCH_SIZE) {
        const batch = upsertBuffer.slice(i, i + BATCH_SIZE);
        const { error } = await client
            .from('schedule_slots')
            .upsert(batch, { onConflict: 'date,time_code' });

        if (error) console.error(`Error in batch ${i}:`, error);
    }

    console.log('✅ All Sync Complete!');
}

syncCalendar();
