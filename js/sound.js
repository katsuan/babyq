// ジェンダーリビール：発表の音（Web Audio で作る。音のファイルは使わない）
// 読まれるところ：index.html（app.js の前）。app.js が window.RevealSound.create(音を出すか) で使う
(function () {
  "use strict";

  // 音を出す道具をつくる。isOn() が false のときは鳴らさない
  function create(isOn) {
    let ac = null;
    // 音の準備（AudioContext）
    function audio() { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); return ac; }
    // 音を1つ鳴らす（高さ・長さ・音色・大きさ・鳴りはじめ）
    function tone(freq, dur = .15, type = "sine", vol = .2, when = 0) {
      if (!isOn()) return;
      const c = audio(), t = c.currentTime + when;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur);
    }
    // 心音「ドクン、ドクン」: 低いサイン波の2連打を1秒周期で
    function heartbeat(beats) {
      if (!isOn()) return;
      const c = audio();
      for (let i = 0; i < beats; i++) {
        [0, 0.18].forEach((off, k) => {
          const t = c.currentTime + i * 1.0 + off;
          const o = c.createOscillator(), g = c.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(k ? 70 : 85, t);
          o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(k ? 0.35 : 0.5, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
          o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.22);
        });
      }
    }
    // 発表のときのファンファーレ
    function fanfare() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, .35, "triangle", .22, i * .12));
      [784, 1047, 1319].forEach(f => tone(f, 1.2, "triangle", .12, .55));
    }
    // iOS 対策：さわったときに音を鳴らせるようにする（音を出す設定のときだけ）
    function unlock() { if (isOn()) audio().resume?.(); }
    return { tone, heartbeat, fanfare, unlock };
  }

  window.RevealSound = { create };
})();
