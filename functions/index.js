const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

// Teklif formu -> Ustaya API (functions/quote.js). admin.initializeApp() sonrası yüklenmeli.
exports.quote = require("./quote").quote;

const DAILY_LIMIT = 10; // tüm site için günlük toplam istek sayısı
const MAX_CHARS = 2000;
const MODEL = "claude-haiku-5-5";

const SYSTEM = `Sen Türkiye'deki yerel bir su tesisatçısı web sitesi için çalışan bir metin editörüsün.
Verilen metni anlamını, bilgileri (telefon, fiyat, bölge, hizmet adı) ve tonunu koruyarak, tamamen farklı cümle yapıları ve kelimelerle özgün şekilde yeniden yaz.
Kurallar: Türkçe yaz. Yeni bilgi, rakam veya iddia uydurma. Doğal, güven veren, sade bir dil kullan. Uzunluğu yaklaşık aynı tut.
Metin satır satır "Başlık | Açıklama" biçimindeyse aynı biçimi ve satır sayısını koru, "|" işaretini değiştirme.
Sadece yeniden yazılmış metni döndür, açıklama ekleme.`;

exports.rewrite = onRequest(
  { region: "europe-west1", secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 60, maxInstances: 2 },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "POST gerekli" });

    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ error: "Metin boş." });
    if (text.length > MAX_CHARS) return res.status(400).json({ error: `En fazla ${MAX_CHARS} karakter.` });

    // Günlük sayaç (İstanbul saatine göre). Client bu belgeye erişemez, sadece fonksiyon yazar.
    const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
    const ref = admin.firestore().doc(`usage/${day}`);
    let remaining;
    try {
      remaining = await admin.firestore().runTransaction(async (t) => {
        const n = (await t.get(ref)).data()?.count || 0;
        if (n >= DAILY_LIMIT) return -1;
        t.set(ref, { count: n + 1 });
        return DAILY_LIMIT - n - 1;
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Sayaç hatası." });
    }
    if (remaining < 0) return res.status(429).json({ error: `Günlük ${DAILY_LIMIT} istek hakkı doldu. Yarın tekrar dene.` });

    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY.value(),
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          system: SYSTEM,
          messages: [{ role: "user", content: text }]
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || `API ${r.status}`);
      const out = (data.content || []).map((b) => b.text || "").join("").trim();
      return res.json({ text: out, remaining });
    } catch (e) {
      console.error(e);
      // Başarısız istek hakkı yemesin.
      await ref.set({ count: admin.firestore.FieldValue.increment(-1) }, { merge: true }).catch(() => {});
      return res.status(502).json({ error: "Yeniden yazma başarısız oldu." });
    }
  }
);
