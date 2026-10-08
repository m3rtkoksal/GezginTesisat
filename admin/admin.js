import { app } from "../content.js";
import { loadContent, saveContent } from "../content.js";
import { CATEGORIES } from "../categories.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const $ = (id) => document.getElementById(id);
const loginForm = $("loginForm"), editor = $("editor");

if (!app) {
  loginForm.innerHTML = "<p>Firebase henüz bağlanmadı (firebase-config.js boş).</p>";
  throw new Error("no firebase");
}

const auth = getAuth(app);
const storage = getStorage(app);
let gallery = [];

for (const k of CATEGORIES) $("uploadCat").add(new Option(k, k));

let activeCat = CATEGORIES[0];
const catOf = (g) => (CATEGORIES.includes(g.cat) ? g.cat : CATEGORIES[0]);

const renderGallery = () => {
  for (const g of gallery) g.cat = catOf(g);
  // Sekmeler: her kategori ve içindeki fotoğraf sayısı
  $("galleryTabs").replaceChildren(...CATEGORIES.map((k) => {
    const n = gallery.filter((g) => g.cat === k).length;
    const b = document.createElement("button");
    b.type = "button"; b.textContent = `${k} (${n})`;
    b.className = "tab" + (k === activeCat ? " on" : "");
    b.onclick = () => { activeCat = k; $("uploadCat").value = k; renderGallery(); };
    return b;
  }));
  $("uploadCat").value = activeCat;
  const list = gallery.filter((g) => g.cat === activeCat);
  $("gallery").replaceChildren(...list.map((g) => {
    const d = document.createElement("div");
    const img = document.createElement("img"); img.src = g.url;
    const b = document.createElement("button"); b.type = "button"; b.textContent = "✕"; b.title = "Sil";
    b.onclick = () => { gallery.splice(gallery.indexOf(g), 1); renderGallery(); };
    const sel = document.createElement("select");
    for (const k of CATEGORIES) sel.add(new Option(k, k));
    sel.value = g.cat;
    sel.title = "Kategoriyi değiştir";
    sel.onchange = () => { g.cat = sel.value; renderGallery(); };
    const cap = document.createElement("input");
    cap.type = "text"; cap.maxLength = 120; cap.placeholder = "Açıklama (isteğe bağlı)";
    cap.value = g.caption || "";
    cap.oninput = () => { g.caption = cap.value; };
    d.append(img, b, sel, cap);
    return d;
  }));
  if (!list.length) {
    const p = document.createElement("p");
    p.className = "hint"; p.textContent = "Bu kategoride fotoğraf yok. Aşağıdan ekleyebilirsin.";
    $("gallery").append(p);
  }
};

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  $("loginMsg").textContent = "";
  try { await signInWithEmailAndPassword(auth, $("email").value, $("password").value); }
  catch { $("loginMsg").textContent = "E-posta veya şifre hatalı."; }
};
$("logout").onclick = () => signOut(auth);

// Geçici: true iken giriş istenmez. Kurallar da (firestore.rules / storage.rules) açık olmalı.
const OPEN_ADMIN = true;

async function onUser(user) {
  loginForm.hidden = !!user;
  editor.hidden = !user;
  if (!user) return;
  const c = await loadContent();
  for (const k of ["businessName","tagline","phone","whatsapp","hours","address","areas","about"]) editor.elements[k].value = c[k];
  editor.elements.services.value = c.services.map((s) => `${s.title} | ${s.desc}`).join("\n");
  gallery = [...c.gallery];
  renderGallery();
}
if (OPEN_ADMIN) { $("logout").hidden = true; onUser(true); }
else onAuthStateChanged(auth, onUser);

// Fotoğrafı en uzun kenarı 1600px olacak şekilde küçültüp JPEG'e çevirir.
async function shrink(file) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Görsel işlenemedi"))), "image/jpeg", 0.85));
}

$("upload").onchange = async (e) => {
  const files = [...e.target.files];
  e.target.value = "";
  let ok = 0;
  for (const [i, f] of files.entries()) {
    $("saveMsg").textContent = `Yükleniyor ${i + 1}/${files.length}...`;
    try {
      const blob = await shrink(f);
      const path = `gallery/${Date.now()}-${i}.jpg`;
      const r = ref(storage, path);
      await uploadBytes(r, blob, { contentType: "image/jpeg" });
      gallery.push({ url: await getDownloadURL(r), path, cat: $("uploadCat").value });
      activeCat = $("uploadCat").value;
      ok++;
    } catch (err) {
      console.error(err);
      $("saveMsg").textContent = `"${f.name}" yüklenemedi: ${err.code || err.message}`;
      renderGallery();
      return;
    }
  }
  renderGallery();
  $("saveMsg").textContent = `${ok} fotoğraf yüklendi. Kaydet'e basmayı unutma.`;
};

editor.onsubmit = async (e) => {
  e.preventDefault();
  const f = editor.elements;
  const data = { gallery };
  for (const k of ["businessName","tagline","phone","whatsapp","hours","address","areas","about"]) data[k] = f[k].value.trim();
  data.services = f.services.value.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [title, ...rest] = l.split("|");
    return { title: title.trim(), desc: rest.join("|").trim() };
  });
  try { await saveContent(data); $("saveMsg").textContent = "Kaydedildi ✓"; }
  catch (err) { $("saveMsg").textContent = "Kaydedilemedi: " + err.message; }
};

// --- AI ile özgünleştir ---
let aiTarget = null;
const aiBox = $("aiBox"), aiText = $("aiText"), aiApply = $("aiApply");
const showAi = (btn, text, canApply, note) => {
  btn.after(aiBox);                       // sonuç, basılan butonun hemen altında açılır
  aiText.textContent = text;
  $("aiNote").textContent = note || "";
  aiApply.hidden = !canApply;
  aiBox.hidden = false;
  aiBox.scrollIntoView({ block: "nearest", behavior: "smooth" });
};
document.querySelectorAll("button.ai").forEach((btn) => {
  btn.onclick = async () => {
    const el = editor.elements[btn.dataset.for];
    if (!el.value.trim()) { aiTarget = null; showAi(btn, "Önce yukarıdaki alana metni yaz.", false); return; }
    btn.disabled = true; const old = btn.textContent; btn.textContent = "Yazılıyor...";
    aiBox.hidden = true;
    try {
      const r = await fetch("/api/rewrite", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: el.value }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Hata");
      aiTarget = el;
      showAi(btn, d.text, true, `Bugün ${d.remaining} istek hakkın kaldı.`);
    } catch (err) { aiTarget = null; showAi(btn, err.message, false); }
    btn.disabled = false; btn.textContent = old;
  };
});
aiApply.onclick = () => { if (aiTarget) aiTarget.value = aiText.textContent; aiBox.hidden = true; $("saveMsg").textContent = "Uygulandı. Kaydet'e basmayı unutma."; };
$("aiCancel").onclick = () => { aiBox.hidden = true; };
