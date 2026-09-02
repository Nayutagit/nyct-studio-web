<?php
session_start();
require_once __DIR__ . '/config.php';

if (!empty($_SESSION['wk_auth'])) {
    return;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = $_POST['password'] ?? '';
    if (hash_equals($ADMIN_PASSWORD, $input)) {
        $_SESSION['wk_auth'] = true;
        header('Location: ' . ($_SERVER['REQUEST_URI']));
        exit;
    }
    $error = 'パスワードが違います';
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>編集ページ ログイン</title>
<style>
    body { font-family: "Zen Kaku Gothic New", sans-serif; background: #fff8ec; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,.08); width: 320px; }
    h1 { font-size: 1.1rem; color: #4a3720; margin-bottom: 20px; }
    input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd; box-sizing: border-box; font-size: 1rem; margin-bottom: 14px; }
    button { width: 100%; padding: 12px; border-radius: 999px; border: none; background: #E5A900; color: #1d1d1f; font-weight: 700; font-size: 1rem; cursor: pointer; }
    .err { color: #c0392b; font-size: .85rem; margin-bottom: 10px; }
</style>
</head>
<body>
    <div class="box">
        <h1>🐨 わかなのワーホリ日記 編集ページ</h1>
        <?php if ($error): ?><p class="err"><?= htmlspecialchars($error) ?></p><?php endif; ?>
        <form method="post">
            <input type="password" name="password" placeholder="パスワード" autofocus>
            <button type="submit">ログイン</button>
        </form>
    </div>
</body>
</html>
<?php exit;
