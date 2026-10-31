# 第6章：ニュースを自動取得する

`index.html`・`style.css`・`app.js`：ブラウザ側のプログラム。
`server.mjs`：サーバー側のプログラム。APIキーをブラウザへ公開しません。

## 実行方法（Node.js 20.6以上）

1. `.env.example`をコピーして`.env`に改名します。
2. `.env`の`GNEWS_API_KEY`に**新しく発行した**GNews APIキーを設定します。
3. このフォルダーで `node --env-file=.env server.mjs` を実行します。
4. ブラウザで `http://127.0.0.1:3000/` を開き、「2 ニュース」を押します。

キーがなくても、検索画面は利用できます。ニュースはエラー案内を表示します。
`index.html`を直接`file://`で開いても、ニュースは取得できません（ローカルのサーバーが必要です）。

## 処理の流れ

```text
ニュースタブ → app.js → GET /api/news?keyword=テクノロジー
                              ↓
                         server.mjs（秘密のキーを保持）
                              ↓  X-Api-Key ヘッダー
                         GNews Search API
                              ↓
                         記事データをJSONで返す → 画面に表示
```

JavaScript の `fetch` と `async/await` の役割は、通信完了を待って記事を描画することです。
`server.mjs`は同じジャンルのニュース結果を5分キャッシュします。
**公開Webサイトとして配布する場合**は認証・レート制限など追加の対策が必要です。

GNewsの仕様：https://docs.gnews.io/endpoints/search-endpoint
認証：https://docs.gnews.io/authentication
