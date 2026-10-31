# chapterCopy book

Cloudflare Workers Static Assetsで印刷用HTMLを配信します。

## ローカルプレビュー

```powershell
npm install
npx wrangler dev
```

`npx wrangler preview` はWorkersでは使用せず、ローカル確認は `npx wrangler dev` を使います。

## デプロイ

```powershell
npm run deploy
```

GitHub Actionsは `main` へのpushを契機に `npx wrangler deploy` を実行します。
