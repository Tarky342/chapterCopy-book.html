# AI向けディレクトリ説明

## 1. このディレクトリの目的

このディレクトリ（`src/chapters/`）は、大学生・デザイン学科・Web制作初学者を対象とした、New Tabアプリ制作教材の原稿・実行コード・画像・ビジュアル制作管理台帳を収める場所です。

教材は、導入（00）、8章（01〜08）、まとめ（-1）で構成されています。学習の流れは、ページを設計し、HTMLで骨格を作り、CSSで見た目を整え、JavaScriptで操作を追加し、検索・ニュース取得・デバッグ・検証と拡張へ進む構成です。

このディレクトリの本文・コード・画像は教材の原本です。印刷確認や検査のために内容を変更してはいけません。印刷用の調整は、同じ階層の `src/print/` にあるCSS・設定・報告書だけで行います。

## 2. 上位ディレクトリとの関係

```text
リポジトリルート/
└─ src/                         ← ハーネスの実行基準ディレクトリ
   ├─ chapters/                 ← 本ディレクトリ。教材の原本
   │  ├─ new-tab-8chapters/     ← 章本文・サンプルコード・章内画像
   │  ├─ assets/                ← 章外から参照する共通画像
   │  ├─ visual/                ← 図の監査・制作依頼・保護台帳
   │  ├─ persona.md             ← 読者像・教材の目的
   │  └─ AI向けディレクトリ説明.md
   ├─ print/                    ← 印刷用の編集可能な設定
   ├─ scripts/                  ← ビルド・検査・PDF生成スクリプト
   ├─ chapterCopy/              ← スクリプトが生成する印刷確認用バンドル
   └─ .chapterCopy.*            ← 生成処理が作る退避・作業用ディレクトリ
```

重要なのは、コマンドを `src/` で実行することです。現在のファイルがある `src/chapters/` から実行すると、スクリプトが `chapters/` を見つけられません。

```powershell
Set-Location "G:\マイドライブ\WorkSpace\dev\roku\エディトリアルデザイン\src"
```

## 3. 教材原本 `new-tab-8chapters/`

### 3.1 章の順序と役割

章順は `00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → -1` です。順序を入れ替えたり、フォルダ名・日本語ファイル名を変更したりしてはいけません。印刷用の正式な章構成は `src/print/chapters.json` が定義します。

| ID | ディレクトリ | 本文 | 役割 |
|---|---|---|---|
| 00 | `00-first/` | `はじめに.md` | 教材の題材、学習順、読者への導入 |
| 01 | `01-design/` | `第1章_作りたいページを設計する.md` | 作りたいページの構成・設計 |
| 02 | `02-html/` | `HTMLでpageの骨格を作る.md` | HTMLで画面の骨格を作る |
| 03 | `03-css/` | `第3章_CSSでデザインを整える.md` | CSSでレイアウト・色・表示を整える |
| 04 | `04-tabs/` | `jsでタブを動かす.md` | JavaScriptでタブ切り替えを実装する |
| 05 | `05-search/` | `検索機能を実装する.md` | 検索フォームと検索遷移を実装する |
| 06 | `06-news/` | `第6章_ニュースを自動取得する.md` | サーバー経由でニュースAPIを利用する |
| 07 | `07-debug/` | `第7章_エラーを見つけて修正する.md` | 再現・仮説・確認・修正・再検証を学ぶ |
| 08 | `08-complete/` | `第8章_完成・拡張.md`、`第8章_完成・検証・拡張.md` | 完成状態の確認、検証、拡張 |
| -1 | `-1-finally/` | `まとめ.md` | 全体の振り返り |

`README.md` は各章の補助説明です。印刷本文に自動挿入する主原稿ではありません。印刷バンドルには参照用として同梱されます。

### 3.2 章内ファイルの意味

- `*.md`：章本文。印刷バンドルの主本文です。
- `README.md`：章の実行方法・補足情報。本文とは分離して扱います。
- `index.html`：ブラウザで表示する画面のHTML。
- `style.css`：画面の見た目を定義するCSS。
- `app.js`：ブラウザ側の処理。検索やニュース表示などを担当します。
- `tabs.js`：04章のタブ切り替え処理。
- `server.mjs`：Node.js側のローカルサーバー/APIプロキシ処理。
- `test.mjs`：07・08章の自動検証コード。
- `.env.example`：APIキーなどの環境変数名の例。秘密値を入れません。
- `.gitignore`：`.env` などの秘密情報をGit管理対象外にする指定。
- `assets/`：その章で使う図・スクリーンショット・補助画像。

章ごとに実装が段階的に増えます。後の章の完成状態を前の章へ逆輸入しないでください。図や説明を追加する場合も、その章の実装と本文に一致しているか確認します。

### 3.3 章内画像

既存画像は教材の原本です。画像の移動・改名・削除・上書きは禁止です。Markdownから参照される相対パスを壊さないでください。

現在の代表的な画像：

- `01-design/assets/V-01-001.svg`
- `03-css/assets/図3-1_HTMLとCSSの対応.svg`
- `03-css/assets/図3-2_明暗の表示比較.png`
- `03-css/assets/図3-4_幅390px.png`
- `04-tabs/assets/V-04-001.svg`、`V-04-001__redesign.png`
- `05-search/assets/V-05-001.svg`
- `06-news/assets/V-06-001.svg`、`V-06-0001.svg`
- `07-debug/assets/V-07-001.svg`、`V-07-0001.svg`
- `08-complete/assets/V-08-001.svg`、`V-08-002.svg`、`6a157120-7e27-4071-8908-24d9423deea9.png`

## 4. 共通資料

- `persona.md`：想定読者、制作目的、学習前後の状態、教材で提供する体験。
- `assets/figure-placeholder.svg`：章外の共通参照用プレースホルダー画像。実画像の代用として勝手に本文へ挿入しません。

## 5. ビジュアル管理 `visual/`

`visual/` は図の制作と監査を管理する場所です。画像制作そのものを自動生成する場所ではありません。本文・コードは完成済みという前提で、読者がつまずく箇所を見極め、必要な図の依頼書と根拠を管理します。

### 5.1 台帳・方針ファイル

- `chapters.json`：ビジュアル監査単位の定義。00、01〜08、99（まとめ）の10単位。
- `audit.json`：各単位の判断（未監査／図不要／候補／図が必要）、理由、原稿ハッシュ、依頼ID。
- `requests.json`：制作依頼の台帳。依頼ID、対象章、本文アンカー、出力先、根拠、権利、読者適合性メタデータを記録。
- `workflow.json`：`pilot` または `scale` の制作フェーズと、未承認依頼数の制限。
- `source-lock.json`：本文・コードのSHA-256保護台帳。原稿変更を検出します。
- `POLICY.md`：運用仕様、状態遷移、保護、検査方法。
- `READER_FIT.md`：初学者向けの図の粒度・情報量・人間レビュー基準。
- `STYLE_GUIDE.md`：図の表現・依頼文・可読性・権利の指針。
- `REVIEW_CHECKLIST.md`：人間が行う受入レビュー項目。
- `BATCH_REPORT_TEMPLATE.md`：複数依頼のレビュー報告テンプレート。

### 5.2 制作依頼

- `briefs/README.md`：依頼書の置き場所と状態管理の説明。
- `briefs/V-<章ID>-<3桁>.md`：個別の図制作依頼書。
- `templates/visual-request.md`：個別依頼書のテンプレート。
- `backups/`：移行時に作られる旧台帳のバックアップ。削除・上書きしません。

依頼の状態は `proposed → approved → delivered → verified` です。Agentはユーザー承認なしに `approved`、素材受領なしに `delivered`、人間レビューなしに `verified` へ変更してはいけません。

### 5.3 ビジュアル検査のコマンド

`src/` で実行します。Node.js 18以上、追加npmパッケージ不要です。

```powershell
node scripts/lock_sources.js
node scripts/check_visuals.js --mode baseline
node scripts/check_visuals.js --mode handoff --list-next
node scripts/check_visuals.js --mode verify
node --test scripts/test_visuals.js
```

`lock_sources.js` は初回だけ実行する保護初期化です。既に `initialized: true` の `source-lock.json` を再生成してはいけません。原稿を意図的に変更する場合は、人間の確認と台帳更新が必要です。

`migrate_visuals.js` は旧v1台帳をv2へ移行するための非破壊移行ツールです。適用前は必ずドライランを行い、`--apply` 実行時に作られるバックアップを保持します。

## 6. 印刷ハーネス `print/`

`print/` は唯一の印刷調整場所です。本文・サンプルコード・原画像を修正せず、ここで印刷用CSSと構成を調整します。

- `chapters.json`：印刷対象10単位の順序、本文ファイル、必須ファイル。
- `theme.css`：本文フォント、サイズ、行間、字詰め、揃え、段落字下げ、リストインデント、図の高さ。
- `page.css`：用紙サイズとページ余白。
- `layout.css`：禁則、改ページ、孤立行、画像・表・コードのはみ出し対策。
- `overrides.css`：例外的な見た目の調整。理由をコメントで残します。
- `render.json`：Markdownレンダラーの設定。標準は追加依存のない `builtin`。
- `STYLE_GUIDE.md`：和文組版の根拠とブラウザの限界。
- `STYLE_SAMPLE.html`：9pt/38字相当などの組版比較用サンプル。
- `PRINT_CHECKLIST.md`：禁則、リスト、見出し、図表、余白、コード、フォントの目視確認表。
- `reports/`：調整前後、確認ページ、未解決事項を記録する報告書の保存場所。

本文は `line-break: strict`、`word-break: normal`、`text-align: var(--body-align)` を基本とします。静的検査のPASSは、実際のPDFで文字が切れないことや可読性を保証しません。

## 7. 印刷生成物 `chapterCopy/`

`chapterCopy/` は生成物です。手編集してはいけません。次のビルドで上書きされます。

- `book.html`：10単位をまとめた印刷確認用HTML。
- `units/`：章別HTML。
- `styles/`：`print/` からコピーされた生成CSS。
- `source/chapters/`：原稿・サンプルコード・章内画像のコピー。
- `assets/`：`chapters/` 外から参照された画像のコピー。
- `manifest.json`：コピー元ハッシュ、参照状況、警告。
- `preview/`：PDFを生成した場合のプレビュー出力。

`.chapterCopy.*` はビルド処理中の退避・作業用ディレクトリです。内容を教材原本として参照したり、手作業で修正したりしません。

## 8. スクリプト `scripts/`

### 印刷関連

- `print_pipeline.js`：source検査 → バンドル生成 → bundle検査 → 任意のPDF生成を一括実行。
- `build_chapter_copy.js`：`chapterCopy/` を生成。
- `check_print.js`：sourceまたはbundleを静的検査。
- `render_print.js`：Chrome/Chromium/Edgeを検出してPDFを生成。
- `browser.js`：ブラウザ検出の補助。
- `lib.js`：印刷ハーネス共通処理。
- `test_print.js`：印刷ハーネスのテスト。

### ビジュアル関連

- `check_visuals.js`：ビジュアル台帳、参照ファイル、画像形式、読者適合性、フェーズ制限を検査。
- `lock_sources.js`：原稿・コードの保護ハッシュを初期化。
- `source_lock.js`：保護対象の列挙、ハッシュ計算、比較処理。
- `migrate_visuals.js`：ビジュアル台帳v1→v2の非破壊移行。
- `test_visuals.js`：ビジュアル検査スクリプトのテスト。
- `package.json`：Node.js 18以上、外部依存なしのnpmスクリプト定義。

## 9. 印刷確認の標準手順

必ず `src/` で、検査を分離して実行します。

```powershell
Set-Location "G:\マイドライブ\WorkSpace\dev\roku\エディトリアルデザイン\src"
node scripts/check_print.js --mode source
node scripts/build_chapter_copy.js
node scripts/check_print.js --mode bundle
node scripts/render_print.js --detect
node scripts/render_print.js
node --test scripts/test_print.js
```

一括実行は次のコマンドです。

```powershell
node scripts/print_pipeline.js
node scripts/print_pipeline.js --pdf
```

PDFが生成できない場合、HTMLバンドルと静的検査の結果は保持し、PDF未確認として報告します。`chapterCopy/book.html` をブラウザで開き、「印刷 → PDFに保存」で手動確認できます。ブラウザを勝手にインストールしません。

CSSを変更した場合は、必ず再ビルド・再検査・PDF再生成を行い、`print/reports/` に変更理由、確認した章・ページ、未解決事項を記録します。

## 10. Agentが守る禁止事項と停止条件

### 禁止事項

1. `chapters/` 内の本文、コード、画像、依頼書を執筆・修正・移動・削除しない。
2. `visual/` の既存台帳・依頼書・納品素材を勝手に承認、上書き、削除しない。
3. `chapterCopy/` 内の生成HTML・CSSを直接編集しない。
4. 内容を削除・短縮してページに収めない。レイアウトで解決できない問題は報告する。
5. 外部画像、APIキー、個人情報を教材や図に持ち込まない。
6. 静的検査のPASSだけで「印刷完了」「読者が理解できる」と断定しない。

### 停止して報告する条件

- 既存の `chapterCopy/` が本ハーネスの生成物か判定できない。
- `source-lock.json` と原稿・コードのハッシュが一致しない。
- 本文、画像、参照ファイル、依頼書の根拠が欠落している。
- 標準Markdownレンダラーが未対応構文を検出した。
- PDFの切れ、フォント置換、禁則、孤立行、図表の分断、長いコード行が目視で確認できない。
- 内容の変更が必要で、CSSや印刷設定だけでは解決できない。

静的検査は構造上の問題を見つけるためのものです。最終的な印刷品質は、生成PDFを人間が確認し、残る課題とともに報告して初めて判断できます。