// Güvenlik kuralı testleri. Çalıştırmak için (repo kökünden):
//   npx firebase-tools emulators:exec --only firestore,storage --project demo-gezgin "npm test --prefix rules-tests"
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { initializeTestEnvironment, assertFails, assertSucceeds } = require("@firebase/rules-unit-testing");
const { doc, getDoc, setDoc, deleteDoc } = require("firebase/firestore");
const { ref, uploadBytes, deleteObject, getBytes } = require("firebase/storage");

const ADMIN = "umitkurt360@gmail.com";
let env;

test.before(async () => {
  const root = path.join(__dirname, "..");
  env = await initializeTestEnvironment({
    projectId: "demo-gezgin",
    firestore: { rules: fs.readFileSync(path.join(root, "firestore.rules"), "utf8") },
    storage: { rules: fs.readFileSync(path.join(root, "storage.rules"), "utf8") },
  });
});
test.after(async () => env && (await env.cleanup()));

const who = {
  anon: () => env.unauthenticatedContext(),
  admin: () => env.authenticatedContext("u-admin", { email: ADMIN, email_verified: true }),
  adminUnverified: () => env.authenticatedContext("u-unv", { email: ADMIN, email_verified: false }),
  other: () => env.authenticatedContext("u-other", { email: "baska@gmail.com", email_verified: true }),
  lookalike: () => env.authenticatedContext("u-look", { email: ADMIN.toUpperCase(), email_verified: true }),
};

test("Firestore: herkes site içeriğini okur", async () => {
  await assertSucceeds(getDoc(doc(who.anon().firestore(), "site/content")));
});

test("Firestore: sadece doğrulanmış yönetici site içeriğini yazar", async () => {
  const d = (c) => doc(c.firestore(), "site/content");
  await assertSucceeds(setDoc(d(who.admin()), { businessName: "Gezgin" }));
  await assertFails(setDoc(d(who.anon()), { x: 1 }));
  await assertFails(setDoc(d(who.other()), { x: 1 }));
  await assertFails(setDoc(d(who.adminUnverified()), { x: 1 }));
  await assertFails(setDoc(d(who.lookalike()), { x: 1 }));
  await assertFails(deleteDoc(d(who.other())));
});

test("Firestore: başka koleksiyonlar (leads, kullanım sayaçları) kimseye açık değil, yönetici dahil", async () => {
  for (const col of ["leads", "usage", "quoteUsage", "adminSetupUsage"]) {
    for (const c of [who.anon(), who.other(), who.admin()]) {
      const db = c.firestore(); // her bağlamdan bir kez alınır
      await assertFails(getDoc(doc(db, `${col}/x`)));
      await assertFails(setDoc(doc(db, `${col}/x`), { a: 1 }));
    }
  }
});

const img = () => ({ bytes: new Uint8Array(1024), meta: { contentType: "image/jpeg" } });
const put = (c, p, bytes = img().bytes, meta = img().meta) => uploadBytes(ref(c.storage(), p), bytes, meta);

test("Storage: sadece doğrulanmış yönetici resim yükler", async () => {
  await assertSucceeds(put(who.admin(), "gallery/ok.jpg"));
  await assertFails(put(who.anon(), "gallery/a.jpg"));
  await assertFails(put(who.other(), "gallery/b.jpg"));
  await assertFails(put(who.adminUnverified(), "gallery/c.jpg"));
  await assertFails(put(who.lookalike(), "gallery/d.jpg"));
});

test("Storage: yönetici bile resim dışı ya da 5 MB üstü dosya yükleyemez, galeri dışına yazamaz", async () => {
  await assertFails(put(who.admin(), "gallery/x.pdf", new Uint8Array(10), { contentType: "application/pdf" }));
  await assertFails(put(who.admin(), "gallery/big.jpg", new Uint8Array(5 * 1024 * 1024 + 1), { contentType: "image/jpeg" }));
  await assertFails(put(who.admin(), "baska/yer.jpg"));
});

test("Storage: resimler herkese okunur, yönetici dışında kimse üzerine yazamaz ya da silemez", async () => {
  await assertSucceeds(getBytes(ref(who.anon().storage(), "gallery/ok.jpg")));
  for (const c of [who.anon(), who.other(), who.adminUnverified(), who.lookalike()]) {
    await assertFails(put(c, "gallery/ok.jpg"));
    await assertFails(deleteObject(ref(c.storage(), "gallery/ok.jpg")));
  }
});
