import os

html = """<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1080, height=1920, initial-scale=1.0">
    <title>Chocolat musique Availability</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Zen+Old+Mincho:wght@400;700&family=Jost:wght@400;600&display=swap');

        :root {
            --text-color: #333333;
            --accent-color: #c9a050;
            --bg-base: #fffaf0;
        }

        body {
            margin: 0;
            padding: 120px 0 0 0;
            width: 1080px;
            height: 1920px;
            background-image: radial-gradient(circle at 10% 20%, rgba(255,192,203,0.4) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(173,216,230,0.4) 0%, transparent 50%), radial-gradient(circle at 30% 80%, rgba(255,228,196,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 90%, rgba(221,160,221,0.3) 0%, transparent 50%);
            background-color: var(--bg-base);
            background-blend-mode: multiply;
            color: var(--text-color);
            font-family: 'Zen Old Mincho', serif;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .decorative-border {
            position: absolute;
            top: 40px; left: 40px; right: 40px; bottom: 40px;
            border: 2px solid rgba(212, 175, 55, 0.5);
            border-radius: 40px;
            pointer-events: none;
            z-index: 10;
        }

        .container {
            width: 900px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 50px;
            z-index: 5;
            flex-grow: 1;
        }

        .main-header {
            text-align: center;
            width: 100%;
        }

        .date-text {
            font-family: 'Jost', sans-serif;
            font-size: 110px;
            font-weight: 600;
            color: var(--text-color);
            line-height: 1;
            letter-spacing: -0.02em;
        }

        .date-text span.weekday {
            font-size: 70px;
            color: #666;
            margin-left: 15px;
            font-weight: 400;
        }

        .avail-text {
            font-size: 60px;
            font-weight: 700;
            color: var(--text-color);
            margin-top: 15px;
            letter-spacing: 0.15em;
            display: inline-block;
            border-bottom: 3px solid rgba(212, 175, 55, 0.4);
            padding-bottom: 25px;
        }

        .rooms-row {
            display: flex;
            width: 100%;
            justify-content: space-around;
            gap: 30px;
        }

        .room-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 25px;
            flex: 1;
        }

        .room-header {
            font-family: 'Jost', sans-serif;
            font-size: 55px;
            font-weight: 600;
            color: var(--accent-color);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 10px;
        }

        .time-slots {
            display: flex;
            flex-direction: column;
            gap: 25px;
            width: 100%;
            align-items: center;
        }

        .slot {
            font-family: 'Jost', sans-serif;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(212, 175, 55, 0.6);
            color: var(--text-color);
            border-radius: 60px;
            padding: 20px 0;
            width: 100%;
            max-width: 400px;
            font-size: 50px;
            font-weight: 600;
            text-align: center;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.6);
            letter-spacing: 0.05em;
        }

        .no-slots {
            font-size: 50px;
            opacity: 0.5;
            text-align: center;
            padding: 40px;
            font-family: 'Zen Old Mincho', serif;
        }

        .weekly-summary {
            width: 100%;
            margin-top: 20px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(15px);
            border-radius: 40px;
            box-sizing: border-box;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(255,255,255,0.8);
        }

        .weekly-header {
            font-size: 45px;
            font-weight: 700;
            color: var(--text-color);
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            position: relative;
        }
        
        .weekly-header::after {
            content: '';
            position: absolute;
            bottom: 0; left: 50%; transform: translateX(-50%);
            width: 100px;
            height: 3px;
            background: var(--accent-color);
            border-radius: 2px;
        }

        .weekly-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
        }

        .weekly-row {
            display: flex;
            justify-content: space-between;
            width: 85%;
            font-size: 48px;
            font-family: 'Jost', sans-serif;
            font-weight: 600;
            align-items: center;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            padding-bottom: 15px;
        }

        .weekly-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }

        .weekly-date {
            color: var(--text-color);
        }

        .weekly-status {
            font-size: 55px; /* bigger symbols */
            line-height: 1;
        }
        .status-o { color: #4CAF50; }
        .status-tri { color: #FF9800; font-size: 60px; }
        .status-x { color: #E53935; font-size: 65px; font-weight: 400;} 

        /* Booking Call to Action */
        .booking-prompt {
            text-align: center;
            margin-top: 30px;
            z-index: 5;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .booking-text {
            font-size: 55px;
            font-weight: 700;
            color: #fff;
            background: var(--accent-color);
            padding: 15px 50px;
            border-radius: 50px;
            box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4);
            letter-spacing: 0.05em;
        }
        .booking-arrow {
            font-size: 80px;
            color: var(--accent-color);
            margin-top: 10px;
            line-height: 1;
        }
        .booking-space {
            height: 250px; /* Space for instagram link sticker */
            width: 100%;
        }
    </style>
</head>
<body>
    <div class="decorative-border"></div>
    <div class="container">
        <!-- Header -->
        <div class="main-header">
            <span class="date-text">2/9 <span class="weekday">(Mon)</span></span>
            <br>
            <span class="avail-text">の空き状況</span>
        </div>

        <!-- Rooms Row -->
        <div class="rooms-row">
            <div class="room-col">
                <div class="room-header">A room</div>
                <div class="time-slots">
                    <div class="slot">10:00 - 13:00</div>
                    <div class="slot">15:00 - 18:00</div>
                </div>
            </div>
            <div class="room-col">
                <div class="room-header">B room</div>
                <div class="time-slots">
                    <div class="no-slots">予約で一杯です</div>
                </div>
            </div>
        </div>

        <!-- Weekly Summary -->
        <div class="weekly-summary">
            <div class="weekly-header">今後の空き状況 (Next 7 days)</div>
            <div class="weekly-list">
                <div class="weekly-row">
                    <span class="weekly-date">2/10(Tue)</span>
                    <span class="weekly-status status-o">〇</span>
                </div>
                <div class="weekly-row">
                    <span class="weekly-date">2/11(Wed)</span>
                    <span class="weekly-status status-tri">△</span>
                </div>
                <div class="weekly-row">
                    <span class="weekly-date">2/12(Thu)</span>
                    <span class="weekly-status status-x">×</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="booking-prompt">
        <span class="booking-text">ご予約はこちら</span>
        <div class="booking-arrow">↓</div>
    </div>
    <div class="booking-space"></div>
</body>
</html>"""

with open("templates/story_avail_demo.html", "w") as f:
    f.write(html)
