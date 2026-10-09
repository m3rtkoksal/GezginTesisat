# Gezgin Tesisat & Tadilat

Statik web sitesi + Firebase (Hosting, Firestore, Storage, Functions).

- `index.html`, `style.css`, `app.js`: herkese açık site
- `admin/`: içerik ve fotoğraf düzenleme paneli (`/admin`)
- `functions/`: ✨ Özgünleştir (Claude ile metin yeniden yazma), günlük 10 istek sınırı
- `defaults.js`: Firestore boşken kullanılan varsayılan içerik
- `firestore.rules`, `storage.rules`: güvenlik kuralları

## Yayına alma

```bash
npx firebase-tools deploy --project su-tesisat-site-mk
```

`ANTHROPIC_API_KEY` Firebase secret olarak saklanır, repoda yoktur:

```bash
npx firebase-tools functions:secrets:set ANTHROPIC_API_KEY --project su-tesisat-site-mk
```

> Not: Panel şu an girişsizdir (`OPEN_ADMIN = true` in `admin/admin.js`, kurallar açık).
> Gerçek kullanıma geçmeden önce girişi geri açın.

## Ustaya hesabını değiştirme (teklif formu)

Sitedeki "Teklif Al" formu, talepleri Ustaya API'sinde tek bir **müşteri** hesabı adına açar. Şimdilik demo hesap.
Başka bir hesaba geçmek için:

1. `functions/.env` içindeki `USTAYA_ACCOUNT_EMAIL` değerini yeni hesabın e-postasıyla değiştirin.
2. O hesabın şifresini secret olarak kaydedin (şifre repoya ve sohbete yazılmaz):

```bash
npx firebase-tools functions:secrets:set USTAYA_DEMO_PASSWORD --project su-tesisat-site-mk
```

3. Yayına alın: `npx firebase-tools deploy --only functions --project su-tesisat-site-mk`

Hesap **müşteri** rolünde olmalıdır. `POST /jobs` ustalar tarafından çağrılamaz.
Talebin sadece belirli bir ustaya gitmesi için API'de ustayı seçen bir alan gerekir, henüz yoktur.

## Yönetim paneli girişi

`/admin` sadece **umitkurt360@gmail.com** hesabına açıktır, hesabın e-postası **doğrulanmış** olmalıdır.
Aynı kural üç yerde zorlanır, değiştirirken üçünü de güncelleyin:

- `firestore.rules` ve `storage.rules`: yazma izni sadece bu e-postaya (asıl koruma bu)
- `functions/admin.js`: AI editörü (`/api/rewrite`) ve `adminSetup`
- `admin/auth-config.js`: sadece arayüz

**İlk şifre / unuttum:** panelde "Şifremi unuttum / İlk şifreyi belirle". `adminSetup` hesabı yoksa açar (rastgele şifreyle,
e-posta doğrulanmış), sonra Firebase yetkili e-postaya şifre belirleme bağlantısı gönderir. Şifreyi sadece e-postanın sahibi belirler.
Girişten sonra panelde "Şifreyi değiştir" vardır.

Yetkili e-postayı değiştirmek için: iki kural dosyası, `functions/admin.js` ve `admin/auth-config.js` içindeki adresi güncelleyip
`firebase deploy --only functions,hosting,firestore:rules,storage` çalıştırın.

**Testler:** `cd functions && npm test` (sunucu mantığı) ve repo kökünde
`npx firebase-tools emulators:exec --only firestore,storage --project demo-gezgin "npm test --prefix rules-tests"` (güvenlik kuralları, emülatör gerekir).
