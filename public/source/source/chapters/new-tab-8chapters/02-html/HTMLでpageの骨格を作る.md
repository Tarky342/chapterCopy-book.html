<!-- chapter-id: 02 -->
<!-- goal: HTMLの要素と画面上の役割の対応を説明し、タブとパネルの対応を自分で確認できる -->
<!-- print:title-page title="HTMLでページを作る" subtitle="画面の骨格を理解する" -->
# 第2章　HTMLでページの骨格を作る

*画面の構造を理解し、要素同士の関係を読み解く*

## この章で学ぶこと

Webページには、見出しや文章、画像、入力欄、ボタンなどの要素が配置されています。本章では、HTMLの役割を学び、実際のコードと画面上の対応を読み解きます。

本章で扱う`index.html`には、検索機能とニュース表示領域が用意されています。ただし、現時点ではCSSやJavaScriptを読み込んでいません。そのため、見た目の調整やタブの切り替えはまだ行わず、画面の構造とHTMLが持つ基本的な機能に注目します。

## 2.1 HTMLとは何か

### 2.1.1 Webページを構成する3つの技術

本書におけるWebページの制作では、主にHTML、CSS、JavaScriptという3つの技術を使用します。それぞれは別の役割を持っています。

#### Webページを構成する主な技術とその役割

HTMLは、見出しや文章、入力欄などの構造と意味を定義します。CSSは、それらの大きさや色、余白、配置などを調整します。JavaScriptは、ボタンの操作に応じて画面を切り替えたり、データを取得したりする処理を担当します。

検索フォームでは、HTMLで検索欄とボタンを用意し、CSSで幅や色を整え、JavaScriptで入力に応じた検索候補などを追加できます。

ただし、JavaScriptがなければすべての操作ができないわけではありません。HTML自体にも、リンク先への移動やフォームの送信など、ブラウザが標準で処理できる機能が用意されています。本章の検索フォームは、その一例です。

3つの技術を一度に理解しようとすると、コードのどの部分が画面のどの働きを担当しているのか、分からなくなりやすいものです。そこで本書では、最初にHTMLで画面の構造を理解し、その上にCSSによるデザインとJavaScriptによる動作を段階的に追加していきます。

### 2.1.2 タグと要素
HTML(.html　等）は、文章やコンテンツに意味を与えブラウザーなどに解釈をさせるためのマークアップ言語です。その基本となるのが、タグと呼ばれる記述です。

```html
<h1>New Tab</h1>
<p>Googleで検索できます。</p>
<button>検索</button>
```

ブラウザでは、`New Tab`が見出しとして扱われ、その下に文章とボタンが表示されます。このとき、`<h1>`や`<p>`、`<button>`がタグです。一般的に、開始タグと終了タグ、それらに囲まれた内容を合わせて「要素」と呼びます。
開始タグは要素の始まりを、終了タグは終わりを示します。なお、`input`や`meta`など、終了タグを持たない要素も存在します。

HTMLの要素には、それぞれ定められた意味があります。例えば、`h1`は見出し、`p`は段落、`button`はボタンを表します。ここで重要なのは、**要素は単に見た目を変えるための記述ではない**ということです。

`h1`は見出し、`button`は操作できる部品を表します。HTMLは見た目だけでなく、要素の意味をブラウザや支援技術へ伝えます。

HTMLで使用できる標準的な要素や属性は、WHATWGが管理するHTML Living Standardなどで定義されています。制作する人が自由に名前を付けられるものと、仕様で意味が決められているものを区別することが大切です。
### 2.1.3 属性によって要素に情報を追加する

要素には、属性と呼ばれる追加情報を記述できます。

```html
<button id="tab-search" class="filetab" type="button">
  検索
</button>
```

`button`という要素に対して、`id`、`class`、`type`という3つの属性が指定されています。属性は通常、開始タグの中に記述します。`id="tab-search"`のように、属性名と値を組み合わせて指定する形式が一般的です。

| 属性 | 役割 |
|---|---|
| `id` | 要素を識別するための名前を付ける  |
| `class` | 複数の要素を分類し、CSSなどから参照できるようにする |

`id`と`class`は似ていますが、使い方には違いがあります。`id`は、同じ文書の中で一意になるように指定する識別子です。一方、`class`は同じ値を複数の要素に付けられます。
要素の役割に応じて、ほかの属性を追加することもあります。

本章のHTMLでは、`filetab`というclassが検索タブとニュースタブの両方に使用されています。それに対して、`tab-search`と`tab-news`というidは、それぞれのボタンを区別するために使用されています。この違いは、後ほどタブとパネルの関係を読み解く際にも重要になります。

## 2.2 HTML文書の基本構造

### 2.2.1 VS CodeでHTMLを作成する

ここでは、Visual Studio Code（以下、VS Code）を使用してHTML文書の基本形を確認します。新しいファイルを作成し、`emmet.html`という名前で保存してください。

ファイル名の末尾にある`.html`は、HTML文書であることを示す拡張子です。VS Codeはこの拡張子からファイルの種類を判断し、HTMLの入力補助や色分け表示などを行います。

ファイルを開いて半角の`!`を入力すると、Emmetの補完候補が表示されます。候補を選んでEnterキーを押すと、HTML文書の基本構造が挿入されます。Emmetは、短い省略記法からHTMLやCSSのコードを展開する仕組みで、VS Codeに標準で組み込まれています。展開内容は設定によって異なるため、言語設定やタイトルは制作するページに合わせて確認・変更します。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>

</body>
</html>
```
*図2-2-1　HTML文書の基本的な構造*

### 2.2.2 headとbodyの違い
生成されたコード図2-2-1を見てみましょう。大きく分けると`head`と`body`の2つの領域に別れることがわかります。

`head`には、文字コードやページタイトルなど、文書を扱うための情報を記述します。`charset`は文字コードをUTF-8に指定し、`viewport`は端末の表示領域を指定します。一方、`body`には、利用者が読む文章や操作するボタンなど、ページの内容を記述します。

### 2.2.3 Emmet記法を利用して構造を読む

Emmetはコードの入力を補助するだけでなく、HTMLの親子関係を簡潔に表現することにも使えます。

```text
div.shell>main.container>h1
```

これは、次のHTMLへ展開できます。

```html
<div class="shell">
  <main class="container">
    <h1></h1>
  </main>
</div>
```

Emmetでは、`.`はclass、`#`はidの指定に使用します。また、`>`は子要素、`+`は同じ階層に並ぶ要素を表します。

```text
section.panel#panel-search
```

```html
<section class="panel" id="panel-search"></section>
```

本書では、HTMLの構造を短く示すためにEmmet形式の表現を使用する場合があります。ただし、Emmetで使う記号と、実際のHTMLで使うタグや属性は別のものです。コードを読む際には混同しないようにしてください。

## 2.3 HTMLの構造を読み解く

ここからは、実際にNew Tabアプリの`index.html`を読み解いていきます。本章では、コードを上から一行ずつ説明するのではなく、最初にページ全体の構造を確認し、その後で各領域の役割を調べていきます。これは、デザイン制作で画面全体のレイアウトを考えてから細部の作業を行うのと同様です。

### 2.3.1 親要素と子要素

HTMLでは、ある要素の内側に別の要素を配置できます。このような関係を、親要素と子要素と呼びます。

`div`の内側に`main`があり、さらにその内側に`h1`が配置されています。`div`から見れば`main`は子要素、`main`から見れば`h1`が子要素です。複数の要素が内側に重なる構造を「入れ子」や「ネスト」と呼びます。

```html
<div class="shell">
  <main class="container">
    <h1>New Tab</h1>
  </main>
</div>
```

HTMLの構造が複雑になると、どこからコードを書き始めればよいのか迷う場合があります。そのようなときには、親要素から順番に考えると整理しやすくなります。

まず、ページ全体をまとめる領域を用意します。次に、その中にメニューやメインコンテンツなどの大きな領域を配置します。最後に、それぞれの領域の中に見出しやボタンを追加するといった順序を考えて見てください。

なお、親子関係は単にコードを見やすくするためだけのものではありません。例えばCSSでは、親要素を基準として子要素の配置を指定したり、一部の親に対するスタイルの指定が子孫要素へと影響を与えることがあります。

### 2.3.2 ページ全体の構造を確認する

以下は、添付された`index.html`から、ページの主要な構造を抜き出したものです。

<!-- source: chapters/new-tab-8chapters/02-html/index.html#L9-L43 (構造の抜粋) -->

```html
<div class="shell">
  <nav class="tabs" role="tablist">
    <button id="tab-search" class="filetab" role="tab">検索</button>
    <button id="tab-news" class="filetab" role="tab">ニュース</button>
  </nav>

  <main class="container">
    <section id="panel-search" class="panel" role="tabpanel">
      <!-- 検索フォーム -->
    </section>
    <section id="panel-news" class="panel" role="tabpanel" hidden>
      <!-- ニュース表示領域 -->
    </section>
  </main>
</div>
```

最も外側にあるのが`div.shell`です。その中に、`nav.tabs`と`main.container`という2つの領域が配置されています。

`nav`は検索とニュースを選ぶタブのまとまり、`main`は検索・ニュース領域を含む主要部分です。

これをテキストで表現するなら以下のようになるでしょう。

```text
shell（ページ全体）
├── nav.tabs
│   ├── button#tab-search（検索）
│   └── button#tab-news（ニュース）
└── main.container
    ├── h1（New Tab）
    ├── p.subtitle（説明文）
    ├── section#panel-search（検索フォーム）
    └── section#panel-news（ニュース領域・初期状態では非表示）
```

このように、コード全体の構造を見るだけでも、アプリケーションにどのような機能が用意されているかを読み取れる場合があります。逆に、アプリケーションを制作する際には、最初に構造を考えることが重要です。

### 2.3.3 div、nav、main、sectionを使い分ける

`div`は、それ自体には特別な意味を持たない汎用な要素です。
主に、CSSによるレイアウトやプログラムからの操作を目的として、複数の要素をまとめる際に使われます。
他の要素で代替可能な場合は極力使用しないようにしましょう。

これに対して、`nav`はナビゲーション、`main`は主要コンテンツ、`section`は内容を主題ごとにまとめた区画を表します。

```html
<section id="panel-search">
  <!-- 検索に関する内容 -->
</section>
```

### 2.3.4 classやidから構造を予測する

```html
<button id="tab-search" class="filetab">検索</button>
<section id="panel-search" class="panel"></section>
```

この2つには、`search`という共通した名前が含まれています。名前の付け方から、両者が関連していると予想できるでしょう。

idやclassの名前は、制作者が決めることができます。`panel-search`という名前はHTMLの仕様で特別な意味が決められているわけではありません。
それでも、名前から役割を推測できるようにすると、コードを読みやすくなります。`panel-search`のように役割を示す名前を付けるルールを**命名規則**と呼びます。

**考えてみよう：** `tab-search`というidを`button1`に変更した場合、ブラウザの処理は同じでも、人間にとっての読みやすさは変わるでしょうか。


## 2.4 検索フォームの仕組みを理解する

次は、`main.container`の内側を詳しく見ていきます。New Tabアプリには、Googleで検索を行うための入力欄と検索ボタンがあります。これらは、HTMLの`form`要素によってまとめられています。

### 2.4.1 見出しと検索領域

<!-- source: chapters/new-tab-8chapters/02-html/index.html#L18-L30 (抜粋) -->
```html
<main class="container">
  <h1>New Tab</h1>
  <p class="subtitle">「検索」はGoogleに送信されます。</p>

  <section id="panel-search" class="panel"
           role="tabpanel" aria-labelledby="tab-search">
    <!-- 検索フォーム -->
  </section>
</main>
```

`h1`はページの見出し、`p`はその下に表示する説明文です。これらは検索パネルの外側に配置されています。
そのため、検索画面からニュース画面に切り替える仕組みを追加した場合でも、見出しと説明文は共通の領域として扱うことができます。

一方、`section`は検索パネルとして独立しています。このような構造を採用すると、共通して表示したい要素と、切り替えて表示したい要素を区別できます。

制作をする際にこのような拡張可能な構造になっているかは視点として持っておくべきです。

### 2.4.2 form要素の役割

<!-- source: chapters/new-tab-8chapters/02-html/index.html#L24-L29 -->

```html
<form class="search-form" action="https://www.google.com/search"
      method="get" role="search">
  <label class="sr-only" for="search-input">検索キーワード</label>
  <input class="search-input" id="search-input" name="q" type="search"
         placeholder="Googleで検索" autocomplete="off"
         enterkeyhint="search" required>
  <button class="search-button" type="submit">検索</button>
</form>
```

大きく分けると、入力内容を送信するための`form`、文字を入力するための`input`、送信を実行する`button`が含まれています。
これらをHTMLの標準的な機能として組み合わせることで、JavaScriptを使わずに検索フォームを動かすことができます。

```html
action="https://www.google.com/search"
method="get"
```

`action`はフォームの送信先、`method`は送信方法です。GET方式では、フォームのデータを送信します。
例えば、検索欄に`HTML`と入力して検索ボタンを押すと、次のようなURLへの移動が行われます。

```text
https://www.google.com/search?q=HTML
```

`?`以降がクエリ文字列です。ここで重要なのが、入力欄に指定されている`name="q"`です。

```html
<input name="q" type="search">
```

`name`は、フォームの送信時に使用されるデータの項目名です。Googleの検索用URLでは、検索語を`q`という名前のパラメータで受け取ります。そのため、入力欄に`name="q"`を指定しています。

```text
入力欄に「HTML」と入力
        ↓
input の name="q"
        ↓
form の GET 送信
        ↓
https://www.google.com/search?q=HTML
```*図2-6　HTMLの検索フォームがデータを送る流れ*

### 2.4.3 input要素と属性

```html
<input class="search-input"
       id="search-input"
       name="q"
       type="search"
       placeholder="Googleで検索"
       autocomplete="off"
       enterkeyhint="search"
       required>
```

| 属性 | 役割 |
|---|---|
| `type="search"` | 検索語の入力欄であることを示す |
| `name="q"` | 送信する値の項目名を指定する |
| `id="search-input"` | 要素を識別する |
| `placeholder` | 入力欄が空のときに補助的な文字を表示する |
| `autocomplete="off"` | ブラウザによる入力補完を抑制するよう指定する |
| `enterkeyhint="search"` | 対応する端末で、入力用キーの表示を検索向けにするヒントを与える |
| `required` | 入力を必須とする |

ここで注目したいのは、`required`です。この属性が指定された入力欄では、値が空の場合、通常のフォーム送信時にブラウザが入力を求めます。

実際に検索欄を空のまま検索ボタンを押してみてください。入力を求めるメッセージなどが表示されるはずです。

この動作も、HTMLとブラウザに用意された標準的な機能です。ただし、`required`は単にブラウザ側の検証であることは留意が必要です。

### 2.4.4 labelと入力欄の関係

```html
<label class="sr-only" for="search-input">検索キーワード</label>
<input id="search-input" name="q" type="search">
```

`label`は、入力欄などのフォーム部品に説明を付けるための要素です。`for`には対応する入力要素のidを指定します。`for="search-input"`と`id="search-input"`が一致することで、ラベルと入力欄が関連付けられます。

```text
label [for="search-input"]
            ↕
input [id="search-input"]
```*図2-7　labelのfor属性とinputのid属性の関係*

表示されているラベルをクリックした際、対応する入力欄へフォーカスを移せます。また、スクリーンリーダーなどのweb支援技術に、入力欄の名前を伝えることにも役立ちます。


### 2.4.5 button要素の役割

```html
<button class="search-button" type="submit">検索</button>
```

`button`は、利用者が操作するためのボタンを表す要素です。`type="submit"`は、所属するフォームを送信するためのボタンであることを示します。

一方、タブに使用されるボタンは次のようになっています。

```html
<button type="button">ニュース</button>
```

`type="button"`では、フォームの送信は行いません。また、クリックした際に特定の画面を表示するような動作が自動的に追加されるわけでもありません。そのような独自の処理は、後章で実装します。

## 2.5 タブとパネルの対応を理解する

New Tabアプリには、検索とニュースを切り替えるための2つのタブが用意されています。しかし、本章のHTMLだけでは、タブをクリックしても表示内容は切り替わりません。それでもタブとパネルを用意するのは、**操作する部分と、操作によって表示する部分を、あらかじめ対応付けておくため**です。


### 2.5.1 タブのHTMLを確認する

<!-- source: chapters/new-tab-8chapters/02-html/index.html#L11-L16 -->

```html
<nav class="tabs" role="tablist" aria-label="新しいタブのメニュー">
  <button id="tab-search" type="button" class="filetab"
          role="tab" aria-selected="true"
          aria-controls="panel-search" tabindex="0">1 検索</button>
  <button id="tab-news" type="button" class="filetab"
          role="tab" aria-selected="false"
          aria-controls="panel-news" tabindex="-1">2 ニュース</button>
</nav>
```

`role`は、要素がアクセシビリティ上どのような役割を持つのかを示す属性です。`role="tablist"`は複数のタブのまとまり、`role="tab"`は個々のタブを示します。

`aria-selected`は選択状態を示す属性で、検索側には`true`、ニュース側には`false`が指定されています。ただし、`aria-selected`を書いただけで、画面の色が変わったり、パネルが切り替わったりするわけではありません。
ARIA属性は主に、要素の役割や状態、関係を支援技術へ伝えるためのものです。

### 2.5.3 aria-controlsで対応するパネルを示す

検索タブには次の属性があります。

```html
aria-controls="panel-search"
```

対応するパネルには同じ値のidがあります。

```html
<section id="panel-search" role="tabpanel"
         aria-labelledby="tab-search"></section>
```

ニュース側も同じ規則です。

```text
tab-search                       tab-news
aria-controls="panel-search"     aria-controls="panel-news"
       │                                │
       ▼                                ▼
panel-search                      panel-news
id="panel-search"                id="panel-news"
```

*図2-9　タブのaria-controlsとパネルのidによる対応関係*

`aria-controls`は、要素間の関係を表す属性であり、JavaScriptの処理を自動的に実行するものではありません。`aria-controls="panel-news"`と書いただけでは、ニュースタブをクリックしてもニュースパネルは表示されません。

第4章では、JavaScriptでタブの操作を受け取り、対応するパネルの表示状態を変更します。その際、`aria-controls`の値を利用してパネルを探す実装も可能ですが、実際にどの属性を参照するかは実装次第です。

### 2.5.4 aria-labelledbyと要素の名前

パネル側には、次の属性も指定されています。

```html
aria-labelledby="tab-search"
```

これは、そのパネルのアクセシブルな名前を、`tab-search`というidを持つ要素から取得することを示します。今回の場合、検索パネルは「1 検索」というボタンによって名前付けされています。


### 2.5.5 tabindexとキーボード操作

```html
tabindex="0"
tabindex="-1"
```

`tabindex`は、キーボードによるフォーカスの扱いに関係する属性です。通常、`tabindex="0"`の要素はTabキーによる順次フォーカス移動の対象になります。一方、`tabindex="-1"`の要素は通常のTabキー移動の対象から外れますが、JavaScriptなどによってフォーカスを移すことはできます。

本章のHTMLでは検索タブに`0`、ニュースタブに`-1`が指定されています。ただし、現時点ではJavaScriptによる矢印キー操作や選択状態の更新は実装されていません。**タブの構造と初期状態を用意した段階**と考えてください。

## 2.6 ニュース領域の構造を理解する

<!-- source: chapters/new-tab-8chapters/02-html/index.html#L32-L41 -->

```html
<section id="panel-news" class="panel" role="tabpanel"
         aria-labelledby="tab-news" hidden>
  <div class="news-card">
    <div class="news-heading">
      <h2 id="news-title">ニュース</h2>
    </div>
    <p id="news-genre" class="news-genre">
      第4章以降でタブを動かします。
    </p>
    <div id="news" aria-live="polite"></div>
  </div>
</section>
```

`section`はニュースパネル全体、`h2`はニュース領域の見出し、`p`は説明文です。また、`news-card`というclassが付いた`div`はニュースの内容をまとめるために用意されています。


### 2.6.1 hidden属性による非表示

```html
<section id="panel-news" hidden>
```

`hidden`は要素を非表示にするHTML属性です。検索パネルにはなく、ニュースパネルにあるため、初期表示は検索画面です。

### 2.6.2 ニュース表示用の空のdiv

```html
<div id="news" aria-live="polite"></div>
```
`aria-live="polite"`は、内容が更新された際に、支援技術が適切なタイミングで変更を通知できるようにするための属性です。ただし、実際の通知方法はブラウザや支援技術の組み合わせなどによって異なります。

### 2.6.3 将来の機能を意識した構造

ニュースパネルには、パネルそのもの、ニュースの見出し、補助情報、本文などを追加する領域が用意されています。まだ動作していない機能であっても、その機能が必要とする画面構造を先に設計しているわけです。

最初からすべての機能を完成させようとすると、HTML、CSS、JavaScriptを同時に考える必要があります。一方、必要な領域をHTMLで用意しておけば、後から各機能を段階的に追加できます。

## 2.7 ブラウザで動作を確認する

コードを理解する上で重要なのは、説明を読むことだけではありません。実際に動かしてみて、予想した結果と一致するかを確認することも必要です。

### 2.7.1 HTMLをブラウザで開く

`02-html/index.html`を開きましょう。CSSがないため標準の見た目で、ニュースタブを押しても切り替わりません。まだJavaScriptによる表示変更がないためです。

## 2.8 開発者ツールを使って構造を調べる

開発者ツールは、WebページのHTMLやCSSを確認し、動作を調査する機能です。Chromeでは右クリックして「検証」を選ぶか、`Ctrl+Shift+I`を押して開きます。ここでの変更は元のHTMLファイルには保存されず、ページを再読み込みすると元に戻ります。

### 2.8.1 ElementsでHTMLを確認する

開発者ツールで「Elements」またはそれに相当する画面を探してください。そこには`html`、`head`、`body`などが階層構造で表示されます。

これはブラウザが現在扱っているDOMと呼ばれる文書構造です。DOMはHTMLをもとに構築されますが、ソースコードと完全に同じ表現になるとは限りません。

まず`div.shell`を探してください。その内側に`nav.tabs`と`main.container`があり、さらに見出しや検索パネル、ニュースパネルが存在することを確認します。

### 2.8.2 タブとパネルのidを照合する

検索タブの`aria-controls="panel-search"`と、検索パネルの`id="panel-search"`を照合します。ニュースタブとニュースパネルについても、同じ手順で確認してください。

属性がどの要素を参照しているのかを追いかけることが大切です。

## 2.9 AIと参考資料を使って理解を深める

コードの意味が分からなかったり、どのように調べればよいのか迷ったりした場合、生成AIに質問して説明を得ることもできます。

> HTMLの`aria-controls`はどのような役割を持っていますか。`id`との関係を、初学者にも分かるように説明してください。

このような質問は、分からない用語を理解するための手掛かりになります。ただし、AIによる説明が常に正しいとは限りません。

### 2.9.1 仕様と実装を区別する

例えば、
> 「タブを作るには`aria-controls`が必要ですか」と質問したとします。
この問いに答える際には、何を根拠に「必要」と判断するのかを区別することが重要です。

HTMLの標準的な`button`要素を単独で使用する場合と、WAI-ARIAのタブパターンに沿ったUIを自作する場合とでは、求められる構造が異なります。

W3CのWAI-ARIA Authoring Practices Guideでは、タブとパネルの対応付けとして`aria-controls`を使用するパターンが示されています。一方、単に2つのボタンを並べただけであれば、それらが必ずタブとして機能するわけではありません。

### 2.9.2 参考資料を確認する

HTMLの要素や属性について調べる際には、MDN Web Docsが参考になります。タブのアクセシビリティ設計については、W3CのWAI-ARIA Authoring Practices Guideを確認するとよいでしょう。

疑問が生じた場合には、まず何が分からないのかを整理し、AIの説明や参考資料を利用して理解を深めるべきです。

### 2.9.3 自分で確かめる習慣を身につける

今回の学習では、`h1`の内容を変更すると見出しが変わり、`hidden`を削除するとニュース領域が表示され、`name="q"`を変更するとフォーム送信時の項目名が変わることを確認しました。一方、`aria-controls`を変更しても、ページの見た目は通常変化しません。

これらの結果から、HTMLには、画面に直接現れる情報と、画面上では分かりにくい意味や関係の情報が含まれていることが分かります。

## 2.10 章末演習

次の問いについて、自分で考えてから解答例を確認してください。分からない場合には、`index.html`を読み直したり、ブラウザで動作を確かめたりしましょう。

1. `head`と`body`の違いは何でしょうか。
2. `id`と`class`にはどのような違いがありますか。
3. 検索欄の`name="q"`を変更すると、何が変わりますか。
4. ニュース領域が最初から表示されないのはなぜですか。
5. `aria-controls`を指定しただけで、タブが切り替わらないのはなぜですか。

### 発展課題：3つ目のパネルを設計する

余裕がある方は、新しく「メモ」というタブとパネルを追加してみてください。最初から動作させる必要はありません。HTMLの構造だけを用意します。

```html
<button id="tab-memo" type="button" class="filetab" role="tab"
        aria-selected="false" aria-controls="panel-memo"
        tabindex="-1">3 メモ</button>
```

```html
<section id="panel-memo" class="panel" role="tabpanel"
         aria-labelledby="tab-memo" hidden>
  <h2>メモ</h2>
  <p>ここにメモを表示します。</p>
</section>
```

既存のタブ一覧とパネル一覧の適切な場所へ追加してください。追加した時点では、メモタブをクリックしてもパネルは切り替わりません。しかし、`hidden`を一時的に削除すれば、メモ領域が表示されます。

ここで考えてほしいのは、タブを追加する際に、どのような要素や属性をそろえる必要があるかということです。演習後は、元の2つのタブの構成に戻しておきましょう。

## 2.11 本章のまとめ

本章では、HTMLの基本的な役割から始まり、New Tabアプリの`index.html`を題材として、画面の構造と要素同士の関係を確認しました。

HTMLは、単に文字やボタンを表示するためのものではありません。文書の見出しや区画、入力フォーム、操作部品などに意味を与え、ブラウザや支援技術がそれらを適切に扱うための土台となります。

また、HTMLの親子関係を理解することで、複雑なコードも大きな構造から順番に読み解けるようになります。

今回のアプリでは、最初に`div.shell`というまとまりがあり、その内側にタブの領域とメインコンテンツが配置されていました。さらにメインコンテンツの中には、検索パネルとニュースパネルが用意されていました。

検索フォームでは、`form`、`input`、`button`の組み合わせによって、JavaScriptを使わずに検索語を送信できることを確認しました。

タブとパネルについては、`id`やARIA属性を利用して対応関係を表す方法を学びました。ただし、対応関係を記述することと、実際に画面を切り替えることは別の作業です。
