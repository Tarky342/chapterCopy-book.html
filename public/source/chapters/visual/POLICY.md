# ビジュアル制作依頼の運用仕様 v2

## 目的と範囲

本文とコードは完成済み。Agentは読者の理解を補う画像の**依頼書**だけを作り、画像はユーザーが制作する。原稿・コードは保護し、図の学習上の必要性を先に判断する。

この仕様は `visual/READER_FIT.md` のペルソナ適合性基準を前提とする。**機械的な合格だけで教育的品質を保証しない。**

## 監査する単位

`visual/chapters.json` の10単位：`00`（導入）、`01`〜`08`（8章）、`99`（まとめ。実フォルダ `-1-finally`）。既存ファイル名は変更しない。

## 図の候補をどう扱うか

`visual/audit.json` の各単位は以下を持つ：

- `chapter_id`、`decision`、`rationale`、`reader_blocker`、`manuscript_sha256`、`request_ids`。
- `unreviewed`：未監査。初期状態。
- `no_visual_needed`：文章・コードで十分。理由を記録する。依頼IDは空。
- `candidate_visual`：つまずきはあるが、まだ発注しない。理由と `reader_blocker` を記録する。依頼IDは空。
- `needs_visual`：制作依頼を作成済み。理由・`reader_blocker`・依頼IDを記録する。

候補段階で依頼書を大量に作らない。`candidate_visual` は「図が必須」という意味ではなく、読者テスト後に不要へ変更してよい。

原稿の SHA-256 は `node scripts/check_visuals.js --hash all` で取得する。実ファイルの内容が変わった場合は再監査する。

## 依頼台帳 `visual/requests.json`

`schema_version` は `2`。`requests` の各要素は v1 と同じ基本フィールドに加え、**`pedagogy`** を必須とする。

```json
{
  "pedagogy": {
    "stage": "読み解く",
    "reader_question": "画面の見出しは、HTMLのどの部分に対応する？",
    "sticking_point": "画面とコードの関係が見えず、HTMLの役割を想像しにくい",
    "takeaway": "画面の一か所と、それを表すHTMLの短い記述を対応づけられる",
    "reader_action": "同じ章のindex.htmlで、見出しに当たる記述を探してみる",
    "why_visual": "画面とコードの位置関係は、文章だけでは追いにくいため",
    "granularity": "correspondence",
    "focus_elements": ["実際の画面の見出し", "対応する短いHTML", "両者を結ぶ線"],
    "labels": ["画面", "HTML"],
    "new_terms": [],
    "omit": ["CSSの細かな指定", "JavaScriptの動き"]
  }
}
```

このJSONは**構造の例**であり、教材の実コードを確認した制作依頼ではない。実際の文面は対象章の本文とコードから導く。

`pedagogy` のルール：

- `stage`：`知る` / `読み解く` / `考える`。
- `granularity`：`overview` / `correspondence` / `one-step` / `detail`。
- `reader_question`：読者の言葉で書いた一つの疑問。
- `sticking_point`：その図がなければ何がわからないか。
- `takeaway`：図の後に読者が説明できること。
- `reader_action`：図の後、実コード・画面で確かめる一つの行動。
- `why_visual`：文章だけでは難しい理由。
- `focus_elements`：1〜4個。`labels`：0〜4個（図解は最低1個）。`new_terms`：0〜1個。`omit`：最低1個。
- `detail` は例外で `detail_reason` に十分な根拠が必要。`pilot` では `detail` を依頼できない。

既存の基本フィールド：`id`、`chapter_id`、`kind`、`priority`、`status`、`manuscript`、`anchor`、`brief`、`output`、`title`、`learning_goal`、`caption`、`alt_text`、`evidence`、`rights`、`review`。

- IDは `V-<章ID>-<3桁>`。依頼書は `visual/briefs/<ID>.md`。
- `anchor` は本文に一度だけ登場する見出しまたは固有文字列。
- `output` は対象章の `assets/<ID>.<拡張子>`。
- `diagram` と `screenshot` は実ファイルの `evidence` が必須。実画面はその章を実行して撮影する。
- `rights`、`review` は未完了時に空でもよいが、`verified` にする際は実際の人間による確認を記録する。

## 制作素材の種類

| `kind` | 使う場面 | 避けること |
| --- | --- | --- |
| `screenshot` | 実画面のどこを見るかを示す | 架空画面を実画面と呼ぶ |
| `diagram` | 画面とコードの対応、ひとつの変化 | 内部構造を一枚に詰め込む |
| `illustration` | 画面では説明しづらい抽象概念の導入 | 比喩を実際の仕様と混同する |
| `photo` | 撮影環境など実物の理解が必要 | 単なる雰囲気づくり |

## フェーズ制御 `visual/workflow.json`

- `pilot`：**未承認の `proposed` 依頼は最大1件**。`detail` の発注は禁止。最初の一枚の粒度をユーザーが確認する。
- `scale`：未承認の `proposed` 依頼は最大3件。ユーザーが最初の試作を評価し、明示的に進行を許可した後だけ切り替える。

このフェーズ変更が本当にユーザーの承認によるものか、機械だけでは証明できない。Agentは勝手に切り替えない。

## 状態

`proposed`：Agentによる提案。`approved`：ユーザー承認。`delivered`：実ファイルの受領。`verified`：人間による内容・権利・読みやすさの検証済み。`rejected`：ユーザーが不要と判断。

状態は実際の承認・納品を根拠に変更する。既存の未承認依頼は勝手に承認済みにしない。

## 保護と検査

初回に `node scripts/lock_sources.js` で `chapters/` の本文・コードをロック。すでに初期化済みなら再生成しない。

- `node scripts/check_visuals.js --mode baseline`：ファイル・参照・台帳の検査。未監査は警告。
- `node scripts/check_visuals.js --mode handoff --list-next`：全10単位の監査と依頼の読者適合メタデータ、依頼書、根拠、フェーズ制限を検査。次の1件を表示。
- `node scripts/check_visuals.js --mode verify`：上記に加え、納品済み素材の形式・権利・レビュー記録を検査。
- `node --test scripts/test_visuals.js`：チェッカーのテスト。

自動検査できないもの：初学者が理解できるか、技術的な図の意味が真実か、著作権の許諾が有効か。`visual/REVIEW_CHECKLIST.md` に従って人間が確認する。

## 旧 v1 からの移行

**既存の `visual/audit.json`、`visual/requests.json`、`visual/briefs/`、`visual/source-lock.json` は上書きしない。** `node scripts/migrate_visuals.js --apply` はバックアップを作成し、台帳に新しい空欄を追加する。Agentはその空欄を実ファイルに基づいて再審査し、既存の依頼書に新しい節を追記する。自動移行だけでは `handoff` は合格しない。
