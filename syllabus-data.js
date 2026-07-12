// ==========================================================================
// TO'LIQ ISH REJA MA'LUMOTLAR BAZASI (asl PDF fayllardan olingan)
// Admin panel shu ro'yxatdan "hozirgi dars"ni tanlaydi,
// o'quvchi paneli esa shu matnni ko'rsatadi — qayta yozish shart emas.
// ==========================================================================

export const SYLLABUS = {
  5: [
    { chorak: "I chorak", mavzu: "Raqamli dunyoga kirish", darslar: [
      "Kirish. Kelajak texnologiyalari nima? Nega o'rganamiz?",
      "Internet tarixi va ishlash tamoyillari. DNS, IP, protokollar",
      "Dasturlash nima? Algoritmlar va sxemalar",
      "Scratch yoki Python: birinchi dastur — \"Salom, dunyo!\"",
      "O'zgaruvchilar, shartlar va tsikllar (Python asoslari)",
      "Mini-loyiha: Kalkulyator dasturi yaratish",
      "Raqamli xavfsizlik: parol, fishing, shaxsiy ma'lumotlar",
      "I chorak nazorat ishi va muhokama"
    ]},
    { chorak: "II chorak", mavzu: "Dasturlash va ma'lumotlar", darslar: [
      "Funksiyalar va modullar. Kodni qayta ishlatish",
      "Ro'yxatlar (list) va lug'atlar (dict) bilan ishlash",
      "Fayllar bilan ishlash. Ma'lumotlarni saqlash",
      "Ma'lumotlar turlari: jadval, grafik, diagramma",
      "Veb-sahifaning anatomiyasi: HTML va CSS asoslari",
      "Birinchi veb-sahifani yaratish",
      "Mini-loyiha: Shaxsiy portfolio sahifasi",
      "II chorak nazorat ishi va muhokama"
    ]},
    { chorak: "III chorak", mavzu: "Sun'iy intellekt va zamonaviy texnologiyalar", darslar: [
      "Sun'iy intellekt nima? Tarix va bugungi holat",
      "Mashina o'qishi: qanday ishlaydi? (tasvirlar, nutq, matn)",
      "ChatGPT va boshqa AI vositalar bilan ishlash",
      "AI yordamida ijodiy loyihalar: rasm, musiqa, matn",
      "Robotlar va avtomatlashtirish. IoT (narsalar interneti)",
      "Katta ma'lumotlar (Big Data) va bulut texnologiyalar",
      "Mini-loyiha: AI vositasi yordamida muammo yechish",
      "III chorak nazorat ishi va muhokama"
    ]},
    { chorak: "IV chorak", mavzu: "Kelajak kasblari va yakuniy loyiha", darslar: [
      "Kelajak kasblari: qaysi mutaxassisliklar talab yuqori bo'ladi?",
      "Kiberjinoyatlar va etika. Texnologiyadan mas'uliyat bilan foydalanish",
      "Startap nima? Texnologik g'oyadan mahsulotgacha",
      "Portfolio va CV: texnologiya yo'nalishida o'qishga tayyorgarlik",
      "Yakuniy loyiha ustida ishlash – I bosqich",
      "Yakuniy loyiha ustida ishlash – II bosqich",
      "Yakuniy loyihalarni taqdimot qilish",
      "IV chorak (yakuniy) nazorat ishi. Yil xulosasi va sertifikat"
    ]}
  ],
  6: [
    { chorak: "I chorak", mavzu: "Python — o'rta daraja", darslar: [
      "Kirish. 5-sinf bilimlarini takrorlash. Yangi yil maqsadlari",
      "Stringlar bilan ishlash: split, join, replace, upper, lower",
      "Xatolarni ushlash: try-except bloklari va debugging",
      "Funksiyalar: *args, **kwargs, default parametrlar",
      "Lambda funksiyalar va map/filter/sorted",
      "Modul va paketlar: math, random, datetime",
      "Mini-loyiha: tasodifiy viktorina dasturi (random bilan)",
      "I chorak nazorat ishi va muhokama"
    ]},
    { chorak: "II chorak", mavzu: "Obyektga yo'naltirilgan dasturlash (OOP)", darslar: [
      "OOP nima? Real dunyo modeli. Klass va obyekt tushunchasi",
      "Klass yaratish: __init__, self, atributlar",
      "Metodlar: oddiy va maxsus metodlar (__str__, __len__)",
      "Vorislik (inheritance): ota va bola klasslar",
      "Inkapsulyatsiya: xususiy atributlar va getter/setter",
      "Amaliy OOP: Bank hisobi tizimini modellashtirish",
      "Mini-loyiha: Maktab jurnal tizimi (Student, Teacher klasslari)",
      "II chorak nazorat ishi va muhokama"
    ]},
    { chorak: "III chorak", mavzu: "Grafika va o'yin dasturlash", darslar: [
      "Python Turtle grafika: chiziqlar, shakllar, ranglar",
      "Turtle bilan animatsiya: harakatlanuvchi shakllar",
      "Pygame bilan tanishuv: oyna, ranglar, shakl chizish",
      "Klaviatura va sichqoncha bilan boshqaruv (Pygame events)",
      "To'qnashuv aniqlash (collision detection)",
      "O'yin mantig'i: ball, to'siq, ball hisoblash",
      "Mini-loyiha: oddiy \"Ping Pong\" yoki \"Snake\" o'yini",
      "III chorak nazorat ishi va muhokama"
    ]},
    { chorak: "IV chorak", mavzu: "Ma'lumotlar va API bilan ishlash", darslar: [
      "JSON formatini Python'da o'qish va yozish",
      "API nima? requests kutubxonasi bilan ishlash",
      "Ochiq API'lardan ma'lumot olish (ob-havo, valyuta, memes)",
      "CSV fayllari bilan ishlash: o'qish, yozish, filtrlash",
      "Amaliy loyiha: API'dan ma'lumot olib, ekranga chiroyli chiqarish",
      "Yakuniy loyiha ustida ishlash – I bosqich",
      "Yakuniy loyiha ustida ishlash – II bosqich va taqdimot",
      "IV chorak (yakuniy) nazorat ishi. Yil xulosasi va sertifikat"
    ]}
  ],
  7: [
    { chorak: "I chorak", mavzu: "Zamonaviy veb-dasturlash", darslar: [
      "Kirish. Veb-dasturlash ekotizimi: frontend, backend, full-stack",
      "HTML5 yangiliklari: semantic teglar, section, article, nav",
      "CSS3 chuqur: flexbox, grid layout tizimi",
      "CSS animatsiyalar va transition effektlar",
      "JavaScript asoslari: let/const, arrow functions, template literals",
      "DOM bilan ishlash: element tanlash, o'zgartirish, qo'shish",
      "Mini-loyiha: interaktiv to-do ro'yxat (JS + DOM)",
      "I chorak nazorat ishi va muhokama"
    ]},
    { chorak: "II chorak", mavzu: "JavaScript chuqur va veb-ilova", darslar: [
      "JS funksiyalar: callback, closure, higher-order functions",
      "Fetch API: serverdan ma'lumot olish (JSON)",
      "Async/await va Promise tushunchasi",
      "LocalStorage bilan ishlash: ma'lumotni saqlash",
      "Bootstrap yoki Tailwind CSS: tayyor UI komponentlar",
      "Mini-loyiha: ob-havo ilovasi (ochiq API + JS + CSS)",
      "Responsive dizayn: mobil qurilmalar uchun moslash",
      "II chorak nazorat ishi va muhokama"
    ]},
    { chorak: "III chorak", mavzu: "Ma'lumotlar bazasi asoslari", darslar: [
      "Ma'lumotlar bazasi (DB) nima? Turlari: SQL va NoSQL",
      "SQL asoslari: CREATE, INSERT, SELECT, WHERE, ORDER BY",
      "Jadvallar orasidagi munosabat: JOIN operatsiyalari",
      "SQLite: Python bilan ishlash (sqlite3 moduli)",
      "CRUD operatsiyalar: yaratish, o'qish, yangilash, o'chirish",
      "Amaliy: maktab kutubxona katalogi (Python + SQLite)",
      "Mini-loyiha: DB bilan bog'liq veb-sahifa",
      "III chorak nazorat ishi va muhokama"
    ]},
    { chorak: "IV chorak", mavzu: "Loyiha va kelajak texnologiyalari", darslar: [
      "Version control: Git asoslari — init, add, commit, push",
      "GitHub: loyihani nashr qilish va hamkorlik",
      "Kiberxavfsizlik chuqur: HTTPS, XSS, SQL injection hujumlari",
      "Backend tushunchasi: Flask (Python) bilan mini server yaratish",
      "Yakuniy loyiha ustida ishlash – I bosqich (texnik qism)",
      "Yakuniy loyiha ustida ishlash – II bosqich (dizayn + DB)",
      "Yakuniy loyihalarni himoya qilish va taqdimot",
      "IV chorak (yakuniy) nazorat ishi. Yil xulosasi va sertifikat"
    ]}
  ],
  8: [
    { chorak: "I chorak", mavzu: "Python ilg'or darajasi va ma'lumotlar tahlili", darslar: [
      "Kirish. Python ekotizimi: virtual muhit, pip, requirements.txt",
      "NumPy: massivlar, matematik operatsiyalar, broadcasting",
      "Pandas: DataFrame yaratish, ma'lumot tozalash, filtrlash",
      "Pandas: groupby, merge, pivot_table operatsiyalari",
      "Matplotlib: chiziqli, ustunli, tarqalish diagrammalari",
      "Seaborn: statistik vizualizatsiya va heatmap",
      "Mini-loyiha: haqiqiy dataset tahlili (Kaggle'dan)",
      "I chorak nazorat ishi va muhokama"
    ]},
    { chorak: "II chorak", mavzu: "Mashina o'qishi amaliyoti", darslar: [
      "Mashina o'qishi turlari: nazorat ostida, nazorat ostisiz, kuchaytirish",
      "Scikit-learn kutubxonasi bilan tanishuv",
      "Chiziqli regressiya: narx bashorat qilish modeli",
      "Klassifikatsiya: KNN va Decision Tree algoritmlari",
      "Model sifatini baholash: accuracy, precision, recall",
      "Overfitting va underfitting: train/test split, cross-validation",
      "Mini-loyiha: uyning narxini bashorat qiluvchi model",
      "II chorak nazorat ishi va muhokama"
    ]},
    { chorak: "III chorak", mavzu: "Neyron tarmoqlar va generativ AI", darslar: [
      "Neyron tarmoq arxitekturasi: input, hidden, output qatlamlari",
      "TensorFlow/Keras bilan oddiy neyron tarmoq qurish",
      "Rasm tanish (CNN): konvolyutsion neyron tarmoqlar tushunchasi",
      "Matn tahlili (NLP): tokenization, sentiment analysis",
      "Generativ AI chuqur: GANlar va diffuzion modellar tamoyili",
      "AI API'lar bilan ishlash: OpenAI yoki boshqa ochiq modellar",
      "Mini-loyiha: matn yoki rasm klassifikatori",
      "III chorak nazorat ishi va muhokama"
    ]},
    { chorak: "IV chorak", mavzu: "To'liq loyiha va IT karyera", darslar: [
      "DevOps tushunchasi: CI/CD, Docker asoslari",
      "Bulut platformalar: AWS, Google Cloud, Vercel bilan tanishuv",
      "IT sohada karyera yo'llari: tadqiqot va amaliyot",
      "Portfolio tayyorlash: GitHub, LinkedIn, CV yozish",
      "Yakuniy loyiha – I bosqich: g'oya, dataset, model tanlash",
      "Yakuniy loyiha – II bosqich: texnik bajarilish va UI",
      "Yakuniy loyihalarni ilmiy konferensiya formatida himoya qilish",
      "IV chorak (yakuniy) nazorat ishi. Yil xulosasi va sertifikat"
    ]}
  ]
};

// Yordamchi: (sinf, chorakIndex, darsIndex) bo'yicha mavzu matnini olish
export function getLesson(sinf, chorakIndex, darsIndex) {
  const grade = SYLLABUS[sinf];
  if (!grade || !grade[chorakIndex]) return null;
  const chorak = grade[chorakIndex];
  const darsText = chorak.darslar[darsIndex];
  if (!darsText) return null;
  return { chorak: chorak.chorak, mavzu: chorak.mavzu, dars: darsText, darsRaqami: darsIndex + 1 };
}

// Yordamchi: sinf uchun barcha darslarni tekis ro'yxat qilib olish (navigatsiya uchun)
export function flattenGrade(sinf) {
  const grade = SYLLABUS[sinf] || [];
  const list = [];
  grade.forEach(function (chorak, ci) {
    chorak.darslar.forEach(function (dars, di) {
      list.push({ chorakIndex: ci, darsIndex: di, chorak: chorak.chorak, mavzu: chorak.mavzu, dars: dars });
    });
  });
  return list;
}
