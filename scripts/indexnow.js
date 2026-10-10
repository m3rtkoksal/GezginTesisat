#!/usr/bin/env node
// IndexNow: canlı sitemap'teki tüm URL'leri https://api.indexnow.org/indexnow'a gönderir.
// Kullanım: node scripts/indexnow.js   (Node 18+)
const fs = require('fs'), path = require('path');
const HOST = process.env.INDEXNOW_HOST || 'gezgintadilat.com.tr';
const DIR = path.join(__dirname, '..', '.');
const keyFile = fs.readdirSync(DIR).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('IndexNow anahtar dosyası bulunamadı');
const key = keyFile.slice(0, 32);
async function locs(url) {
  const xml = await (await fetch(url)).text();
  const all = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  if (/<sitemapindex/.test(xml)) return (await Promise.all(all.map(locs))).flat();
  return all;
}
(async () => {
  const urlList = [...new Set(await locs(`https://${HOST}/sitemap.xml`))];
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList }),
  });
  console.log(`${urlList.length} URL gönderildi -> HTTP ${res.status} ${await res.text()}`);
  if (![200, 202].includes(res.status)) process.exit(1);
})();
