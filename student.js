// ==========================================================================
// O'QUVCHI PANELI LOGIKASI
// ==========================================================================
import {
  auth, db, storage,
  onAuthStateChanged, signOut, updatePassword,
  doc, getDoc, updateDoc, collection, query, where, onSnapshot,
  ref, uploadBytes, getDownloadURL
} from "./firebase-config.js";
import { SYLLABUS, getLesson, flattenGrade } from "./syllabus-data.js";

function showToast(message, type) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "kt-toast" + (type === "error" ? " error" : "");
  toast.innerHTML = "<strong>" + (type === "error" ? "Xato: " : "Bajarildi: ") + "</strong>" + message;
  container.appendChild(toast);
  setTimeout(function () {
    toast.style.transition = "opacity .4s, transform .4s";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    setTimeout(function () { toast.remove(); }, 400);
  }, 5000);
}

function showFatalError(msg) {
  console.error(msg);
  const titleEl = document.getElementById("todayTopicTitle");
  const metaEl = document.getElementById("todayTopicMeta");
  const nameEl = document.getElementById("stuNameLabel");
  if (titleEl) titleEl.textContent = "Xatolik yuz berdi";
  if (metaEl) metaEl.textContent = msg;
  if (nameEl) nameEl.textContent = "Xato";
  showToast(msg, "error");
}

let myUid = null;
let myData = null;

/* ---------- AUTH GUARD + INIT ---------- */
onAuthStateChanged(auth, async function (user) {
  if (!user) { window.location.href = "index.html"; return; }
  myUid = user.uid;
  try {
    const userDoc = await getDoc(doc(db, "users", myUid));
    if (!userDoc.exists()) {
      showFatalError("Bu foydalanuvchi uchun Firestore'da 'users' hujjati topilmadi. Admin orqali qayta qo'shib ko'ring.");
      return;
    }
    myData = userDoc.data();
    if (myData.role === "admin") { window.location.href = "admin.html"; return; }

    document.getElementById("stuNameLabel").textContent = (myData.ism || "") + " " + (myData.familiya || "");
    document.getElementById("greetName").textContent = myData.ism || "o'quvchi";
    document.getElementById("profIsmFamiliya").value = (myData.ism || "") + " " + (myData.familiya || "");
    document.getElementById("profSinf").value = (myData.sinf || "") + "-sinf" + (myData.guruh ? " · " + myData.guruh : "");
    document.getElementById("profId").value = myData.loginId || "—";
    document.getElementById("avatarImg").src = myData.rasmUrl || defaultAvatar();

    listenCurrentLesson();
    loadRating();
    heartbeat("Joriy mavzu");
    setInterval(function () { heartbeat(currentSectionName); }, 30000);
  } catch (error) {
    showFatalError("Ma'lumot yuklashda xato: " + error.code + " — " + error.message);
  }
});

document.getElementById("logoutBtn").addEventListener("click", function () {
  signOut(auth).then(function () { window.location.href = "index.html"; });
});

function defaultAvatar() {
  return "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#111b36"/><circle cx="50" cy="38" r="18" fill="#2dd4ff"/><path d="M15 90c5-25 25-35 35-35s30 10 35 35" fill="#2dd4ff"/></svg>'
  );
}

/* ---------- FAOLIYAT HEARTBEAT ---------- */
let currentSectionName = "Joriy mavzu";
async function heartbeat(sectionName) {
  if (!myUid) return;
  try {
    await updateDoc(doc(db, "users", myUid), { oxirgiBolim: sectionName, oxirgiVaqt: new Date() });
  } catch (err) { /* jim turadi — faoliyat yozib bo'lmasa ham sahifa ishlashda davom etadi */ }
}

/* ---------- SIDEBAR NAVIGATSIYA ---------- */
const sideLinks = Array.from(document.querySelectorAll(".kt-side-link"));
const sectionNames = { today: "Joriy mavzu", profile: "Profil", rating: "Reyting", ai: "AI yordamchi" };
sideLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    sideLinks.forEach(function (l) { l.classList.remove("active"); });
    link.classList.add("active");
    document.querySelectorAll(".kt-view").forEach(function (v) {
      v.classList.toggle("active", v.dataset.viewPanel === link.dataset.view);
    });
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
    currentSectionName = sectionNames[link.dataset.view] || link.dataset.view;
    heartbeat(currentSectionName);
  });
});

const mobileBtn = document.getElementById("mobileSidebarBtn");
if (mobileBtn) {
  mobileBtn.addEventListener("click", function () {
    document.getElementById("sidebar").classList.toggle("open");
  });
}

/* ---------- JORIY MAVZU (SYLLABUS ASOSIDA, JONLI) ---------- */
function listenCurrentLesson() {
  document.getElementById("todayDate").textContent = new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  onSnapshot(doc(db, "joriy_mavzu", myData.sinf), function (snap) {
    if (!snap.exists()) {
      document.getElementById("todayTopicTitle").textContent = "Hozircha mavzu belgilanmagan";
      document.getElementById("todayTopicMeta").textContent = "Admin joriy darsni belgilaganda shu yerda ko'rinadi.";
      document.getElementById("recentTopicsList").innerHTML = "";
      return;
    }
    const data = snap.data();
    const lesson = getLesson(myData.sinf, data.chorakIndex, data.darsIndex);
    if (!lesson) return;

    document.getElementById("todayTopicTitle").textContent = lesson.dars;
    document.getElementById("todayTopicMeta").textContent = lesson.chorak + " · " + lesson.mavzu + " · " + lesson.darsRaqami + "-dars";

    const flat = flattenGrade(myData.sinf);
    const currentFlatIndex = flat.findIndex(function (l) {
      return l.chorakIndex === data.chorakIndex && l.darsIndex === data.darsIndex;
    });
    const recentBox = document.getElementById("recentTopicsList");
    recentBox.innerHTML = "";
    const previous = flat.slice(0, currentFlatIndex + 1).reverse().slice(0, 6);
    previous.forEach(function (l) {
      recentBox.innerHTML += "<div style='display:flex;justify-content:space-between;border-bottom:1px solid rgba(127,147,184,.15);padding:.5rem 0;'>" +
        "<span>" + l.dars + "</span><span style='color:var(--dim);font-size:.82rem;'>" + l.chorak + "</span></div>";
    });
  }, function (error) {
    showFatalError("Joriy mavzuni yuklashda xato: " + error.code + " — " + error.message);
  });
}

/* ---------- PROFIL: RASM YUKLASH ---------- */
document.getElementById("avatarInput").addEventListener("change", async function (e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast("Faqat rasm fayllari qabul qilinadi.", "error"); return; }
  if (file.size > 3 * 1024 * 1024) { showToast("Rasm hajmi 3MB dan oshmasligi kerak.", "error"); return; }

  const statusEl = document.getElementById("avatarUploadStatus");
  statusEl.textContent = "Yuklanmoqda...";
  try {
    const fileRef = ref(storage, "profiles/" + myUid + "/avatar.jpg");
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await updateDoc(doc(db, "users", myUid), { rasmUrl: url });
    document.getElementById("avatarImg").src = url;
    statusEl.textContent = "Rasm yangilandi.";
    showToast("Profil rasmi yangilandi.", "success");
  } catch (err) {
    statusEl.textContent = "";
    showToast("Rasm yuklashda xatolik: " + err.message, "error");
  }
});

/* ---------- PAROLNI O'ZGARTIRISH ---------- */
document.getElementById("changePassForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const p1 = document.getElementById("newPass1").value;
  const p2 = document.getElementById("newPass2").value;
  const msgBox = document.getElementById("passChangeMsg");
  if (p1.length < 6) { msgBox.textContent = "Parol kamida 6 ta belgi bo'lishi kerak."; msgBox.className = "kt-error-text mt-2"; return; }
  if (p1 !== p2) { msgBox.textContent = "Parollar mos emas."; msgBox.className = "kt-error-text mt-2"; return; }
  try {
    await updatePassword(auth.currentUser, p1);
    msgBox.textContent = "Parol muvaffaqiyatli yangilandi.";
    msgBox.className = "mt-2";
    msgBox.style.color = "var(--cyan)";
    document.getElementById("changePassForm").reset();
  } catch (err) {
    if (err.code === "auth/requires-recent-login") {
      msgBox.textContent = "Xavfsizlik uchun avval tizimdan chiqib, qayta kiring, so'ng parolni o'zgartiring.";
    } else {
      msgBox.textContent = "Xatolik: " + err.message;
    }
    msgBox.className = "kt-error-text mt-2";
  }
});

/* ---------- REYTING ---------- */
async function loadRating() {
  try {
    const q = query(collection(db, "users"), where("role", "==", "student"), where("sinf", "==", myData.sinf));
    onSnapshot(q, function (snap) {
      const list = [];
      snap.forEach(function (d) { list.push(Object.assign({ uid: d.id }, d.data())); });
      list.sort(function (a, b) { return (b.ball || 0) - (a.ball || 0); });

      const myIndex = list.findIndex(function (s) { return s.uid === myUid; });
      document.getElementById("myBall").textContent = myData && list[myIndex] ? (list[myIndex].ball || 0) : 0;
      document.getElementById("myRank").textContent = myIndex >= 0 ? (myIndex + 1) + " / " + list.length : "—";

      const tbody = document.getElementById("ratingTableBody");
      tbody.innerHTML = "";
      list.forEach(function (s, i) {
        const isMe = s.uid === myUid;
        tbody.innerHTML += "<tr" + (isMe ? " style='background:rgba(45,212,255,.08);'" : "") + ">" +
          "<td><span class='" + (i === 0 ? "kt-rank-badge kt-rank-1" : "kt-rank-badge") + "'>" + (i + 1) + "</span></td>" +
          "<td>" + s.ism + " " + s.familiya + (isMe ? " (siz)" : "") + "</td>" +
          "<td>" + (s.ball || 0) + "</td></tr>";
      });
    }, function (error) {
      showToast("Reytingni jonli kuzatishda xato: " + error.message, "error");
    });
  } catch (error) {
    showToast("Reytingni yuklashda xato: " + error.message, "error");
  }
}

/* ---------- AI YORDAMCHI (haqiqiy AI + zaxira lokal bot) ---------- */
// Cloudflare Worker'ni sozlagach, shu manzilni O'ZINGIZNIKIGA almashtiring:
const AI_WORKER_URL = "https://square-haze-8ece.yusufaluz1.workers.dev";

const AI_GREETINGS = ["salom", "assalomu alaykum", "hi", "hello", "hey", "yaxshimisiz"];
const AI_THANKS = ["rahmat", "tashakkur", "raxmat"];

const AI_KNOWLEDGE = [
  { keys: ["python nima", "python"], answer: "Python — o'qish va yozish oson bo'lgan, keng qo'llaniladigan dasturlash tili. U veb-dasturlash, ma'lumotlar tahlili va sun'iy intellektda ishlatiladi." },
  { keys: ["html", "css"], answer: "HTML veb-sahifaning tuzilmasini (matn, rasm, tugmalar), CSS esa uning ko'rinishini (rang, shrift, joylashuv) belgilaydi." },
  { keys: ["sun'iy intellekt", "sunʼiy intellekt", " ai ", "ai nima"], answer: "Sun'iy intellekt (AI) — katta hajmdagi ma'lumotlardan naqshlarni o'rganib, bashorat qiladigan yoki qaror qabul qiladigan dasturlar majmuasi." },
  { keys: ["kiberxavfsizlik", "parol", "fishing"], answer: "Kiberxavfsizlik — ma'lumotlaringizni himoya qilish san'ati. Kuchli parol ishlating, noma'lum havolalarni bosmang va 2FA (ikki bosqichli tasdiqlash)ni yoqing." },
  { keys: ["algoritm"], answer: "Algoritm — biror muammoni yechish uchun aniq va tartiblangan qadamlar ketma-ketligi." },
  { keys: ["oop", "klass", "obyekt"], answer: "OOP (obyektga yo'naltirilgan dasturlash)da klass — qolip, obyekt esa shu qolipdan yasalgan aniq narsa." },
  { keys: ["api"], answer: "API — ikki dastur o'rtasida ma'lumot almashish uchun ishlatiladigan interfeys." },
  { keys: ["reyting", "ball"], answer: "Reyting bo'limidan o'z ballingiz va sinfdagi o'rningizni ko'rishingiz mumkin. Admin loyihalar va nazorat ishlari uchun ball qo'shadi." },
  { keys: ["git", "github"], answer: "Git — kod o'zgarishlarini kuzatib boruvchi vosita. GitHub esa loyihangizni internetga joylab, boshqalar bilan bo'lishish imkonini beradi." },
  { keys: ["sql", "ma'lumotlar bazasi"], answer: "SQL — ma'lumotlar bazasida ma'lumot qidirish, qo'shish va o'zgartirish uchun ishlatiladigan til." }
];

function findAiAnswer(text) {
  const lower = " " + text.toLowerCase() + " ";

  if (AI_GREETINGS.some(function (g) { return lower.indexOf(g) !== -1; })) {
    return "Salom, " + (myData ? myData.ism : "do'stim") + "! Sizga qanday yordam bera olaman?";
  }
  if (AI_THANKS.some(function (g) { return lower.indexOf(g) !== -1; })) {
    return "Arzimaydi! Yana savol bo'lsa, bemalol so'rayvering.";
  }

  for (const item of AI_KNOWLEDGE) {
    if (item.keys.some(function (k) { return lower.indexOf(k) !== -1; })) return item.answer;
  }

  // Ish rejadagi darslar orasidan mos keluvchi mavzuni qidiramiz
  if (myData) {
    const flat = flattenGrade(myData.sinf);
    const words = text.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 3; });
    const found = flat.find(function (l) {
      const darsLower = l.dars.toLowerCase();
      return words.some(function (w) { return darsLower.indexOf(w) !== -1; });
    });
    if (found) {
      return "Bu \"" + found.chorak + "\" mavzusiga tegishli bo'lishi mumkin: \"" + found.dars + "\". To'liq tushuntirishni to'garak rahbaridan so'rang.";
    }
  }

  return "Bu haqida aniq ma'lumotim yo'q. Iltimos, savolingizni boshqacharoq shaklda yozib ko'ring yoki to'garak rahbaridan so'rang.";
}

function addChatMessage(text, who) {
  const box = document.getElementById("chatMessages");
  if (!box) return;
  const msg = document.createElement("div");
  msg.className = "kt-chat-msg " + who;
  msg.textContent = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

const sendBtn = document.getElementById("chatSendBtn");
if (sendBtn) sendBtn.addEventListener("click", sendChat);

const chatInput = document.getElementById("chatInput");
if (chatInput) {
  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendChat();
  });
}

function sendChat() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  addChatMessage(text, "user");
  input.value = "";

  const typingId = "typing-" + Date.now();
  const box = document.getElementById("chatMessages");
  const typingEl = document.createElement("div");
  typingEl.className = "kt-chat-msg bot";
  typingEl.id = typingId;
  typingEl.textContent = "Yozmoqda...";
  box.appendChild(typingEl);
  box.scrollTop = box.scrollHeight;

  askRealAI(text)
    .then(function (reply) {
      const el = document.getElementById(typingId);
      if (el) el.remove();
      addChatMessage(reply, "bot");
    })
    .catch(function (err) {
      // Worker hali sozlanmagan yoki xato — sababini ko'rsatamiz va lokal botga qaytamiz
      console.error("AI Worker xatosi:", err);
      showToast("Haqiqiy AI ishlamadi: " + err.message + " (oddiy botga o'tildi)", "error");
      const el = document.getElementById(typingId);
      if (el) el.remove();
      addChatMessage(findAiAnswer(text), "bot");
    });
}

async function askRealAI(text) {
  if (!AI_WORKER_URL || AI_WORKER_URL.indexOf("SIZNING-WORKER-NOMINGIZ") !== -1) {
    throw new Error("AI Worker hali sozlanmagan");
  }
  const res = await fetch(AI_WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });
  if (!res.ok) throw new Error("AI so'rovi muvaffaqiyatsiz");
  const data = await res.json();
  if (!data.reply) throw new Error("Javob bo'sh");
  return data.reply;
}
