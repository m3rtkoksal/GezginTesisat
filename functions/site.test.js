const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { render, intlPhone, buildHead } = require("./site");
const { defaults, CATEGORIES, SEO } = require("./shared");

const template = fs.readFileSync(path.join(__dirname, "template.html"), "utf8");
const decode2 = (x) => x.replace(/&amp;/g, "&");
const page = (content = {}) => render(template, content, new Date("2026-10-09T12:00:00Z"));
const ld = (html) => JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)[1].replace(/\\u003c/g, "<"));

test("ham HTML'de içerik var (JavaScript gerekmeden)", () => {
  const h = page();
  assert.match(h, /<h1 id="heroTitle">Gezgin Tesisat &amp; Tadilat<\/h1>/);
  for (const s of defaults.services) assert.ok(h.includes(`<h3>${s.title.replace(/&/g, "&amp;")}</h3>`), s.title);
  assert.ok(h.includes('href="tel:05386049140"'));
  assert.ok(h.includes('href="https://wa.me/905386049140"'));
  assert.match(h, /<p id="aboutText" class="muted">Gezgin Tesisat &amp; Tadilat;/);
  assert.ok(h.includes("Yangın tesisatı"), "görünür metinde anahtar kelime");
});

test("hiç doldurulmamış {{işaret}} kalmaz", () => {
  assert.doesNotMatch(page(), /\{\{\w+\}\}/);
});

test("boş alanlar gizlenir: bölge, saat, adres, galeri", () => {
  const h = page();
  assert.match(h, /id="areasWrap" hidden>/);
  assert.match(h, /<li hidden><span>🕒/);
  assert.match(h, /<li hidden><span>📍/);
  assert.match(h, /<section id="gallery" class="sec alt" hidden>/);
});

test("başlık, açıklama, canonical ve Open Graph marka aramalarını içerir", () => {
  const h = page();
  const title = decode2(/<title>(.*?)<\/title>/.exec(h)[1]);
  assert.ok(title.length <= 80, `başlık uzun: ${title.length}`);
  assert.match(title, /Gezgin Tesisat & Tadilat/);
  assert.match(title, /İstanbul Tadilat, Tamirat, Yangın Tesisatı/);
  const decode = (x) => x.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const desc = decode(/<meta name="description" content="(.*?)">/.exec(h)[1]);
  assert.ok(desc.length <= 160, `açıklama uzun: ${desc.length}`);
  assert.match(desc, /Gezgin Tadilat/);
  assert.match(desc, /Gezgin Tamirat/);
  for (const k of ["yangın", "doğalgaz", "pompa", "vana", "ısıtma", "gider", "tamirat", "tadilat", "İstanbul", "çit", "demir"]) assert.match(desc, new RegExp(k), k);
  assert.ok(h.includes('<link rel="canonical" href="https://gezgintadilat.com.tr/">'));
  assert.ok(h.includes('<meta property="og:url" content="https://gezgintadilat.com.tr/">'));
});

test("yapılandırılmış veri geçerli JSON ve doğru alanlar var", () => {
  const d = ld(page());
  assert.equal(d["@type"], "Plumber");
  assert.equal(d.name, "Gezgin Tesisat & Tadilat");
  assert.deepEqual(d.alternateName, SEO.altNames);
  for (const n of ["Gezgin Tadilat", "Gezgin Tamirat"]) assert.ok(d.alternateName.includes(n));
  assert.equal(d.telephone, "+905386049140");
  assert.equal(d.url, "https://gezgintadilat.com.tr/");
  assert.equal(d.hasOfferCatalog.itemListElement.length, defaults.services.length);
  assert.equal(d.address.streetAddress, undefined, "sokak adresi yokken uydurulmaz");
  assert.equal(d.address.addressLocality, "İstanbul");
  assert.deepEqual(d.areaServed, [{ "@type": "City", name: "İstanbul" }], "ilçe yokken sadece şehir");
});

test("bölge, adres ve saat girilince sayfaya ve veriye yansır", () => {
  const h = page({ areas: "Kadıköy, Üsküdar", address: "Örnek Mah. 1", hours: "Her gün 09-18" });
  assert.ok(h.includes('<span class="chip">Kadıköy</span>'));
  assert.doesNotMatch(h, /id="areasWrap" hidden>/);
  const d = ld(h);
  assert.deepEqual(d.areaServed.map((a) => a.name), ["İstanbul", "Kadıköy", "Üsküdar"]);
  assert.equal(d.address.streetAddress, "Örnek Mah. 1");
  assert.equal(d.openingHours, "Her gün 09-18");
  assert.match(/<meta name="description" content="(.*?)">/.exec(h)[1], /Kadıköy/);
});

test("içerikteki HTML kaçışlanır, script kapanışı JSON'u bozmaz", () => {
  const h = page({ about: '<script>alert(1)</script> "tırnak"', businessName: 'A</script><img src=x onerror=1>' });
  assert.ok(!h.includes("<script>alert(1)</script>"));
  assert.ok(!h.includes("<img src=x"));
  assert.ok(h.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.doesNotThrow(() => ld(h), "JSON-LD hâlâ ayrıştırılabilir");
  const blocks = h.match(/<script type="application\/ld\+json">/g);
  assert.equal(blocks.length, 1);
});

test("galeri: ilk dolu kategori açık gelir, küçük resim ve açıklama kullanılır", () => {
  const h = page({ gallery: [
    { url: "https://x/a.jpg", thumb: "https://x/at.jpg", cat: "Mekanik", caption: "Pompa grubu" },
    { url: "https://x/b.jpg", thumb: "https://x/bt.jpg", cat: "Su & Gider" },
    { url: "https://x/c.jpg", cat: "Tadilat" },
  ] });
  assert.doesNotMatch(h, /<section id="gallery" class="sec alt" hidden>/);
  assert.match(h, /data-cat="Su &amp; Gider" class="on" aria-selected="true"/);
  assert.ok(h.includes('src="https://x/bt.jpg"'), "ilk kategorinin küçük resmi");
  assert.ok(!h.includes("https://x/at.jpg") && !h.includes("https://x/c.jpg"), "diğer kategorilerin resimleri HTML'de yok");
  assert.ok(!/<img [^>]*a\.jpg/.test(h), "diğer kategori <img> olarak gelmez");
  assert.ok(h.includes('<meta property="og:image" content="https://x/a.jpg">'));
});

test("bozuk içerik sayfayı düşürmez", () => {
  assert.doesNotThrow(() => page({ services: null, gallery: "x", areas: null, phone: "" }));
});

test("telefon biçimleri", () => {
  assert.equal(intlPhone("0538 604 91 40"), "+905386049140");
  assert.equal(intlPhone("+90 538 604 91 40"), "+905386049140");
  assert.equal(intlPhone("905386049140"), "+905386049140");
  assert.equal(intlPhone("538 604 91 40"), "+905386049140");
  assert.equal(intlPhone("123"), null);
});

test("sunucu varsayılanları kök dizindeki defaults.js ve categories.js ile aynı", async () => {
  const root = path.join(__dirname, "..");
  const d = (await import(pathToFileURL(path.join(root, "defaults.js")).href)).defaults;
  const c = (await import(pathToFileURL(path.join(root, "categories.js")).href)).CATEGORIES;
  assert.deepEqual(defaults, d);
  assert.deepEqual(CATEGORIES, c);
});

test("hizmet satırları ve görünür bölümde istenen anahtar kelimeler var", () => {
  const h = page();
  for (const k of ["Yangın tesisatı", "Doğalgaz", "Pompa", "Vana", "Isıtma", "gider", "Tadilat", "tamirat", "İstanbul", "çit", "Demir doğrama"]) {
    assert.ok(h.includes(k) || h.toLowerCase().includes(k.toLowerCase()), `sayfada yok: ${k}`);
  }
  assert.ok(h.includes("<h3>Pompa &amp; Vana</h3>"));
  assert.ok(h.includes("<h3>Doğalgaz Tesisatı</h3>"));
  assert.deepEqual(ld(h).knowsAbout, SEO.topics);
});
