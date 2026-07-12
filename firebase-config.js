// ==========================================================================
// FIREBASE ALL-IN-ONE CONFIG (GITHUB PAGES UCHUN ENG TOZA VARIANT)
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBg1rqBJtTlsapTrws-j-laa0dqUzB_y-4",
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
const storage = getStorage(app);

// Ikkinchi auth (O'quvchi qo'shganda admin sessiyasi o'chmasligi uchun)
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

// ID-ni email formatiga o'tkazuvchi yordamchi funksiya
function idToEmail(id) {
  if (id.includes("@")) return id;
  return `${id}@kt-portal.local`;
}

// FIREBASE-CONFIG.JS NING PASTKI QISMI — barcha eksportlar:
export {
  auth, db, storage, secondaryAuth, idToEmail,
  onAuthStateChanged, signOut, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, updatePassword,
  doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  collection, query, where, orderBy, onSnapshot, serverTimestamp, increment,
  ref, uploadBytes, getDownloadURL
};
