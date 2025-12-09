const SUPABASE_URL = 'https://yptegzzukymqotzchgnp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdGVnenp1a3ltcW90emNoZ25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDU1MTYsImV4cCI6MjA3OTQyMTUxNn0.iKWkVYwlKrSBlJKUxRebbGRcgvprzkcyAOgDaCHKLSY';

// Usage: node scripts/update_schedule.js '[{"date":"2025-12-13","time_code":"10:00","status":"status-ng"}, ...]'

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("Please provide JSON updates string");
    process.exit(1);
}

const updates = JSON.parse(args[0]);

async function run() {
    console.log(`Updating ${updates.length} slots...`);

    // Supabase REST API (upsert)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/schedule_slots`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates' // Upsert behavior
        },
        body: JSON.stringify(updates)
    });

    if (!response.ok) {
        const txt = await response.text();
        console.error("Supabase Error:", response.status, txt);
        process.exit(1);
    }

    console.log("Success!");
}

run();
