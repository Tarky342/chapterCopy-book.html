#!/usr/bin/env node
'use strict';

// Node.js >= 18. No npm dependencies. Read-only validator.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {scanSources, compareLock} = require('./source_lock');

const ORDER = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '99'];
const KINDS = new Set(['diagram', 'screenshot', 'illustration', 'photo']);
const PRIORITY = new Set(['P0', 'P1', 'P2']);
const STATUS = new Set(['proposed', 'approved', 'delivered', 'verified', 'rejected']);
const DECISIONS = new Set(['unreviewed', 'no_visual_needed', 'candidate_visual', 'needs_visual']);
const STAGES = new Set(['知る', '読み解く', '考える']);
const GRANULARITIES = new Set(['overview', 'correspondence', 'one-step', 'detail']);
const RIGHTS = new Set(['pending', 'self-created', 'permission-obtained', 'licensed', 'public-domain']);
const EXTENSIONS = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp']);
const BRIEF_SECTIONS = [
  '読者の疑問と到達点', '制作の目的', '本文への設置指示', '図の粒度・省略する情報', '制作依頼文（そのまま渡せる形）',
  '必須の要素・ラベル', '描かないこと・誤解防止', '制作仕様',
  'キャプション・代替テキスト', '根拠・検証方法', '見た後の小さな行動', '完成時の受入基準',
];
const SAMPLE_PLACEHOLDER = /【要記入|<(?:ID|図のタイトル|manuscript|output|この図で|本文に|図・画像の|必ず描く|表示する|描いてはいけない|概念的な|読書媒体に|STYLE_GUIDE|本文に添える|図を見られない|参照した|ユーザーが|図の意味|ラベルを|誤解を|権利・出典)/;
const text = (x) => typeof x === 'string' && x.trim().length > 0;
const arr = (x) => Array.isArray(x) ? x : [];

function safeRelative(rel) {
  if (!text(rel) || rel.includes('\\') || rel.includes('\0') || path.posix.isAbsolute(rel)) return false;
  const parts = rel.split('/');
  return parts.every(part => part !== '' && part !== '.' && part !== '..');
}
function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function resolveSafe(root, rel) {
  if (!safeRelative(rel)) return null;
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(path.resolve(root) + path.sep)) return null;
  return abs;
}
function loadJson(root, rel, errors) {
  const file = resolveSafe(root, rel);
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { errors.push(`${rel}: 読込/JSON解析失敗 (${error.message})`); return null; }
}
function readRel(root, rel, errors, label) {
  const abs = resolveSafe(root, rel);
  if (!abs) { errors.push(`${label}: 禁止された相対パス: ${JSON.stringify(rel)}`); return null; }
  try { return fs.readFileSync(abs); }
  catch { errors.push(`${label}: ファイルがありません: ${rel}`); return null; }
}
function countOccur(haystack, needle) {
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
}
function checkImageFormat(data, ext) {
  if (!data || data.length < 12) return false;
  if (ext === '.png') return data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (ext === '.jpg' || ext === '.jpeg') return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  if (ext === '.webp') return data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP';
  if (ext === '.svg') {
    const src = data.toString('utf8');
    return /<svg(?:\s|>)/i.test(src) && !/<script(?:\s|>)/i.test(src) && !/\bon\w+\s*=/i.test(src) && !/javascript:/i.test(src) && !/\b(?:href|xlink:href)\s*=\s*["'](?:https?:|data:)/i.test(src);
  }
  return false;
}
function isRecord(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }

// This is a structural guardrail, not a measure of actual learning quality.
function checkPedagogy(id, req, errors, warnings, phase) {
  const p = req.pedagogy;
  if (!isRecord(p)) { errors.push(`${id}: pedagogy がありません（読者適合性の再審査が必要）`); return; }
  if (!STAGES.has(p.stage)) errors.push(`${id}: pedagogy.stage は 知る/読み解く/考える のいずれか`);
  if (!GRANULARITIES.has(p.granularity)) errors.push(`${id}: pedagogy.granularity が不正`);
  for (const key of ['reader_question', 'sticking_point', 'takeaway', 'reader_action', 'why_visual']) {
    if (!text(p[key]) || p[key].trim().length < 12) errors.push(`${id}: pedagogy.${key} の説明が不足（12文字以上）`);
  }
  if (text(p.reader_question) && !/[?？]$/.test(p.reader_question.trim())) errors.push(`${id}: reader_question は読者の問い（疑問符で終える）`);
  for (const [key, min, max] of [['focus_elements',1,4], ['labels',0,4], ['new_terms',0,1], ['omit',1,6]]) {
    const a = p[key];
    if (!Array.isArray(a) || a.length < min || a.length > max || a.some(x=>!text(x)) || new Set(a).size !== a.length) {
      errors.push(`${id}: pedagogy.${key} は重複のない文字列配列（${min}〜${max}個）`);
    }
  }
  if (req.kind === 'diagram' && Array.isArray(p.labels) && p.labels.length === 0) errors.push(`${id}: 図解には最低1つのラベルが必要`);
  if (p.granularity === 'detail') {
    if (!text(p.detail_reason) || p.detail_reason.trim().length < 25) errors.push(`${id}: detail は詳細図が不可欠な理由を detail_reason に記載（25文字以上）`);
    if (phase === 'pilot' && req.status === 'proposed') errors.push(`${id}: pilot では detail の制作依頼は出せません`);
    else warnings.push(`${id}: detail は読者に必要な前提知識があるか人間が確認してください`);
  }
}

function checkProject(root, mode = 'baseline') {
  if (!['baseline','handoff','verify'].includes(mode)) throw new Error(`不正なモード: ${mode}`);
  const errors = [], warnings = [];
  const chapters = loadJson(root, 'visual/chapters.json', errors);
  const sourceLock = loadJson(root, 'visual/source-lock.json', errors);
  if (sourceLock) {
    if (sourceLock.initialized === true) {
      try { errors.push(...compareLock(sourceLock, scanSources(root))); }
      catch(e) {errors.push(`source-lock: ${e.message}`);} 
    } else if (mode === 'baseline') warnings.push('source-lock: 保護未初期化です。最初に node scripts/lock_sources.js を実行してください');
    else errors.push('source-lock: 保護未初期化です。最初に node scripts/lock_sources.js を実行してください');
  }
  const audit = loadJson(root, 'visual/audit.json', errors);
  const registry = loadJson(root, 'visual/requests.json', errors);
  const workflow = loadJson(root, 'visual/workflow.json', errors);
  if (!chapters || !audit || !registry || !workflow) return {errors, warnings, requests: [], summary: {audited: 0, requests: 0}};
  for (const [name, obj, version] of [['chapters',chapters,1],['audit',audit,2],['requests',registry,2],['workflow',workflow,2]]) {
    if (obj.schema_version !== version) errors.push(`visual/${name}.json: schema_version は ${version} を指定（旧版は migrate_visuals.js で移行）`);
  }
  if (!['pilot','scale'].includes(workflow.phase)) errors.push('visual/workflow.json: phase は pilot または scale');
  if (!Array.isArray(chapters.units) || !Array.isArray(audit.units) || !Array.isArray(registry.requests)) {
    errors.push('units または requests が配列ではありません');
    return {errors, warnings, requests: [], summary: {audited: 0, requests: 0}};
  }
  const unitMap = new Map();
  for (const unit of chapters.units) {
    if (!isRecord(unit) || !text(unit.id) || unitMap.has(unit.id)) { errors.push(`chapters: 重複/不正 ID: ${unit?.id}`); continue; }
    unitMap.set(unit.id, unit);
    if (!ORDER.includes(unit.id)) errors.push(`chapters: 想定外の単位 ${unit.id}`);
    if (!text(unit.dir) || !text(unit.manuscript) || !text(unit.topic)) errors.push(`chapters: ${unit.id} の記載不足`);
    if (text(unit.dir) && text(unit.manuscript)) {
      const rel = `chapters/new-tab-8chapters/${unit.dir}/${unit.manuscript}`;
      if (!safeRelative(rel)) errors.push(`chapters: 危険な原稿パス ${rel}`);
      else if (!fs.existsSync(path.join(root, rel))) errors.push(`chapters: 原稿が見つかりません ${rel}`);
    }
  }
  for (const id of ORDER) if (!unitMap.has(id)) errors.push(`chapters: ${id} の定義がありません`);
  if (unitMap.size !== ORDER.length) errors.push(`chapters: ${ORDER.length}単位である必要があります`);
  const auditedMap = new Map();
  for (const item of audit.units) {
    if (!isRecord(item) || !text(item.chapter_id) || auditedMap.has(item.chapter_id)) {errors.push(`audit: 重複/不正 ID ${item?.chapter_id}`); continue;}
    auditedMap.set(item.chapter_id, item);
    const unit = unitMap.get(item.chapter_id);
    if (!unit) { errors.push(`audit: 未知の章 ${item.chapter_id}`); continue; }
    const ch = item.chapter_id;
    const rel = `chapters/new-tab-8chapters/${unit.dir}/${unit.manuscript}`;
    const raw = readRel(root, rel, errors, `audit ${ch}`);
    if (!DECISIONS.has(item.decision)) errors.push(`audit ${ch}: 不正な decision ${item.decision}`);
    if (!Array.isArray(item.request_ids) || new Set(item.request_ids).size !== arr(item.request_ids).length) errors.push(`audit ${ch}: request_ids の配列または重複が不正`);
    if (item.decision === 'unreviewed') {
      if (mode !== 'baseline') errors.push(`audit ${ch}: 未監査です`);
      else warnings.push(`audit ${ch}: 未監査です`);
    } else {
      if (!text(item.rationale) || item.rationale.trim().length < 12) errors.push(`audit ${ch}: 理由が短すぎる/空です（12文字以上）`);
      if (!/^[a-f0-9]{64}$/.test(item.manuscript_sha256 || '')) errors.push(`audit ${ch}: SHA-256 がありません`);
      else if (raw && sha256(raw) !== item.manuscript_sha256) errors.push(`audit ${ch}: 原稿が監査時から変わっています（再監査が必要）`);
      if (['no_visual_needed','candidate_visual'].includes(item.decision) && arr(item.request_ids).length) errors.push(`audit ${ch}: 未発注/画像不要なのに依頼IDがあります`);
      if (item.decision === 'needs_visual' && !arr(item.request_ids).length) errors.push(`audit ${ch}: 画像が必要なのに依頼IDがありません`);
      if (['candidate_visual','needs_visual'].includes(item.decision) && (!text(item.reader_blocker) || item.reader_blocker.trim().length < 12)) errors.push(`audit ${ch}: 読者のつまずき reader_blocker を具体的に記入（12文字以上）`);
    }
  }
  for (const id of ORDER) if (!auditedMap.has(id)) errors.push(`audit: ${id} がありません`);
  if (auditedMap.size !== ORDER.length) errors.push('audit: 単位数が不正です');

  const seenIDs = new Set(), seenOutputs = new Set(), requestedByChapter = new Map();
  for (const req of registry.requests) {
    if (!isRecord(req)) {errors.push('requests: 不正なレコード'); continue;}
    const id = req.id;
    if (!text(id) || !/^V-(00|0[1-8]|99)-\d{3}$/.test(id)) {errors.push(`requests: 不正な依頼ID ${id}`); continue;}
    if (seenIDs.has(id)) errors.push(`${id}: 依頼IDが重複`);
    seenIDs.add(id);
    const unit = unitMap.get(req.chapter_id);
    if (!unit) {errors.push(`${id}: 未知の章 ${req.chapter_id}`); continue;}
    if (!id.startsWith(`V-${req.chapter_id}-`)) errors.push(`${id}: IDと章が一致しません`);
    if (!KINDS.has(req.kind)) errors.push(`${id}: 不正な kind ${req.kind}`);
    if (!PRIORITY.has(req.priority)) errors.push(`${id}: 不正な priority ${req.priority}`);
    if (!STATUS.has(req.status)) errors.push(`${id}: 不正な status ${req.status}`);
    const manuscript = `chapters/new-tab-8chapters/${unit.dir}/${unit.manuscript}`;
    if (req.manuscript !== manuscript) errors.push(`${id}: 章の本文パス不一致`);
    const expectedBrief = `visual/briefs/${id}.md`;
    if (req.brief !== expectedBrief) errors.push(`${id}: 依頼書パスは ${expectedBrief} にしてください`);
    const outMatch = typeof req.output === 'string' && req.output.match(/\.([a-z0-9]+)$/);
    const ext = outMatch ? `.${outMatch[1]}` : '';
    const expectedBase = `chapters/new-tab-8chapters/${unit.dir}/assets/${id}`;
    if (!safeRelative(req.output) || !req.output.startsWith(`${expectedBase}.`) || !EXTENSIONS.has(ext)) errors.push(`${id}: 納品パス/形式が不正 ${req.output}`);
    if (seenOutputs.has(req.output)) errors.push(`${id}: 納品パスが重複`);
    seenOutputs.add(req.output);
    for (const field of ['title', 'learning_goal', 'caption', 'alt_text']) if (!text(req[field])) errors.push(`${id}: ${field} が空です`);
    checkPedagogy(id, req, errors, warnings, workflow.phase);
    if (text(req.alt_text) && req.alt_text.trim().length < 14) errors.push(`${id}: alt_text は意味が伝わる14文字以上にしてください`);
    const anchor = req.anchor;
    if (!isRecord(anchor) || !['heading','text'].includes(anchor.type) || !text(anchor.value)) errors.push(`${id}: anchor の type/value が不正`);
    else {
      const body = readRel(root, manuscript, errors, `${id} anchor`);
      if (body) {
        const src = body.toString('utf8');
        const occurrences = anchor.type === 'heading' ? src.split(/\r?\n/).filter(line => line.trimEnd() === anchor.value).length : countOccur(src, anchor.value);
        if (anchor.type === 'heading' && !/^#{1,6}\s/.test(anchor.value)) errors.push(`${id}: heading は見出し行を正確に指定`);
        if (occurrences !== 1) errors.push(`${id}: anchor は本文内で1回だけ一致すべきです（現在 ${occurrences} 回）`);
      }
    }
    const evidence = arr(req.evidence);
    if (!Array.isArray(req.evidence)) errors.push(`${id}: evidence は配列にしてください`);
    if (['diagram','screenshot'].includes(req.kind) && evidence.length === 0) errors.push(`${id}: ${req.kind} には根拠が必要です`);
    for (const [i, ev] of evidence.entries()) {
      if (!isRecord(ev) || !safeRelative(ev.path) || !text(ev.contains)) {errors.push(`${id}: evidence[${i}] の形式/パス/抜粋が不正`); continue;}
      const evidenceFile = readRel(root, ev.path, errors, `${id} evidence[${i}]`);
      if (evidenceFile && !evidenceFile.toString('utf8').includes(ev.contains)) errors.push(`${id}: evidence[${i}] の抜粋は実ファイルに存在しません`);
      if (req.kind === 'screenshot' && !evidence.some(e => isRecord(e) && e.path?.startsWith(`chapters/new-tab-8chapters/${unit.dir}/`) && /\.(?:html|css|js|mjs)$/.test(e.path))) {
        errors.push(`${id}: スクリーンショットには対象章の実装コードへの evidence が必要`);
        break;
      }
    }
    const briefBuffer = readRel(root, expectedBrief, errors, `${id} 依頼書`);
    if (briefBuffer) {
      const brief = briefBuffer.toString('utf8');
      if (!brief.startsWith(`# ${id}｜`)) errors.push(`${id}: 依頼書の表題IDが不正`);
      for (const section of BRIEF_SECTIONS) {
        const marker = `## ${section}`;
        const found = brief.indexOf(marker);
        if (found < 0) errors.push(`${id}: 依頼書に節「${section}」がありません`);
        else {
          const untilNext = brief.indexOf('\n## ', found + marker.length);
          const body = brief.slice(found + marker.length, untilNext < 0 ? undefined : untilNext).trim();
          if (body.length < 12) errors.push(`${id}: 節「${section}」の記述が不足しています`);
        }
      }
      if (SAMPLE_PLACEHOLDER.test(brief)) errors.push(`${id}: 依頼書にテンプレートの未記入箇所があります`);
      if (text(req.output) && !brief.includes(req.output)) errors.push(`${id}: 依頼書に納品先 ${req.output} が書かれていません`);
      if (text(req.manuscript) && !brief.includes(req.manuscript)) errors.push(`${id}: 依頼書に本文パスが書かれていません`);
      if (isRecord(anchor) && text(anchor.value) && !brief.includes(anchor.value)) errors.push(`${id}: 依頼書に設置アンカーが書かれていません`);
      if (text(req.caption) && !brief.includes(req.caption)) errors.push(`${id}: 依頼書にキャプションが書かれていません`);
      if (text(req.alt_text) && !brief.includes(req.alt_text)) errors.push(`${id}: 依頼書に代替テキストが書かれていません`);
      if (isRecord(req.pedagogy)) {
        for (const key of ['reader_question','takeaway','reader_action']) {
          if (text(req.pedagogy[key]) && !brief.includes(req.pedagogy[key])) errors.push(`${id}: 依頼書に pedagogy.${key} の内容がありません`);
        }
        if (text(req.pedagogy.granularity) && !brief.includes(req.pedagogy.granularity)) errors.push(`${id}: 依頼書に図の粒度がありません`);
      }
    }
    if (!isRecord(req.rights) || !RIGHTS.has(req.rights.status)) errors.push(`${id}: rights.status が不正`);
    if (!isRecord(req.review)) errors.push(`${id}: review オブジェクトが不正`);
    if (req.status === 'verified') {
      if (!req.rights || req.rights.status === 'pending' || !text(req.rights.source)) errors.push(`${id}: verified には権利の根拠が必要`);
      if (!req.review || !text(req.review.reviewer) || !text(req.review.note)) errors.push(`${id}: verified には人間のレビュー記録が必要`);
    }
    if (['delivered','verified'].includes(req.status)) {
      const image = readRel(root, req.output, errors, `${id} 納品済み素材`);
      if (image && !checkImageFormat(image, ext)) errors.push(`${id}: 画像の形式が拡張子と一致しないか、安全なSVGではありません`);
    }
    const set = requestedByChapter.get(req.chapter_id) || new Set();
    set.add(id);
    requestedByChapter.set(req.chapter_id, set);
  }
  for (const [ch, record] of auditedMap) {
    const listed = new Set(arr(record.request_ids));
    const registered = requestedByChapter.get(ch) || new Set();
    for (const id of listed) if (!registered.has(id)) errors.push(`audit ${ch}: ${id} は requests.json にありません`);
    for (const id of registered) if (!listed.has(id)) errors.push(`audit ${ch}: requests.json の ${id} が audit にありません`);
    if (registered.size && record.decision !== 'needs_visual') errors.push(`audit ${ch}: 依頼がある章は needs_visual にする必要があります`);
  }
  const proposed = registry.requests.filter(r => r && r.status === 'proposed');
  const cap = workflow.phase === 'pilot' ? 1 : 3;
  if (proposed.length > cap) errors.push(`workflow: ${workflow.phase} では proposed は最大${cap}件（現在${proposed.length}件）。既存依頼を勝手に削除/承認せずユーザーに確認してください`);
  const auditedCount = [...auditedMap.values()].filter(e => e.decision !== 'unreviewed').length;
  return {errors, warnings, requests: registry.requests, summary: {audited: auditedCount, units: ORDER.length, requests: registry.requests.length}};
}

function nextRequests(requests, limit = 1) {
  return requests.filter(r => r.status === 'proposed')
    .sort((a,b) => PRIORITY_ORDER(a.priority) - PRIORITY_ORDER(b.priority) || ORDER.indexOf(a.chapter_id) - ORDER.indexOf(b.chapter_id) || a.id.localeCompare(b.id))
    .slice(0,limit);
}
function PRIORITY_ORDER(x) {return ({P0:0,P1:1,P2:2})[x] ?? 9;}
function hashUnit(root, id) {
  const errors = [];
  const chapters = loadJson(root, 'visual/chapters.json', errors);
  if (!chapters || !Array.isArray(chapters.units)) throw Error(errors.join('; ') || 'chapters が不正');
  const unit = chapters.units.find(u => u.id === id);
  if (!unit) throw Error(`未知の章ID: ${id}`);
  const rel = `chapters/new-tab-8chapters/${unit.dir}/${unit.manuscript}`;
  const body = readRel(root, rel, errors, 'hash');
  if (!body) throw Error(errors.join('; '));
  return {chapter_id:id, manuscript:rel, sha256:sha256(body)};
}
function cli(argv = process.argv.slice(2)) {
  if (argv.includes('--help')) {
    console.log('node scripts/check_visuals.js [--mode baseline|handoff|verify] [--root /path/to/project] [--hash 02|all] [--list-next] [--limit 1|2|3]');
    return 0;
  }
  const get = (name, fallback) => { const idx = argv.indexOf(name); return idx >= 0 ? argv[idx+1] : fallback; };
  const root = path.resolve(get('--root', path.resolve(__dirname,'..')));
  const hashTarget = get('--hash', null);
  if (hashTarget) {
    try { console.log(JSON.stringify(hashTarget === 'all' ? ORDER.map(id => hashUnit(root,id)) : hashUnit(root,hashTarget),null,2)); return 0; }
    catch (e) {console.error(`ERROR: ${e.message}`);return 1;}
  }
  const mode = get('--mode', 'baseline');
  let result;
  try {result = checkProject(root,mode);} catch(e){console.error(`ERROR: ${e.message}`);return 1;}
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  for (const warning of result.warnings) console.warn(`WARN: ${warning}`);
  console.log(`監査済 ${result.summary.audited}/${result.summary.units || 10}、制作依頼 ${result.summary.requests} 件、エラー ${result.errors.length} 件`);
  if (argv.includes('--list-next')) {
    const limit = Number(get('--limit', '1'));
    if (!Number.isInteger(limit) || limit < 1 || limit > 3) {console.error('ERROR: --limit は1〜3の整数'); return 1;}
    console.log(`次に依頼する優先候補（最大${limit}件）:`);
    for (const req of nextRequests(result.requests,limit)) console.log(`  ${req.priority} ${req.id} ${req.title}  ${req.brief}`);
  }
  return result.errors.length ? 1 : 0;
}
if (require.main === module) process.exitCode = cli();
module.exports = {checkProject, nextRequests, hashUnit, sha256, safeRelative, checkImageFormat, cli};
