// Yönetim paneli girişi: sadece ADMIN_EMAIL, e-postası doğrulanmış hesap içeriği değiştirebilir.
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto = require("crypto");

const ADMIN_EMAIL = "umitkurt360@gmail.com";
const DAILY_LIMIT = 20; // /api/adminSetup günlük toplam çağrı

/** Çözülmüş ID token yönetici mi? E-posta eşleşmeli ve doğrulanmış olmalı. */
const isAdminToken = (t) => !!t && t.email === ADMIN_EMAIL && t.email_verified === true;

/** İstekteki "Authorization: Bearer <idToken>" başlığını doğrular. Yönetici değilse null. */
async function requireAdmin(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || "");
  if (!m) return null;
  try {
    const t = await admin.auth().verifyIdToken(m[1]);
    return isAdminToken(t) ? t : null;
  } catch {
    return null;
  }
}

/**
 * Yönetici hesabının var olmasını sağlar, şifresini bilen olmasın diye rastgele şifreyle.
 * - Hesap yoksa: e-postası doğrulanmış olarak açılır. Şifreyi sahibi "şifremi unuttum" ile belirler.
 * - Hesap var ve doğrulanmışsa: dokunulmaz.
 * - Hesap var ama doğrulanmamışsa: bunu başkası önceden kaydetmiş olabilir (şifresini o biliyor),
 *   bu yüzden silinip yeniden açılır.
 */
async function ensureAdminUser(auth) {
  const fresh = () =>
    auth.createUser({ email: ADMIN_EMAIL, emailVerified: true, password: crypto.randomBytes(24).toString("base64url") });
  let user;
  try {
    user = await auth.getUserByEmail(ADMIN_EMAIL);
  } catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
    await fresh();
    return "created";
  }
  if (user.emailVerified) return "exists";
  await auth.deleteUser(user.uid);
  await fresh();
  return "recreated";
}

async function takeSlot() {
  const db = admin.firestore();
  const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
  const ref = db.doc(`adminSetupUsage/${day}`);
  return db.runTransaction(async (t) => {
    const n = ((await t.get(ref)).data() || {}).total || 0;
    if (n >= DAILY_LIMIT) return false;
    t.set(ref, { total: n + 1 }, { merge: true });
    return true;
  });
}

const adminSetup = onRequest({ region: "europe-west1", maxInstances: 1 }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST gerekli" });
  if (!(await takeSlot().catch(() => false))) return res.status(429).json({ error: "Çok fazla deneme. Daha sonra tekrar dene." });
  try {
    await ensureAdminUser(admin.auth());
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Hesap hazırlanamadı." });
  }
});

module.exports = { ADMIN_EMAIL, isAdminToken, requireAdmin, ensureAdminUser, adminSetup };
