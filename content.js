import { defaults } from "./defaults.js";
import { firebaseConfig, configured } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const app = configured ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;
const ref = () => doc(db, "site", "content");

export async function loadContent() {
  if (!db) return defaults;
  try {
    const snap = await getDoc(ref());
    return snap.exists() ? { ...defaults, ...snap.data() } : defaults;
  } catch (e) {
    console.error(e);
    return defaults;
  }
}

export async function saveContent(data) {
  if (!db) throw new Error("Firebase henüz bağlanmadı.");
  await setDoc(ref(), data);
}
