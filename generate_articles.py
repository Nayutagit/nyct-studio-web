import os
import random

articles = [
    {"id": 11, "title": "習慣化の壁を越える", "date": "2025.04.20", "category": "Mindset", "desc": "三日坊主を卒業するために必要なこと。意志の力に頼らず、仕組みで解決する方法について。", "img": "incubation_bg.png"},
    {"id": 12, "title": "レセプションでの気づき", "date": "2025.04.24", "category": "Business", "desc": "先日参加したレセプションパーティーで感じた、リアルな場の熱量と、そこで生まれるチャンスについて。", "img": "coffee_bg.png"},
    {"id": 13, "title": "ポッドキャストの定義", "date": "2025.04.28", "category": "Voice", "desc": "単なるラジオのアーカイブではない。ポッドキャストだからこそできる、深いコミュニケーションの形。", "img": "voice_bg.png"},
    {"id": 14, "title": "マインドとスキルの関係", "date": "2025.04.28", "category": "Mindset", "desc": "スキルは車、マインドはエンジン。どちらが欠けても前に進まない理由。", "img": "school_bg.png"},
    {"id": 15, "title": "「一旦置いといて」の効用", "date": "2025.04.29", "category": "Mindset", "desc": "悩みすぎて動けなくなった時、魔法の言葉「一旦置いといて」が思考の突破口になる。", "img": "design_bg.png"},
    {"id": 16, "title": "本当の差別化とは", "date": "2025.04.29", "category": "Business", "desc": "奇をてらうことではない。当たり前のことを、誰よりも徹底してやり続けることの強さ。", "img": "udatsu_hero_bg.png"},
    {"id": 17, "title": "なぜカフェをやりたいのか", "date": "2025.05.01", "category": "Vision", "desc": "コーヒーを売りたいわけではない。私がカフェという「場所」にこだわる本当の理由。", "img": "coffee_bg.png"},
    {"id": 18, "title": "手札を増やす", "date": "2025.05.01", "category": "Business", "desc": "一つのスキルに固執しない。複数の武器を掛け合わせることで、あなただけの価値が生まれる。", "img": "incubation_bg.png"},
    {"id": 19, "title": "AI時代の人間の価値", "date": "2025.05.01", "category": "Udatsu / AI", "desc": "AIにできることはAIに任せればいい。人間が人間らしくあるために、今すべきこと。", "img": "design_bg.png"},
    {"id": 20, "title": "理想の働き方を求めて", "date": "2025.05.01", "category": "Life", "desc": "場所や時間に縛られない働き方。それを実現するために、私が捨てたものと得たもの。", "img": "udatsu_hero_bg_v2.png"},
    {"id": 21, "title": "目指すべき場所", "date": "2025.11.27", "category": "Vision", "desc": "ニストスタジオが描く10年後の未来図。地域に根ざし、世界と繋がるクリエイティブ拠点へ。", "img": "school_bg.png"},
    {"id": 22, "title": "春の決意", "date": "2025.04.06", "category": "Life", "desc": "新しい季節の始まりに。初心に帰り、改めて自分自身と向き合う時間。", "img": "voice_bg.png"},
    {"id": 23, "title": "プロセスエコノミーの実践", "date": "2025.05.24", "category": "Business", "desc": "完成品だけでなく、制作過程そのものをコンテンツ化する。ファンと共に歩む新しいビジネスモデル。", "img": "incubation_bg.png"},
    {"id": 24, "title": "音声とSEOの未来", "date": "2025.05.24", "category": "Udatsu / AI", "desc": "検索エンジンの進化と音声コンテンツの可能性。声で検索される時代への備え。", "img": "udatsu_hero_bg.png"},
    {"id": 25, "title": "思考の銀行", "date": "2025.05.25", "category": "Udatsu / AI", "desc": "日々のアイデアを貯金するように記録する。それがいつか、大きな利子を生む資産になる。", "img": "design_bg.png"},
    {"id": 26, "title": "iPhone一台で始める", "date": "2025.05.26", "category": "Voice", "desc": "高価な機材は必要ない。ポケットの中にあるスタジオで、今すぐ発信を始めよう。", "img": "voice_bg.png"},
    {"id": 27, "title": "営業はリクエスト", "date": "2025.05.27", "category": "Business", "desc": "「売る」のではなく「リクエストに応える」。視点を変えるだけで、営業はもっと楽しくなる。", "img": "coffee_bg.png"},
    {"id": 28, "title": "記事代行のロードマップ", "date": "2025.05.28", "category": "Business", "desc": "Udatsuの記事制作プロセスを公開。ヒアリングから納品まで、私たちが大切にしていること。", "img": "udatsu_hero_bg_v2.png"},
    {"id": 29, "title": "Udatsuの原風景", "date": "2025.04.14", "category": "Vision", "desc": "なぜこのサービスを始めたのか。その原点にある、ある経営者との出会い。", "img": "udatsu_hero_bg.png"},
    {"id": 30, "title": "Udatsuが提供する価値", "date": "2025.04.17", "category": "Udatsu / AI", "desc": "単なる時間短縮ではない。あなたの思考を深め、新たな気づきを与える壁打ち相手として。", "img": "design_bg.png"},
    {"id": 31, "title": "音声の可能性", "date": "2025.04.15", "category": "Voice", "desc": "視覚情報に疲れた現代人にこそ、音声が響く。耳からの情報は、心に直接届く。", "img": "voice_bg.png"},
    {"id": 32, "title": "代行サービスの裏側", "date": "2025.05.30", "category": "Business", "desc": "プロのライターとAIはどう協業しているのか。品質を担保するための舞台裏。", "img": "incubation_bg.png"},
    {"id": 33, "title": "嫉妬をエネルギーに変える", "date": "2025.06.01", "category": "Mindset", "desc": "他人の成功を羨むのは悪いことじゃない。その感情こそが、自分を成長させるガソリンになる。", "img": "school_bg.png"},
    {"id": 34, "title": "営業を学び直す", "date": "2025.06.02", "category": "Business", "desc": "クリエイターも数字から逃げてはいけない。改めて学ぶ、ビジネスの基礎体力。", "img": "coffee_bg.png"},
    {"id": 35, "title": "粘り強さについて", "date": "2025.06.03", "category": "Mindset", "desc": "才能の差なんて微々たるもの。最後に勝つのは、しつこく続けた人だけだ。", "img": "incubation_bg.png"},
    {"id": 36, "title": "投資としての自己投資", "date": "2025.06.04", "category": "Business", "desc": "お金を使うことを恐れない。自分への投資は、最もリターンの高い金融商品だ。", "img": "design_bg.png"},
    {"id": 37, "title": "道筋が見えなくても進む", "date": "2025.06.05", "category": "Mindset", "desc": "正解がわかってから動くのではない。動くから正解が見えてくる。", "img": "udatsu_hero_bg.png"},
    {"id": 38, "title": "私の履歴書", "date": "2025.04.17", "category": "Life", "desc": "失敗だらけのキャリアを振り返る。遠回りしたからこそ、見えた景色がある。", "img": "coffee_bg.png"},
    {"id": 39, "title": "キャッチコピーの重要性", "date": "2025.06.07", "category": "Business", "desc": "たった一言で人生が変わることもある。言葉の力を味方につける方法。", "img": "voice_bg.png"},
    {"id": 40, "title": "30代からの挑戦", "date": "2025.04.05", "category": "Life", "desc": "遅すぎることなんてない。今が一番若い日。新しい一歩を踏み出すあなたへ。", "img": "school_bg.png"}
]

template = """<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Blog | Nyct Studio - 広島のナレーション・ボイストレーニング・Udatsu</title>
    <meta name="description" content="{desc}">
    <link rel="stylesheet" href="../style.css?v=2">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tsukushi+B+Round+Gothic&family=Zen+Old+Mincho:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="icon" type="image/png" href="../favicon.png">
</head>
<body>
    <header class="header">
        <div class="container header-container">
            <a href="../index.html" class="logo">Nyct Studio</a>
            <nav class="nav">
                <ul class="nav-list">
                    <li><a href="../index.html" class="nav-link">Home</a></li>
                    <li><a href="../udatsu.html" class="nav-link">Udatsu</a></li>
                    <li><a href="../about.html" class="nav-link">About</a></li>
                    <li><a href="../voice.html" class="nav-link">Voice</a></li>
                    <li><a href="../school.html" class="nav-link">School</a></li>
                    <li><a href="../incubation.html" class="nav-link">Incubation</a></li>
                    <li><a href="../blog.html" class="nav-link active" style="color: var(--accent-teal);">Blog</a></li>
                    <li><a href="../contact.html" class="nav-link">Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <section class="section bg-dark-concrete" style="padding-top: 150px; padding-bottom: 50px;">
        <div class="container">
            <h1 class="section-title">{title}</h1>
            <div style="text-align: center; margin-top: 20px; color: var(--accent-teal);">
                <span style="margin-right: 15px;">{date}</span>
                <span style="background: rgba(0, 164, 216, 0.1); padding: 5px 15px; border-radius: 20px; font-size: 0.9rem;">{category}</span>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="blog-content" style="max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 4px; line-height: 2; color: #333;">
                <div style="margin-bottom: 40px;">
                    <img src="../img/{img}" alt="{title}" style="width: 100%; height: auto; border-radius: 4px;">
                </div>

                <p style="margin-bottom: 30px;">こんにちは、ナユタです。</p>

                <p>{desc}</p>

                <h3 style="font-size: 1.5rem; margin-top: 40px; margin-bottom: 20px; border-left: 4px solid var(--accent-teal); padding-left: 15px;">{title}について</h3>
                <p>最近、ふと{title}について考えることがあったんだよね。</p>
                <p>毎日忙しくしてると、つい目の前のことばかりになっちゃうけど、たまには立ち止まって、こういう本質的なことを考える時間も大事だなって思う。</p>
                <p>特に最近感じるのは、小手先のテクニックよりも、その奥にある「想い」とか「哲学」みたいなものが、結局は一番強いんじゃないかなってこと。</p>

                <h3 style="font-size: 1.5rem; margin-top: 40px; margin-bottom: 20px; border-left: 4px solid var(--accent-teal); padding-left: 15px;">やってみて気づいたこと</h3>
                <p>実際に動いてみると、頭で考えてたのとは全然違う反応が返ってくることもあるよね。でも、それは失敗じゃなくて、次に繋がる大事なヒントなんだ。</p>
                <p>「とりあえずやってみて、違ったら直す」。この繰り返しをどれだけ楽しめるかが、成長の鍵なんじゃないかな。</p>

                <h3 style="font-size: 1.5rem; margin-top: 40px; margin-bottom: 20px; border-left: 4px solid var(--accent-teal); padding-left: 15px;">これからどうする？</h3>
                <p>今回の気づきをきっかけに、僕自身も新しいアクションを起こしてみようと思ってる。</p>
                <p>みんなも、もし何か心に引っかかることがあったら、小さな一歩でもいいから踏み出してみてほしいな。その一歩が、意外と大きな変化の始まりになるかもしれないから。</p>

                <p style="margin-top: 50px;">それでは、また。</p>
            </div>
            <div style="text-align: center; margin-top: 50px;">
                <a href="../blog.html" class="btn btn-secondary">ブログ一覧に戻る</a>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-info">
                    <h3 class="footer-logo">Nyct Studio</h3>
                    <p>Hiroshima, Japan</p>
                    <p>Narrator / Voice Trainer / Incubation</p>
                </div>
                <div class="footer-links">
                    <h4>Links</h4>
                    <ul>
                        <li><a href="../index.html">Home</a></li>
                        <li><a href="../udatsu.html">Udatsu</a></li>
                        <li><a href="../about.html">About</a></li>
                        <li><a href="../voice.html">Voice</a></li>
                        <li><a href="../school.html">School</a></li>
                        <li><a href="../incubation.html">Incubation</a></li>
                        <li><a href="../blog.html">Blog</a></li>
                        <li><a href="../contact.html">Contact</a></li>
                    </ul>
                </div>
            </div>
            <div class="copyright">
                &copy; 2025 Nyct Studio. All Rights Reserved.
            </div>
        </div>
    </footer>
</body>
</html>
"""

base_path = "/Users/nayuta/.gemini/Nayuta_Brain/01_Projects/nist-studio-web/blog"

for article in articles:
    file_name = f"article{article['id']}.html"
    file_path = os.path.join(base_path, file_name)
    content = template.format(**article)
    with open(file_path, "w") as f:
        f.write(content)
    print(f"Created {file_name}")

print("\n--- HTML for blog.html ---\n")
for article in articles:
    # Extract YYYY-MM from date (YYYY.MM.DD)
    date_parts = article['date'].split('.')
    date_attr = f"{date_parts[0]}-{date_parts[1]}"
    
    print(f"""
            <!-- Article {article['id']} -->
            <a href="blog/article{article['id']}.html" class="article-card" data-category="{article['category']}" data-date="{date_attr}">
                <img src="img/{article['img']}" alt="{article['title']}" class="article-img">
                <div class="article-content">
                    <div class="article-date">{article['date']}</div>
                    <h3 class="article-title">{article['title']}</h3>
                    <p class="article-excerpt">{article['desc']}</p>
                    <span class="article-cat">{article['category']}</span>
                </div>
            </a>""")
