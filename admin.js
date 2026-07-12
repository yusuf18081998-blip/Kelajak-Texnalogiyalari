// ==========================================================================
// ADMIN PANEL LOGIKASI
// ==========================================================================
import {
  auth, db, secondaryAuth, idToEmail,
  onAuthStateChanged, signOut, createUserWithEmailAndPassword,
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, where, onSnapshot, serverTimestamp, increment
} from "./firebase-config.js";
import { SYLLABUS, getLesson } from "./syllabus-data.js";

/* ---------- TOAST ---------- */
function showToast(message, type) {
  const container = document.getElementById("toastContainer");
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

onAuthStateChanged(auth, async function (user) {
  if (!user) { window.location.href = "index.html"; return; }
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      showToast("Sizda admin huquqi yo'q.", "error");
      setTimeout(function () { window.location.href = "index.html"; }, 1500);
      return;
    }
    document.getElementById("adminNameLabel").textContent = userDoc.data().ism + " " + userDoc.data().familiya;
    initStudentsListener();
    initCurrentLessonPanel();
  } catch (err) {
    showToast("Xatolik: " + err.code + " — " + err.message, "error");
  }
});

document.getElementById("logoutBtn").addEventListener("click", function () {
  signOut(auth).then(function () { window.location.href = "index.html"; });
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
document.getElementById("mobileSidebarBtn").addEventListener("click", function () {
  document.getElementById("sidebar").classList.toggle("open");
});

/* ---------- O'QUVCHI QO'SHISH ---------- */
document.getElementById("addStudentForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const ism = document.getElementById("stuIsm").value.trim();
  const familiya = document.getElementById("stuFamiliya").value.trim();
  const sinf = document.getElementById("stuSinf").value;
  const guruh = document.getElementById("stuGuruh").value.trim();
  const id = document.getElementById("stuId").value.trim().toLowerCase();
  const parol = document.getElementById("stuParol").value;
  const msgBox = document.getElementById("addStudentMsg");
  const btn = document.getElementById("addStudentBtn");

  if (parol.length < 6) {
    msgBox.textContent = "Parol kamida 6 ta belgidan iborat bo'lishi kerak.";
    msgBox.className = "kt-error-text mt-4";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Qo'shilmoqda...";
  try {
    const email = idToEmail(id);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, parol);
    await setDoc(doc(db, "users", cred.user.uid), {
      ism: ism, familiya: familiya, sinf: sinf, guruh: guruh || "",
      loginId: id, role: "student", ball: 0, rasmUrl: "",
      oxirgiBolim: "—", oxirgiVaqt: serverTimestamp(), yaratilgan: serverTimestamp()
    });
    await signOut(secondaryAuth);
    showToast(ism + " " + familiya + " muvaffaqiyatli qo'shildi. ID: " + id, "success");
    document.getElementById("addStudentForm").reset();
    msgBox.textContent = "";
  } catch (err) {
    console.error(err);
    let text = "Xatolik: " + err.message;
    if (err.code === "auth/email-already-in-use") text = "Bu ID allaqachon band. Boshqa ID tanlang.";
    msgBox.textContent = text;
    msgBox.className = "kt-error-text mt-4";
  }
  btn.disabled = false;
  btn.textContent = "O'quvchi qo'shish";
});

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
  }, function (err) {
    showToast("O'quvchilarni yuklashda xato: " + err.message, "error");
  });
}

function renderOverview() {
  document.getElementById("statTotal").textContent = currentStudents.length;
  const now = Date.now();
  const online = currentStudents.filter(function (s) {
    return s.oxirgiVaqt && s.oxirgiVaqt.toMillis && (now - s.oxirgiVaqt.toMillis()) < 90000;
  }).length;
  document.getElementById("statOnline").textContent = online;
  const avg = currentStudents.length ? (currentStudents.reduce(function (a, s) { return a + (s.ball || 0); }, 0) / currentStudents.length) : 0;
  document.getElementById("statAvgBall").textContent = avg.toFixed(1);

  const dist = { 5: 0, 6: 0, 7: 0, 8: 0 };
  currentStudents.forEach(function (s) { if (dist[s.sinf] !== undefined) dist[s.sinf]++; });
  const box = document.getElementById("gradeDistribution");
  box.innerHTML = "";
  Object.keys(dist).forEach(function (g) {
    box.innerHTML += '<div class="kt-stat"><span class="kt-stat-num">' + dist[g] + '</span><span class="kt-stat-label">' + g + '-sinf</span></div>';
  });
}

function renderStudentsTable() {
  const filter = document.getElementById("studentsGradeFilter").value;
  const tbody = document.getElementById("studentsTableBody");
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

document.getElementById("studentsGradeFilter").addEventListener("change", renderStudentsTable);

/* ---------- HOZIRGI MAVZU (SYLLABUS ASOSIDA) ---------- */
function populateChorakSelect() {
  const sinf = document.getElementById("clSinf").value;
  const chorakSelect = document.getElementById("clChorak");
  chorakSelect.innerHTML = "";
  SYLLABUS[sinf].forEach(function (ch, i) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = ch.chorak + " — " + ch.mavzu;
    chorakSelect.appendChild(opt);
  });
  populateDarsSelect();
}

function populateDarsSelect() {
  const sinf = document.getElementById("clSinf").value;
  const chorakIndex = document.getElementById("clChorak").value;
  const darsSelect = document.getElementById("clDars");
  darsSelect.innerHTML = "";
  const chorak = SYLLABUS[sinf][chorakIndex];
  chorak.darslar.forEach(function (dars, i) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = (i + 1) + "-dars: " + dars;
    darsSelect.appendChild(opt);
  });
}

document.getElementById("clSinf").addEventListener("change", populateChorakSelect);
document.getElementById("clChorak").addEventListener("change", populateDarsSelect);
populateChorakSelect();

document.getElementById("currentLessonForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const sinf = document.getElementById("clSinf").value;
  const chorakIndex = parseInt(document.getElementById("clChorak").value, 10);
  const darsIndex = parseInt(document.getElementById("clDars").value, 10);
  const msgBox = document.getElementById("currentLessonMsg");
  try {
    await setDoc(doc(db, "joriy_mavzu", sinf), {
      sinf: sinf, chorakIndex: chorakIndex, darsIndex: darsIndex, yangilangan: serverTimestamp()
    });
    const lesson = getLesson(sinf, chorakIndex, darsIndex);
    showToast(sinf + "-sinf uchun hozirgi dars belgilandi: " + lesson.dars, "success");
    msgBox.textContent = "";
  } catch (err) {
    msgBox.textContent = "Xatolik: " + err.message;
    msgBox.className = "kt-error-text mt-4";
  }
});

function initCurrentLessonPanel() {
  const tbody = document.getElementById("currentLessonTableBody");
  [5, 6, 7, 8].forEach(function (sinf) {
    onSnapshot(doc(db, "joriy_mavzu", String(sinf)), function (snap) {
      renderCurrentLessonRow(sinf, snap.exists() ? snap.data() : null);
    });
  });
  function renderCurrentLessonRow(sinf, data) {
    let row = document.getElementById("cl-row-" + sinf);
    if (!row) {
      row = document.createElement("tr");
      row.id = "cl-row-" + sinf;
      tbody.appendChild(row);
      const rows = Array.from(tbody.querySelectorAll("tr")).sort(function (a, b) {
        return a.id.localeCompare(b.id);
      });
      rows.forEach(function (r) { tbody.appendChild(r); });
    }
    if (!data) {
      row.innerHTML = "<td>" + sinf + "-sinf</td><td>—</td><td style='color:var(--dim);'>Hali belgilanmagan</td><td>—</td>";
      return;
    }
    const lesson = getLesson(sinf, data.chorakIndex, data.darsIndex);
    const updated = data.yangilangan && data.yangilangan.toMillis ? new Date(data.yangilangan.toMillis()).toLocaleString("uz-UZ") : "—";
    row.innerHTML = "<td>" + sinf + "-sinf</td><td>" + (lesson ? lesson.chorak : "—") + "</td><td>" + (lesson ? lesson.dars : "—") + "</td><td>" + updated + "</td>";
  }
}

/* ---------- FAOLIYAT MONITORING ---------- */
function renderActivityTable() {
  const tbody = document.getElementById("activityTableBody");
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
