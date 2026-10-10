import { loadContent } from "./content.js";
import { CATEGORIES } from "./categories.js";

const $ = (id) => document.getElementById(id);
const digits = (s) => s.replace(/[^\d+]/g, "");
const ICONS = ["🔍", "🚿", "🔧", "🚰", "🔥", "💧", "🛠️", "🧰"];

const c = await loadContent();

// Başlık ve H1 sunucuda SEO için üretilir, burada değiştirilmez.
for (const id of ["brand", "footBrand"]) $(id).textContent = c.businessName;
$("tagline").textContent = c.tagline;
$("aboutText").textContent = c.about;
const show = (id, v) => { $(id).textContent = v; $(id).closest("li").hidden = !v; };
show("hours", c.hours); show("address", c.address);
$("year").textContent = new Date().getFullYear();

const d10 = digits(c.phone).replace(/^\+?90/, "").replace(/^0/, "");
const tel = "tel:" + (/^\d{10}$/.test(d10) ? "+90" + d10 : digits(c.phone));
for (const id of ["callTop", "callBtn", "callBtn2", "phoneLink", "callBar"]) $(id).href = tel;
$("phoneLink").textContent = c.phone;
$("phoneTop").textContent = c.phone;
const wa = "https://wa.me/" + digits(c.whatsapp).replace("+", "");
for (const id of ["waBtn", "waBtn2", "waBar"]) $(id).href = wa;

$("areasWrap").hidden = !c.areas.trim();
$("areas").replaceChildren(...c.areas.split(",").map((a) => a.trim()).filter(Boolean).map((a) => {
  const s = document.createElement("span"); s.className = "chip"; s.textContent = a; return s;
}));

$("serviceList").replaceChildren(...c.services.map((s, i) => {
  const d = document.createElement("article");
  d.className = "card";
  const ic = document.createElement("div"); ic.className = "ic"; ic.textContent = ICONS[i % ICONS.length];
  const h = document.createElement("h3"); h.textContent = s.title;
  const p = document.createElement("p"); p.textContent = s.desc;
  d.append(ic, h, p);
  return d;
}));

$("gallery").hidden = !c.gallery.length;
document.querySelectorAll('a[href="#gallery"]').forEach((a) => (a.hidden = !c.gallery.length));
const box = $("lightbox");
box.querySelector("button").onclick = () => box.close();
box.onclick = (e) => { if (e.target === box) box.close(); };
const catOf = (g) => (CATEGORIES.includes(g.cat) ? g.cat : CATEGORIES[0]);
const cats = CATEGORIES.filter((k) => c.gallery.some((g) => catOf(g) === k));
const showCat = (k) => {
  $("galleryTabs").querySelectorAll("button").forEach((b) => {
    const on = b.dataset.cat === k;
    b.classList.toggle("on", on); b.setAttribute("aria-selected", on);
  });
  $("galleryList").replaceChildren(...c.gallery.filter((g) => catOf(g) === k).map((g) => {
    const f = document.createElement("figure");
    const i = document.createElement("img");
    i.src = g.thumb || g.url; i.loading = "lazy"; i.decoding = "async"; i.alt = g.caption || `${c.businessName} - ${k}`;
    i.onclick = () => { box.querySelector("img").src = g.url; $("lbCap").textContent = g.caption || ""; box.showModal(); };
    f.append(i);
    if (g.caption) { const t = document.createElement("figcaption"); t.textContent = g.caption; f.append(t); }
    return f;
  }));
};
$("galleryTabs").replaceChildren(...cats.map((k) => {
  const b = document.createElement("button");
  b.type = "button"; b.role = "tab"; b.dataset.cat = k; b.textContent = k;
  b.onclick = () => showCat(k);
  return b;
}));
if (cats.length) showCat(cats[0]);

const nav = $("nav");
const onScroll = () => nav.classList.toggle("solid", scrollY > 24);
addEventListener("scroll", onScroll, { passive: true }); onScroll();

const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: .12 });
document.querySelectorAll(".card,.steps li,.contact,.checks li").forEach((el) => { el.classList.add("rv"); io.observe(el); });

// --- Teklif formu -> /api/quote (Ustaya API'sinde yeni iş) ---
const qf = $("quoteForm");
if (qf) {
  qf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("quoteMsg"), btn = qf.querySelector("button[type=submit]");
    const body = Object.fromEntries(new FormData(qf));
    msg.className = "qmsg"; msg.textContent = "";
    btn.disabled = true;
    try {
      const r = await fetch("/api/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Talep gönderilemedi.");
      qf.reset();
      qf.elements.city.value = "İstanbul";
      msg.className = "qmsg ok"; msg.textContent = "Talebiniz alındı. En kısa sürede size dönüş yapacağız.";
    } catch (err) {
      msg.className = "qmsg err"; msg.textContent = err.message;
    }
    btn.disabled = false;
  });
}
