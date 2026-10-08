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
