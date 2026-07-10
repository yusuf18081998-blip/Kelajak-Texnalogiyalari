// ==========================================================================
// FIREBASE ALL-IN-ONE CONFIG (CDN TO'LIQ MANZILLARI BILAN)
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
  // ⚠️ BU YERGA BOYAGI O'ZINGIZNING TO'G'RI WEB API KEYINGIZNI QO'YING:
  apiKey: "AIzaSyBg1rqBJtTlsapTrws-j-laa0dqUzB_y-4",
  authDomain: "kelajak-texnalogiyalari.firebaseapp.com",
  projectId: "kelajak-texnalogiyalari",
  storageBucket: "kelajak-texnalogiyalari.firebasestorage.app",
  messagingSenderId: "415919389784",
  appId: "1:415919389784:web:f6c88e922486d907c51e2d",
  measurementId: "G-HEPK72DZCW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

function idToEmail(id) {
  if (id.includes("@")) return id; 
  return `${id}@kt-portal.local`; 
}

export { 
  auth, db, secondaryAuth, idToEmail,
  onAuthStateChanged, signOut, createUserWithEmailAndPassword,
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, onSnapshot, serverTimestamp, increment
};