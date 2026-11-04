// ジェンダーリビール：発表の紙ふぶき（キャンバスに描く）
// 読まれるところ：index.html（app.js の前）。app.js が window.RevealConfetti.create(キャンバス, ふらせ続けるか) で使う
(function () {
  "use strict";

  // 紙ふぶきの道具をつくる。keepRaining() が false になったら、ふらせるのをやめる
  function create(cv, keepRaining) {
    const ctx = cv.getContext("2d");
    let parts = [], raf = null;
    // キャンバスは実際の表示サイズ(clientWidth/Height)に合わせる。スマホでツールバーが出入りすると
    // innerHeight だけ変わって resize が来ないことがあるので、visualViewport の変化でも合わせ直す
    function resize() {
      cv.width = cv.clientWidth * devicePixelRatio; cv.height = cv.clientHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    addEventListener("resize", resize); window.visualViewport?.addEventListener("resize", resize); resize();
    // 画面の高さではなくキャンバス全体を消す(一部だけ消し残して紙吹雪が帯状に残るのを防ぐ)
    function clearAll() { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.restore(); }
    // 紙ふぶきを1回はじけさせる
    function burst(colors, count = 180, origin = { x: innerWidth / 2, y: innerHeight * .45 }) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 9;
        parts.push({
          x: origin.x, y: origin.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6,
          w: 6 + Math.random() * 6, h: 8 + Math.random() * 10, r: Math.random() * 6, vr: (Math.random() - .5) * .3,
          c: colors[i % colors.length], life: 0, max: 160 + Math.random() * 80, shape: Math.random() < .25 ? "c" : "r",
        });
      }
      if (!raf) loop();
    }
    // 紙ふぶきを secs 秒ふらせる
    function rain(colors, secs = 4) {
      const end = Date.now() + secs * 1000;
      (function drop() {
        for (let i = 0; i < 6; i++) parts.push({
          x: Math.random() * innerWidth, y: -20, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3,
          w: 6 + Math.random() * 5, h: 8 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .2,
          c: colors[Math.floor(Math.random() * colors.length)], life: 0, max: 400, shape: Math.random() < .25 ? "c" : "r",
        });
        if (!raf) loop();
        if (Date.now() < end && keepRaining()) setTimeout(drop, 60);
      })();
    }
    // 紙ふぶきを1こま進めて描く（残りがあれば続ける）
    function loop() {
      clearAll();
      parts = parts.filter(p => p.life < p.max && p.y < cv.clientHeight + 40);
      for (const p of parts) {
        p.life++; p.vy += .18; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.min(1, (p.max - p.life) / 40);
        if (p.shape === "c") { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r)));
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(loop) : null;
      if (!raf) clearAll();
    }
    // ちらばっている紙ふぶきを、なしにする（次のこまで消える）
    function reset() { parts = []; }
    return { burst, rain, reset };
  }

  window.RevealConfetti = { create };
})();
