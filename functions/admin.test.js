const test = require("node:test");
const assert = require("node:assert/strict");
const { ADMIN_EMAIL, isAdminToken, ensureAdminUser } = require("./admin");

test("sadece doğrulanmış yönetici e-postası kabul edilir", () => {
  assert.equal(isAdminToken({ email: ADMIN_EMAIL, email_verified: true }), true);
  assert.equal(isAdminToken({ email: ADMIN_EMAIL, email_verified: false }), false, "doğrulanmamış hesap");
  assert.equal(isAdminToken({ email: ADMIN_EMAIL }), false, "email_verified yok");
  assert.equal(isAdminToken({ email: "baska@gmail.com", email_verified: true }), false, "başka e-posta");
  assert.equal(isAdminToken({ email: ADMIN_EMAIL.toUpperCase(), email_verified: true }), false, "büyük harfli taklit");
  assert.equal(isAdminToken({ email: "x" + ADMIN_EMAIL, email_verified: true }), false);
  assert.equal(isAdminToken(null), false);
  assert.equal(isAdminToken(undefined), false);
});

/** Bellekte çalışan sahte auth. */
function fakeAuth(initial) {
  const log = [];
  let user = initial || null;
  return {
    log,
    get user() { return user; },
    async getUserByEmail(email) {
      log.push(["get", email]);
      if (!user) throw Object.assign(new Error("yok"), { code: "auth/user-not-found" });
      return user;
    },
    async createUser(props) { log.push(["create", props.email, props.emailVerified]); user = { uid: "yeni", ...props }; return user; },
    async deleteUser(uid) { log.push(["delete", uid]); user = null; },
  };
}

test("hesap yoksa doğrulanmış olarak açılır, şifre rastgele ve uzundur", async () => {
  const a = fakeAuth(null);
  assert.equal(await ensureAdminUser(a), "created");
  assert.equal(a.user.email, ADMIN_EMAIL);
  assert.equal(a.user.emailVerified, true);
  assert.ok(a.user.password.length >= 24);
});

test("doğrulanmış hesaba dokunulmaz", async () => {
  const a = fakeAuth({ uid: "u1", email: ADMIN_EMAIL, emailVerified: true });
  assert.equal(await ensureAdminUser(a), "exists");
  assert.deepEqual(a.log.map((x) => x[0]), ["get"], "sadece okundu, silme/oluşturma yok");
});

test("doğrulanmamış hesap (başkası önceden kaydetmiş olabilir) silinip yeniden açılır", async () => {
  const a = fakeAuth({ uid: "saldirgan", email: ADMIN_EMAIL, emailVerified: false, password: "saldirganin-sifresi" });
  assert.equal(await ensureAdminUser(a), "recreated");
  assert.deepEqual(a.log.map((x) => x[0]), ["get", "delete", "create"]);
  assert.notEqual(a.user.password, "saldirganin-sifresi");
  assert.equal(a.user.emailVerified, true);
});

test("beklenmeyen Firebase hatası yutulmaz", async () => {
  const a = fakeAuth(null);
  a.getUserByEmail = async () => { throw Object.assign(new Error("ağ"), { code: "auth/internal-error" }); };
  await assert.rejects(() => ensureAdminUser(a), /ağ/);
});
