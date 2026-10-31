# 第2章：HTMLでページの骨格を作る

`index.html` を開き、`head`（設定情報）と `body`（表示内容）を探してください。

- `role="tablist"` の中にボタンが2個あります。
- `role="tabpanel"` の画面も2個で、`aria-controls` と `id` が対応しています。
- Google検索は`form action`と`name="q"`により、JavaScriptなしで送信できます。

この章では**タブをクリックしてもまだ動きません**。ニュース画面は`hidden`で隠しておき、第4章で切り替えます。
