/* 时间线(48s):轴轮 → 铰柱臼 → 四碓杆 → 碓棚 → 常速连舂 → 单碓特写 → 快速 → 总结 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "axle", name: "AXLE · 碓轴立轮拨杆", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.18, r: 7.6, target: [0, 1.6, 0.8] }, drift: 0.03 },
    { id: "frame", name: "FRAME · 铰柱与石臼", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.45, phi: 1.20, r: 7.0, target: [1.5, 1.2, 0] }, drift: 0.015 },
    { id: "rods", name: "RODS · 四碓杆落铰", dur: 6, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.16, r: 6.4, target: [1.5, 1.4, 0] }, drift: 0.015 },
    { id: "shed", name: "SHED · 碓棚地台", dur: 4, dot: "blue", mode: "ASSEMBLING",
      cam: { theta: -0.85, phi: 1.22, r: 8.2, target: [0.8, 1.2, 0] }, drift: 0.02 },
    { id: "slow", name: "POUND · 常速连舂 1.1 rad/s", dur: 7, dot: "green", mode: "POUNDING",
      cam: { theta: 0.75, phi: 1.20, r: 8.6, target: [1.0, 1.4, 0] }, drift: 0.012 },
    { id: "one", name: "CLOSE · 单碓特写(1 号)", dur: 6, dot: "yellow", mode: "POUNDING",
      cam: { theta: 0.95, phi: 1.22, r: 4.6, target: [2.2, 1.1, 1.35] }, drift: 0.006 },
    { id: "fast", name: "FAST · 快速连舂 1.8 rad/s", dur: 7, dot: "pink", mode: "FAST",
      cam: { theta: -0.55, phi: 1.16, r: 8.8, target: [1.0, 1.5, 0] }, drift: 0.02 },
    { id: "summary", name: "SUMMARY · 相位与频率", dur: 5, dot: "green", mode: "REVIEW",
      cam: { theta: 0.0, phi: 1.10, r: 9.6, target: [1.0, 1.5, 0] }, drift: 0.05 }
  ];
  MECH.PHASE_IDS = ["axle", "frame", "rods", "shed", "slow", "one", "fast", "summary"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) { st.lastPhase = ph.id; st.impactTimes = []; }
    if (ph.id === "slow" || ph.id === "one") st.omegaTarget = D.k.slow;
    else if (ph.id === "fast") st.omegaTarget = D.k.fast;
    else st.omegaTarget = 0;
    var imp0 = st.impacts[0] + st.impacts[1] + st.impacts[2] + st.impacts[3];
    KS.step(st, dt);
    var imp1 = st.impacts[0] + st.impacts[1] + st.impacts[2] + st.impacts[3];
    /* 撞击 → 尘粒(臼位) */
    if (imp1 > imp0 && ph.id !== "summary") {
      var n = Math.min(3, imp1 - imp0);
      for (var i = 0; i < n; i++) {
        var zk = D.rodZ[(k = imp1 % 4)];
        MECH.Scene3D.spawnPuff(D.mortarX, 0.62, D.rodZ[(imp1 - 1) % 4], {
          max: 0.75, base: 0.3, vx: 0.25 + Math.random() * 0.2, vy: 0.5 + Math.random() * 0.3,
          vz: (Math.random() - 0.5) * 0.2, opacity: 0.55, tint: 0xC9B89A, grow: 1.6
        });
      }
    }
    /* 水流粒子冲轮缘 */
    if (st.omega > 0.4 && Math.random() < dt * 6) {
      MECH.Scene3D.spawnPuff(-2.6 + Math.random() * 1.2, 0.42, 2.25, {
        max: 1.0, base: 0.34, vx: 1.3, vy: 0.1, vz: 0, opacity: 0.4, tint: 0x9FD4E8, grow: 1.3
      });
    }
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (ph.id === "slow" || ph.id === "one" || ph.id === "fast") {
      pill = ph.name + " · " + D.freqOf(st.omega).toFixed(2) + " 次/s";
    }
    var total = st.impacts[0] + st.impacts[1] + st.impacts[2] + st.impacts[3];
    return {
      mode: ph.mode,
      hot: ph.id === "fast",
      pill: pill,
      a: (st.omega / (2 * Math.PI) * 60).toFixed(1) + " RPM",
      b: D.freqOf(st.omega).toFixed(2) + " 次/s",
      c: "累计 " + total + " 击"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "axle") return [
      { id: "p-ax", obj: E("axle"), text: "碓轴 + 拨杆×4 · 相位差 90°" },
      { id: "p-wh", obj: E("wheel"), text: "立轮 R 1.3 · 水驱动", tone: "white" }
    ];
    if (ph.id === "rods") return [
      { id: "p-r0", obj: E("rod0"), text: "碓杆 · 铰点力臂 0.8 / 2.2" },
      { id: "p-r2", obj: E("rod2"), text: "杆尾受拨杆压下 0.225 → 头抬 0.62", tone: "white" }
    ];
    if (ph.id === "one") return [{ id: "p-r1", obj: E("rod1"), text: "1 号碓 · 压下-滑脱-落体-击臼" }];
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "summary") return [
      { id: "p-m", obj: E("mortars"), text: "石臼 · 落体 t=0.36s", tone: "white" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
