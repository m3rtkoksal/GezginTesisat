import { app } from "../content.js";
import { loadContent, saveContent } from "../content.js";
import { CATEGORIES } from "../categories.js";
import { ADMIN_EMAIL } from "./auth-config.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const $ = (id) => document.getElementById(id);
const loginForm = $("loginForm"), editor = $("editor");

if (!app) {
  loginForm.innerHTML = "<p>Firebase henüz bağlanmadı (firebase-config.js boş).</p>";
  throw new Error("no firebase");
}

const auth = getAuth(app);
auth.languageCode = "tr";
$("adminEmail").textContent = ADMIN_EMAIL;
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

const authError = (e) => ({
  "auth/invalid-credential": "Şifre hatalı. Şifreni unuttuysan aşağıdaki bağlantıya bas.",
  "auth/wrong-password": "Şifre hatalı. Şifreni unuttuysan aşağıdaki bağlantıya bas.",
  "auth/user-not-found": "Hesap henüz hazır değil. 'Şifremi unuttum / İlk şifreyi belirle'ye bas.",
  "auth/too-many-requests": "Çok fazla deneme yapıldı. Biraz bekle ya da şifreni sıfırla.",
  "auth/weak-password": "Şifre çok zayıf. En az 8 karakter kullan.",
  "auth/requires-recent-login": "Güvenlik için çıkış yapıp tekrar giriş yap.",
  "auth/network-request-failed": "Bağlantı hatası. İnternetini kontrol et.",
}[e.code] || "İşlem başarısız: " + (e.code || e.message));

const say = (id, text, kind = "") => { const el = $(id); el.textContent = text; el.className = "msg " + kind; };

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  say("loginMsg", "");
  try { await signInWithEmailAndPassword(auth, ADMIN_EMAIL, $("password").value); $("password").value = ""; }
  catch (err) { say("loginMsg", authError(err), "err"); }
};

// İlk şifre ve "unuttum" aynı akış: hesap yoksa sunucu açar (rastgele şifreyle), sonra yetkili e-postaya bağlantı gider.
$("forgot").onclick = async () => {
  say("loginMsg", "Gönderiliyor...");
  try {
    const r = await fetch("/api/adminSetup", { method: "POST" });
    if (!r.ok) throw Object.assign(new Error((await r.json().catch(() => ({}))).error || "Hesap hazırlanamadı."), { code: "" });
    // "Geri dön" bağlantısı sadece Firebase'in yetkili alan adlarında olur. Bu adres henüz yetkili değilse (ör. yeni alan adı
    // doğrulanmadan) bağlantısız gönderilir, şifre yine de belirlenebilir.
    try { await sendPasswordResetEmail(auth, ADMIN_EMAIL, { url: location.origin + "/admin/" }); }
    catch (e) { if (e.code !== "auth/unauthorized-continue-uri") throw e; await sendPasswordResetEmail(auth, ADMIN_EMAIL); }
    say("loginMsg", `Şifre belirleme bağlantısı ${ADMIN_EMAIL} adresine gönderildi. Gelen kutusuna, gelmezse spam klasörüne bak.`, "ok");
  } catch (err) { say("loginMsg", err.message && !err.code ? err.message : authError(err), "err"); }
};

$("logout").onclick = () => signOut(auth);

$("pwToggle").onclick = () => { $("pwBox").hidden = !$("pwBox").hidden; say("pwMsg", ""); };
$("pwCancel").onclick = () => { $("pwBox").hidden = true; };
$("pwSave").onclick = async () => {
  const cur = $("pwCurrent").value, next = $("pwNext").value, again = $("pwAgain").value;
  if (!cur) return say("pwMsg", "Mevcut şifreni yaz.", "err");
  if (next.length < 8) return say("pwMsg", "Yeni şifre en az 8 karakter olmalı.", "err");
  if (next !== again) return say("pwMsg", "Yeni şifreler aynı değil.", "err");
  try {
    const user = auth.currentUser;
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, cur));
    await updatePassword(user, next);
    for (const id of ["pwCurrent", "pwNext", "pwAgain"]) $(id).value = "";
    say("pwMsg", "Şifren güncellendi ✓", "ok");
  } catch (err) { say("pwMsg", authError(err), "err"); }
};

// Sadece yetkili e-posta ve doğrulanmış hesap panele girer. Gerçek koruma güvenlik kurallarındadır, bu sadece arayüzdür.
async function onUser(user) {
  if (user && (user.email !== ADMIN_EMAIL || !user.emailVerified)) {
    say("loginMsg", "Bu hesap yetkili değil.", "err");
    await signOut(auth);
    return;
  }
  loginForm.hidden = !!user;
  editor.hidden = !user;
  if (!user) return;
  const c = await loadContent();
  for (const k of ["businessName","tagline","phone","whatsapp","hours","address","areas","about"]) editor.elements[k].value = c[k];
  editor.elements.services.value = c.services.map((s) => `${s.title} | ${s.desc}`).join("\n");
  gallery = [...c.gallery];
  renderGallery();
}
onAuthStateChanged(auth, onUser);

// Fotoğrafı en uzun kenarı 1600px olacak şekilde küçültüp JPEG'e çevirir.
async function shrink(file, max = 1600, q = 0.85) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Görsel işlenemedi"))), "image/jpeg", q));
}

$("upload").onchange = async (e) => {
  const files = [...e.target.files];
  e.target.value = "";
  let ok = 0;
  for (const [i, f] of files.entries()) {
    $("saveMsg").textContent = `Yükleniyor ${i + 1}/${files.length}...`;
    try {
      const id = `${Date.now()}-${i}`;
      const meta = { contentType: "image/jpeg", cacheControl: "public, max-age=31536000, immutable" };
      const put = async (path, blob) => { const r = ref(storage, path); await uploadBytes(r, blob, meta); return getDownloadURL(r); };
      const path = `gallery/f${id}.jpg`;
      const [url, thumb] = await Promise.all([
        shrink(f, 1600, 0.82).then((b) => put(path, b)),
        shrink(f, 640, 0.72).then((b) => put(`gallery/t${id}.jpg`, b))
      ]);
      gallery.push({ url, thumb, path, cat: $("uploadCat").value });
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
      const token = await auth.currentUser.getIdToken();
      const r = await fetch("/api/rewrite", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ text: el.value }) });
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
