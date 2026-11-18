/* 水碓 — 尺寸常量与凸轮-碓杆运动学求解器
   文献依据:《天工开物·乃粒》水碓图;桓谭《新论》「役水而舂,其利百倍」。
   立轮(R 1.3)驱动水平碓轴(Z 向);轴上 4 组拨杆(半径 0.58)相位差 90°,
   自转经上缘扫过对应碓杆尾:压下 0.225 m 后滑脱,碓头自由落体击臼。
   铰杆力臂比 2.2 : 0.8;杆尾压 0.225 ⇒ 碓头抬升 h_max = 0.62(自检断言)。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    R: 1.3,                // 立轮半径
    yC: 1.55,              // 碓轴高
    axleL: 4.4,
    rBar: 0.58,            // 拨杆回转半径
    paddleN: 4,
    barLen: 0.52,
    zPaddles: [1.35, 0.45, -0.45, -1.35],
    rodL: 3.0,
    xHinge: 1.17, yHinge: 1.233,   // 铰点(尾 0.8 / 头 2.2)
    xTail: 0.37,
    armTail: 0.8, armHead: 2.2,
    theta0: Math.asin(0.0833),     // 静息杆角(头端杵底落于臼口 0.55)
    press: 0.225,                  // 杆尾压下行程
    hMax: 0.62,
    contactC: -47.5 * Math.PI / 180, contactHalf: 22.5 * Math.PI / 180,
    g: 9.8,
    rodZ: [1.35, 0.45, -0.45, -1.35],
    mortarX: 3.37, mortarR: 0.24,
    pestleR: 0.13, pestleL: 0.5,
    k: { slow: 1.1, fast: 1.8 }
  };
  D.hMax = D.press * D.armHead / D.armTail;
  D.tFall = Math.sqrt(2 * D.hMax / D.g);
  D.freqOf = function (w) { return D.paddleN * w / (2 * Math.PI); };

  var TWO_PI = Math.PI * 2;
  function norm(a) { a = a % TWO_PI; if (a < 0) a += TWO_PI; return a; }

  function newState() {
    return {
      time: 0, phi: 0, omega: 0, omegaTarget: 0,
      rods: D.rodZ.map(function (_, k) {
        return { phase0: k * Math.PI / 2, mode: 0, tF: 0, h: 0 };
      }),
      impacts: [0, 0, 0, 0], impactTimes: [],
      peakH: 0, lastPhase: ""
    };
  }

  /* 拨杆自转(轮 CW → γ 递减):γ 从 −25° 进入接触区压杆尾,−70° 滑脱 */
  function step(st, dt) {
    st.omega += (st.omegaTarget - st.omega) * Math.min(1, dt * 2.0);
    st.phi += st.omega * dt;
    st.time += dt;
    st.peakH = 0;
    for (var k = 0; k < D.paddleN; k++) {
      var r = st.rods[k];
      /* 拨杆角(CW 递减):γk = contactC + k·90° − φ;rel 过 ±half 压下并滑脱 */
      var g = norm(D.contactC + r.phase0 - st.phi);
      var rel = norm(g - D.contactC + Math.PI) - Math.PI;        // (−π, π]
      if (Math.abs(rel) < D.contactHalf) {
        var f = (rel + D.contactHalf) / (2 * D.contactHalf);     // +half→−half:0→1
        r.mode = 1;
        r.h = D.hMax * Math.min(1, Math.max(0, f));
      } else if (r.mode === 1) {
        r.mode = 2; r.tF = 0;                                    // 滑脱 → 自由落体
      }
      if (r.mode === 2) {
        r.tF += dt;
        r.h = Math.max(0, D.hMax - 0.5 * D.g * r.tF * r.tF);
        if (r.h <= 0) {
          r.mode = 0; r.h = 0;
          st.impacts[k] += 1;
          st.impactTimes.push({ t: st.time, k: k });
          if (st.impactTimes.length > 40) st.impactTimes.shift();
        }
      }
      if (r.h > st.peakH) st.peakH = r.h;
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, norm: norm };

  /* 载入期自检 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.hMax - 0.62) > 1e-9) errs.push("抬升比不自洽: " + D.hMax);
    if (Math.abs(D.tFall - Math.sqrt(2 * D.hMax / D.g)) > 1e-9) errs.push("落体时间不自洽");
    var st = newState();
    st.omegaTarget = D.k.slow;
    st.omega = D.k.slow;
    for (var i = 0; i < 900; i++) step(st, 1 / 30);
    var exp = D.paddleN * D.k.slow * 30 / TWO_PI;
    var total = st.impacts[0] + st.impacts[1] + st.impacts[2] + st.impacts[3];
    if (Math.abs(total - exp) > 3) errs.push("撞击数异常: " + total + " vs " + exp.toFixed(1));
    var lastT = -10, minGap = 10;
    st.impactTimes.forEach(function (im) {
      if (lastT > 0 && im.t - lastT < minGap) minGap = im.t - lastT;
      lastT = im.t;
    });
    if (minGap < 0.08) errs.push("两碓几乎同时击: 间隔 " + minGap.toFixed(3));
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("水碓自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
