
const ical = require('node-ical');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const CALENDAR_URL = 'https://calendar.google.com/calendar/ical/6f54ce11f97b681070bc5a69d523b453f161b06daaee4005fe97c1f42fa41b57%40group.calendar.google.com/private-4c9613486a17a1634cb2ef536ba855ff/basic.ics';

// Supabase Config
const SUPABASE_URL = 'https://yptegzzukymqotzchgnp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdGVnenp1a3ltcW90emNoZ25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDU1MTYsImV4cCI6MjA3OTQyMTUxNn0.iKWkVYwlKrSBlJKUxRebbGRcgvprzkcyAOgDaCHKLSY';
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const ROOM_A = 'A';
const ROOM_B = 'B';

async function syncCalendar() {
    console.log('Fetching Google Calendar...');

    // 1. Fetch iCal Data
    const events = await ical.async.fromURL(CALENDAR_URL);

    // 2. Parse Events into Occupancy Map
    // Structure: { "YYYY-MM-DD": { "HH": { A: "StudentName", B: "StudentName" } } }
    const occupancy = {};

    let eventCount = 0;

    for (const k in events) {
        const ev = events[k];
        if (ev.type !== 'VEVENT') continue;

        // Detect Room
        let room = null;
        let summary = ev.summary || '';
        let desc = ev.description || '';

        if (summary.includes('A room')) room = ROOM_A;
        else if (summary.includes('B room')) room = ROOM_B;
        else if (desc.includes('A room')) room = ROOM_A;
        else if (desc.includes('B room')) room = ROOM_B;

        // If no room detected, ignore (or treat as blocking both if it's a general event? Safer to ignore for now)
        if (!room) continue;

        // Extract Name
        // Try multiple patterns found in AirReserve emails/descriptions
        let name = 'AirReserve';
        const nameMatch = desc.match(/フリガナ（セイ）\s*:\s*(.+)/);
        if (nameMatch) {
            name = nameMatch[1].trim(); // e.g. "アキヤマ"
        } else {
            // Sometimes format is "氏名: ..." or just in summary
            if (summary.includes('先生')) {
                name = summary.split(' ')[0]; // Fukunga Sensei
            }
        }

        eventCount++;

        const start = new Date(ev.start);
        const end = new Date(ev.end);

        // Loop through hours
        let current = new Date(start);
        while (current < end) {
            // Safety: max loop to prevent infinite
            if (current.getFullYear() > 2030) break;

            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, '0');
            const d = String(current.getDate()).padStart(2, '0');
            const dateKey = `${y}-${m}-${d}`;

            const h = current.getHours();

            if (!occupancy[dateKey]) occupancy[dateKey] = {};
            if (!occupancy[dateKey][h]) occupancy[dateKey][h] = {};

            occupancy[dateKey][h][room] = name;

            // Increment 1 hour
            current.setHours(current.getHours() + 1);
        }
    }

    console.log(`Parsed ${eventCount} events from Calendar.`);

    // 3. Prepare Upsert Buffer (Next 90 Days)
    // We go further than 60 days to be safe
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
            const hStr = parseInt(hour); // use number for object key if we stored it as number, but iCal parsing might have weird timezone issues?
            // current.getHours() returns number.

            const slotData = (occupancy[dateKey] && occupancy[dateKey][hour]) || {};
            const userA = slotData.A;
            const userB = slotData.B;

            let status = 'status-ok';
            let memo = [];

            if (userA) memo.push(`A: ${userA}`);
            if (userB) memo.push(`B: ${userB}`);

            // Logic: If Both filled -> Online/Full
            if (userA && userB) {
                status = 'status-online';
            }

            // Prepare record
            // We set Memo to the list of occupants so Admin knows availability details
            const memoStr = memo.length > 0 ? memo.join(', ') : null;

            upsertBuffer.push({
                date: dateKey,
                time_code: `${hour}:00`,
                status: status,
                memo: memoStr,
                // Note: We are setting student_id to NULL implicitly if we don't provide it?
                // Actually, upsert will update provided fields.
                // If we want to CLEAR old manual inputs when AirReserve updates, we should set them to null.
                // But the user might have mixed usage.
                // For now, let's ONLY update status and memo.
                // We will NOT touch 'student_id' so manual assignments stick?
                // BUT, if AirReserve says it's full, and we force status-online, it overrides manual 'status-ok'.
                // That is correct.
            });
        }
    }

    console.log(`Prepared ${upsertBuffer.length} slots for update.`);

    // 4. Batch Upsert
    // Supabase limit per request
    const BATCH_SIZE = 100;
    for (let i = 0; i < upsertBuffer.length; i += BATCH_SIZE) {
        const batch = upsertBuffer.slice(i, i + BATCH_SIZE);
        const { error } = await client
            .from('schedule_slots')
            .upsert(batch, { onConflict: 'date,time_code' }); // Upsert by PK

        if (error) {
            console.error(`Error upserting batch ${i}:`, error);
        } else {
            // console.log(`✓ Batch ${i} synced`); 
        }
    }

    console.log('✅ Calendar Sync Complete!');
}

syncCalendar();
