/* 图纸面板(B 键):水碓侧视总图 + 铰杆受力详图 + 运动公式 + 尺寸表 */
(function (MECH) {
  var red = "#8C2F1E";

  function arrow(ctx, x1, y1, x2, y2, text, below) {
    ctx.strokeStyle = "rgba(42,38,32,0.4)";
    ctx.fillStyle = "rgba(42,38,32,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * dir, y2 - 3); ctx.lineTo(x2 - s * dir, y2 + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + s * dir, y1 - 3); ctx.lineTo(x1 + s * dir, y1 + 3); ctx.closePath(); ctx.fill();
    ctx.font = "600 10px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(text, (x1 + x2) / 2, below ? (y1 + 13) : (y1 - 5));
  }

  MECH.BP = {
    no: "Fig. 06 · 复原总图",
    title: "水碓 · 立轮拨杆四碓连舂",
    src: "《天工开物·乃粒》水碓图 · 桓谭《新论》「役水而舂,其利百倍」",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("h_max = 0.225×(2.2/0.8) = 0.62 m · t落体 = √(2h/g) = 0.356 s · 频率 = 4ω/2π", w * 0.045, topY - 10);

      /* ============ 左:侧视(轮 + 轴 + 一根碓杆) ============ */
      var S = Math.min(w * 0.46 / 7.4, (chainY - topY - 26) / 3.6);
      var ox = w * 0.045, oy = chainY - 16;
      var X = function (mx) { return ox + (mx + 3.0) * S; }, Y = function (my) { return oy - my * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(碓杆与轴同剖面)", ox, Y(3.4));
      /* 水面 */
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(X(-3.0), Y(0.5)); ctx.lineTo(X(-0.7), Y(0.5)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "600 9px sans-serif";
      ctx.fillText("水流 →", X(-2.9), Y(0.32));
      /* 立轮 */
      ctx.beginPath(); ctx.arc(X(0), Y(D.yC), D.R * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0), Y(D.yC), 0.16 * S, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 12; i++) {
        var a = i / 12 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(X(0), Y(D.yC));
        ctx.lineTo(X(0) + Math.cos(a) * D.R * S, Y(D.yC) - Math.sin(a) * D.R * S);
        ctx.stroke();
      }
      /* 拨杆(水平位) */
      ctx.beginPath(); ctx.moveTo(X(0), Y(D.yC)); ctx.lineTo(X(D.rBar), Y(D.yC)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0), Y(D.yC)); ctx.lineTo(X(-D.rBar), Y(D.yC)); ctx.stroke();
      /* 轴 + 支架 */
      ctx.beginPath(); ctx.moveTo(X(-2.4), Y(D.yC)); ctx.lineTo(X(2.4), Y(D.yC)); ctx.stroke();
      ctx.strokeRect(X(2.3) - 4, Y(D.yC + 0.2), 8, (D.yC + 0.2) * S);
      /* 碓杆(静息倾斜 θ0)+ 铰 + 杵 + 臼 */
      ctx.save();
      ctx.translate(X(D.xHinge), Y(D.yHinge));
      ctx.rotate(-D.theta0);
      ctx.beginPath();
      ctx.moveTo(-D.armTail * S, 0);
      ctx.lineTo(D.armHead * S, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(D.armHead * S, 0);
      ctx.lineTo(D.armHead * S, D.pestleL * S);
      ctx.stroke();
      ctx.restore();
      ctx.beginPath(); ctx.arc(X(D.xHinge), Y(D.yHinge), 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(X(D.mortarX), Y(0.15), (D.mortarR + 0.1) * S, 0, Math.PI * 2); ctx.stroke();
      ctx.fillText("铰", X(D.xHinge) + 6, Y(D.yHinge) - 4);
      ctx.fillStyle = "rgba(42,38,32,0.55)";
      ctx.fillText("石臼", X(D.mortarX) - 12, Y(0.15) + 0.34 * S);
      /* 尺寸 */
      arrow(ctx, X(0) - D.R * S, Y(-0.2), X(0) + D.R * S, Y(-0.2), "轮径 2.6m", true);
      arrow(ctx, X(D.xHinge), Y(D.yHinge + 0.45), X(D.mortarX), Y(D.yHinge + 0.45), "头臂 2.2", false);
      arrow(ctx, X(D.xHinge) - 0.8 * S, Y(D.yHinge + 0.45), X(D.xHinge), Y(D.yHinge + 0.45), "", false);
      ctx.fillStyle = "rgba(42,38,32,0.55)";
      ctx.font = "600 9px sans-serif";
      ctx.fillText("尾臂 0.8", X(D.xHinge) - 0.75 * S, Y(D.yHinge + 0.62));
      ctx.fillStyle = ink;

      /* ============ 右:运动相位图 ============ */
      var ox2 = w * 0.56;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("碓头 h-相位(压下/滑脱/落体)", ox2, topY + 18);
      var gx = ox2, gy = topY + 34, gw = w - ox2 - 24, gh = chainY - gy - 44;
      ctx.strokeStyle = "rgba(42,38,32,0.5)";
      ctx.strokeRect(gx, gy, gw, gh);
      /* 压下段(线性升)+ 落体段(抛物线降) */
      ctx.beginPath();
      var half = D.contactHalf, cc = 0;
      var N = 90;
      for (var j = 0; j <= N; j++) {
        var rel = (1 - j / N) * 2 * half - half;      // +half→−half
        var hh2;
        if (rel > -half * 0.999) hh2 = D.hMax * (rel + half) / (2 * half);
        else hh2 = 0;
        var px = gx + j / N * gw, py = gy + gh - hh2 / D.hMax * gh;
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(42,38,32,0.55)";
      ctx.font = "600 9px sans-serif";
      ctx.fillText("滑脱点", gx + gw - 26, gy + 10);
      ctx.fillText("压下(拨杆接触 ±22.5°)", gx + 6, gy + gh - 6);
      ctx.fillStyle = red;
      ctx.font = "700 10px Menlo, monospace";
      ctx.fillText("落体 t = 0.356 s", gx + gw * 0.52, gy + gh * 0.62);

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["水流冲轮", "R 1.3 · 立轮"], ["碓轴拨杆", "4 组 · 90° 相位"],
        ["压杆尾", "0.225 m · ±22.5°"], ["铰杆抬升", "0.62 m · 2.2:0.8"],
        ["自由落体", "t = 0.356 s"], ["击臼舂谷", "频率 4ω/2π"]
      ];
      var bwid = (w * 0.91) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx2 = w * 0.045 + b * bwid;
        ctx.strokeStyle = ink;
        ctx.fillStyle = ink;
        ctx.strokeRect(bx2, chainY, bwid - 10, chainH);
        ctx.font = "700 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx2 + (bwid - 10) / 2, chainY + 17);
        ctx.font = "600 8.5px Menlo, monospace";
        ctx.fillStyle = "rgba(42,38,32,0.55)";
        ctx.fillText(boxes[b][1], bx2 + (bwid - 10) / 2, chainY + 32);
        if (b < boxes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 20);
          ctx.lineTo(bx2 + bwid - 2, chainY + 20);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>轮与轴</h4><table>' +
      '<tr><th>立轮</th><td>R 1.3 · 12 辐 8 叶</td><td>径 2.6 m</td></tr>' +
      '<tr><th>碓轴</th><td>长 4.4 · y=1.55</td><td>Ø 0.18 m</td></tr>' +
      '<tr><th>拨杆(×4)</th><td>回转半径 0.58 · 相位差 90°</td><td>间距 0.9 m</td></tr>' +
      '</table><h4>碓杆</h4><table>' +
      '<tr><th>杆长</th><td>尾臂 0.8 : 头臂 2.2</td><td>3.0 m</td></tr>' +
      '<tr><th>杆尾行程</th><td>压下 0.225(接触区 ±22.5°)</td><td>—</td></tr>' +
      '<tr><th>碓头抬升</th><td>0.225×2.2/0.8</td><td>0.62 m</td></tr>' +
      '<tr><th>落体时间</th><td>√(2×0.62/9.8)</td><td>0.356 s</td></tr>' +
      '<tr><th>频率</th><td>ω=1.1:0.70 次/s · ω=1.8:1.15 次/s</td><td>4ω/2π</td></tr>' +
      '</table><h4>运行期自检</h4>' +
      '<p>载入即模拟 30s:总撞击数与 4ω·t/2π 偏差 > 3 次拒绝启动;任意两碓撞击间隔 < 0.08s 拒绝启动(相位互锁)。</p>' +
      '<h4>文献</h4>' +
      '<p>《天工开物》:「凡碓……合数家之力,旱年则借水碓而舂」;桓谭《新论》:「役水而舂,其利百倍」。</p>'
  };
})(window.MECH = window.MECH || {});
