/* 水碓部件建模与注册(约 22 件)。
   布局:碓轴沿 Z(y=1.55),立轮在 x-y 平面(z=+2.25)绕轴转(CW);
   轴上 4 组拨杆(z=±1.35/±0.45)相位差 90°;碓杆 4 根沿 X,铰点 x=1.17,
   杆尾伸至拨杆回转带(x=0.37),碓头端石杵落于臼(x=3.37)。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  function buildPond() {
    var g = group();
    var water = P.mesh(new THREE.PlaneGeometry(3.6, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x2E6E8E, transparent: true, opacity: 0.6, roughness: 0.24 }), -2.0, 0.5, 2.25, false, true);
    water.rotation.x = -Math.PI / 2;
    g.add(water);
    g.add(P.box(0.28, 0.52, 3.3, M3.stone, -3.7, 0.26, 2.25));
    return g;
  }

  /* 立轮:轮缘双圈 + 12 辐 + 轮毂(XY 平面,法线 Z)+ 轮叶 8 片(受水) */
  function buildWheel() {
    var g = group();
    g.add(P.torus(D.R, 0.06, M3.woodD, 0, 0, 0, 48));
    g.add(P.torus(D.R - 0.18, 0.045, M3.wood, 0, 0, 0, 44));
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2;
      var s = P.box(0.065, D.R - 0.16, 0.05, M3.wood, 0, 0, 0);
      s.position.set(Math.cos(a) * (0.14 + (D.R - 0.16) / 2), Math.sin(a) * (0.14 + (D.R - 0.16) / 2), 0);
      s.rotation.z = a - Math.PI / 2;
      g.add(s);
    }
    for (var j = 0; j < 8; j++) {
      var a2 = j / 8 * Math.PI * 2 + Math.PI / 16;
      var b = P.box(0.55, 0.16, 0.02, M3.woodL, 0, 0, 0);
      b.position.set(Math.cos(a2) * (D.R - 0.33), Math.sin(a2) * (D.R - 0.33), 0.10);
      b.rotation.z = a2 + Math.PI / 2;
      g.add(b);
    }
    var hub = P.cyl(0.14, 0.14, 0.26, M3.woodD, 0, 0, 0, 16);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    return { group: g };
  }

  function buildAxle() {   // 碓轴 + 拨杆 ×4(挂轴上,随轴转)
    var g = group();
    var axle = P.cyl(0.09, 0.09, D.axleL, M3.woodD, 0, 0, 0, 14);
    axle.rotation.x = P.ROTX;
    g.add(axle);
    var bars = [];
    for (var k = 0; k < D.paddleN; k++) {
      var mount = D.contactC + k * Math.PI / 2;
      var b = group();
      b.rotation.z = mount;                    // 静置安装角(KINE 每帧改)
      var bar = P.box(2 * D.rBar, 0.07, D.barLen, M3.woodL, D.rBar, 0, 0);   // 杆沿 +x 伸出
      b.add(bar);
      var tip = P.box(0.16, 0.10, D.barLen * 0.96, M3.iron, D.rBar - 0.05, 0, 0);
      b.add(tip);
      b.position.set(0, 0, D.zPaddles[k]);
      g.add(b);
      bars.push(b);
    }
    g.userData.anim = { bars: bars };
    return { group: g };
  }

  function buildFrame() {   // 轴承支架 ×2 + 地台
    var g = group();
    [-2.3, 2.3].forEach(function (z) {
      g.add(P.box(0.22, D.yC + 0.15, 0.22, M3.woodD, 0, (D.yC + 0.15) / 2, z));
      g.add(P.cyl(0.10, 0.10, 0.16, M3.iron, 0, D.yC, z, 12));
      g.add(P.box(0.36, 0.10, 0.5, M3.stone, 0, 0.05, z));
    });
    g.add(P.box(0.24, 0.24, D.axleL - 0.6, M3.woodD, 0, 0.12, 0));
    return g;
  }

  function buildHinges() {  // 铰柱横梁 ×4
    var g = group();
    D.rodZ.forEach(function (z) {
      g.add(P.box(0.14, D.yHinge - 0.1, 0.14, M3.woodD, D.xHinge, (D.yHinge - 0.1) / 2, z));
      g.add(P.cyl(0.035, 0.035, 0.24, M3.iron, D.xHinge, D.yHinge, z, 10));
      g.add(P.box(0.3, 0.08, 0.3, M3.stone, D.xHinge, 0.04, z));
    });
    g.add(P.box(0.10, 0.10, 4.1, M3.woodD, D.xHinge, D.yHinge + 0.16, 0));   // 上拉梁
    return g;
  }

  function buildRod(k) {    // 碓杆 + 石杵(铰点为原点;局部 +x = 头端)
    var g = group();
    var beam = P.box(D.rodL, 0.10, 0.11, M3.wood, D.xHinge * 0 + D.armHead - D.rodL / 2, 0, 0);
    g.add(beam);
    var pestle = P.cyl(D.pestleR * 0.85, D.pestleR, D.pestleL, M3.stone, D.armHead, -D.pestleL / 2 - 0.05, 0, 14);
    g.add(pestle);
    var cap = P.cyl(D.pestleR * 1.05, D.pestleR * 0.9, 0.09, M3.iron, D.armHead, -0.06, 0, 14);
    g.add(cap);
    var tailWeight = P.box(0.16, 0.13, 0.13, M3.iron, -D.armTail + 0.06, 0, 0);   // 尾端配重
    g.add(tailWeight);
    g.userData.k = k;
    return { group: g };
  }

  function buildMortars() { // 石臼 ×4 + 谷物
    var g = group();
    D.rodZ.forEach(function (z) {
      g.add(P.cyl(D.mortarR + 0.08, D.mortarR + 0.12, 0.30, M3.stone, D.mortarX, 0.15, z, 20));
      var grain = P.cyl(D.mortarR - 0.03, D.mortarR - 0.05, 0.10, new THREE.MeshStandardMaterial({ color: 0xD8C08E, roughness: 0.9 }), D.mortarX, 0.32, z, 16);
      g.add(grain);
    });
    return g;
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "pond", name: "POND · 水池", sub: "world 固定 · 冲轮下缘", phase: 0, kind: "none", world: true,
      build: buildPond, target: [0, 0, 0] });
    def({ id: "frame", name: "FRAME · 轴承支架", sub: "双柱石础", phase: 0, at: 0.15, dur: 1.1,
      build: buildFrame, target: [0, 0, 0], start: [0, 4.8, 3.2], mid: [0, 2.8, 1.4], anchor: [0, 1.3, 0.5] });
    def({ id: "axle", name: "AXLE · 碓轴 + 拨杆×4", sub: "半径 0.58 · 相位差 90°", phase: 0, at: 1.4, dur: 1.3, kind: "kine",
      build: buildAxle, target: [0, D.yC, 0], off: [0, 1.2, 6.5] });
    def({ id: "wheel", name: "WHEEL · 立轮", sub: "R 1.3 · 12 辐 8 叶", phase: 0, at: 2.4, dur: 1.4, kind: "kine",
      build: buildWheel, target: [0, D.yC, 2.25], off: [0, 0.9, 7.5] });

    def({ id: "hinges", name: "HINGES · 铰柱×4", sub: "横梁 + 铰销", phase: 1, at: 5.2, dur: 1.2,
      build: buildHinges, target: [0, 0, 0], start: [2.5, 4.6, 0], mid: [1.5, 2.6, 0.4], anchor: [D.xHinge, 1.4, 0.5] });
    def({ id: "mortars", name: "MORTARS · 石臼×4", sub: "谷物满臼", phase: 1, at: 6.2, dur: 1.2,
      build: buildMortars, target: [0, 0, 0], start: [4.6, 2.8, 0], mid: [3.8, 1.6, 0.3], anchor: [D.mortarX, 0.4, 0.6] });

    /* 4 根碓杆(kine,铰点为原点) */
    for (var k = 0; k < D.paddleN; k++) {
      def({ id: "rod" + k, name: "ROD · 碓杆 " + (k + 1), sub: "力臂比 2.2:0.8 · 石杵",
        phase: 2, at: 7.3 + k * 0.7, dur: 0.9, kind: "kine",
        build: (function (kk) { return function () { return buildRod(kk); }; })(k),
        target: [D.xHinge, D.yHinge, D.rodZ[k]], off: [0.8, 1.6, (k % 2 ? 1.2 : -1.2)] });
    }

    def({ id: "shed", name: "SHED · 碓棚地台", sub: "工作面", phase: 3, kind: "none",
      build: function () {
        var g = group();
        g.add(P.box(6.6, 0.06, 4.4, M3.woodD, 0.6, 0.03, 0));
        return g;
      }, target: [0, 0, 0], anchor: null });
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    var rot = -st.phi;                        // 立轮与轴同步(CW)
    var e = MECH.Parts.entry("axle");
    if (e && e.shown) {
      e.group.rotation.z = rot;
      e.group.userData.anim.bars.forEach(function (b, k) {
        b.rotation.z = D.contactC + k * Math.PI / 2;   // 安装角固定(随轴转)
      });
    }
    e = MECH.Parts.entry("wheel");
    if (e && e.shown) e.group.rotation.z = rot;
    for (var k = 0; k < D.paddleN; k++) {
      var rd = MECH.Parts.entry("rod" + k);
      if (!rd || !rd.shown) continue;
      var r = st.rods[k];
      rd.group.rotation.z = D.theta0 + r.h / D.armHead;
    }
  };
})(window.MECH = window.MECH || {});
