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
