#!/usr/bin/env node
'use strict';
// Non-destructive v1 -> v2 metadata migration. Node.js >=18, no dependencies.
const fs = require('node:fs');
const path = require('node:path');

const TEMPLATE = () => ({
  stage: '', reader_question: '', sticking_point: '', takeaway: '',
  reader_action: '', why_visual: '', granularity: '',
  focus_elements: [], labels: [], new_terms: [], omit: []
});

function migrate(root, apply = false) {
  const targets = ['audit.json','requests.json'];
  const changes = [];
  const modified = [];
  for (const file of targets) {
    const rel = `visual/${file}`;
    const abs = path.join(root,rel);
    if (!fs.existsSync(abs)) throw Error(`${rel} が見つかりません。既存台帳を確認してください。`);
    const original = fs.readFileSync(abs,'utf8');
    const obj = JSON.parse(original);
    if (![1,2].includes(obj.schema_version)) throw Error(`${rel}: 対応していない schema_version`);
    if (file === 'audit.json') {
      if (!Array.isArray(obj.units)) throw Error(`${rel}: units が配列ではありません`);
      for (const unit of obj.units) {
        if (!Object.hasOwn(unit,'reader_blocker')) {unit.reader_blocker='';changes.push(`${rel}: ${unit.chapter_id} に reader_blocker 追加`);}
      }
    } else {
      if (!Array.isArray(obj.requests)) throw Error(`${rel}: requests が配列ではありません`);
      for (const req of obj.requests) {
        if (!req.pedagogy || typeof req.pedagogy !== 'object' || Array.isArray(req.pedagogy)) {
          req.pedagogy = TEMPLATE(); changes.push(`${rel}: ${req.id} に pedagogy 追加（要再審査）`);
        } else {
          for (const [key,value] of Object.entries(TEMPLATE())) {
            if (!Object.hasOwn(req.pedagogy,key)) {req.pedagogy[key]=value;changes.push(`${rel}: ${req.id} に ${key} 追加`);}
          }
        }
      }
    }
    if (obj.schema_version !== 2) {obj.schema_version=2;changes.push(`${rel}: schema_version 2`);}
    const updated = JSON.stringify(obj,null,2)+'\n';
    if (updated !== original) modified.push({file,abs,original,updated});
  }
  const workflow = path.join(root,'visual','workflow.json');
  if (!fs.existsSync(workflow)) changes.push('visual/workflow.json: pilot 設定を新規作成');
  if (!apply) return {applied:false,changes};
  if (!changes.length) return {applied:true,changes:[],backup:null};
  const stamp = new Date().toISOString().replace(/[:.]/g,'-');
  const backup = path.join(root,'visual','backups',`migration-${stamp}`);
  fs.mkdirSync(backup,{recursive:true});
  for (const item of modified) {
    fs.writeFileSync(path.join(backup,item.file),item.original);
    fs.writeFileSync(item.abs,item.updated);
  }
  if (!fs.existsSync(workflow)) fs.writeFileSync(workflow,JSON.stringify({schema_version:2,phase:'pilot',notes:'初回は1件だけ。ユーザー確認後にscaleへ。'},null,2)+'\n');
  return {applied:true,changes,backup};
}

if (require.main === module) {
  try {
    const args=process.argv.slice(2);
    const i=args.indexOf('--root');
    const root=path.resolve(i>=0 ? args[i+1] : path.join(__dirname,'..'));
    const result=migrate(root,args.includes('--apply'));
    console.log(result.applied ? '移行を適用しました。' : 'ドライラン（変更なし）。適用するには --apply を指定。');
    for (const change of result.changes) console.log('- '+change);
    if (result.backup) console.log('バックアップ: '+result.backup);
    console.log('注意: 新規 pedagogy 欄と依頼書の内容は、Agentが実際の教材を読んで再審査してください。');
  } catch(e) {console.error('ERROR: '+e.message);process.exitCode=1;}
}
module.exports={migrate};
