// Ana sayfayı sunucuda içerikle birlikte üretir. Arama motorları ve sosyal medya önizlemeleri boş bir kabuk yerine
// gerçek metni, telefonu ve yapılandırılmış veriyi (schema.org) görür. Sayfadaki script yine canlı içerikle günceller.
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const { CATEGORIES, defaults, SEO, PAGES, DISTRICTS, HOME } = require("./shared");

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

const telHref = (p) => "tel:" + (intlPhone(p) || digits(p));
const is24 = (h) => /24\s*saat|7\s*\/\s*24/i.test(String(h || ""));

function buildHead(c) {
  const services = c.services.map((s) => s.title).filter(Boolean);
  const title = clip(`${HOME.title} | ${c.businessName}`, 72);
  const description = clip(HOME.desc, 158);
  const image = (c.gallery[0] && (c.gallery[0].url || c.gallery[0].thumb)) || "";

  const ld = {
    "@context": "https://schema.org",
    "@type": ["Plumber", "HomeAndConstructionBusiness"],
    "@id": SITE_URL + "/#isletme",
    name: c.businessName,
    alternateName: SEO.altNames,
    knowsAbout: SEO.topics,
    url: SITE_URL + "/",
    description: clip(c.about || description, 300),
  };
  const tel = intlPhone(c.phone);
  if (tel) ld.telephone = tel;
  if (image) ld.image = image;
  // Hizmet bölgesi İstanbul'un tamamı: şehir + 39 ilçe.
  ld.areaServed = [
    { "@type": "City", name: SEO.city },
    ...[...DISTRICTS.avrupa, ...DISTRICTS.anadolu].map((d) => ({ "@type": "AdministrativeArea", name: `${d}, ${SEO.city}` })),
  ];
  // Ustanın adresi Çayırova/Kocaeli. Panelde açık adres girilirse sokak olarak eklenir.
  ld.address = { "@type": "PostalAddress", ...(c.address ? { streetAddress: c.address } : {}), ...HOME.address };
  if (is24(c.hours)) {
    ld.openingHoursSpecification = [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    }];
  }
  if (HOME.founder) ld.founder = { "@type": "Person", name: HOME.founder };
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
    tel: esc(telHref(c.phone)),
    wa: esc(wa),
    h1: esc(HOME.h1),
    intro: esc(HOME.intro),
    districtsAvrupa: esc(DISTRICTS.avrupa.join(", ")),
    districtsAnadolu: esc(DISTRICTS.anadolu.join(", ")),
    serviceLinks: Object.keys(PAGES).map((k) => `<a href="${PAGES[k].path}" class="btn ghost">${esc(PAGES[k].nav)}</a>`).join(""),
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

/** Hizmet sayfası: sabit metin (shared.js PAGES) + panelden gelen telefon ve işletme adı. */
function renderPage(template, key, content, now = new Date()) {
  const pg = PAGES[key];
  if (!pg) return null;
  const c = { ...defaults, ...content };
  const wa = "https://wa.me/" + digits(c.whatsapp).replace("+", "");
  const url = SITE_URL + pg.path;
  const title = `${pg.title} | ${c.businessName}`;
  const tel = intlPhone(c.phone);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: pg.h1,
      serviceType: pg.nav,
      description: pg.desc,
      areaServed: [{ "@type": "City", name: SEO.city }, { "@type": "AdministrativeArea", name: "Avrupa Yakası" }, { "@type": "AdministrativeArea", name: "Anadolu Yakası" }],
      provider: { "@type": "Plumber", "@id": SITE_URL + "/#isletme", name: c.businessName, alternateName: SEO.altNames, url: SITE_URL + "/", ...(tel ? { telephone: tel } : {}) },
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: pg.nav, item: url },
      ],
    },
  ];
  if (pg.faq && pg.faq.length) {
    ld.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: pg.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    });
  }
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(clip(pg.metaDesc || pg.desc + (c.phone ? ` Ara: ${c.phone}` : ""), 158))}">`,
    ...(pg.keywords ? [`<meta name="keywords" content="${esc(pg.keywords)}">`] : []),
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="tr_TR">`,
    `<meta property="og:site_name" content="${esc(c.businessName)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(pg.desc)}">`,
    `<meta property="og:url" content="${url}">`,
    ...ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`),
  ].join("\n  ");
  const year = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" })).getFullYear();
  const link = (k, cls = "") => `<a href="${PAGES[k].path}"${cls}>${esc(PAGES[k].nav)}</a>`;
  const values = {
    head,
    h1: esc(pg.h1),
    lead: esc(pg.lead),
    crumb: esc(pg.nav),
    name: esc(c.businessName),
    phone: esc(c.phone),
    tel: esc(telHref(c.phone)),
    wa: esc(wa),
    year: String(year),
    body: (pg.body || []).map((p) => `<p>${esc(p)}</p>`).join(""),
    bodyHidden: pg.body && pg.body.length ? "" : " hidden",
    itemsHidden: pg.items && pg.items.length ? "" : " hidden",
    faq: (pg.faq || []).map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join(""),
    faqHidden: pg.faq && pg.faq.length ? "" : " hidden",
    navLinks: Object.keys(PAGES).filter((k) => !PAGES[k].body).map((k) => link(k)).join(""),
    items: pg.items.map(([t, d]) => `<article><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join(""),
    others: Object.keys(PAGES).filter((k) => k !== key).map((k) => link(k, ' class="btn ghost"')).join(""),
  };
  return template.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in values ? values[k] : m));
}

let templateCache;
const loadTemplate = () => (templateCache ??= fs.readFileSync(path.join(__dirname, "template.html"), "utf8"));
let pageCache;
const loadPage = () => (pageCache ??= fs.readFileSync(path.join(__dirname, "page.html"), "utf8"));
const pageKeyOf = (p) => Object.keys(PAGES).find((k) => PAGES[k].path === String(p || "/").replace(/\/+$/, ""));

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
  const key = pageKeyOf(req.path);
  res.status(200).send(key ? renderPage(loadPage(), key, content) : render(loadTemplate(), content));
});

module.exports = { render, renderPage, buildHead, intlPhone, site };
