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

// SEO içerik paketi (2026-10-10): ayrıntılı hizmet sayfaları. Metinler sadece sitede listelenen hizmetlerden yazıldı;
// fiyat, deneyim yılı, sertifika veya yorum yoktur.
const DETAIL_PAGES = {
  "su-tesisati": {
    "path": "/su-tesisati",
    "nav": "Su Tesisatı",
    "h1": "İstanbul'da Su Tesisatı Kurulum, Yenileme ve Arıza Onarımı",
    "title": "İstanbul Su Tesisatı Kurulum ve Tamiri",
    "desc": "İstanbul'un iki yakasında su tesisatı kurulumu, yenileme ve arıza onarımı. Yerinde keşif, işe başlamadan net fiyat. 0538 604 91 40",
    "metaDesc": "İstanbul'un iki yakasında su tesisatı kurulumu, yenileme ve arıza onarımı. Yerinde keşif, işe başlamadan net fiyat. 0538 604 91 40",
    "lead": "Evde, iş yerinde ya da bir sanayi tesisinde su tesisatı sorunu çoğu zaman beklemeden çözülmesi gereken bir iştir. Gezgin Tesisat & Tadilat olarak yeni su tesisatı kurulumu, eskiyen hatların yenilenmesi ve arıza onarımı işlerini yapıyoruz. Usta Ümit Kurt işi yerinde görür, ne yapılması gerektiğini anlatır ve fiyatı işe başlamadan net olarak söyler.",
    "body": [
      "Yeni yapılan ya da tadilattan geçen bir dairede su hattının baştan döşenmesi, mutfak ve banyoya giden hatların yeniden düzenlenmesi, vana değişimi ve eski boruların sökülüp yenilenmesi en sık yaptığımız işler arasında. Arıza durumunda önce sorunun kaynağını buluyor, sonra yalnızca gereken kısmı açıp onarıyoruz. Böylece gereksiz kırım ve ek masraf olmuyor.",
      "İstanbul'un Avrupa ve Anadolu yakasındaki tüm ilçelere gidiyoruz. Avrupa yakasında Beylikdüzü, Esenyurt, Bakırköy, Başakşehir ve Şişli; Anadolu yakasında Kadıköy, Üsküdar, Ataşehir, Pendik ve Tuzla bunlardan yalnızca birkaçı. Hangi ilçede olursanız olun, telefonla ya da WhatsApp'tan yazmanız yeterli.",
      "Çalışma şeklimiz basit: Önce sorunu anlatıyorsunuz, mümkünse fotoğraf gönderiyorsunuz. Ardından yerinde keşif yapıyor, yapılacak işi ve fiyatı söylüyoruz. Onay verdiğinizde işi planlandığı gibi bitiriyor, çalıştığımız alanı toplayıp temiz şekilde teslim ediyoruz.",
      "Keşiften önce birkaç bilgi işinizi hızlandırır: sorunun ne zamandır sürdüğü, suyun nerede göründüğü, sayaçta bir hareket olup olmadığı ve sorunlu alanın birkaç fotoğrafı. Bu bilgilerle hangi malzemeye ihtiyaç olabileceğini önceden düşünebilir, keşfe hazırlıklı gelebiliriz. Kiracıysanız, tesisatta yapılacak değişiklikleri ev sahibinizle önceden konuşmanız da süreci kolaylaştırır. Apartman ortak hatlarını ilgilendiren işlerde ise yönetimle birlikte planlama yapıyoruz.",
      "Su tesisatının yanında gider hatları, banyo ve WC yenileme, mekanik tesisat ve genel tadilat işlerini de yaptığımız için birden fazla işi tek ustayla halledebilirsiniz. Örneğin banyo yenilenirken su ve gider hatlarını aynı anda elden geçirmek hem zaman hem de iş tekrarı açısından avantaj sağlar."
    ],
    "faq": [
      [
        "Su tesisatı arızası için fiyatı nasıl öğrenebilirim?",
        "Sorunu telefonla ya da WhatsApp'tan anlatıp fotoğraf gönderin. Yerinde keşiften sonra fiyatı işe başlamadan net olarak söylüyoruz."
      ],
      [
        "İstanbul'un hangi ilçelerine geliyorsunuz?",
        "Avrupa ve Anadolu yakasındaki tüm ilçelere geliyoruz; örneğin Bakırköy, Başakşehir, Kadıköy, Ümraniye ve Kartal."
      ],
      [
        "Sadece arızalı kısım mı açılıyor?",
        "Önce sorunun kaynağını tespit ediyor, yalnızca gereken bölümü açıp onarıyoruz."
      ]
    ],
    "items": []
  },
  "pis-su-gider-hatti": {
    "path": "/pis-su-gider-hatti",
    "nav": "Pis Su & Gider",
    "h1": "İstanbul'da Pis Su ve Gider Hattı Yenileme, Kazı ve Boru Döşeme",
    "title": "Pis Su ve Gider Hattı Yenileme İstanbul",
    "desc": "İstanbul'da pis su ve gider hattı yenileme: kazı, boru döşeme ve hat yenileme. Konut, iş yeri ve sanayi. Keşif ve net fiyat: 0538 604 91 40",
    "metaDesc": "İstanbul'da pis su ve gider hattı yenileme: kazı, boru döşeme ve hat yenileme. Konut, iş yeri ve sanayi. Keşif ve net fiyat: 0538 604 91 40",
    "lead": "Eskiyen, çöken ya da sürekli sorun çıkaran bir gider hattı, yalnızca üst üste yapılan küçük onarımlarla düzelmez. Gezgin Tesisat & Tadilat olarak pis su ve gider hatlarında kazı, boru döşeme ve hat yenileme işlerini yapıyoruz. Konutların yanında iş yerlerinde ve sanayi tesislerinde de gider hattı çalışmaları yürütüyoruz.",
    "body": [
      "İşe yerinde keşifle başlıyoruz. Hattın nereden geçtiğini, hangi bölümün yenilenmesi gerektiğini ve kazının nasıl yapılacağını belirliyor, fiyatı işe başlamadan söylüyoruz. Ardından kanalı açıyor, eski boruları söküyor, yeni boruları uygun eğimle döşüyor ve bağlantıları tamamlıyoruz. İş bittiğinde çalışma alanını toplayıp düzenli şekilde teslim ediyoruz.",
      "Çalışmalarımız sayfadaki fotoğraflarda da görülüyor: bahçe ve kaldırım altında açılan kanallara boru döşeme, iş yeri zeminlerinde gider kanalı ve rögar düzenlemesi gibi işler yapıyoruz.",
      "İstanbul'un her iki yakasına hizmet veriyoruz. Avrupa yakasında Küçükçekmece, Avcılar, Bağcılar, Eyüpsultan ve Sarıyer; Anadolu yakasında Ümraniye, Maltepe, Kartal, Sancaktepe ve Beykoz'daki işler için de bize ulaşabilirsiniz.",
      "Gider hattında sorun olduğunu gösteren işaretler genellikle tekrar eden taşmalar, kötü koku, yavaş akan giderler ya da bahçede ve zeminde çökme olarak ortaya çıkar. Bu belirtileri fark ettiğinizde ne zaman başladığını ve hangi noktalarda görüldüğünü not etmeniz, keşifte hattın durumunu daha hızlı anlamamıza yardımcı olur. Kazı gerektiren işlerde, çalışmanın yapılacağı alana erişimi ve varsa bina yönetiminin onayını önceden konuşmak işi uzatmadan bitirmemizi sağlar.",
      "Gider hattı yenilenirken çoğu zaman banyo, mutfak ya da bahçede ek işler de gerekir. Su tesisatı, banyo ve WC yenileme, karo ve genel tadilat işlerini de yaptığımız için kazıdan sonra zemini ve yüzeyleri toparlama işini de aynı ekiple planlayabiliriz. Hattınızla ilgili sorunu anlatmak için arayabilir, WhatsApp'tan fotoğraf gönderebilir ya da teklif formunu doldurabilirsiniz."
    ],
    "faq": [
      [
        "Gider hattının tamamen yenilenmesi gerekip gerekmediğini nasıl anlarız?",
        "Yerinde keşifte hattın durumuna bakıyor, onarım mı yenileme mi gerektiğini ve fiyatı işe başlamadan söylüyoruz."
      ],
      [
        "İş yeri ve sanayi tesislerinde de çalışıyor musunuz?",
        "Evet, konutların yanında iş yeri ve sanayi tesislerinde de gider hattı ve kazı işleri yapıyoruz."
      ],
      [
        "Kazıdan sonra zemini kim topluyor?",
        "Çalışma alanını toplayıp teslim ediyoruz; karo veya tadilat gerekiyorsa aynı ekiple planlayabiliriz."
      ]
    ],
    "items": []
  },
  "yangin-tesisati": {
    "path": "/yangin-tesisati",
    "nav": "Yangın Tesisatı",
    "h1": "İstanbul'da Yangın Tesisatı Kurulumu ve Bakımı",
    "title": "İstanbul Yangın Tesisatı Kurulumu ve Bakımı",
    "desc": "İstanbul'da iş yeri ve sanayi tesisleri için yangın tesisatı kurulumu ve bakımı. Planlama, uygulama, bakım. Keşif: 0538 604 91 40",
    "metaDesc": "İstanbul'da iş yeri ve sanayi tesisleri için yangın tesisatı kurulumu ve bakımı. Planlama, uygulama, bakım. Keşif: 0538 604 91 40",
    "lead": "İş yerleri, depolar ve sanayi tesislerinde yangın tesisatı, binanın güvenliği için en kritik altyapılardan biridir. Gezgin Tesisat & Tadilat olarak İstanbul'da yangın tesisatı kurulumu ve bakımı yapıyoruz. Yangın hattı işlerini planlıyor, uyguluyor ve kurulumdan sonra bakımını üstleniyoruz.",
    "body": [
      "Yeni bir tesiste yangın hattının döşenmesi, mevcut hatta eklenti ya da yenileme ve düzenli bakım işleri için önce yerinde keşif yapıyoruz. Hattın güzergâhını, bağlantı noktalarını ve yapılacak işi birlikte netleştiriyor, fiyatı işe başlamadan söylüyoruz. Yangın tesisatı çoğu zaman pompa grubu, vanalar ve kolektör hatlarıyla birlikte çalıştığı için mekanik tesisat tarafını da aynı ekip olarak ele alabiliyoruz.",
      "Çalışırken işletmenin düzenini mümkün olduğunca az bozmaya dikkat ediyoruz. İşi planlandığı gibi bitiriyor, çalışma alanını toplayıp düzenli şekilde teslim ediyoruz.",
      "İstanbul'un Avrupa ve Anadolu yakasındaki tüm ilçelerde çalışıyoruz. Sanayi ve iş yerlerinin yoğun olduğu Esenyurt, Başakşehir, Bağcılar, Beylikdüzü ve Kağıthane ile Anadolu yakasında Tuzla, Pendik, Ümraniye, Ataşehir ve Sultanbeyli bunlardan bazıları.",
      "Keşifte işimizi kolaylaştıran bilgiler şunlardır: tesisin kullanım amacı, mevcut yangın hattının durumu, varsa proje çizimleri ve hattın geçeceği alanların fotoğrafları. Bu bilgilerle yapılacak işin kapsamını daha net çıkarır, malzeme ve iş planını önceden hazırlarız. Çalışmanın mesai dışında ya da üretimi aksatmayacak saatlerde yapılması gerekiyorsa bunu da baştan konuşur, planlamayı buna göre yaparız. Bakım işlerinde, hattın son bakımının ne zaman yapıldığı bilgisi de faydalı olur.",
      "Tesisinizdeki yangın hattıyla ilgili bir kurulum, yenileme ya da bakım ihtiyacınız varsa telefonla arayabilir, WhatsApp'tan proje veya fotoğraf gönderebilir ya da teklif formunu doldurabilirsiniz. Usta Ümit Kurt işi değerlendirip size dönüş yapar."
    ],
    "faq": [
      [
        "Yangın tesisatında hangi işleri yapıyorsunuz?",
        "Yangın tesisatı kurulumu ve bakımı yapıyoruz; yangın hattı işlerini planlıyor, uyguluyor ve bakımını üstleniyoruz."
      ],
      [
        "Pompa ve vana tarafına da bakıyor musunuz?",
        "Evet, pompa grubu kurulumu ve bakımı, vana değişimi ve kolektör hatları gibi mekanik tesisat işlerini de yapıyoruz."
      ],
      [
        "Fiyatı nasıl belirliyorsunuz?",
        "Yerinde keşiften sonra yapılacak işi netleştirip fiyatı işe başlamadan söylüyoruz."
      ]
    ],
    "items": []
  },
  "dogalgaz-tesisati": {
    "path": "/dogalgaz-tesisati",
    "nav": "Doğalgaz Tesisatı",
    "h1": "İstanbul'da Doğalgaz ve Gaz Tesisatı İşleri",
    "title": "İstanbul Doğalgaz ve Gaz Tesisatı",
    "desc": "İstanbul'da doğalgaz hattı ve gaz tesisatı işleri: mutfak ve iş yeri gaz hatları, bağlantı ve montaj. Keşif ve net fiyat: 0538 604 91 40",
    "metaDesc": "İstanbul'da doğalgaz hattı ve gaz tesisatı işleri: mutfak ve iş yeri gaz hatları, bağlantı ve montaj. Keşif ve net fiyat: 0538 604 91 40",
    "lead": "Gaz tesisatı, özen ve doğru işçilik isteyen bir iştir. Gezgin Tesisat & Tadilat olarak İstanbul'da doğalgaz hattı ve gaz tesisatı işleri yapıyoruz: mutfak ve iş yeri gaz hatları, bağlantılar ve montaj bu işlerin başında geliyor.",
    "body": [
      "Mutfak yenilemesi sırasında gaz hattının yerinin değişmesi, iş yerinde yeni bir cihaz için hat çekilmesi ya da mevcut bağlantıların düzenlenmesi gibi ihtiyaçlarda önce yerinde keşif yapıyoruz. Yapılacak işi açıkça anlatıyor, fiyatı işe başlamadan söylüyoruz. Onayınızdan sonra işi planlandığı gibi tamamlayıp alanı toplayarak teslim ediyoruz.",
      "Gaz tesisatı işleri çoğu zaman başka işlerle aynı anda gündeme gelir. Mutfak ya da banyo tadilatı yaparken su tesisatı, gider hatları, karo ve boya işlerini de yaptığımız için farklı ustaları ayrı ayrı koordine etmek zorunda kalmazsınız. Isıtma tesisatı ve kolektör işleri de hizmetlerimiz arasında.",
      "Hizmet bölgemiz İstanbul'un tamamı. Avrupa yakasında Bahçelievler, Güngören, Fatih, Zeytinburnu ve Gaziosmanpaşa; Anadolu yakasında Kadıköy, Üsküdar, Maltepe, Çekmeköy ve Kartal'daki işler için de bize ulaşabilirsiniz.",
      "Keşif öncesinde hattın bağlanacağı cihazı, mutfak veya iş yerindeki yeni yerleşimi ve mevcut bağlantıların fotoğraflarını paylaşmanız işi hızlandırır. Mutfak yenilemesi yapılıyorsa dolap ve tezgâh yerleşimi kesinleşmeden gaz hattını planlamak, sonradan yapılacak değişiklikleri azaltır. Kiracıysanız ev sahibinizle, apartman ortak alanlarını ilgilendiren işlerde ise bina yönetimiyle önceden görüşmeniz süreci kolaylaştırır. Yapılacak işi ve kapsamını keşifte açıkça konuşuruz.",
      "Gaz hattınızla ilgili yapılacak işi telefonla ya da WhatsApp'tan anlatabilir, fotoğraf gönderebilir veya teklif formunu doldurabilirsiniz. Size dönüş yapıp keşif için uygun zamanı birlikte belirleriz."
    ],
    "faq": [
      [
        "Hangi gaz tesisatı işlerini yapıyorsunuz?",
        "Doğalgaz hattı ve gaz tesisatı işleri yapıyoruz: mutfak ve iş yeri gaz hatları, bağlantı ve montaj."
      ],
      [
        "Mutfak tadilatıyla birlikte gaz hattı da düzenlenebilir mi?",
        "Evet. Su, gider, karo ve boya işlerini de yaptığımız için mutfak işini tek ekiple planlayabiliriz."
      ],
      [
        "Keşif için ne yapmam gerekiyor?",
        "Telefonla ya da WhatsApp'tan ulaşmanız yeterli; uygun zamanı birlikte belirleyip yerinde keşif yapıyoruz."
      ]
    ],
    "items": []
  },
  "mekanik-tesisat-pompa-vana-isitma": {
    "path": "/mekanik-tesisat-pompa-vana-isitma",
    "nav": "Pompa, Vana & Isıtma",
    "h1": "İstanbul'da Mekanik Tesisat: Pompa, Vana ve Isıtma Tesisatı",
    "title": "Mekanik Tesisat: Pompa, Vana, Isıtma Kolektörü | İstanbul",
    "desc": "İstanbul'da mekanik tesisat: pompa grubu kurulum ve bakımı, vana değişimi, ısıtma kolektörü ve ısıtma hatları. Keşif: 0538 604 91 40",
    "metaDesc": "İstanbul'da mekanik tesisat: pompa grubu kurulum ve bakımı, vana değişimi, ısıtma kolektörü ve ısıtma hatları. Keşif: 0538 604 91 40",
    "lead": "Binaların ve teknik odaların düzgün çalışması büyük ölçüde mekanik tesisata bağlıdır. Gezgin Tesisat & Tadilat olarak İstanbul'da pompa grubu kurulumu ve bakımı, vana değişimi, kolektör hatları ve ısıtma tesisatı işleri yapıyoruz.",
    "body": [
      "Teknik odalarda pompa grubunun kurulması ya da bakımı, arızalı veya eskimiş vanaların değiştirilmesi, ısıtma kolektörünün kurulması ve yenilenmesi, ısıtma hatlarının bakımı en sık aldığımız işler. Sayfadaki fotoğraflardan birinde de pompalı bir ısıtma kolektörü ve izoleli hatları görebilirsiniz.",
      "Her işe yerinde keşifle başlıyoruz. Sistemi inceliyor, neyin değişmesi ya da bakıma alınması gerektiğini anlatıyor ve fiyatı işe başlamadan söylüyoruz. İş sırasında binadaki yaşamı ya da işletmenin düzenini mümkün olduğunca az etkilemeye çalışıyor, iş bitince teknik odayı toplu şekilde teslim ediyoruz.",
      "Konutlar, apartmanlar, iş yerleri ve sanayi tesislerinde çalışıyoruz. İstanbul'un iki yakasındaki tüm ilçelere gidiyoruz: Avrupa yakasında Şişli, Beşiktaş, Kağıthane, Esenler ve Büyükçekmece; Anadolu yakasında Ataşehir, Ümraniye, Üsküdar, Sancaktepe ve Pendik bunlardan bazıları.",
      "Pompa ya da ısıtma sisteminde sorun olduğunu gösteren işaretler genellikle düzensiz basınç, bazı dairelerin ya da bölümlerin yeterince ısınmaması, alışılmadık sesler veya vanalarda kaçaktır. Bu belirtileri ve ne zaman başladıklarını not etmeniz, teknik odanın ve cihaz etiketlerinin fotoğraflarını göndermeniz keşfi hızlandırır. Apartmanlarda işin yönetimle birlikte planlanması, ısıtma sezonu öncesinde yapılacak bakımın ise sezon başladıktan sonraki arızalara göre daha az sorunlu olduğunu unutmamak gerekir.",
      "Mekanik tesisatla birlikte su tesisatı, yangın tesisatı ve doğalgaz işlerini de yaptığımız için teknik odanızdaki birbirine bağlı sistemleri tek ekiple ele alabiliriz. İhtiyacınızı telefonla ya da WhatsApp'tan anlatabilir, fotoğraf gönderebilir veya teklif formunu doldurabilirsiniz."
    ],
    "faq": [
      [
        "Mekanik tesisatta hangi işleri yapıyorsunuz?",
        "Pompa grubu kurulumu ve bakımı, vana değişimi, kolektör hatları, ısıtma kolektörü ve ısıtma hattı işleri yapıyoruz."
      ],
      [
        "Apartman teknik odalarında da çalışıyor musunuz?",
        "Evet, konut, apartman, iş yeri ve sanayi tesislerinde mekanik tesisat işleri yapıyoruz."
      ],
      [
        "Fiyat nasıl belirleniyor?",
        "Sistemi yerinde inceledikten sonra yapılacak işi ve fiyatı işe başlamadan söylüyoruz."
      ]
    ],
    "items": []
  },
  "banyo-wc-yenileme": {
    "path": "/banyo-wc-yenileme",
    "nav": "Banyo & WC Yenileme",
    "h1": "İstanbul'da Banyo ve WC Yenileme",
    "title": "İstanbul Banyo ve WC Yenileme, Banyo Tadilatı",
    "desc": "İstanbul'da banyo ve WC yenileme: ıslak hacim tesisatı, karo ve montaj işleri tek ustadan. Yerinde keşif, net fiyat: 0538 604 91 40",
    "metaDesc": "İstanbul'da banyo ve WC yenileme: ıslak hacim tesisatı, karo ve montaj işleri tek ustadan. Yerinde keşif, net fiyat: 0538 604 91 40",
    "lead": "Banyo tadilatı, tesisat ve ince işçiliğin bir arada yürüdüğü bir iştir. Gezgin Tesisat & Tadilat olarak banyo ve WC yenilemede ıslak hacim tesisatı, karo ve montaj işlerini birlikte yapıyoruz. Böylece tesisatçı, karocu ve montajcı arasında koordinasyon derdi yaşamazsınız.",
    "body": [
      "Banyo yenilemenin en önemli kısmı görünmeyen taraftır. Su ve gider hatlarını yeniliyor ya da düzenliyor, ardından karo işlerine ve vitrifiye, batarya gibi parçaların montajına geçiyoruz. Tesisat ve kaplama aynı ekipten çıktığı için sonradan ortaya çıkan uyumsuzluklar ve iş tekrarı azalır.",
      "İşe yerinde keşifle başlıyoruz. Banyonun mevcut durumuna bakıyor, ne yapılacağını konuşuyor ve fiyatı işe başlamadan net olarak söylüyoruz. Çalışma sırasında evin geri kalanını korumaya özen gösteriyor, iş bitince ortamı toplayarak teslim ediyoruz.",
      "İstanbul'un Avrupa ve Anadolu yakasındaki tüm ilçelerde banyo ve WC yenileme yapıyoruz. Avrupa yakasında Bakırköy, Beylikdüzü, Esenyurt, Fatih ve Sarıyer; Anadolu yakasında Kadıköy, Ataşehir, Maltepe, Kartal ve Çekmeköy bunlardan yalnızca birkaçı.",
      "Banyo yenilemeye başlamadan önce nasıl bir kullanım istediğinizi düşünmeniz işi kolaylaştırır: duş mu küvet mi, lavabo ve klozetin yeri değişecek mi, depolama alanı gerekiyor mu? Beğendiğiniz karo ve ürünlerin fotoğraflarını keşifte paylaşırsanız, tesisatı bu yerleşime göre planlayabiliriz. Apartmanlarda gürültülü işler ve moloz taşıma için bina kurallarını önceden öğrenmek de süreci rahatlatır. İş bitene kadar hangi aşamada ne yapılacağını baştan konuşuruz.",
      "Banyonun yanında mutfak ve diğer odalarda karo, boya ve genel tadilat işlerini de yapıyoruz. Banyonuzun fotoğrafını WhatsApp'tan gönderebilir, telefonla arayabilir ya da teklif formunu doldurabilirsiniz; keşif için size dönüş yapalım."
    ],
    "faq": [
      [
        "Banyo yenilemede tesisatı da yeniliyor musunuz?",
        "Evet. Islak hacim tesisatı, karo ve montaj işlerini birlikte yapıyoruz."
      ],
      [
        "Banyo tadilatının fiyatını nasıl öğrenebilirim?",
        "Yerinde keşiften sonra yapılacak işi konuşup fiyatı işe başlamadan net olarak söylüyoruz."
      ],
      [
        "Sadece WC yenileme de yapıyor musunuz?",
        "Evet, banyo ile birlikte ya da ayrı olarak WC yenileme işleri de yapıyoruz."
      ]
    ],
    "items": []
  },
  "boya-karo-tadilat": {
    "path": "/boya-karo-tadilat",
    "nav": "Boya & Karo",
    "h1": "İstanbul'da Boya, Karo ve Genel Tadilat İşleri",
    "title": "İstanbul Boya, Karo ve Genel Tadilat",
    "desc": "İstanbul'da boya, karo ve genel tadilat-tamirat işleri. Tesisat ve tadilat tek elden. Yerinde keşif, işe başlamadan net fiyat: 0538 604 91 40",
    "metaDesc": "İstanbul'da boya, karo ve genel tadilat-tamirat işleri. Tesisat ve tadilat tek elden. Yerinde keşif, işe başlamadan net fiyat: 0538 604 91 40",
    "lead": "Evinizde ya da iş yerinizde yapılacak boya, karo ve genel tadilat işlerini tesisatla birlikte tek elden halletmek hem zaman hem de iş tekrarı açısından kolaylık sağlar. Gezgin Tadilat olarak karo, boya ve genel tadilat işlerini; tesisat tamiratı gibi tamirat işleriyle bir arada yürütüyoruz.",
    "body": [
      "Duvar ve tavan boyası, karo döşeme ve yenileme, tesisat işinden sonra kırılan yüzeylerin toparlanması ve küçük tamiratlar sık yaptığımız işler arasında. Özellikle tesisat ya da gider hattı çalışması yapılan yerlerde, açılan duvarı veya zemini kapatıp karo ve boyayı tamamlamak işi tek seferde bitirmenizi sağlar.",
      "Her işe yerinde keşifle başlıyoruz. Yapılacak işi birlikte netleştiriyor, fiyatı işe başlamadan söylüyoruz. Çalışma sırasında eşyaların ve çevrenin korunmasına dikkat ediyor, iş bitince ortamı toplayıp temiz şekilde teslim ediyoruz.",
      "İstanbul'un tamamına hizmet veriyoruz. Avrupa yakasında Başakşehir, Küçükçekmece, Bahçelievler, Beyoğlu ve Arnavutköy; Anadolu yakasında Üsküdar, Ümraniye, Pendik, Tuzla ve Beykoz'daki tadilat işleriniz için de bize ulaşabilirsiniz.",
      "Keşif öncesinde yapılacak alanların ölçülerini biliyorsanız ya da fotoğraflarını gönderirseniz işin kapsamını daha hızlı çıkarabiliriz. Boya işlerinde renk ve ürün tercihinizi, karo işlerinde beğendiğiniz karonun modelini önceden belirlemeniz planlamayı kolaylaştırır. Eşyalı bir evde çalışılacaksa hangi odaların sırayla boşaltılacağını birlikte planlıyor, eşyaları örtüp koruyoruz. Apartmanlarda gürültülü işler için bina kurallarını öğrenmek de süreci rahatlatır.",
      "Banyo ve WC yenileme, su ve gider tesisatı, demir doğrama gibi işleri de yaptığımız için bir dairenin ya da iş yerinin birden fazla ihtiyacını aynı ekiple planlayabilirsiniz. Yaptırmak istediğiniz işi telefonla ya da WhatsApp'tan anlatabilir, fotoğraf gönderebilir veya teklif formunu doldurabilirsiniz."
    ],
    "faq": [
      [
        "Hangi tadilat işlerini yapıyorsunuz?",
        "Karo, boya ve genel tadilat işlerini; tesisat tamiratı gibi tamirat işleriyle birlikte yapıyoruz."
      ],
      [
        "Tesisat çalışmasından sonra duvar ve zemini de topluyor musunuz?",
        "Evet, açılan yüzeyleri kapatıp karo ve boya işlerini tamamlayabiliyoruz."
      ],
      [
        "Fiyat ne zaman belli oluyor?",
        "Yerinde keşiften sonra, işe başlamadan fiyatı net olarak söylüyoruz."
      ]
    ],
    "items": []
  },
  "demir-dograma-cit": {
    "path": "/demir-dograma-cit",
    "nav": "Demir Doğrama & Çit",
    "h1": "İstanbul'da Demir Doğrama, Demir Çit ve Tel Çit",
    "title": "İstanbul Demir Doğrama, Demir Çit ve Korkuluk",
    "desc": "İstanbul'da demir kapı, korkuluk, demir çit ve tel çit işleri: ölçü, imalat ve montaj. Yerinde keşif, net fiyat: 0538 604 91 40",
    "metaDesc": "İstanbul'da demir kapı, korkuluk, demir çit ve tel çit işleri: ölçü, imalat ve montaj. Yerinde keşif, net fiyat: 0538 604 91 40",
    "lead": "Bahçe, site, iş yeri ya da tesis çevresinde güvenlik ve düzen için demir işleri sık ihtiyaç duyulan işlerdendir. Gezgin Tesisat & Tadilat olarak demir kapı, korkuluk, demir çit ve tel çit işleri yapıyoruz. İşin ölçüsünü yerinde alıyor, imalatını yapıyor ve montajını tamamlıyoruz.",
    "body": [
      "Bahçe kapısı, merdiven ve balkon korkulukları, arsa ya da tesis çevresine demir çit veya tel çit en sık aldığımız işler arasında. Keşifte alanı ölçüyor, ihtiyacınızı konuşuyor ve fiyatı işe başlamadan net olarak söylüyoruz. Onayınızdan sonra imalatı yapıp montajı planlandığı gibi tamamlıyor, çalışma alanını toplayarak teslim ediyoruz.",
      "Demir işlerinin yanında tesisat ve tadilat da yaptığımız için, örneğin bahçede gider hattı yenilerken çit veya kapı işini de aynı ekiple planlayabilirsiniz. Böylece farklı ustalarla ayrı ayrı uğraşmanız gerekmez.",
      "İstanbul'un Avrupa ve Anadolu yakasındaki tüm ilçelere gidiyoruz. Bahçeli evlerin ve arsaların yoğun olduğu Silivri, Çatalca, Büyükçekmece, Arnavutköy ve Sultangazi ile Anadolu yakasında Şile, Beykoz, Çekmeköy, Sancaktepe ve Tuzla bunlardan bazıları.",
      "Keşfi hızlandırmak için çit veya korkuluk yapılacak alanın yaklaşık uzunluğunu, zeminin durumunu ve alanın fotoğraflarını paylaşabilirsiniz. Kapı işlerinde açılış yönü, genişlik ve araç geçişi olup olmayacağı gibi bilgiler de önemlidir. Beğendiğiniz bir model varsa fotoğrafını göstermeniz, imalatı ihtiyacınıza uygun yapmamızı kolaylaştırır. Site ve apartmanlarda ortak alanlara yapılacak işler için yönetimle önceden görüşmeniz süreci hızlandırır.",
      "Yaptırmak istediğiniz demir kapı, korkuluk ya da çit işini telefonla veya WhatsApp'tan anlatabilir, alanın fotoğrafını gönderebilir ya da teklif formunu doldurabilirsiniz. Ölçü ve keşif için size dönüş yapalım."
    ],
    "faq": [
      [
        "Hangi demir işlerini yapıyorsunuz?",
        "Demir kapı, korkuluk, demir çit ve tel çit işleri yapıyoruz: ölçü, imalat ve montaj."
      ],
      [
        "Ölçüyü kim alıyor?",
        "Ölçüyü yerinde biz alıyor, imalat ve montajı da biz yapıyoruz."
      ],
      [
        "Fiyatı nasıl öğrenebilirim?",
        "Alanı yerinde ölçüp konuştuktan sonra fiyatı işe başlamadan net olarak söylüyoruz."
      ]
    ],
    "items": []
  }
};
Object.assign(PAGES, DETAIL_PAGES);

// İstanbul'un 39 ilçesi (hizmet bölgesi: İstanbul'un tamamı). Schema.org areaServed ve ana sayfadaki liste için.
const DISTRICTS = { avrupa: ["Arnavutköy", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kağıthane", "Küçükçekmece", "Sarıyer", "Silivri", "Sultangazi", "Şişli", "Zeytinburnu"], anadolu: ["Adalar", "Ataşehir", "Beykoz", "Çekmeköy", "Kadıköy", "Kartal", "Maltepe", "Pendik", "Sancaktepe", "Sultanbeyli", "Şile", "Tuzla", "Ümraniye", "Üsküdar"] };

// Ana sayfa SEO metinleri.
const HOME = {
  title: "İstanbul Tesisat ve Tadilat Ustası",
  desc: "İstanbul'un iki yakasında su, gider, yangın ve doğalgaz tesisatı, banyo-WC yenileme, boya ve demir çit. Keşif ve net fiyat: 0538 604 91 40",
  h1: "İstanbul'da Tesisat ve Tadilat: Avrupa ve Anadolu Yakası",
  intro: "Gezgin Tesisat & Tadilat; su ve gider tesisatı, yangın tesisatı, doğalgaz, mekanik tesisat, banyo-WC yenileme, boya-karo ve demir çit işlerini tek elden yapar. Usta Ümit Kurt, konut, iş yeri ve sanayi tesislerinde İstanbul'un Avrupa ve Anadolu yakasındaki tüm ilçelere gelir; yerinde keşif yapar ve fiyatı işe başlamadan net olarak söyler.",
  // Ustanın adresi (ofis yok). Sokak/no bilinmiyor, uydurulmaz.
  address: { addressLocality: "Çayırova", addressRegion: "Kocaeli", addressCountry: "TR" },
  founder: "Ümit Kurt",
};

module.exports = { CATEGORIES, defaults, SEO, PAGES, DISTRICTS, HOME };
