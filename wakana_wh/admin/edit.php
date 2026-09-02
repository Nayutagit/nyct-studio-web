<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/config.php';

$file = $_GET['f'] ?? '';
if (!isset($ARTICLES[$file])) {
    http_response_code(404);
    exit('記事が見つかりません');
}

$path = __DIR__ . '/../' . $file;
$html = file_get_contents($path);

// WK_CONTENT_START / END の間だけを contenteditable にする
$html = str_replace(
    '<!-- WK_CONTENT_START -->',
    '<div id="wk-editable" contenteditable="true" style="outline:2px dashed #ffd9a0; outline-offset:6px;">',
    $html
);
$html = str_replace('<!-- WK_CONTENT_END -->', '</div>', $html);

$toolbar = '
<div style="position:fixed;bottom:0;left:0;right:0;background:#1d1d1f;color:#fff;padding:16px 20px;display:flex;gap:16px;align-items:center;justify-content:center;z-index:9999;font-family:\'Zen Kaku Gothic New\',sans-serif;box-shadow:0 -4px 16px rgba(0,0,0,.2);">
  <span id="wk-status" style="margin-right:auto;font-size:.85rem;color:#ffd9a0;"></span>
  <a href="index.php" style="color:#fff;text-decoration:none;font-size:.9rem;">← 記事一覧</a>
  <button onclick="wkSave()" style="background:#E5A900;border:none;padding:12px 30px;border-radius:999px;font-weight:700;font-size:1rem;cursor:pointer;">保存する</button>
</div>
<script>
function wkSave(){
  var content = document.getElementById("wk-editable").innerHTML;
  var status = document.getElementById("wk-status");
  status.textContent = "保存中...";
  fetch("save.php", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({file: ' . json_encode($file) . ', content: content})
  }).then(function(r){ return r.json(); }).then(function(d){
    status.textContent = d.ok ? "✅ 保存しました！" : ("❌ エラー: " + d.error);
  }).catch(function(e){
    status.textContent = "❌ 通信エラー";
  });
}
</script>';

$html = str_replace('</body>', $toolbar . '</body>', $html);

echo $html;
