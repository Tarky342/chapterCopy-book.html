'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const {checkProject, nextRequests, hashUnit, sha256, safeRelative, checkImageFormat} = require('./check_visuals');
const {scanSources} = require('./source_lock');
const {migrate} = require('./migrate_visuals');

const rootManifest = path.resolve(__dirname, '..', 'visual', 'chapters.json');
const sections = [
  '読者の疑問と到達点','制作の目的','本文への設置指示','図の粒度・省略する情報',
  '制作依頼文（そのまま渡せる形）','必須の要素・ラベル',
  '描かないこと・誤解防止','制作仕様','キャプション・代替テキスト','根拠・検証方法',
  '見た後の小さな行動','完成時の受入基準'
];
function write(root, rel, value) {
  const target = path.join(root,rel); fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,typeof value === 'string' ? value : JSON.stringify(value,null,2)+'\n');
}
function json(root, rel) {return JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));}
function setup(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'visual-harness-'));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  const chapters = JSON.parse(fs.readFileSync(rootManifest,'utf8'));
  const audit = {schema_version:2,units:[]};
  for (const unit of chapters.units) {
    const manuscript = `chapters/new-tab-8chapters/${unit.dir}/${unit.manuscript}`;
    const content = `# ${unit.topic}\n\nこれは完成した教材の原稿です。\n\n## 図の基準位置\n\nここには独立した説明があります。\n`;
    write(root,manuscript,content);
    write(root,`chapters/new-tab-8chapters/${unit.dir}/index.html`,'<main class="newtab">hello</main>\n');
    audit.units.push({chapter_id:unit.id,decision:'no_visual_needed',rationale:'この章は文章による説明だけで十分に理解できるため図は不要です。',manuscript_sha256:sha256(Buffer.from(content)),reader_blocker:'',request_ids:[]});
  }
  const unit = chapters.units.find(x=>x.id==='02');
  const manuscript = `chapters/new-tab-8chapters/${unit.dir}/${unit.manuscript}`;
  const output = 'chapters/new-tab-8chapters/02-html/assets/V-02-001.svg';
  const caption = '画面の文字と、その表示を表すHTMLの対応を示します。';
  const alt_text = '画面のhelloという文字と、HTML内のhelloという文字を線で対応づける図。';
  const req = {id:'V-02-001',chapter_id:'02',kind:'diagram',priority:'P0',status:'proposed',
    manuscript,anchor:{type:'heading',value:'## 図の基準位置'},
    brief:'visual/briefs/V-02-001.md',output,
    title:'画面とHTMLの対応',learning_goal:'画面に見える文字とHTMLの記述を初学者が対応づける',caption,alt_text,
    pedagogy:{stage:'読み解く',reader_question:'画面のhelloはHTMLのどこに書かれている？',
      sticking_point:'画面に表示される文字とHTMLのどの行が対応するか見つけにくい',
      takeaway:'画面の文字とそれを表すHTMLの短い記述を対応づけられる',
      reader_action:'同じ章のindex.htmlを開き、helloという文字を探してみる',
      why_visual:'画面とコードを並べると位置関係を一度に確認しやすくなるため',
      granularity:'correspondence',focus_elements:['画面のhello','HTMLのhello','対応を示す線'],
      labels:['画面','HTML'],new_terms:[],omit:['CSSの細かな設定','JavaScriptの動き']},
    evidence:[{path:'chapters/new-tab-8chapters/02-html/index.html',contains:'<main class="newtab">'}],
    rights:{status:'pending',source:'',credit:''},review:{reviewer:'',note:''}};
  const r = audit.units.find(x=>x.chapter_id==='02');r.decision='needs_visual';r.rationale='実コードと表示された文字の対応を視覚化すると、初学者が画面とコードの関係を捉えやすくなります。';r.reader_blocker='画面の文字がHTMLのどこに書かれているか分からず戸惑う';r.request_ids=[req.id];
  const body = `# ${req.id}｜${req.title}\n\n`+sections.map(section => `## ${section}\n\n`+(
      section==='本文への設置指示' ? `本文: ${manuscript} の「${req.anchor.value}」直後。納品先: ${output}。`: 
      section==='読者の疑問と到達点' ? `${req.pedagogy.reader_question}\n\n${req.pedagogy.sticking_point}\n\n${req.pedagogy.takeaway}`:
      section==='図の粒度・省略する情報' ? `${req.pedagogy.granularity}。画面と短いHTMLだけを対応づけ、他の要素は省きます。`:
      section==='見た後の小さな行動' ? req.pedagogy.reader_action:
      section==='キャプション・代替テキスト' ? `キャプション: ${caption}\n\n代替テキスト: ${alt_text}`:
      `この図で ${req.learning_goal}。誤解がないように明確な表現を使ってください。`
    )).join('\n\n')+'\n';
  write(root,'visual/chapters.json',chapters);
  write(root,'visual/source-lock.json',{schema_version:1,initialized:true,files:scanSources(root)});
  write(root,'visual/audit.json',audit);
  write(root,'visual/requests.json',{schema_version:2,requests:[req]});
  write(root,'visual/workflow.json',{schema_version:2,phase:'pilot'});
  write(root,req.brief,body);
  return {root,req,manuscript};
}
const has = (result, fragment) => result.errors.some(x=>x.includes(fragment));
test('すべて適合していれば handoff は成功する', t=> {const {root}=setup(t); assert.deepEqual(checkProject(root,'handoff').errors,[]);});
test('baseline は未監査を警告しても停止しない',t=> {const {root}=setup(t);const audit=json(root,'visual/audit.json');audit.units[0].decision='unreviewed';write(root,'visual/audit.json',audit);const result=checkProject(root,'baseline');assert.equal(result.errors.length,0);assert.ok(result.warnings.length>0);});
test('handoff は未監査単位を拒否する',t=> {const {root}=setup(t);const audit=json(root,'visual/audit.json');audit.units[0].decision='unreviewed';write(root,'visual/audit.json',audit);assert.ok(has(checkProject(root,'handoff'),'未監査'));});
test('原稿更新後の監査は無効になる',t=> {const {root,manuscript}=setup(t);fs.appendFileSync(path.join(root,manuscript),'追記');assert.ok(has(checkProject(root,'handoff'),'再監査'));});
test('本文見出しが存在しない依頼を拒否する',t=> {const {root}=setup(t);const x=json(root,'visual/requests.json');x.requests[0].anchor.value='## ない見出し';write(root,'visual/requests.json',x);assert.ok(has(checkProject(root,'handoff'),'anchor'));});
test('本文見出しが重複した依頼を拒否する',t=> {const {root,manuscript}=setup(t);fs.appendFileSync(path.join(root,manuscript),'\n## 図の基準位置\n');const result=checkProject(root,'handoff');assert.ok(has(result,'1回だけ'));});
test('実在しないコード抜粋を拒否する',t=> {const {root}=setup(t);const x=json(root,'visual/requests.json');x.requests[0].evidence[0].contains='NONEXISTENT';write(root,'visual/requests.json',x);assert.ok(has(checkProject(root,'handoff'),'抜粋'));});
test('根拠のない図解を拒否する',t=> {const {root}=setup(t);const x=json(root,'visual/requests.json');x.requests[0].evidence=[];write(root,'visual/requests.json',x);assert.ok(has(checkProject(root,'handoff'),'根拠'));});
test('存在しない依頼書を拒否する',t=> {const {root,req}=setup(t);fs.rmSync(path.join(root,req.brief));assert.ok(has(checkProject(root,'handoff'),'ファイルがありません'));});
test('記述が足りない依頼書を拒否する',t=> {const {root,req}=setup(t);fs.writeFileSync(path.join(root,req.brief),'# V-02-001｜HTML\n');assert.ok(has(checkProject(root,'handoff'),'制作の目的'));});
test('プレースホルダーが残る依頼書を拒否する',t=> {const {root,req}=setup(t);fs.appendFileSync(path.join(root,req.brief),'\n<この図で理解すること>\n');assert.ok(has(checkProject(root,'handoff'),'未記入'));});
test('監査リストから欠けた依頼を拒否する',t=> {const {root}=setup(t);const x=json(root,'visual/audit.json');x.units[2].request_ids=[];write(root,'visual/audit.json',x);assert.ok(has(checkProject(root,'handoff'),'依頼ID'));});
test('申請中の画像ファイル未作成は正常',t=> {const {root}=setup(t);assert.equal(checkProject(root,'verify').errors.length,0);});
test('納品済みの画像ファイル未作成はエラー',t=> {const {root}=setup(t);const x=json(root,'visual/requests.json');x.requests[0].status='delivered';write(root,'visual/requests.json',x);assert.ok(has(checkProject(root,'verify'),'納品済み素材'));});
test('偽装した画像拡張子を拒否する',t=> {const {root,req}=setup(t);const x=json(root,'visual/requests.json');x.requests[0].status='delivered';write(root,'visual/requests.json',x);write(root,req.output,'not a real image');assert.ok(has(checkProject(root,'verify'),'画像の形式'));});
test('検証済みに人間のレビュー・権利情報が必要',t=> {const {root,req}=setup(t);const x=json(root,'visual/requests.json');x.requests[0].status='verified';write(root,'visual/requests.json',x);write(root,req.output,'<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="30" height="20"/></svg>');const result=checkProject(root,'verify');assert.ok(has(result,'権利'));assert.ok(has(result,'レビュー'));});
test('検証済みで画像・権利・レビューが揃えば成功',t=> {const {root,req}=setup(t);const x=json(root,'visual/requests.json');x.requests[0].status='verified';x.requests[0].rights={status:'self-created',source:'制作担当のユーザーが新規作成',credit:'制作担当者'};x.requests[0].review={reviewer:'確認した人',note:'掲載コードと図中ラベルと権利を照合済み'};write(root,'visual/requests.json',x);write(root,req.output,'<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="30" height="20"/></svg>');assert.deepEqual(checkProject(root,'verify').errors,[]);});
test('外部 JavaScript を含むSVGは安全な形式と認めない',()=> {const bad=Buffer.from('<svg><script>alert(1)</script></svg>');assert.equal(checkImageFormat(bad,'.svg'),false);});
test('親ディレクトリを指すパスは無効',()=> {assert.equal(safeRelative('../secrets'),false);assert.equal(safeRelative('/etc/passwd'),false);assert.equal(safeRelative('ok/test.svg'),true);});
test('初回は1件を優先し、明示すれば最大3件選択できる',()=> {const items=[{id:'V-02-001',priority:'P2',chapter_id:'02',status:'proposed'},{id:'V-03-001',priority:'P0',chapter_id:'03',status:'proposed'},{id:'V-01-001',priority:'P0',chapter_id:'01',status:'proposed'},{id:'V-04-001',priority:'P1',chapter_id:'04',status:'proposed'},{id:'V-05-001',priority:'P0',chapter_id:'05',status:'approved'}];assert.deepEqual(nextRequests(items).map(x=>x.id),['V-01-001']);assert.deepEqual(nextRequests(items,3).map(x=>x.id),['V-01-001','V-03-001','V-04-001']);});
test('hash は章ファイルを正確に参照する',t=> {const {root,manuscript}=setup(t);const result=hashUnit(root,'02');assert.equal(result.sha256,sha256(fs.readFileSync(path.join(root,manuscript))));});

test('ソースロックはコードが変更されたことを検出する',t=> {const {root}=setup(t);fs.appendFileSync(path.join(root,'chapters/new-tab-8chapters/02-html/index.html'),'X');assert.ok(has(checkProject(root,'handoff'),'保護対象が変更'));});
test('ソースロックはコードの追加も検出する',t=> {const {root}=setup(t);write(root,'chapters/new-tab-8chapters/02-html/newcode.js','console.log(123)');assert.ok(has(checkProject(root,'handoff'),'保護対象ファイルが増え'));});
test('ソースロックは納品先assetsディレクトリを保護対象としない',t=> {const {root,req}=setup(t);write(root,req.output,'<svg></svg>');assert.deepEqual(checkProject(root,'handoff').errors,[]);});
test('未初期化のソースロックは handoff に失敗する',t=> {const {root}=setup(t);write(root,'visual/source-lock.json',{schema_version:1,initialized:false,files:{}});assert.ok(has(checkProject(root,'handoff'),'保護未初期化'));});

test('読者適合性メタデータが欠けた依頼は拒否する',t=> {
  const {root}=setup(t); const x=json(root,'visual/requests.json');
  delete x.requests[0].pedagogy; write(root,'visual/requests.json',x);
  assert.ok(has(checkProject(root,'handoff'),'pedagogy がありません'));
});
test('読者の問いは質問として書く必要がある',t=> {
  const {root}=setup(t); const x=json(root,'visual/requests.json');
  x.requests[0].pedagogy.reader_question='HTMLの説明をわかりやすく表示する';write(root,'visual/requests.json',x);
  assert.ok(has(checkProject(root,'handoff'),'疑問符'));
});
test('焦点要素が多すぎる依頼を拒否する',t=> {
  const {root}=setup(t); const x=json(root,'visual/requests.json');
  x.requests[0].pedagogy.focus_elements=['A','B','C','D','E'];write(root,'visual/requests.json',x);
  assert.ok(has(checkProject(root,'handoff'),'focus_elements'));
});
test('ラベルが多すぎる依頼を拒否する',t=> {
  const {root}=setup(t); const x=json(root,'visual/requests.json');
  x.requests[0].pedagogy.labels=['A','B','C','D','E'];write(root,'visual/requests.json',x);
  assert.ok(has(checkProject(root,'handoff'),'labels'));
});
test('新出専門語を一枚に2つ以上持ち込む依頼を拒否する',t=> {
  const {root}=setup(t); const x=json(root,'visual/requests.json');
  x.requests[0].pedagogy.new_terms=['DOM','イベント伝播'];write(root,'visual/requests.json',x);
  assert.ok(has(checkProject(root,'handoff'),'new_terms'));
});
test('省く要素がない依頼を拒否する',t=> {
  const {root}=setup(t); const x=json(root,'visual/requests.json');
  x.requests[0].pedagogy.omit=[];write(root,'visual/requests.json',x);
  assert.ok(has(checkProject(root,'handoff'),'omit'));
});
test('読者が図を見た後の行動を依頼書に記載する必要がある',t=> {
  const {root,req}=setup(t);
  const brief=fs.readFileSync(path.join(root,req.brief),'utf8');
  fs.writeFileSync(path.join(root,req.brief),brief.replace(req.pedagogy.reader_action,'コードを確認してください。'));
  assert.ok(has(checkProject(root,'handoff'),'pedagogy.reader_action'));
});
test('候補のままの章は依頼書を作らずに監査完了できる',t=> {
  const {root}=setup(t); const audit=json(root,'visual/audit.json');
  audit.units[1].decision='candidate_visual';audit.units[1].reader_blocker='ワイヤーフレームと画面の対応をつかみにくい';
  write(root,'visual/audit.json',audit);
  assert.deepEqual(checkProject(root,'handoff').errors,[]);
});
test('候補段階で依頼IDを登録したら拒否する',t=> {
  const {root}=setup(t); const audit=json(root,'visual/audit.json');
  audit.units[2].decision='candidate_visual';write(root,'visual/audit.json',audit);
  assert.ok(has(checkProject(root,'handoff'),'未発注/画像不要'));
});
test('候補には読者のつまずきが必要',t=> {
  const {root}=setup(t); const audit=json(root,'visual/audit.json');
  audit.units[1].decision='candidate_visual';write(root,'visual/audit.json',audit);
  assert.ok(has(checkProject(root,'handoff'),'reader_blocker'));
});
test('pilot では複数の未承認依頼を禁止する',t=> {
  const {root}=setup(t); const registry=json(root,'visual/requests.json');
  const duplicate=structuredClone(registry.requests[0]);duplicate.id='V-02-002';
  duplicate.brief='visual/briefs/V-02-002.md';duplicate.output='chapters/new-tab-8chapters/02-html/assets/V-02-002.svg';
  registry.requests.push(duplicate);write(root,'visual/requests.json',registry);
  const audit=json(root,'visual/audit.json');audit.units[2].request_ids.push(duplicate.id);write(root,'visual/audit.json',audit);
  assert.ok(has(checkProject(root,'handoff'),'最大1件'));
});
test('scale は複数の未承認依頼を許容する（最大3件）',t=> {
  const {root}=setup(t);write(root,'visual/workflow.json',{schema_version:2,phase:'scale'});
  const registry=json(root,'visual/requests.json');const req=registry.requests[0];
  const duplicate=structuredClone(req);duplicate.id='V-02-002';duplicate.brief='visual/briefs/V-02-002.md';
  duplicate.output='chapters/new-tab-8chapters/02-html/assets/V-02-002.svg';
  registry.requests.push(duplicate);write(root,'visual/requests.json',registry);
  const audit=json(root,'visual/audit.json');audit.units[2].request_ids.push(duplicate.id);write(root,'visual/audit.json',audit);
  const result=checkProject(root,'handoff');assert.ok(!has(result,'最大1件') && !has(result,'最大3件'));
});
test('pilot では詳細図を発注できない',t=> {
  const {root}=setup(t);const registry=json(root,'visual/requests.json');
  registry.requests[0].pedagogy.granularity='detail';
  registry.requests[0].pedagogy.detail_reason='画面とコードの対応を理解した後でも、内部の仕組みを理解する必要があるため詳細を説明する';
  write(root,'visual/requests.json',registry);
  assert.ok(has(checkProject(root,'handoff'),'pilot では detail'));
});
test('旧schemaは移行しない限りhandoffに失敗する',t=> {
  const {root}=setup(t);const audit=json(root,'visual/audit.json');audit.schema_version=1;
  write(root,'visual/audit.json',audit);
  assert.ok(has(checkProject(root,'handoff'),'schema_version は 2'));
});
test('移行スクリプトはドライランでは変更せず、適用時にバックアップを作る',t=> {
  const {root}=setup(t);
  const audit=json(root,'visual/audit.json');audit.schema_version=1;for(const unit of audit.units)delete unit.reader_blocker;
  const registry=json(root,'visual/requests.json');registry.schema_version=1;delete registry.requests[0].pedagogy;
  write(root,'visual/audit.json',audit);write(root,'visual/requests.json',registry);
  const dry=migrate(root,false);assert.equal(dry.applied,false);
  assert.equal(json(root,'visual/requests.json').schema_version,1);
  const result=migrate(root,true);assert.equal(result.applied,true);
  assert.equal(json(root,'visual/requests.json').schema_version,2);
  assert.ok(json(root,'visual/requests.json').requests[0].pedagogy);
  assert.ok(fs.existsSync(path.join(result.backup,'audit.json')));
  assert.ok(fs.existsSync(path.join(result.backup,'requests.json')));
  assert.ok(has(checkProject(root,'handoff'),'reader_question'));
});
