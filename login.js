// ==========================================================================
// LOGIN LOGIKASI (MUTLAQO XAVFSIZ VA SINMAYDIGAN VARIANT)
// ==========================================================================
import { 
  auth, 
  db, 
  doc, 
  getDoc, 
  signInWithEmailAndPassword, 
  idToEmail 
} from "./firebase-config.js"; // Keshni chetlab o'tish uchun ?v=1

// Sahifadagi yagona formani ushlaymiz
const form = document.querySelector("form");

if (form) {
  // Xatolik matni uchun joy tayyorlaymiz
  let errorDiv = document.getElementById("loginError");
  if (!errorDiv) {
    errorDiv = document.createElement("p");
    errorDiv.id = "loginError";
    errorDiv.style.color = "#ff4a76";
    errorDiv.style.marginTop = "15px";
    errorDiv.style.textAlign = "center";
    form.appendChild(errorDiv);
  }

  form.addEventListener("submit", async (e) => {
    // 1. Sahifa yangilanib ketishini birinchi bo'lib TO'XTTAMIZ!
    e.preventDefault(); 
    
    errorDiv.innerText = "Tekshirilmoqda...";
    errorDiv.style.color = "#00e5ff";

    // 2. Element id-lariga bog'lanmasdan, formadan qiymatlarni olamiz
    const textInput = form.querySelector("input[type='text']");
    const passwordInput = form.querySelector("input[type='password']");

    if (!textInput || !passwordInput) {
      errorDiv.innerText = "Xato: Input elementlari topilmadi!";
      errorDiv.style.color = "#ff4a76";
      return;
    }

    const inputId = textInput.value.trim();
    const password = passwordInput.value;

    if (!inputId || !password) {
      errorDiv.innerText = "Iltimos, ID va parolni kiriting!";
      errorDiv.style.color = "#ff4a76";
      return;
    }

    // ID-ni email formatiga o'tkazamiz
    const formattedEmail = idToEmail(inputId);

    try {
      // Firebase Auth orqali kirish
      const userCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
      const user = userCredential.user;

      // Firestore rolni tekshirish
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        errorDiv.innerText = "Muvaffaqiyatli! Yo'naltirilmoqda...";
        errorDiv.style.color = "#00ff88";

        if (role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "student.html";
        }
      } else {
        errorDiv.innerText = "Bazada foydalanuvchi roli topilmadi!";
        errorDiv.style.color = "#ff4a76";
      }

    } catch (error) {
      console.error("Xatolik:", error);
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorDiv.innerText = "ID yoki parol noto'g'ri!";
      } else {
        errorDiv.innerText = `Xatolik: ${error.message}`;
      }
      errorDiv.style.color = "#ff4a76";
    }
  });
} else {
  alert("HTML ichida <form> tegi topilmadi! Shuning uchun JS ishlamayapti.");
}
