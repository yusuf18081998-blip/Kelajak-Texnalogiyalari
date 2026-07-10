// ==========================================================================
// FIREBASE INITSIALIZATSIYASI — barcha sahifalar shu fayldan foydalanadi
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, onSnapshot, serverTimestamp, getDocs, increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig, ID_DOMAIN } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Ikkinchi (yordamchi) Firebase instance — admin yangi o'quvchi/hisob yaratganda
// o'zining joriy sessiyasidan chiqib ketmasligi uchun kerak.
export const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);

export {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword,
  doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, orderBy, onSnapshot, serverTimestamp, getDocs, increment,
  ref, uploadBytes, getDownloadURL, ID_DOMAIN
};

// ID'ni Firebase Auth uchun soxta emailga aylantiruvchi yordamchi funksiya
export function idToEmail(id) {
  return id.trim().toLowerCase() + ID_DOMAIN;
}
