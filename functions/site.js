// Ana sayfayı sunucuda içerikle birlikte üretir. Arama motorları ve sosyal medya önizlemeleri boş bir kabuk yerine
// gerçek metni, telefonu ve yapılandırılmış veriyi (schema.org) görür. Sayfadaki script yine canlı içerikle günceller.
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const { CATEGORIES, defaults, SEO } = require("./shared");

const SITE_URL = "https://gezgintadilat.com.tr";
const ICONS = ["🔍", "🚿", "🔧", "🚰", "🔥", "💧", "🛠️", "🧰"];

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const digits = (s) => String(s || "").replace(/[^\d+]/g, "");
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…");

/** 0538 604 91 40 -> +905386049140 (schema.org için uluslararası biçim). */
function intlPhone(p) {
  const d = digits(p).replace(/^\+/, "");
  if (/^90\d{10}$/.test(d)) return "+" + d;
  if (/^0\d{10}$/.test(d)) return "+9" + d;
  if (/^\d{10}$/.test(d)) return "+90" + d;
  return null;
}

const areaList = (c) => String(c.areas || "").split(",").map((a) => a.trim()).filter(Boolean);
const catOf = (g) => (CATEGORIES.includes(g.cat) ? g.cat : CATEGORIES[0]);

function buildHead(c) {
  const services = c.services.map((s) => s.title).filter(Boolean);
  const areas = areaList(c);
  // Başlık: işletme adı + en önemli aranan işler. Marka aramaları için "Tadilat" ve "Tamirat" adın hemen yanında.
  const title = clip(`${c.businessName} | ${SEO.city} Tadilat, Tamirat, Yangın Tesisatı`, 72);
  // Şehir ve ilçeler cümlenin başında: kırpılsa bile yerel bilgi kaybolmaz.
  const place = areas.length ? `${SEO.city} (${areas.slice(0, 3).join(", ")})` : SEO.city;
  const description = clip(
    `${c.businessName} (${SEO.altNames.slice(0, 2).join(", ")}): ${place} yangın, doğalgaz, pompa, vana, ısıtma, gider, demir, çit, tamirat, tadilat.` +
      (c.phone ? ` Ara: ${c.phone}` : ""),
    158,
  );
  const keywords = SEO.keywords;
  const image = (c.gallery[0] && (c.gallery[0].url || c.gallery[0].thumb)) || "";

  const ld = {
    "@context": "https://schema.org",
    // (knowsAbout aşağıda)
    "@type": "Plumber",
    name: c.businessName,
    alternateName: SEO.altNames,
    knowsAbout: SEO.topics,
    url: SITE_URL + "/",
    description: clip(c.about || description, 300),
  };
  const tel = intlPhone(c.phone);
  if (tel) ld.telephone = tel;
  if (image) ld.image = image;
  // Şehir her zaman bilinir (İstanbul). İlçeler panelden girilince eklenir.
  ld.areaServed = [{ "@type": "City", name: SEO.city }, ...areas.map((a) => ({ "@type": "AdministrativeArea", name: a }))];
  ld.address = { "@type": "PostalAddress", addressLocality: SEO.city, addressCountry: "TR", ...(c.address ? { streetAddress: c.address } : {}) };
  if (c.hours) ld.openingHours = c.hours;
  if (services.length) {
    ld.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Hizmetler",
      itemListElement: c.services.filter((s) => s.title).map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, ...(s.desc ? { description: s.desc } : {}) },
      })),
    };
  }
  // </script> kapanışı JSON içinde sayfayı bozmasın.
  const ldJson = JSON.stringify(ld).replace(/</g, "\\u003c");

  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<meta name="keywords" content="${esc(keywords)}">`,
    `<link rel="canonical" href="${SITE_URL}/">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="tr_TR">`,
    `<meta property="og:site_name" content="${esc(c.businessName)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${SITE_URL}/">`,
    image ? `<meta property="og:image" content="${esc(image)}">` : "",
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`,
    `<script type="application/ld+json">${ldJson}</script>`,
  ].filter(Boolean).join("\n  ");
}

function buildGallery(c) {
  const cats = CATEGORIES.filter((k) => c.gallery.some((g) => catOf(g) === k));
  if (!cats.length) return { tabs: "", photos: "", hidden: " hidden" };
  const tabs = cats
    .map((k, i) => `<button type="button" role="tab" data-cat="${esc(k)}" class="${i === 0 ? "on" : ""}" aria-selected="${i === 0}">${esc(k)}</button>`)
    .join("");
  const photos = c.gallery
    .filter((g) => catOf(g) === cats[0])
    .map((g) => {
      const alt = g.caption || `${c.businessName} - ${cats[0]}`;
      return `<figure><img src="${esc(g.thumb || g.url)}" loading="lazy" decoding="async" alt="${esc(alt)}">${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ""}</figure>`;
    })
    .join("");
  return { tabs, photos, hidden: "" };
}

/** Şablondaki {{...}} yerlerini içerikle doldurur. İçerik ham gelir, her değer burada kaçışlanır. */
function render(template, content, now = new Date()) {
  const c = { ...defaults, ...content };
  c.services = Array.isArray(c.services) ? c.services : defaults.services;
  c.gallery = Array.isArray(c.gallery) ? c.gallery : [];
  const g = buildGallery(c);
  const year = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" })).getFullYear();
  const wa = "https://wa.me/" + digits(c.whatsapp).replace("+", "");
  const values = {
    head: buildHead(c),
    name: esc(c.businessName),
    tagline: esc(c.tagline),
    about: esc(c.about),
    phone: esc(c.phone),
    tel: esc("tel:" + digits(c.phone)),
    wa: esc(wa),
    hours: esc(c.hours),
    address: esc(c.address),
    hoursHidden: c.hours ? "" : " hidden",
    addressHidden: c.address ? "" : " hidden",
    areas: areaList(c).map((a) => `<span class="chip">${esc(a)}</span>`).join(""),
    areasHidden: areaList(c).length ? "" : " hidden",
    services: c.services
      .map((s, i) => `<article class="card"><div class="ic">${ICONS[i % ICONS.length]}</div><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></article>`)
      .join(""),
    galleryTabs: g.tabs,
    gallery: g.photos,
    galleryHidden: g.hidden,
    year: String(year),
  };
  // head ve gallery HTML'dir (parçaları zaten kaçışlandı), diğerleri metindir ve yukarıda kaçışlandı.
  return template.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in values ? values[k] : m));
}

let templateCache;
const loadTemplate = () => (templateCache ??= fs.readFileSync(path.join(__dirname, "template.html"), "utf8"));

const site = onRequest({ region: "europe-west1", maxInstances: 3 }, async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") return res.status(405).send("Method Not Allowed");
  let content = {};
  try {
    const snap = await admin.firestore().doc("site/content").get();
    if (snap.exists) content = snap.data();
  } catch (e) {
    console.error("içerik okunamadı, varsayılanla devam", e); // sayfa yine de açılsın
  }
  res.set("Content-Type", "text/html; charset=utf-8");
  // CDN 5 dakika saklar. Tarayıcıdaki script zaten canlı içerikle günceller.
  res.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  res.status(200).send(render(loadTemplate(), content));
});

module.exports = { render, buildHead, intlPhone, site };
