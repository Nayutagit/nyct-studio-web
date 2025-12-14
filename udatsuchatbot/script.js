const chatMessages = document.getElementById('chat-messages');
const chatControls = document.getElementById('chat-controls');
const zoomOverlay = document.getElementById('zoom-overlay');
const closeZoomBtn = document.getElementById('close-zoom');

// Scenario Data
const scenarios = {
    start: {
        messages: [
            "こんにちは。思考資産構築サービス『Udatsu』について、私がご案内します。",
            "何か気になることはありますか？"
        ],
        options: [
            { label: "Udatsuとは？", next: "what_is" },
            { label: "料金について", next: "pricing" },
            { label: "導入事例を見たい", next: "cases" },
            { label: "無料相談したい", next: "consultation" }
        ]
    },
    what_is: {
        messages: [
            "『Udatsu』は、あなたの「喋り」を「資産」に変えるサービスです。",
            "Voice Journalingという手法を使い、あなたがスマホに向かって話した音声を送るだけで、AIとプロの編集者がブログ記事やSNS投稿を作成します。",
            "書く時間がなくても、あなたの思考や価値観を毎日発信できるようになります。"
        ],
        options: [
            { label: "詳しく聞きたい", next: "details" },
            { label: "料金は？", next: "pricing" },
            { label: "TOPに戻る", next: "start" }
        ]
    },
    details: {
        messages: [
            "具体的には、専用のLINEやフォームに音声を吹き込むだけです。",
            "そこからNote記事（SEO対策済み）を作成し、毎日更新を代行します。",
            "上位プランではPodcast配信も同時に行い、テキストと音声の両面からファンを増やします。"
        ],
        options: [
            { label: "料金を見る", next: "pricing" },
            { label: "導入事例は？", next: "cases" },
            { label: "無料相談へ", next: "consultation" }
        ]
    },
    pricing: {
        messages: [
            "基本となる『スタンダードプラン』は月額12,000円（+税）です。",
            "※2025年12月限定で、通常24,000円から50%OFFとなっています。",
            "これには月最大31本の記事作成・投稿代行が含まれます。",
            "Podcast配信も含めた『Proプラン』は月額50,000円（+税）です。"
        ],
        options: [
            { label: "安い！申し込む", next: "consultation" },
            { label: "どんな人が使ってる？", next: "cases" },
            { label: "TOPに戻る", next: "start" }
        ]
    },
    cases: {
        messages: [
            "例えば、株式会社逆光様では『逆張りマーケラジオ』というコンテンツを運用しています。",
            "代表・勇様の音声を元に、PodcastとNoteを連動させて毎日更新しており、検索順位でも上位を獲得しています。",
            "「本人は喋るだけ」でコンテンツが資産として積み上がっていく好例です。"
        ],
        options: [
            { label: "すごい。やってみたい", next: "consultation" },
            { label: "もっと詳しく", next: "what_is" },
            { label: "TOPに戻る", next: "start" }
        ]
    },
    consultation: {
        messages: [
            "興味を持っていただきありがとうございます！",
            "Udatsuがあなたにどのようなメリットをもたらすか、一度30分の無料Zoom相談でお話ししませんか？",
            "無理な勧誘は一切ありませんので、ご安心ください。"
        ],
        action: "showZoomOverlay"
    }
};

// Utils
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot', 'typing-indicator');
    typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv;
}

function addMessage(text, type = 'bot') {
    const div = document.createElement('div');
    div.classList.add('message', type);
    div.textContent = text;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function clearOptions() {
    chatControls.innerHTML = '';
}

function showOptions(options) {
    clearOptions();
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = opt.label;
        btn.onclick = () => handleUserChoice(opt);
        chatControls.appendChild(btn);
    });
}

// Logic Flow
async function playScenario(scenarioKey) {
    const scenario = scenarios[scenarioKey];
    clearOptions(); // Disable controls while bot types

    for (const msg of scenario.messages) {
        const typing = await showTyping();
        await delay(800 + Math.random() * 500); // Simulate typing time
        typing.remove();
        addMessage(msg, 'bot');
        await delay(500); // Pause between messages
    }

    if (scenario.action === "showZoomOverlay") {
        setTimeout(() => {
            zoomOverlay.classList.add('active');
        }, 1000);
        // Provide a "Back" option just in case they close the overlay
        showOptions([{ label: "最初に戻る", next: "start" }]);
    } else if (scenario.options) {
        showOptions(scenario.options);
    }
}

function handleUserChoice(option) {
    addMessage(option.label, 'user');
    playScenario(option.next);
}

// Zoom Overlay Logic
closeZoomBtn.addEventListener('click', () => {
    zoomOverlay.classList.remove('active');
});

// Init
window.addEventListener('DOMContentLoaded', () => {
    // Initial delay before first message
    setTimeout(() => {
        playScenario('start');
    }, 1000);
});
