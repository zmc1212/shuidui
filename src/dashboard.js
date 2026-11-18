/* 仪表盘:①轴速+频率 ②四碓高度相位曲线 ③单碓周期 ④撞击鼓点 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";
  var rodHist = [[], [], [], []];   // 各碓 h 历史

  MECH.DASH = { panels: [
    { title: "RATE · 轴速与频率", meta: "4 拨杆 · nω/2π", dot: "teal",
      html: '<div class="big" id="d-f">0.00</div><div class="k">舂击 次/s</div>' +
            '<div class="bar"><i id="d-bar"></i></div>' +
            '<div class="rowline"><span>轴速</span><b id="d-rpm">0.0 RPM</b></div>' +
            '<div class="chip" id="d-chip">停轴</div>',
      init: initRate, draw: drawRate },
    { title: "PHASE · 四碓高度", meta: "90° 等相差", dot: "blue", canvasH: 96, draw: drawPhase },
    { title: "CYCLE · 单碓周期", meta: "压下/滑脱/落体", dot: "yellow", canvasH: 96, draw: drawCycle },
    { title: "IMPACT · 撞击鼓点", meta: "窗口 12s", dot: "green", canvasH: 96, draw: drawImpact }
  ] };
  var colors = ["#7FD8D8", "#E9C93C", "#E86A9E", "#6FBF73"];

  function initRate(sec) {
    el.f = sec.querySelector("#d-f");
    el.bar = sec.querySelector("#d-bar");
    el.rpm = sec.querySelector("#d-rpm");
    el.chip = sec.querySelector("#d-chip");
  }

  function drawRate(st, ph, pt, ctx, w, h) {
    var f = D.freqOf(st.omega);
    if (el.f) el.f.textContent = f.toFixed(2);
    if (el.bar) el.bar.style.width = Math.min(100, f / 2 * 100) + "%";
    if (el.rpm) el.rpm.textContent = (st.omega / (2 * Math.PI) * 60).toFixed(1) + " RPM";
    if (el.chip) {
      if (st.omega > 0.3) {
        el.chip.textContent = "四碓轮击 · t落体 " + D.tFall.toFixed(2) + " s";
        el.chip.className = "chip on";
      } else { el.chip.textContent = "停轴"; el.chip.className = "chip"; }
    }
  }

  /* ② 四碓 h-φ 曲线(一条周期曲线 + 四个当前相位点) */
  function drawPhase(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var mid = h - 16, top = 8;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    /* 模型曲线:h(γ) 压下线性 + 落体抛物线(示意横轴 = 拨杆角) */
    ctx.strokeStyle = "rgba(233,238,242,0.35)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    var N = 120;
    for (var i = 0; i <= N; i++) {
      var rel = (i / N * 2 - 1) * D.contactHalf;         // γ−contactC: +half→−half
      var hh;
      if (rel > -D.contactHalf) {
        hh = D.hMax * Math.max(0, (rel + D.contactHalf) / (2 * D.contactHalf) * 2 - 1) * 1;
        hh = D.hMax * Math.max(0, 1 - Math.abs(rel + D.contactHalf * 0.5) / D.contactHalf);
      } else hh = 0;
      var px = i / N * w, py = mid - hh / D.hMax * (mid - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    /* 四碓当前点(相位差 90° = 横向 1/8 周期错布) */
    for (var k = 0; k < 4; k++) {
      var hh2 = st.rods[k].h;
      var px2 = ((k / 4) * 2 * D.contactHalf + D.contactHalf) / (2 * D.contactHalf) * w;
      px2 = (0.5 + (k - 1.5) * 0.25) * w;                // 四点均布示意
      var py2 = mid - hh2 / D.hMax * (mid - top);
      ctx.fillStyle = colors[k];
      ctx.beginPath(); ctx.arc(px2, py2, 3.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("拨杆角 →", w - 52, mid + 10);
    ctx.fillText("h_max 0.62", 4, top + 8);
  }

  /* ③ 单碓周期:0 号碓 h 时间历史(滚窗) */
  function drawCycle(st, ph, pt, ctx, w, h) {
    var r0 = st.rods[0];
    rodHist[0].push(r0.h);
    if (rodHist[0].length > 180) rodHist[0].shift();
    ctx.clearRect(0, 0, w, h);
    var mid = h - 14, top = 8;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.strokeStyle = "#E9C93C";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i < rodHist[0].length; i++) {
      var px = i / 179 * w, py = mid - rodHist[0][i] / D.hMax * (mid - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    /* 分段标注 */
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("压下(拨杆) → 滑脱 → 自由落体 0.356s → 击臼 → 静息", 4, top + 9);
    ctx.fillText("0 号碓 h(t)", w - 64, top + 9);
  }

  /* ④ 撞击鼓点:四色点按时间轴 */
  function drawImpact(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, h - 14); ctx.lineTo(w, h - 14); ctx.stroke();
    var span = 12;
    for (var i = 0; i < st.impactTimes.length; i++) {
      var dt = st.time - st.impactTimes[i].t;
      if (dt > span) continue;
      var x = w - dt / span * w;
      ctx.fillStyle = colors[st.impactTimes[i].k];
      ctx.beginPath(); ctx.arc(x, h - 20, 3, 0, Math.PI * 2); ctx.fill();
    }
    var total = st.impacts[0] + st.impacts[1] + st.impacts[2] + st.impacts[3];
    ctx.fillStyle = "#E9EEF2";
    ctx.font = "800 15px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(String(total), 4, 20);
    ctx.fillStyle = soft;
    ctx.font = "600 8px Menlo, monospace";
    ctx.fillText("累计击 · 四色 = 四碓", 34, 20);
    var per = [0, 1, 2, 3].map(function (k) { return st.impacts[k]; });
    ctx.fillText("分碓 " + per.join("/"), 4, 34);
  }
})(window.MECH = window.MECH || {});
