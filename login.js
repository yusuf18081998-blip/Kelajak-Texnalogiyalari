// ==========================================================================
// LOGIN SAHIFASI LOGIKASI (GITHUB PAGES UCHUN INTERNETDA SINMAYDIGAN VARIANT)
// ==========================================================================
import { 
  auth, 
  db, 
  doc, 
  getDoc, 
  signInWithEmailAndPassword, 
  idToEmail 
} from "./firebase-config.js"; // GitHub uchun toza va to'g'ri havola

// Sahifadagi yagona formani aniqlaymiz
const form = document.querySelector("form");

if (form) {
  // Xatolik matnini chiqarish uchun joy tayyorlaymiz
  let errorDiv = document.getElementById("loginError");
  if (!errorDiv) {
    errorDiv = document.createElement("p");
    errorDiv.id = "loginError";
    errorDiv.style.color = "#ff4a76";
    errorDiv.style.marginTop = "15px";
    errorDiv.style.textAlign = "center";
    errorDiv.style.fontWeight = "500";
    form.appendChild(errorDiv);
  }

  form.addEventListener("submit", async (e) => {
    // Sahifa yangilanib, so'rov belgilari (?/?) chiqib ketishini qat'iy to'xtatamiz
    e.preventDefault(); 
    
    errorDiv.innerText = "Tekshirilmoqda...";
    errorDiv.style.color = "#00e5ff";

    // Element ID-lariga yopishmasdan, inputlarni turi bo'yicha sug'urib olamiz
    const textInput = form.querySelector("input[type='text']");
    const passwordInput = form.querySelector("input[type='password']");

    if (!textInput || !passwordInput) {
      errorDiv.innerText = "Xatolik: Kirish maydonlari topilmadi!";
      errorDiv.style.color = "#ff4a76";
      return;
    }

    const inputId = textInput.value.trim();
    const password = passwordInput.value;

    if (!inputId || !password) {
      errorDiv.innerText = "Iltimos, ID va parolni to'liq kiriting!";
      errorDiv.style.color = "#ff4a76";
      return;
    }

    // ID-ni maxsus email formatga o'tkazamiz
    const formattedEmail = idToEmail(inputId);

    try {
      // Firebase Auth orqali tizimga kirish
      const userCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
      const user = userCredential.user;

      // Firestore bazasidan foydalanuvchining rolini tekshiramiz
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        errorDiv.innerText = "Muvaffaqiyatli! Yo'naltirilmoqda...";
        errorDiv.style.color = "#00ff88";

        // Rolga qarab sahifaga yo'naltirish
        if (role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "student.html";
        }
      } else {
        errorDiv.innerText = "Tizimda sizning rolingiz aniqlanmadi!";
        errorDiv.style.color = "#ff4a76";
      }

    } catch (error) {
      console.error("Firebase auth xatosi:", error);
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorDiv.innerText = "ID yoki parol noto'g'ri!";
      } else if (error.code === "auth/api-key-not-valid") {
        errorDiv.innerText = "Firebase API Key xato! Konsoldan yangilang.";
      } else {
        errorDiv.innerText = `Xatolik: ${error.message}`;
      }
      errorDiv.style.color = "#ff4a76";
    }
  });
} else {
  console.error("HTML tarkibida hech qanday <form> tegi topilmadi!");
}
