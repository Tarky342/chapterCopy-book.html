'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SOURCE_EXT = new Set(['.md','.html','.css','.js','.mjs','.json']);
const EXCLUDED_DIRS = new Set(['assets','.git','node_modules','dist','build']);
function scanSources(root) {
  const base = path.join(root,'chapters');
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) throw Error('chapters/ が存在しません。教材リポジトリのルートで実行してください');
  const files = {};
  function visit(dir) {
    for (const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      const dest = path.join(dir,entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {if (!EXCLUDED_DIRS.has(entry.name)) visit(dest);continue;}
      if (!entry.isFile() || !SOURCE_EXT.has(path.extname(entry.name).toLowerCase())) continue;
      const rel = path.relative(root,dest).split(path.sep).join('/');
      files[rel] = crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex');
    }
  }
  visit(base);
  if (!Object.keys(files).length) throw Error('chapters/ に検査対象の原稿・コードが見つかりません');
  return files;
}
function compareLock(lock,actual) {
  const errors=[];
  if (!lock || lock.schema_version!==1 || lock.initialized!==true || !lock.files || Array.isArray(lock.files) || typeof lock.files!=='object') {
    errors.push('source-lock: 未初期化です（最初に node scripts/lock_sources.js を実行）'); return errors;
  }
  for(const [file,hash] of Object.entries(lock.files)) {
    if (!(file in actual)) errors.push(`source-lock: 保護対象が削除されました: ${file}`);
    else if (actual[file] !== hash) errors.push(`source-lock: 保護対象が変更されました: ${file}`);
  }
  for(const file of Object.keys(actual)) if (!(file in lock.files)) errors.push(`source-lock: 保護対象ファイルが増えました: ${file}`);
  return errors;
}
module.exports = {scanSources,compareLock};
