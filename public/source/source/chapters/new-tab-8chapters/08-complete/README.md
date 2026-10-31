# 第8章：完成・検証・拡張

## 実行方法

Node.js 20.6以上を用意し、`.env.example`を`.env`へコピー、新規GNews APIキーを入力してから：

```sh
node --env-file=.env server.mjs
```

`http://127.0.0.1:3000/` にアクセスします。ニュース機能以外はキーなしでも動きます。
テスト：`node --test test.mjs`


## さらにタブを追加する方法

1. `index.html`の`role="tablist"`内に`role="tab"`のボタンを追加する。
2. ボタンの`aria-controls="panel-tools"`に対して、`id="panel-tools"`の`role="tabpanel"`を追加する。
3. `app.js`の`activateTab()`はタブ数を自動で認識し、Alt+3なども使えます。
4. **ニュースが2番目に固定**されている点（`index === 1`）は維持してください。順序を変える場合は`id`を使う条件に変更します。

## セキュリティ注意

- APIキーをHTMLや`app.js`に書かない。`.env`を公開・コミットしない。
- 元HTMLにはAPIキーが直書きされていました。そのキーは失効させ、再発行を推奨します。
- この`server.mjs`はローカル学習用です。不特定多数向け公開サーバーには認証・アクセス制限等が必要です。
- ニュースが表示されない場合は開発者ツールのNetworkで`/api/news`を確認してください。

GNews仕様：https://docs.gnews.io/endpoints/search-endpoint
GNews認証：https://docs.gnews.io/authentication
