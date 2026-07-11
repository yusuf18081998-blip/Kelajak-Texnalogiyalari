// ==========================================================================
// ADMIN PANEL LOGIKASI
// ==========================================================================
import {
  auth, db, secondaryAuth, idToEmail,
  onAuthStateChanged, signOut, createUserWithEmailAndPassword, signOut as secSignOut,
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, onSnapshot, serverTimestamp, increment
} from "./firebase-config.js"; 

/* ---------- TOAST ---------- */
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

/* ---------- AUTH GUARD ---------- */
let currentStudents = [];
let currentIshReja = [];

onAuthStateChanged(auth, async function (user) {
  if (!user) { window.location.href = "../index.html"; return; }
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    showToast("Sizda admin huquqi yo'q.", "error");
    setTimeout(function () { window.location.href = "../index.html"; }, 1500);
    return;
  }
  
  // Undefined xatosini oldini olish uchun tekshiruv bilan yozamiz
  const ism = userDoc.data().ism || "Admin";
  const familiya = userDoc.data().familiya || "";
  document.getElementById("adminNameLabel").textContent = ism + " " + familiya;
  
  initStudentsListener();
  initIshRejaListener();
});

document.getElementById("logoutBtn").addEventListener("click", function () {
  signOut(auth).then(function () { window.location.href = "../index.html"; });
});

/* ---------- SIDEBAR NAVIGATSIYA ---------- */
const sideLinks = Array.from(document.querySelectorAll(".kt-side-link"));
sideLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    sideLinks.forEach(function (l) { l.classList.remove("active"); });
    link.classList.add("active");
    document.querySelectorAll(".kt-view").forEach(function (v) {
      v.classList.toggle("active", v.dataset.viewPanel === link.dataset.view);
    });
    document.getElementById("sidebar").classList.remove("open");
  });
});

const mobileBtn = document.getElementById("mobileSidebarBtn");
if (mobileBtn) {
  mobileBtn.addEventListener("click", function () {
    document.getElementById("sidebar").classList.toggle("open");
  });
}

/* ---------- O'QUVCHI QO'SHISH (TO'G'RILANDI & QOTMAYDI) ---------- */
const addStudentForm = document.getElementById("addStudentForm");
if (addStudentForm) {
  addStudentForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const ism = document.getElementById("stuIsm").value.trim();
    const familiya = document.getElementById("stuFamiliya").value.trim();
    const sinf = document.getElementById("stuSinf").value;
    const guruh = document.getElementById("stuGuruh").value.trim();
    const id = document.getElementById("stuId").value.trim().toLowerCase();
    const parol = document.getElementById("stuParol").value;
    const btn = document.getElementById("addStudentBtn");

    if (parol.length < 6) {
      showToast("Parol kamida 6 ta belgidan iborat bo'lishi kerak.", "error");
      return;
    }

    // Tugmani qulflash
    btn.disabled = true;
    btn.textContent = "Qo'shilmoqda...";

    try {
      const email = idToEmail(id);
      
      // Secondary auth orqali yangi o'quvchi profilini ochish
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, parol);
      
      // Firestore bazasiga yozish (Bu yerda qoidalar ochiq bo'lishi kerak)
      await setDoc(doc(db, "users", cred.user.uid), {
        ism: ism, 
        familiya: familiya, 
        sinf: sinf, 
        guruh: guruh || "",
        loginId: id, 
        role: "student", 
        ball: 0, 
        rasmUrl: "",
        oxirgiBolim: "—", 
        oxirgiVaqt: serverTimestamp(), 
        yaratilgan: serverTimestamp()
      });
      
      // Ikkinchi seansni tozalash
      await secSignOut(secondaryAuth);
      
      showToast(ism + " " + familiya + " muvaffaqiyatli qo'shildi! ID: " + id, "success");
      addStudentForm.reset();
      
    } catch (err) {
      console.error("O'quvchi qo'shishda xato:", err);
      
      if (err.code === "auth/email-already-in-use") {
        showToast("Bu ID allaqachon band! Boshqa ID kiriting.", "error");
      } else if (err.code === "permission-denied") {
        showToast("Firebase bazasiga yozish taqiqlandi! Rules'ni oching.", "error");
      } else {
        showToast("Xatolik: " + err.message, "error");
      }
    } finally {
      // Qanday vaziyat bo'lsa ham tugma endi qulflanib qolmaydi!
      btn.disabled = false;
      btn.textContent = "O'quvchi qo'shish";
    }
  });
}

/* ---------- O'QUVCHILAR RO'YXATI / REYTING / STATISTIKA ---------- */
function initStudentsListener() {
  const q = query(collection(db, "users"), where("role", "==", "student"));
  onSnapshot(q, function (snap) {
    currentStudents = [];
    snap.forEach(function (d) { currentStudents.push(Object.assign({ uid: d.id }, d.data())); });
    currentStudents.sort(function (a, b) { return (b.ball || 0) - (a.ball || 0); });
    renderStudentsTable();
    renderActivityTable();
    renderOverview();
  });
}

function renderOverview() {
  const statTotal = document.getElementById("statTotal");
  const statOnline = document.getElementById("statOnline");
  const statTopics = document.getElementById("statTopics");
  const statAvgBall = document.getElementById("statAvgBall");

  if (statTotal) statTotal.textContent = currentStudents.length;
  
  const now = Date.now();
  const online = currentStudents.filter(function (s) {
    return s.oxirgiVaqt && s.oxirgiVaqt.toMillis && (now - s.oxirgiVaqt.toMillis()) < 90000;
  }).length;
  if (statOnline) statOnline.textContent = online;
  if (statTopics) statTopics.textContent = currentIshReja.length;
  
  const avg = currentStudents.length ? (currentStudents.reduce(function (a, s) { return a + (s.ball || 0); }, 0) / currentStudents.length) : 0;
  if (statAvgBall) statAvgBall.textContent = avg.toFixed(1);

  const dist = { 5: 0, 6: 0, 7: 0, 8: 0 };
  currentStudents.forEach(function (s) { if (dist[s.sinf] !== undefined) dist[s.sinf]++; });
  
  const box = document.getElementById("gradeDistribution");
  if (box) {
    box.innerHTML = "";
    Object.keys(dist).forEach(function (g) {
      box.innerHTML += '<div class="kt-stat"><span class="kt-stat-num">' + dist[g] + '</span><span class="kt-stat-label">' + g + '-sinf</span></div>';
    });
  }
}

function renderStudentsTable() {
  const filterEl = document.getElementById("studentsGradeFilter");
  const tbody = document.getElementById("studentsTableBody");
  if (!tbody || !filterEl) return;

  const filter = filterEl.value;
  tbody.innerHTML = "";
  currentStudents
    .filter(function (s) { return filter === "all" || s.sinf === filter; })
    .forEach(function (s, i) {
      const rankClass = i === 0 ? "kt-rank-badge kt-rank-1" : "kt-rank-badge";
      tbody.innerHTML +=
        "<tr><td><span class='" + rankClass + "'>" + (i + 1) + "</span></td>" +
        "<td>" + s.ism + " " + s.familiya + "</td>" +
        "<td>" + s.sinf + "-sinf</td>" +
        "<td>" + (s.loginId || "—") + "</td>" +
        "<td>" + (s.ball || 0) + "</td>" +
        "<td style='display:flex;gap:.4rem;'>" +
        "<button class='kt-btn-outline' style='padding:.3rem .6rem;' data-ball-up='" + s.uid + "'>+5</button>" +
        "<button class='kt-btn-outline' style='padding:.3rem .6rem;' data-ball-down='" + s.uid + "'>-5</button>" +
        "<button class='kt-btn-outline' style='padding:.3rem .6rem;border-color:var(--magenta);color:var(--magenta);' data-del-student='" + s.uid + "'>O'chirish</button>" +
        "</td></tr>";
    });

  Array.from(tbody.querySelectorAll("[data-ball-up]")).forEach(function (btn) {
    btn.addEventListener("click", function () { adjustBall(btn.dataset.ballUp, 5); });
  });
  Array.from(tbody.querySelectorAll("[data-ball-down]")).forEach(function (btn) {
    btn.addEventListener("click", function () { adjustBall(btn.dataset.ballDown, -5); });
  });
  Array.from(tbody.querySelectorAll("[data-del-student]")).forEach(function (btn) {
    btn.addEventListener("click", function () { deleteStudent(btn.dataset.delStudent); });
  });
}

async function adjustBall(uid, delta) {
  try {
    await updateDoc(doc(db, "users", uid), { ball: increment(delta) });
    showToast("Ball yangilandi (" + (delta > 0 ? "+" : "") + delta + ").", "success");
  } catch (err) {
    showToast("Ball yangilashda xatolik: " + err.message, "error");
  }
}

async function deleteStudent(uid) {
  if (!confirm("Bu o'quvchi ma'lumotlarini o'chirmoqchimisiz? (Login hisobi Firebase Console'dan alohida o'chiriladi)")) return;
  try {
    await deleteDoc(doc(db, "users", uid));
    showToast("O'quvchi ma'lumotlari o'chirildi.", "success");
  } catch (err) {
    showToast("O'chirishda xatolik: " + err.message, "error");
  }
}

const stuFilter = document.getElementById("studentsGradeFilter");
if (stuFilter) {
  stuFilter.addEventListener("change", renderStudentsTable);
}

/* ---------- ISH REJA YUKLASH ---------- */
const ishRejaForm = document.getElementById("ishRejaForm");
if (ishRejaForm) {
  ishRejaForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const sinf = document.getElementById("irSinf").value;
    const sana = document.getElementById("irSana").value;
    const chorak = document.getElementById("irChorak").value;
    const mavzu = document.getElementById("irMavzu").value.trim();
    try {
      await setDoc(doc(collection(db, "ishreja")), {
        sinf: sinf, sana: sana, chorak: chorak, mavzu: mavzu, yaratilgan: serverTimestamp()
      });
      showToast("Mavzu qo'shildi: " + mavzu, "success");
      ishRejaForm.reset();
    } catch (err) {
      showToast("Xatolik: " + err.message, "error");
    }
  });
}

function initIshRejaListener() {
  const q = query(collection(db, "ishreja"), orderBy("sana", "desc"));
  onSnapshot(q, function (snap) {
    currentIshReja = [];
    snap.forEach(function (d) { currentIshReja.push(Object.assign({ id: d.id }, d.data())); });
    renderIshRejaTable();
    renderOverview();
  });
}

function renderIshRejaTable() {
  const filterEl = document.getElementById("ishRejaGradeFilter");
  const tbody = document.getElementById("ishRejaTableBody");
  if (!tbody || !filterEl) return;

  const filter = filterEl.value;
  tbody.innerHTML = "";
  currentIshReja
    .filter(function (r) { return filter === "all" || r.sinf === filter; })
    .forEach(function (r) {
      tbody.innerHTML +=
        "<tr><td>" + r.sana + "</td><td>" + r.sinf + "-sinf</td><td>" + r.chorak + "</td><td>" + r.mavzu + "</td>" +
        "<td><button class='kt-btn-outline' style='padding:.3rem .6rem;border-color:var(--magenta);color:var(--magenta);' data-del-ir='" + r.id + "'>O'chirish</button></td></tr>";
    });
  Array.from(tbody.querySelectorAll("[data-del-ir]")).forEach(function (btn) {
    btn.addEventListener("click", async function () {
      await deleteDoc(doc(db, "ishreja", btn.dataset.delIr));
      showToast("Mavzu o'chirildi.", "success");
    });
  });
}

const irFilter = document.getElementById("ishRejaGradeFilter");
if (irFilter) {
  irFilter.addEventListener("change", renderIshRejaTable);
}

/* ---------- FAOLIYAT MONITORING ---------- */
function renderActivityTable() {
  const tbody = document.getElementById("activityTableBody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  const now = Date.now();
  currentStudents.forEach(function (s) {
    const lastMs = s.oxirgiVaqt && s.oxirgiVaqt.toMillis ? s.oxirgiVaqt.toMillis() : 0;
    const online = lastMs && (now - lastMs) < 90000;
    const dot = online ? "<span class='kt-online-dot'></span>Onlayn" : "<span class='kt-offline-dot'></span>Offlayn";
    const lastText = lastMs ? new Date(lastMs).toLocaleString("uz-UZ") : "—";
    tbody.innerHTML +=
      "<tr><td>" + dot + "</td><td>" + s.ism + " " + s.familiya + "</td><td>" + s.sinf + "-sinf</td>" +
      "<td>" + (s.oxirgiBolim || "—") + "</td><td>" + lastText + "</td></tr>";
  });
}
setInterval(renderActivityTable, 15000);

/* ---------- DINAMIK PDF LINKLAR ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const gradeFilter = document.getElementById('ishRejaGradeFilter');
  const pdfCard = document.getElementById('pdfDownloadCard');
  const ishRejaTitle = document.getElementById('ishRejaTitle');
  const nazoratTitle = document.getElementById('nazoratTitle');
  const btnIshReja = document.getElementById('btnMainIshReja');
  const btnNazorat = document.getElementById('btnNazoratJavob');

  if (gradeFilter) {
    gradeFilter.addEventListener('change', (e) => {
      const sinf = e.target.value;
      
      if (sinf === 'all') {
        if (pdfCard) pdfCard.style.display = 'none';
      } else {
        if (pdfCard) pdfCard.style.display = 'block';
        if (ishRejaTitle) ishRejaTitle.textContent = `📅 ${sinf}-Sinf Ish Rejasi`;
        if (nazoratTitle) nazoratTitle.textContent = `🏆 ${sinf}-Sinf Nazorat Ishi Javoblari`;
        if (btnIshReja) btnIshReja.href = `KT_${sinf}sinf_Ish_Reja.pdf`;
        if (btnNazorat) btnNazorat.href = `KT_${sinf}sinf_Nazorat_Ishlari_Javoblari.pdf`;
      }
    });
  }
});
