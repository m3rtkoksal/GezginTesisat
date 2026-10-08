import { loadContent } from "./content.js";

const $ = (id) => document.getElementById(id);
const digits = (s) => s.replace(/[^\d+]/g, "");
const ICONS = ["🔍", "🚿", "🔧", "🚰", "🔥", "💧", "🛠️", "🧰"];

const c = await loadContent();

document.title = `${c.businessName} | Tesisat & Tadilat`;
for (const id of ["brand", "footBrand", "heroTitle"]) $(id).textContent = c.businessName;
$("tagline").textContent = c.tagline;
$("aboutText").textContent = c.about;
const show = (id, v) => { $(id).textContent = v; $(id).closest("li").hidden = !v; };
show("hours", c.hours); show("address", c.address);
$("year").textContent = new Date().getFullYear();

const tel = "tel:" + digits(c.phone);
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
$("galleryList").replaceChildren(...c.gallery.map((g) => {
  const i = document.createElement("img");
  i.src = g.url; i.loading = "lazy"; i.alt = c.businessName + " çalışma fotoğrafı";
  i.onclick = () => { box.querySelector("img").src = g.url; box.showModal(); };
  return i;
}));

const nav = $("nav");
const onScroll = () => nav.classList.toggle("solid", scrollY > 24);
addEventListener("scroll", onScroll, { passive: true }); onScroll();

const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: .12 });
document.querySelectorAll(".card,.steps li,.photos img,.contact,.checks li").forEach((el) => { el.classList.add("rv"); io.observe(el); });
