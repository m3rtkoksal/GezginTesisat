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


// Hizmet sayfaları. Metinler sitedeki mevcut hizmet adlarından ve işletmenin verdiği başlıklardan türetildi,
// burada olmayan bir iş, rakam veya garanti iddiası eklenmez. İlçe bilgisi gelince `areas` panelden dolar.
const PAGES = {
  tesisat: {
    path: "/tesisat",
    nav: "Tesisat",
    h1: "İstanbul Su Tesisatı ve Gider Hatları",
    title: "Su Tesisatı ve Gider Hatları İstanbul",
    desc: "İstanbul su tesisatı, pis su ve gider hattı, banyo ve WC yenileme işleri. Kurulum, yenileme ve arıza onarımı.",
    lead: "Su tesisatı ve gider hatlarında yeni kurulum, yenileme ve arıza onarımı yapıyoruz.",
    items: [
      ["Su tesisatı", "Yeni kurulum, yenileme ve arıza onarımı."],
      ["Pis su ve gider hatları", "Kazı, boru döşeme ve gider hattı yenileme."],
      ["Banyo ve WC yenileme", "Islak hacim tesisatı, karo ve montaj işleri."],
    ],
    keywords: "İstanbul su tesisatı, gider hattı, pis su hattı, banyo yenileme, WC yenileme, tesisat tamiratı",
  },
  mekanik: {
    path: "/mekanik",
    nav: "Mekanik",
    h1: "İstanbul Mekanik Tesisat: Isıtma, Pompa ve Vana",
    title: "Mekanik Tesisat, Isıtma, Pompa ve Vana İstanbul",
    desc: "İstanbul mekanik tesisat, ısıtma kolektörü ve hattı, pompa grubu, vana değişimi ve bakımı.",
    lead: "Isıtma, pompa ve vana işleri dahil mekanik tesisat işlerini yapıyoruz.",
    items: [
      ["Mekanik tesisat", "Isıtma kolektörü, pompa ve mekanik tesisat işleri."],
      ["Pompa ve vana", "Pompa grubu, vana değişimi ve bakımı."],
      ["Isıtma tesisatı", "Isıtma kolektörü ve ısıtma hattı işleri."],
    ],
    keywords: "İstanbul mekanik tesisat, ısıtma tesisatı, ısıtma kolektörü, pompa, vana değişimi, pompa grubu",
  },
  "yangin-gaz": {
    path: "/yangin-gaz",
    nav: "Yangın & Gaz",
    h1: "İstanbul Yangın Tesisatı ve Doğalgaz Tesisatı",
    title: "Yangın Tesisatı ve Doğalgaz Tesisatı İstanbul",
    desc: "İstanbul yangın tesisatı kurulumu ve bakımı, doğalgaz hattı ve gaz tesisatı işleri.",
    lead: "Yangın tesisatı kurulumu ve bakımı ile doğalgaz hattı ve gaz tesisatı işlerini yapıyoruz.",
    items: [
      ["Yangın tesisatı", "Yangın tesisatı kurulumu ve bakımı."],
      ["Doğalgaz tesisatı", "Doğalgaz hattı ve gaz tesisatı işleri."],
    ],
    keywords: "İstanbul yangın tesisatı, yangın tesisatı kurulumu, doğalgaz tesisatı, gaz tesisatı, gaz hattı",
  },
  tadilat: {
    path: "/tadilat",
    nav: "Tadilat",
    h1: "İstanbul Tadilat ve Tamirat: Boya, Karo, Mala",
    title: "Tadilat, Boya, Karo, Demir Doğrama İstanbul",
    desc: "İstanbul tadilat ve tamirat: boya, karo, mala, genel tadilat, demir doğrama, demir çit ve tel çit işleri.",
    lead: "Boya, karo ve mala işleri ile genel tadilat, tamirat, demir doğrama ve çit işlerini yapıyoruz.",
    items: [
      ["Tadilat ve boya", "Karo, boya ve genel tadilat işleri."],
      ["Demir doğrama ve çit", "Demir kapı, korkuluk, çit ve tel çit işleri."],
    ],
    keywords: "İstanbul tadilat, tamirat, boya, karo, mala, demir doğrama, demir çit, tel çit",
  },
};

module.exports = { CATEGORIES, defaults, SEO, PAGES };
