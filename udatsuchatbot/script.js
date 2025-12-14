const chatMessages = document.getElementById('chat-messages');
const chatControls = document.getElementById('chat-controls');
const zoomOverlay = document.getElementById('zoom-overlay');
const closeZoomBtn = document.getElementById('close-zoom');

// Scenario Data
const scenarios = {
    start: {
        messages: [
            "こんにちは。思考資産構築サービス『Udatsu』へようこそ。",
            "あなたが今、主に取り組まれているお仕事や立場について教えていただけますか？"
        ],
        options: [
            { label: "経営者・役員", next: "owner" },
            { label: "フリーランス・個人事業主", next: "freelance" },
            { label: "会社員", next: "employee" },
            { label: "その他（主婦・学生など）", next: "other" }
        ]
    },

    // Persona: Owner
    owner: {
        messages: [
            "経営者の方ですね。日々の意思決定や、理念の共有など、言葉にするべきことが山ほどあるかと思います。",
            "しかし、忙しくてアウトプットの時間が取れない、あるいは、口頭では伝えても形に残っていない…ということはありませんか？"
        ],
        options: [
            { label: "確かに、時間がない", next: "pain_time" },
            { label: "社内に浸透しない悩みがある", next: "pain_share" },
            { label: "発信は特に考えていない", next: "no_publish_intent" }
        ]
    },

    // Persona: Freelance
    freelance: {
        messages: [
            "フリーランスの方ですね。個人の信頼がそのまま仕事に直結する働き方かと思います。",
            "自分のスキルや想いを発信したいけれど、日々の業務に追われて後回しになってしまっていませんか？"
        ],
        options: [
            { label: "まさにその通り", next: "pain_time" },
            { label: "書くのが苦手", next: "pain_writing" },
            { label: "今はまだ発信するほどじゃ…", next: "no_publish_intent" }
        ]
    },

    // Persona: Employee
    employee: {
        messages: [
            "会社にお勤めですね。日々の業務で得た気づきや、将来のためのスキルアップ、副業の準備など、",
            "頭の中にあるアイデアを整理したい、記録しておきたいと思うことはありませんか？"
        ],
        options: [
            { label: "整理したいと思ってる", next: "pain_writing" },
            { label: "副業に興味がある", next: "side_hustle" },
            { label: "公開するのはちょっと…", next: "no_publish_intent" }
        ]
    },

    // Persona: Other
    other: {
        messages: [
            "ありがとうございます。日々の生活の中で感じたことや、忘れたくない大切な思い出、",
            "あるいは、これから始めたい挑戦について、言葉にして残しておきたいと思ったことはありませんか？"
        ],
        options: [
            { label: "日記のような感じで？", next: "life_log" },
            { label: "誰かに見せるのは恥ずかしい", next: "no_publish_intent" }
        ]
    },

    // Branch: Pain Points / Interests
    pain_time: {
        messages: [
            "時間は誰にとっても貴重ですよね。",
            "Udatsuなら、スマホに向かって「喋るだけ」です。移動中や隙間時間の5分で終わります。",
            "あなたの声をAIとプロが編集し、読みやすいテキストや記事に仕上げます。"
        ],
        options: [
            { label: "それなら続けられそう", next: "asset_value" },
            { label: "本当に喋るだけでいいの？", next: "easy_process" }
        ]
    },
    pain_share: {
        messages: [
            "一度話したことが、何度も読み返せる「資産」として残るのがUdatsuの強みです。",
            "あなたの言葉が、社内報になり、ブランドストーリーになり、採用広報になります。",
            "同じことを何度も言う必要がなくなります。"
        ],
        options: [
            { label: "それは助かる", next: "asset_value" },
            { label: "詳しく聞きたい", next: "consultation" }
        ]
    },
    pain_writing: {
        messages: [
            "書こうとすると、うまくまとまらなかったり、時間がかかってしまいますよね。",
            "でも、親しい友人に話すように喋ることはできるはずです。",
            "Udatsuを使えば、あなたは「喋る」という最も自然なアウトプットに集中するだけです。"
        ],
        options: [
            { label: "喋るなら得意", next: "easy_process" },
            { label: "どんな文章になるの？", next: "consultation" }
        ]
    },
    side_hustle: {
        messages: [
            "今の時代、個人の発信力は大きな武器になります。",
            "ですが、いきなり顔出しや完璧なブログを目指す必要はありません。",
            "まずは自分の思考を積み上げていくこと。それが、将来のあなたを助ける強力な「思考資産」になります。"
        ],
        options: [
            { label: "思考資産って？", next: "asset_value" },
            { label: "公開しなくてもいい？", next: "no_publish_intent" }
        ]
    },
    life_log: {
        messages: [
            "そうです。10年後の自分への手紙のように。",
            "あるいは、お子様へのメッセージとして。",
            "声で残すことで、その時の感情や温度感まで、そのまま「資産」として保存できます。"
        ],
        options: [
            { label: "素敵ですね", next: "asset_value" },
            { label: "やってみたい", next: "consultation" }
        ]
    },

    // Core Value: "No Publish Intent" is OK => Thought Asset
    no_publish_intent: {
        messages: [
            "実は、そこが一番お伝えしたいポイントなんです。",
            "「Udatsu」は、必ずしも世の中に公開（発信）するために使う必要はありません。",
            "むしろ、誰にも見せない「自分だけの思考整理」として使っている方も多いんです。"
        ],
        options: [
            { label: "どういうこと？", next: "asset_internal" }
        ]
    },
    asset_internal: {
        messages: [
            "自分の頭の中にあるモヤモヤを外に出して、客観的に見る。",
            "それだけで脳がスッキリして、次の行動が見えてきます。",
            "公開する・しないは後で決めればいいのです。まずは「残す」ことが重要です。",
            "私たちはそれを「思考資産」と呼んでいます。"
        ],
        options: [
            { label: "なるほど、それなら使いたい", next: "consultation_bridge" },
            { label: "思考資産、面白い", next: "consultation_bridge" }
        ]
    },

    asset_value: {
        messages: [
            "積み上がったあなたの言葉は、決して減ることのない「思考資産」となります。",
            "それは時にあなたを助け、時に誰かを救い、ビジネスや人生を加速させる土台になります。",
            "発信する気がなくても、まずは「溜める」ことから始めてみませんか？"
        ],
        options: [
            { label: "始めてみたい", next: "consultation_bridge" }
        ]
    },
    easy_process: {
        messages: [
            "はい、本当に喋るだけです。",
            "あとは私たちが受け取り、整理し、最適な形（Note、日報、備忘録など）に変換してお返しします。",
            "あなたの脳の負担を極限まで減らす仕組みを作りました。"
        ],
        options: [
            { label: "試してみたい", next: "consultation_bridge" }
        ]
    },

    // Final Bridge to CTA
    consultation_bridge: {
        messages: [
            "Udatsuがあなたにとって、どのような「資産」になり得るか。",
            "よろしければ、30分の無料Zoom相談で具体的にお話しさせていただけませんか？",
            "あなたの現状をヒアリングさせていただき、最適な活用法をご提案します。",
            "もちろん、無理な売り込みは一切いたしません。"
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
        }, 1200);
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
