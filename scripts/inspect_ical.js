const ical = require('node-ical');

const url = 'https://calendar.google.com/calendar/ical/6f54ce11f97b681070bc5a69d523b453f161b06daaee4005fe97c1f42fa41b57%40group.calendar.google.com/private-4c9613486a17a1634cb2ef536ba855ff/basic.ics';

console.log('Fetching URL:', url);

ical.fromURL(url, {}, (err, data) => {
    if (err) {
        console.error('Error fetching/parsing:', err);
        return;
    }

    const keys = Object.keys(data);
    console.log(`Got ${keys.length} items in calendar.`);

    if (keys.length === 0) {
        console.log('Calendar seems empty.');
        return;
    }

    // Print first item raw
    const firstKey = keys[0];
    console.log('First item structure:', JSON.stringify(data[firstKey], null, 2));

    let count = 0;
    for (const k of keys) {
        const ev = data[k];
        if (ev.type === 'VEVENT') {
            const summary = ev.summary || '';
            // Only print if it looks like a lesson booking to filter out holidays etc
            console.log('--- Event ---');
            console.log('Summary:', summary);
            console.log('Description:', ev.description);
            console.log('Start:', ev.start);
            console.log('End:', ev.end);
            count++;
            if (count >= 5) break;
        }
    }
});
