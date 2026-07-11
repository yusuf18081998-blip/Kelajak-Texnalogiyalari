// ==========================================================================
// O'QUVCHI PANELI LOGIKASI
// ==========================================================================
import {
  auth, db, storage,
  onAuthStateChanged, signOut, updatePassword,
  doc, getDoc, updateDoc, collection, query, where, onSnapshot, serverTimestamp, getDocs,
  ref, uploadBytes, getDownloadURL
} from "./firebase-init.js";

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
  }, 3800);
}

let myUid = null;
let myData = null;

/* ---------- AUTH GUARD + INIT ---------- */
onAuthStateChanged(auth, async function (user) {
  if (!user) { window.location.href = "../index.html"; return; }
  myUid = user.uid;
  try {
    const userDoc = await getDoc(doc(db, "users", myUid));
    if (!userDoc.exists()) { window.location.href = "../index.html"; return; }
    myData = userDoc.data();
    if (myData.role === "admin") { window.location.href = "admin.html"; return; }

    document.getElementById("stuNameLabel").textContent = (myData.ism || "") + " " + (myData.familiya || "");
    document.getElementById("greetName").textContent = myData.ism || "o'quvchi";
    document.getElementById("profIsmFamiliya").value = (myData.ism || "") + " " + (myData.familiya || "");
    document.getElementById("profSinf").value = (myData.sinf || "") + "-sinf" + (myData.guruh ? " · " + myData.guruh : "");
    document.getElementById("profId").value = myData.loginId || "—";
    document.getElementById("avatarImg").src = myData.rasmUrl || defaultAvatar();

    loadTodayTopic();
    loadRating();
    heartbeat("Bugungi mavzu");
    setInterval(function () { heartbeat(currentSectionName); }, 30000);
  } catch (error) {
    console.error("Foydalanuvchi ma'lumotlarini yuklashda xato:", error);
  }
});

document.getElementById("logoutBtn").addEventListener("click", function () {
  signOut(auth).then(function () { window.location.href = "../index.html"; });
});

function defaultAvatar() {
  return "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#111b36"/><circle cx="50" cy="38" r="18" fill="#2dd4ff"/><path d="M15 90c5-25 25-35 35-35s30 10 35 35" fill="#2dd4ff"/></svg>'
  );
}

/* ---------- FAOLIYAT HEARTBEAT ---------- */
let currentSectionName = "Bugungi mavzu";
async function heartbeat(sectionName) {
  if (!myUid) return;
  try {
    await updateDoc(doc(db, "users", myUid), { oxirgiBolim: sectionName, oxirgiVaqt: serverTimestamp() });
  } catch (err) { /* jim turadi */ }
}

/* ---------- SIDEBAR NAVIGATSIYA ---------- */
const sideLinks = Array.from(document.querySelectorAll(".kt-side-link"));
const sectionNames = { today: "Bugungi mavzu", profile: "Profil", rating: "Reyting", ai: "AI yordamchi" };
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

/* ---------- BUGUNGI MAVZU ---------- */
function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

async function loadTodayTopic() {
  try {
    document.getElementById("todayDate").textContent = new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    
    // Indeks xatosini oldini olish uchun faqat sinf bo'yicha qidiramiz
    const q = query(collection(db, "ishreja"), where("sinf", "==", myData.sinf));
    const snap = await getDocs(q);
    const all = [];
    snap.forEach(function (d) { all.push(d.data()); });

    // Sanalarni JS-ning o'zida kamayish tartibida sarflaymiz (Eng yangisi tepada)
    all.sort(function (a, b) {
      return (b.sana || "").localeCompare(a.sana || "");
    });

    const today = all.find(function (r) { return r.sana === todayStr(); });
    if (today) {
      document.getElementById("todayTopicTitle").textContent = today.mavzu;
      document.getElementById("todayTopicMeta").textContent = (today.chorak || "") + " · " + (today.sana || "");
    } else {
      document.getElementById("todayTopicTitle").textContent = "Bugun uchun mavzu hali yuklanmagan";
      document.getElementById("todayTopicMeta").textContent = "Admin yangi mavzu qo'shganda shu yerda ko'rinadi.";
    }

    const recentBox = document.getElementById("recentTopicsList");
    recentBox.innerHTML = "";
    all.slice(0, 6).forEach(function (r) {
      recentBox.innerHTML += "<div style='display:flex;justify-content:space-between;border-bottom:1px solid rgba(127,147,184,.15);padding:.5rem 0;'>" +
        "<span>" + r.mavzu + "</span><span style='color:var(--dim);font-size:.82rem;'>" + r.sana + "</span></div>";
    });
  } catch (error) {
    console.error("Mavzularni yuklashda xato:", error);
  }
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
    });
  } catch (error) {
    console.error("Reytingni yuklashda xato:", error);
  }
}

/* ---------- AI YORDAMCHI ---------- */
const AI_KNOWLEDGE = [
  { keys: ["python", "python nima"], answer: "Python — o'qish va yozish oson bo'lgan, keng qo'llaniladigan dasturlash tili. U veb-dasturlash, ma'lumotlar tahlili va sun'iy intellektda ishlatiladi." },
  { keys: ["html", "css"], answer: "HTML veb-sahifaning tuzilmasini (matn, rasm, tugmalar), CSS esa uning ko'rinishini (rang, shrift, joylashuv) belgilaydi." },
  { keys: ["ai", "sun'iy intellekt", "sunʼiy intellekt"], answer: "Sun'iy intellekt (AI) — katta hajmdagi ma'lumotlardan naqshlarni o'rganib, bashorat qiladigan yoki qaror qabul qiladigan dasturlar majmuasi." },
  { keys: ["kiberxavfsizlik", "parol", "fishing"], answer: "Kiberxavfsizlik — ma'lumotlaringizni himoya qilish san'ati. Kuchli parol ishlating, noma'lum havolalarni bosmang va 2FA (ikki bosqichli tasdiqlash)ni yoqing." },
  { keys: ["algoritm"], answer: "Algoritm — biror muammoni yechish uchun aniq va tartiblangan qadamlar ketma-ketligi." },
  { keys: ["oop", "klass", "obyekt"], answer: "OOP (obyektga yo'naltirilgan dasturlash)da klass — qolip, obyekt esa shu qolipdan yasalgan aniq naska." },
  { keys: ["api"], answer: "API — ikki dastur o'rtasida ma'lumot almashish uchun ishlatiladigan interfeys." },
  { keys: ["reyting", "ball"], answer: "Reyting bo'limidan o'z ballingiz va sinfdagi o'rningizni ko'rishingiz mumkin. Admin loyihalar va nazorat ishlari uchun ball qo'shadi." }
];

function findAiAnswer(text) {
  const lower = text.toLowerCase();
  for (const item of AI_KNOWLEDGE) {
    if (item.keys.some(function (k) { return lower.indexOf(k) !== -1; })) return item.answer;
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
  setTimeout(function () { addChatMessage(findAiAnswer(text), "bot"); }, 400);
}
