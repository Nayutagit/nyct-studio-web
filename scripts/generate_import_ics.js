const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Raw text from previous script (scripts/parse_airreserve.js)
// Copying it here to ensure we have the data source.
const rawText = `2039P7ZZA 2025/12/09(火) 10:00 2026/03/10(火) 12:00～14:00 福永先生 フクナガ B room レンタル 予約確定
209M5823S 2025/12/09(火) 09:59 2026/03/05(木) 11:00～13:00 福永先生 フクナガ A room レンタル 予約確定
20QLPUT8C 2025/12/13(土) 17:20 2026/02/28(土) 20:00～21:00 山根 ヤマネ A room レンタル 予約確定
209QGLMG4 2025/12/13(土) 17:19 2026/02/28(土) 09:00～20:00 山根 ヤマネ A room レンタル 予約確定
2112BGQEC 2025/12/09(火) 10:00 2026/02/24(火) 12:00～14:00 福永先生 フクナガ B room レンタル 予約確定
2000BW2XJ 2025/12/13(土) 17:19 2026/02/21(土) 20:00～21:00 山根 ヤマネ A room レンタル 予約確定
211JEW1W8 2025/12/13(土) 17:18 2026/02/21(土) 09:00～20:00 山根 ヤマネ A room レンタル 予約確定
2123BALY8 2025/12/09(火) 09:58 2026/02/19(木) 11:00～13:00 福永先生 フクナガ A room レンタル 予約確定
21QUS7CDN 2025/12/13(土) 17:18 2026/02/14(土) 20:00～21:00 山根 ヤマネ A room レンタル 予約確定
20ZJ73NZN 2025/12/13(土) 17:17 2026/02/14(土) 09:00～20:00 山根 ヤマネ A room レンタル 予約確定
21T0WX3R2 2025/12/09(火) 10:01 2026/02/10(火) 12:00～14:00 福永先生 フクナガ B room レンタル 予約確定
218J4P8F2 2025/12/13(土) 17:17 2026/02/07(土) 20:00～21:00 山根 ヤマネ A room レンタル 予約確定
20M5UA1MS 2025/12/13(土) 17:17 2026/02/07(土) 09:00～20:00 山根 ヤマネ A room レンタル 予約確定
200GTZY9E 2025/12/09(火) 09:58 2026/02/05(木) 11:00～13:00 福永先生 フクナガ A room レンタル 予約確定
20U1A63E0 2025/11/22(土) 20:04 2026/01/31(土) 17:00～21:00 山根 ヤマネ A room レンタル 予約確定
212UWFTEQ 2025/11/26(水) 09:54 2026/01/31(土) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
207B03LHE 2025/11/22(土) 20:03 2026/01/31(土) 09:00～14:00 山根 ヤマネ A room レンタル 予約確定
20Z11KFHJ 2025/12/06(土) 11:46 2026/01/31(土) 09:00～11:00 - ヒダカ B room レンタル 予約確定
20K76YM92 2025/10/28(火) 15:23 2026/01/30(金) 15:00～20:00 大塚 オオツカ A room レンタル 予約確定
21QNF2KZA 2025/12/09(火) 13:40 2026/01/30(金) 10:00～15:00 - フザイ B room レンタル 予約確定
21GU4FVYC 2025/12/09(火) 13:40 2026/01/30(金) 10:00～15:00 - フザイ A room レンタル 予約確定
20H3M0YPS 2025/12/06(土) 11:49 2026/01/29(木) 18:00～21:00 - ヒダカ A room レンタル 予約確定
202G6Y9CU 2025/11/26(水) 09:53 2026/01/29(木) 14:00～21:00 西本 ニシモト B room レンタル 予約確定
203NZDRL4 2025/10/28(火) 15:23 2026/01/28(水) 17:00～20:00 大塚 オオツカ A room レンタル 予約確定
215XH145N 2025/10/28(火) 15:23 2026/01/28(水) 13:30～14:30 大塚 オオツカ A room レンタル 予約確定
21HNWVQ0G 2025/11/26(水) 09:53 2026/01/28(水) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
20NRJKZE0 2025/10/17(金) 12:43 2026/01/27(火) 12:00～14:00 福永先生 フクナガ B room レンタル 予約確定
20BXCREKJ 2025/12/09(火) 13:39 2026/01/26(月) 15:00～21:00 西本 ニシモト A room レンタル 予約確定
21CY2KNJ4 2025/12/09(火) 13:40 2026/01/26(月) 10:00～15:00 - フザイ B room レンタル 予約確定
21QL88ASU 2025/12/09(火) 13:39 2026/01/26(月) 10:00～15:00 - フザイ A room レンタル 予約確定
21V5MJ5GL 2025/10/28(火) 15:22 2026/01/25(日) 15:00～17:00 大塚 オオツカ A room レンタル 予約確定
21L3H4AUQ 2025/10/28(火) 15:22 2026/01/25(日) 10:00～12:00 大塚 オオツカ A room レンタル 予約確定
20N13JBCL 2025/11/26(水) 09:54 2026/01/24(土) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
21UFED6DE 2025/10/28(火) 15:22 2026/01/23(金) 15:00～20:00 大塚 オオツカ A room レンタル 予約確定
21BKV3ZJ8 2025/12/09(火) 13:39 2026/01/23(金) 10:00～15:00 - フザイ B room レンタル 予約確定
206132U8Q 2025/12/09(火) 13:38 2026/01/23(金) 10:00～15:00 - フザイ A room レンタル 予約確定
20VBL61NQ 2025/12/06(土) 11:48 2026/01/22(木) 18:00～21:00 - ヒダカ A room レンタル 予約確定
21TS8KVPW 2025/11/26(水) 09:51 2026/01/22(木) 14:00～21:00 西本 ニシモト B room レンタル 予約確定
10HS1URAG 2025/11/22(土) 09:55 2026/01/22(木) 13:00～17:00 坂下 文野 サカシタ フミノ A room レンタル 予約確定
219UU5NXS 2025/10/17(金) 12:41 2026/01/22(木) 11:00～13:00 福永先生 フクナガ A room レンタル 予約確定
11RB1N9GL 2025/11/22(土) 09:56 2026/01/22(木) 10:00～13:00 坂下 文野 サカシタ フミノ B room レンタル 予約確定
21KD9ZBRJ 2025/10/28(火) 15:22 2026/01/21(水) 17:00～20:00 大塚 オオツカ A room レンタル 予約確定
213SVL6W4 2025/10/28(火) 15:21 2026/01/21(水) 13:30～14:30 大塚 オオツカ A room レンタル 予約確定
21001VX20 2025/11/26(水) 09:52 2026/01/21(水) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
20CFAFW7A 2025/11/28(金) 12:39 2026/01/20(火) 15:00～21:00 西本 ニシモト A room レンタル 予約確定
20SRQ7M9A 2025/11/28(金) 12:39 2026/01/19(月) 15:00～21:00 西本 ニシモト A room レンタル 予約確定
21JMRRF9J 2025/12/09(火) 13:38 2026/01/19(月) 10:00～15:00 - フザイ A room レンタル 予約確定
20U1DSQYQ 2025/12/09(火) 13:38 2026/01/19(月) 10:00～15:00 - フザイ B room レンタル 予約確定
20TEQJYEU 2025/10/28(火) 15:21 2026/01/18(日) 15:00～17:00 大塚 オオツカ A room レンタル 予約確定
20XWKXLKA 2025/10/28(火) 15:21 2026/01/18(日) 10:00～12:00 大塚 オオツカ A room レンタル 予約確定
20CYGF42C 2025/11/22(土) 20:00 2026/01/17(土) 17:00～21:00 山根 ヤマネ A room レンタル 予約確定
200QZZDRS 2025/11/26(水) 09:54 2026/01/17(土) 10:00～20:00 西本 ニシモト B room レンタル 予約確定
21N8P7HVJ 2025/11/22(土) 19:59 2026/01/17(土) 09:00～14:00 山根 ヤマネ A room レンタル 予約確定
20H0CPET2 2025/10/28(火) 15:20 2026/01/16(金) 15:00～20:00 大塚 オオツカ A room レンタル 予約確定
21BH89XVS 2025/12/12(金) 12:04 2026/01/16(金) 10:00～13:00 西本 ニシモト B room レンタル 予約確定
210HNJ2KS 2025/11/26(水) 09:51 2026/01/15(木) 14:00～21:00 西本 ニシモト B room レンタル 予約確定
20L8E8YAL 2025/10/28(火) 15:20 2026/01/14(水) 17:00～20:00 大塚 オオツカ A room レンタル 予約確定
21GLN7QKA 2025/10/28(火) 15:20 2026/01/14(水) 13:30～14:30 大塚 オオツカ A room レンタル 予約確定
20X9LYK28 2025/11/26(水) 09:51 2026/01/14(水) 13:00～21:00 西本 ニシモト B room レンタル 予約確定
`;

function exportToICS() {
    const lines = rawText.split('\n').filter(l => l.trim());
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Nyct Studio//AirReserve Import//EN\n";

    let count = 0;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    lines.forEach(line => {
        if (!line.includes('予約確定')) return;

        // Skip Fuzai if you don't want them in Google Calendar?
        // User asked for "Existing AirReserve bookings".
        // Usually "Fuzai" (Absence) might be useful to block the calendar too.
        // Let's include everything that is confirmed.

        // Extract date
        const dateRegex = /(\d{4})\/(\d{2})\/(\d{2})\([^)]+\)/g;
        const dateMatches = [...line.matchAll(dateRegex)];
        if (dateMatches.length < 2) return;

        const serviceDate = dateMatches[1][0]; // "2026/01/14"
        const [y, m, d] = serviceDate.split('(')[0].split('/');

        // Extract time
        const timeRegex = /(\d{1,2}):(\d{2})～(\d{1,2}):(\d{2})/;
        const timeMatch = line.match(timeRegex);
        if (!timeMatch) return;

        const startH = timeMatch[1].padStart(2, '0');
        const startM = timeMatch[2];
        const endH = timeMatch[3].padStart(2, '0');
        const endM = timeMatch[4];

        // Format dates for ICS: YYYYMMDDTHHMMSS
        const dtStart = `${y}${m}${d}T${startH}${startM}00`;
        const dtEnd = `${y}${m}${d}T${endH}${endM}00`;

        // Summary & Description
        // Line format: ... 福永先生 フクナガ B room レンタル 予約確定
        // We can just use the line as description
        // Summary: "B room レンタル (福永先生)" etc

        // Basic extraction for Summary
        let summary = "予約: ";
        if (line.includes('A room')) summary += "A room ";
        if (line.includes('B room')) summary += "B room ";

        // Find name
        const parts = line.split(' ');
        // Finds name after time usually? 
        // Example: ... 12:00～14:00 福永先生 フクナガ ...
        // We can just use the whole line text for detailed description

        icsContent += "BEGIN:VEVENT\n";
        icsContent += `DTSTART;TZID=Asia/Tokyo:${dtStart}\n`;
        icsContent += `DTEND;TZID=Asia/Tokyo:${dtEnd}\n`;
        icsContent += `SUMMARY:${summary}\n`;
        icsContent += `DESCRIPTION:${line}\n`;
        icsContent += `DTSTAMP:${now}\n`;
        icsContent += `UID:airreserve-${y}${m}${d}-${startH}${startM}-${count}@nyctstudio.com\n`;
        icsContent += "END:VEVENT\n";

        count++;
    });

    icsContent += "END:VCALENDAR";

    fs.writeFileSync('airreserve_import.ics', icsContent);
    console.log(`Exported ${count} events to airreserve_import.ics`);
}

exportToICS();
