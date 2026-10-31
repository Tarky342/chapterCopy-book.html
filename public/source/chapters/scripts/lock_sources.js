#!/usr/bin/env node
'use strict';
// One-time initialization. Never silently overwrite a previous lock.
const fs = require('node:fs');
const path = require('node:path');
const {scanSources} = require('./source_lock');
const root = path.resolve(__dirname,'..');
const file = path.join(root,'visual','source-lock.json');
try {
  if (fs.existsSync(file)) {
    const existing = JSON.parse(fs.readFileSync(file,'utf8'));
    if (existing.initialized === true) throw Error('保護済みです。再初期化は禁止します。意図的な原稿更新時は人間に確認してください。');
  }
  const files = scanSources(root);
  const content = {schema_version:1,initialized:true,files};
  fs.writeFileSync(file,JSON.stringify(content,null,2)+'\n','utf8');
  console.log(`原稿・コード ${Object.keys(files).length} ファイルを保護しました：visual/source-lock.json`);
} catch(e) { console.error(`ERROR: ${e.message}`);process.exitCode=1; }
