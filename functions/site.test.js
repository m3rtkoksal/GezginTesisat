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
  assert.match(h, /<h1 id="heroTitle">İstanbul&#39;da Tesisat ve Tadilat: Avrupa ve Anadolu Yakası<\/h1>/);
  for (const s of defaults.services) assert.ok(h.includes(`<h3>${s.title.replace(/&/g, "&amp;")}</h3>`), s.title);
  assert.ok(h.includes('href="tel:+905386049140"'));
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

test("başlık, açıklama, canonical ve Open Graph", () => {
  const h = page();
  const decode = (x) => x.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  assert.equal(decode(/<title>(.*?)<\/title>/.exec(h)[1]), "İstanbul Tesisat ve Tadilat Ustası | Gezgin Tesisat & Tadilat");
  const desc = decode(/<meta name="description" content="(.*?)">/.exec(h)[1]);
  assert.ok(desc.length <= 155, `açıklama uzun: ${desc.length}`);
  for (const k of ["İstanbul", "yangın", "doğalgaz", "banyo", "demir çit", "0538 604 91 40"]) assert.ok(desc.includes(k), k);
  assert.doesNotMatch(h, /name="keywords"/);
  assert.ok(h.includes('<link rel="canonical" href="https://gezgintadilat.com.tr/">'));
  assert.ok(h.includes('<meta property="og:url" content="https://gezgintadilat.com.tr/">'));
});

test("yapılandırılmış veri: adres Çayırova/Kocaeli, bölge İstanbul + 39 ilçe, uydurma alan yok", () => {
  const d = ld(page());
  assert.deepEqual(d["@type"], ["Plumber", "HomeAndConstructionBusiness"]);
  assert.equal(d.name, "Gezgin Tesisat & Tadilat");
  assert.deepEqual(d.alternateName, SEO.altNames);
  assert.equal(d.telephone, "+905386049140");
  assert.equal(d.url, "https://gezgintadilat.com.tr/");
  assert.equal(d.hasOfferCatalog.itemListElement.length, defaults.services.length);
  assert.equal(d.address.streetAddress, undefined, "sokak adresi yokken uydurulmaz");
  assert.equal(d.address.addressLocality, "Çayırova");
  assert.equal(d.address.addressRegion, "Kocaeli");
  assert.equal(d.areaServed[0].name, "İstanbul");
  assert.equal(d.areaServed.length, 40);
  assert.ok(d.areaServed.some((a) => a.name === "Kadıköy, İstanbul"));
  assert.ok(d.areaServed.some((a) => a.name === "Beylikdüzü, İstanbul"));
  assert.equal(d.openingHoursSpecification, undefined, "saat yokken eklenmez");
  for (const k of ["aggregateRating", "review", "priceRange", "foundingDate"]) assert.equal(d[k], undefined, k);
});

test("bölge, adres ve 24 saat girilince sayfaya ve veriye yansır", () => {
  const h = page({ areas: "İstanbul Avrupa ve Anadolu Yakası", address: "Örnek Mah. 1", hours: "24 saat" });
  assert.ok(h.includes('<span class="chip">İstanbul Avrupa ve Anadolu Yakası</span>'));
  const d = ld(h);
  assert.equal(d.address.streetAddress, "Örnek Mah. 1");
  assert.equal(d.address.addressLocality, "Çayırova");
  assert.equal(d.openingHoursSpecification[0].opens, "00:00");
  assert.equal(d.openingHoursSpecification[0].closes, "23:59");
  assert.equal(d.openingHoursSpecification[0].dayOfWeek.length, 7);
  assert.ok(h.includes("Ümraniye"), "ilçe listesi görünür");
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

test("hizmet sayfaları: her biri kendi başlığı, canonical, JSON-LD ve bölge bilgisiyle gelir", () => {
  const { renderPage } = require("./site");
  const { PAGES } = require("./shared");
  const tpl = fs.readFileSync(path.join(__dirname, "page.html"), "utf8");
  for (const k of Object.keys(PAGES)) {
    const h = renderPage(tpl, k, {}, new Date("2026-10-09T12:00:00Z"));
    assert.doesNotMatch(h, /\{\{\w+\}\}/, k);
    assert.ok(h.includes(`<link rel="canonical" href="https://gezgintadilat.com.tr${PAGES[k].path}">`), k);
    assert.match(h, /<h1>İstanbul/, k);
    assert.ok(h.includes("Avrupa ve Anadolu yakasının tamamında"), k);
    assert.ok(h.includes('href="tel:+905386049140"'), k);
    for (const [t] of PAGES[k].items) assert.ok(h.includes(`<h3>${t}</h3>`), t);
    const blocks = [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
    assert.equal(blocks.length, PAGES[k].faq ? 3 : 2);
    assert.equal(blocks[0]["@type"], "Service");
    assert.equal(blocks[1]["@type"], "BreadcrumbList");
    if (PAGES[k].faq) {
      assert.equal(blocks[2]["@type"], "FAQPage");
      assert.equal(blocks[2].mainEntity.length, 3);
      for (const p of PAGES[k].body) assert.ok(h.includes(p.replace(/'/g, "&#39;")), `${k} metin`);
      assert.ok(h.includes('href="/#teklif"'), k);
    }
  }
  assert.equal(renderPage(tpl, "yok", {}), null);
});

test("ana sayfa tüm hizmet sayfalarına bağlanır; sitemap ve rewrite'lar hepsini içerir", () => {
  const { PAGES } = require("./shared");
  const h = page();
  const sm = fs.readFileSync(path.join(__dirname, "..", "sitemap.xml"), "utf8");
  const fb = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "firebase.json"), "utf8"));
  const sources = fb.hosting.rewrites.map((r) => r.source);
  for (const k of Object.keys(PAGES)) {
    const p = PAGES[k].path;
    assert.ok(h.includes(`href="${p}"`), p);
    assert.ok(sm.includes(`https://gezgintadilat.com.tr${p}</loc>`), p);
    assert.ok(sources.includes(p), `rewrite ${p}`);
  }
  assert.equal(Object.keys(PAGES).length, 12);
});

test("favicon dosyaları var ve her iki şablonda bağlı", () => {
  const root = path.join(__dirname, "..");
  for (const f of ["favicon.ico", "icon-48.png", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "icon.svg"]) {
    assert.ok(fs.existsSync(path.join(root, f)), f);
  }
  const png = fs.readFileSync(path.join(root, "icon-48.png"));
  assert.equal(png.readUInt32BE(16), 48); // genişlik
  assert.equal(png.readUInt32BE(20), 48); // yükseklik
  for (const tpl of ["template.html", "page.html"]) {
    const h = fs.readFileSync(path.join(__dirname, tpl), "utf8");
    for (const href of ["/favicon.ico", "/icon-48.png", "/icon-192.png", "/icon.svg", "/apple-touch-icon.png"]) assert.ok(h.includes(`href="${href}"`), `${tpl} ${href}`);
  }
});

test("açık zeminde 'Diğer hizmetler' bağlantıları koyu yazıyla görünür", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");
  assert.match(css, /\.lp-more \.btn\.ghost\s*\{[^}]*color:\s*var\(--ink\)/);
  assert.doesNotMatch(css.match(/\.lp-more \.btn\.ghost\s*\{[^}]*\}/)[0], /color:\s*#fff/);
});
