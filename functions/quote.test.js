const test = require("node:test");
const assert = require("node:assert/strict");
const { validate, buildJob } = require("./quote");

const ok = {
  name: "Ayşe Yılmaz",
  phone: "0538 604 91 40",
  category: "PLUMBING",
  description: "Mutfak eviyesinin altında su kaçağı var, tamir edilmesi gerekiyor.",
  city: "İstanbul",
  district: "Kadıköy",
};

test("geçerli form kabul edilir", () => {
  const r = validate(ok);
  assert.equal(r.error, undefined);
  assert.equal(r.value.category, "PLUMBING");
});

test("eksik ya da bozuk alanlar reddedilir", () => {
  assert.match(validate({ ...ok, name: "" }).error, /Adınızı/);
  assert.match(validate({ ...ok, phone: "123" }).error, /telefon/);
  assert.match(validate({ ...ok, category: "HACK" }).error, /İş türünü/);
  assert.match(validate({ ...ok, description: "kısa" }).error, /en az 10/);
  assert.match(validate({ ...ok, description: "x".repeat(2001) }).error, /2000/);
  assert.match(validate({ ...ok, city: "" }).error, /İl/);
  assert.match(validate({ ...ok, district: "" }).error, /İlçe/);
  assert.ok(validate(null).error);
});

test("hazır olmayan kategori adı gibi prototip anahtarları geçmez", () => {
  assert.ok(validate({ ...ok, category: "constructor" }).error);
  assert.ok(validate({ ...ok, category: "__proto__" }).error);
});

test("ilan başlığı 5-120 karakter, telefon ve ad ilana girmez", () => {
  const v = validate({ ...ok, description: "a".repeat(500) }).value;
  const job = buildJob(v);
  assert.ok(job.title.length >= 5 && job.title.length <= 120);
  assert.ok(job.description.length >= 10 && job.description.length <= 5000);
  assert.equal(job.category, "PLUMBING");
  assert.ok(!JSON.stringify(job).includes("604 91 40"));
  assert.ok(!JSON.stringify(job).includes("Ayşe"));
});

test("yedek kategori OTHER olunca açıklamaya asıl iş türü yazılır", () => {
  const v = validate({ ...ok, category: "FIRE_PROTECTION" }).value;
  const job = buildJob(v, "OTHER");
  assert.equal(job.category, "OTHER");
  assert.match(job.description, /^\[Yangın tesisatı\]/);
});
