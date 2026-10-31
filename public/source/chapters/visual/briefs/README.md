# 依頼書の置き場所

Agent が制作候補ごとに `V-<章ID>-<連番3桁>.md` を追加します。

- 各依頼書は `visual/templates/visual-request.md` を元にする。
- 同じ ID のレコードを `visual/requests.json` に登録する。
- 各依頼の状態は初回は `proposed`。実画像を Agent が勝手に作成しない。
- 受け取った素材を設置するディレクトリ・名前を依頼書に記載する。

本ディレクトリの `README.md` は依頼書ではありません。
