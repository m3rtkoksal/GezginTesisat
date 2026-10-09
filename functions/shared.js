// Sunucu tarafı sayfa üretimi için sitenin ortak verileri. Kök dizindeki defaults.js ve categories.js ile aynı kalmalı
// (site.test.js bunu denetler).
const CATEGORIES = ["Su & Gider", "Mekanik", "Doğalgaz", "Tadilat", "Çit & Demir"];

const defaults = {
  businessName: "Gezgin Tesisat & Tadilat",
  tagline: "Güvenli Tesisat, Modern Yaşam Alanları",
  phone: "0538 604 91 40",
  whatsapp: "905386049140",
  about: "Gezgin Tesisat & Tadilat; su tesisatı, mekanik tesisat, yangın tesisatı ve tadilat işlerinde kaliteli işçilik ve kalıcı çözümler sunar. Konut, iş yeri ve sanayi tesislerinde keşiften teslime kadar yanınızdayız. Usta: Ümit Kurt.",
  areas: "",
  hours: "",
  address: "",
  services: [
    { title: "Su Tesisatı", desc: "Yeni kurulum, yenileme ve arıza onarımı." },
    { title: "Mekanik Tesisat", desc: "Isıtma kolektörü, pompa ve mekanik tesisat işleri." },
    { title: "Yangın Tesisatı", desc: "Yangın tesisatı kurulumu ve bakımı." },
    { title: "Doğalgaz Tesisatı", desc: "Doğalgaz hattı ve gaz tesisatı işleri." },
    { title: "Pompa & Vana", desc: "Pompa grubu, vana değişimi ve bakımı." },
    { title: "Isıtma Tesisatı", desc: "Isıtma kolektörü ve ısıtma hattı işleri." },
    { title: "Tadilat & Boya", desc: "Karo, boya ve genel tadilat işleri." },
    { title: "Pis Su & Gider Hatları", desc: "Kazı, boru döşeme ve gider hattı yenileme." },
    { title: "Demir Doğrama & Çit", desc: "Demir kapı, korkuluk, çit ve tel çit işleri." },
    { title: "Banyo & WC Yenileme", desc: "Islak hacim tesisatı, karo ve montaj işleri." }
  ],
  gallery: []
};

// Arama motorlarına "bu işletme şu adlarla da aranır" demek için (schema.org alternateName). Başlık ve açıklamada da geçer.
// İşletmenin gerçek adı panelden değişir. Bu liste sadece arama adlarıdır, sitede ad olarak gösterilmez.
const SEO = {
  altNames: ["Gezgin Tadilat", "Gezgin Tamirat", "Gezgin Tesisat", "Gezgin Yangın Tesisatı", "Gezgin Mekanik Tesisat"],
  city: "İstanbul",
  topics: ["Yangın tesisatı", "Doğalgaz tesisatı", "Pompa", "Vana", "Isıtma tesisatı", "Mekanik tesisat", "Su tesisatı", "Gider ve pis su hattı", "Banyo ve WC yenileme", "Tadilat", "Tamirat", "Demir doğrama", "Demir çit", "Çit"],
  keywords: "İstanbul tadilat, demir doğrama, çit, demir çit, İstanbul yangın tesisatı, Gezgin Tadilat, Gezgin Tamirat, yangın tesisatı, su tesisatı tamiratı, mekanik tesisat, tadilat",
};

module.exports = { CATEGORIES, defaults, SEO };
