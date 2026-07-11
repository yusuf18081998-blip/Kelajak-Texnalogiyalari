// ==========================================================================
// FIREBASE ALL-IN-ONE CONFIG (GITHUB PAGES UCHUN ENG TOZA VARIANT)
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  // ⚠️ SHU YERGA FIREBASE KONSOLIDAN OLINGAN TO'G'RI WEB API KEYINGIZNI QO'YING:
  apiKey: "AIzaSyBclBgDzUtL66p3ws-j_1uu0dqWGb_Y5_U", 
  authDomain: "kelajak-texnalogiyalari.firebaseapp.com",
  projectId: "kelajak-texnalogiyalari",
  storageBucket: "kelajak-texnalogiyalari.appspot.com",
  messagingSenderId: "41591990724",
  appId: "1:41591990724:web:f6c88e9224860907c3fead"
};

// Tizimni ishga tushirish
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Ikkinchi auth (O'quvchi qo'shganda admin sessiyasi o'chmasligi uchun)
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

// ID-ni email formatiga o'tkazuvchi yordamchi funksiya
function idToEmail(id) {
  if (id.includes("@")) return id; 
  return `${id}@kt-portal.local`; 
}

// FIREBASE-CONFIG.JS ENGI PASTKI QISMI:
export { 
  auth, db, secondaryAuth, idToEmail,
  onAuthStateChanged, signOut, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, // <-- MANA SHU QATORNI QO'SHISH SHART!
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, onSnapshot, serverTimestamp, increment
};
