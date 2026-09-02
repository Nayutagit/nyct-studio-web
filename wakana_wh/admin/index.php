<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/config.php';
?>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>記事一覧 | 編集ページ</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;700&family=Yomogi&display=swap" rel="stylesheet">
<style>
    body { font-family: "Zen Kaku Gothic New", sans-serif; background: #fffdf9; margin: 0; padding: 30px 20px 80px; color: #4a4a4a; }
    h1 { font-family: "Yomogi", sans-serif; color: #c98a00; text-align: center; }
    .list { max-width: 640px; margin: 30px auto; }
    a.item { display: block; background: white; border-radius: 16px; padding: 18px 22px; margin-bottom: 12px; text-decoration: none; color: #4a3720; box-shadow: 0 3px 12px rgba(0,0,0,.05); font-weight: 700; }
    a.item:hover { background: #fff1da; }
    .top { text-align: center; margin-bottom: 10px; }
    .top a { color: #a97300; font-size: .85rem; }
</style>
</head>
<body>
    <div class="top"><a href="../index.html" target="_blank">← 公開ページ（下書き）を見る</a> ｜ <a href="logout.php">ログアウト</a></div>
    <h1>🐨 わかなのワーホリ日記 編集ページ</h1>
    <div class="list">
        <?php foreach ($ARTICLES as $file => $label): ?>
            <a class="item" href="edit.php?f=<?= urlencode($file) ?>"><?= htmlspecialchars($label) ?></a>
        <?php endforeach; ?>
    </div>
</body>
</html>
