// ジェンダーリビール：発表の音（js/sound.js）と、ファイルを読む順番のテスト
//   node --test test/
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

// 音を鳴らした数を数える、にせの AudioContext
function fakeAudio() {
  const log = { oscillators: 0, resumed: 0 };
  const param = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
  class AC {
    constructor() { this.currentTime = 0; this.destination = {}; }
    createOscillator() { log.oscillators++; return { type: "", frequency: param, connect: (g) => g, start() {}, stop() {} }; }
    createGain() { return { gain: param, connect: (d) => d }; }
    resume() { log.resumed++; }
  }
  return { log, AC };
}

// js/sound.js を読んで、RevealSound を返す
function loadSound(AC) {
  const ctx = { window: { AudioContext: AC } };
  vm.createContext(ctx);
  vm.runInContext(read("js/sound.js"), ctx);
  return ctx.window.RevealSound;
}

test("音：音を出す設定のときだけ鳴らす（オフなら AudioContext も作らない）", () => {
  const { log, AC } = fakeAudio();
  const S = loadSound(AC);
  const off = S.create(() => false);
  off.tone(440); off.heartbeat(2); off.fanfare(); off.unlock();
  assert.equal(log.oscillators, 0);
  assert.equal(log.resumed, 0);
  const on = S.create(() => true);
  on.tone(440);
  assert.equal(log.oscillators, 1);
  on.heartbeat(2); // 1回に2つ（ドクン、ドクン）
  assert.equal(log.oscillators, 5);
  on.fanfare(); // 4つ＋3つ
  assert.equal(log.oscillators, 12);
  on.unlock();
  assert.equal(log.resumed, 1);
});

test("読む順番：発表のページは音・紙ふぶきを app.js の前に読む。前の名前の calendar.js も同じものを読む", () => {
  const html = read("index.html");
  const at = (f) => html.indexOf(`src="${f}`);
  for (const f of ["js/link.js", "js/calendar.js", "js/sound.js", "js/confetti.js"]) {
    assert.ok(at(f) > 0 && at(f) < at("app.js"), `${f} が app.js の前にない`);
  }
  const stub = read("calendar.js");
  for (const f of ["js/calendar.js", "js/sound.js", "js/confetti.js"]) assert.ok(stub.includes(`src="${f}"`), `calendar.js が ${f} を読まない`);
});
