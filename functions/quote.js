// Gezgin sitesindeki "Teklif Al" formu -> Ustaya API'sinde demo müşteri hesabı adına yeni iş (POST /jobs).
// Tüm talepler tek bir müşteri hesabından açılır (DEMO_EMAIL). Şifresi Firebase secret'ında durur.
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("crypto");

const API_BASE = "https://api.mika.technology";
const DEMO_EMAIL = "demo.musteri@ustaya.app";
const USTAYA_DEMO_PASSWORD = defineSecret("USTAYA_DEMO_PASSWORD");

const DAILY_LIMIT = 30; // tüm site, günlük
const PER_IP_LIMIT = 3; // tek kişi (IP), günlük

// Formdaki kategori -> API JobCategory etiketi. MECHANICAL ve FIRE_PROTECTION API'de yayına girene kadar OTHER'a düşer.
const CATEGORIES = {
  PLUMBING: "Su ve doğalgaz tesisatı",
  MECHANICAL: "Mekanik tesisat",
  FIRE_PROTECTION: "Yangın tesisatı",
  BOILER_RADIATOR: "Kombi ve petek",
  PAINTING: "Boya ve badana",
  TILING: "Fayans ve seramik",
  GENERAL_REPAIR: "Genel tadilat ve tamirat",
  IRONWORK: "Demir doğrama ve çit",
  OTHER: "Diğer",
};

const clean = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");

/** Form girdisini doğrular. Hata varsa { error }, yoksa { value } döner. */
function validate(body) {
  const b = body && typeof body === "object" ? body : {};
  const value = {
    name: clean(b.name),
    phone: clean(b.phone),
    category: clean(b.category),
    description: typeof b.description === "string" ? b.description.trim() : "",
    city: clean(b.city),
    district: clean(b.district),
  };
  if (value.name.length < 2 || value.name.length > 60) return { error: "Adınızı yazın." };
  const digits = value.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return { error: "Geçerli bir telefon numarası yazın." };
  if (!Object.prototype.hasOwnProperty.call(CATEGORIES, value.category)) return { error: "İş türünü seçin." };
  if (value.description.length < 10) return { error: "İşi birkaç cümleyle anlatın (en az 10 karakter)." };
  if (value.description.length > 2000) return { error: "Açıklama en fazla 2000 karakter olabilir." };
  if (value.city.length < 2 || value.city.length > 80) return { error: "İl yazın." };
  if (value.district.length < 2 || value.district.length > 80) return { error: "İlçe yazın." };
  return { value };
}

/** Ustaya POST /jobs gövdesi. Telefon ve ad ilana yazılmaz, usta görmesin diye. */
function buildJob(v, category = v.category) {
  const label = CATEGORIES[v.category];
  const flat = v.description.replace(/\s+/g, " ");
  const title = `${label}: ${flat}`.slice(0, 120).trim();
  const note = category === v.category ? "" : `[${label}] `;
  return {
    category,
    title,
    description: `${note}${v.description}\n\n(Gezgin Tesisat sitesinden gönderildi)`.slice(0, 5000),
    city: v.city,
    district: v.district,
  };
}

async function ustayaLogin() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: DEMO_EMAIL, password: USTAYA_DEMO_PASSWORD.value() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.accessToken) {
    throw Object.assign(new Error(`login ${res.status}`), { code: "login" });
  }
  return data.accessToken;
}

async function createJob(token, job) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(job),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

/** Günlük sayaç. Limit aşıldıysa false. */
async function takeSlot(ipHash) {
  const db = admin.firestore();
  const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
  const ref = db.doc(`quoteUsage/${day}`);
  return db.runTransaction(async (t) => {
    const d = (await t.get(ref)).data() || {};
    const total = d.total || 0;
    const mine = (d.ips && d.ips[ipHash]) || 0;
    if (total >= DAILY_LIMIT || mine >= PER_IP_LIMIT) return { ok: false, ref };
    t.set(ref, { total: total + 1, ips: { ...(d.ips || {}), [ipHash]: mine + 1 } }, { merge: true });
    return { ok: true, ref };
  });
}

async function giveSlotBack(ref, ipHash) {
  await admin
    .firestore()
    .runTransaction(async (t) => {
      const d = (await t.get(ref)).data() || {};
      t.set(
        ref,
        { total: Math.max(0, (d.total || 1) - 1), ips: { ...(d.ips || {}), [ipHash]: Math.max(0, ((d.ips || {})[ipHash] || 1) - 1) } },
        { merge: true },
      );
    })
    .catch(() => {});
}

const quote = onRequest(
  { region: "europe-west1", secrets: [USTAYA_DEMO_PASSWORD], timeoutSeconds: 60, maxInstances: 3 },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "POST gerekli" });

    const body = req.body || {};
    if (clean(body.website)) return res.json({ ok: true }); // bal tuzağı: botlar bu alanı doldurur

    const checked = validate(body);
    if (checked.error) return res.status(400).json({ error: checked.error });
    const v = checked.value;

    const ip = String(req.headers["x-forwarded-for"] || req.ip || "").split(",")[0].trim();
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    const slot = await takeSlot(ipHash).catch(() => ({ ok: false }));
    if (!slot.ok) return res.status(429).json({ error: "Çok fazla talep gönderildi. Lütfen daha sonra tekrar deneyin ya da bizi arayın." });

    try {
      const token = await ustayaLogin();
      let { status, data } = await createJob(token, buildJob(v));
      if (status === 400 && /category/i.test(JSON.stringify(data)) && v.category !== "OTHER") {
        ({ status, data } = await createJob(token, buildJob(v, "OTHER"))); // yeni kategori API'de henüz yok
      }
      if (status < 200 || status >= 300) throw Object.assign(new Error(`jobs ${status} ${JSON.stringify(data).slice(0, 300)}`), { code: "jobs" });

      await admin.firestore().collection("leads").add({
        name: v.name,
        phone: v.phone,
        category: v.category,
        description: v.description,
        city: v.city,
        district: v.district,
        ustayaJobId: data.id || data.job?.id || null,
        ipHash,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.json({ ok: true });
    } catch (e) {
      console.error(e);
      await giveSlotBack(slot.ref, ipHash);
      return res.status(502).json({ error: "Talebiniz şu an gönderilemedi. Lütfen bizi arayın ya da biraz sonra tekrar deneyin." });
    }
  },
);

module.exports = { quote, validate, buildJob, CATEGORIES };
