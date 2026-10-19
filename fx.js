// ===== Maydonlar, effektlar va HUD =====
function ridge(col, base, amp, par, seed) {
  x.fillStyle = col; x.beginPath(); x.moveTo(-80, GY + 40);
  for (var i = -80; i <= W + 80; i += 20) x.lineTo(i, base - amp * (Math.sin((i + par) * .009 + seed) + .6 * Math.sin((i + par) * .026 + seed * 2)));
  x.lineTo(W + 80, GY + 40); x.closePath(); x.fill();
}
function pagoda(px, base, s, col, lit) {
  for (var k = 0; k < 4; k++) {
    var w = (118 - k * 22) * s, h = 32 * s, y = base - k * (h + 8 * s);
    x.fillStyle = col; x.fillRect(px - w * .34, y - h, w * .68, h);
    x.beginPath(); x.moveTo(px - w * .66, y - h + 5 * s); x.quadraticCurveTo(px - w * .28, y - h - 3 * s, px, y - h - 16 * s);
    x.quadraticCurveTo(px + w * .28, y - h - 3 * s, px + w * .66, y - h + 5 * s); x.quadraticCurveTo(px, y - h + 13 * s, px - w * .66, y - h + 5 * s); x.fill();
    if (lit) { x.fillStyle = 'rgba(255,200,110,.85)'; x.fillRect(px - 5 * s, y - h * .75, 10 * s, 13 * s); x.fillRect(px - w * .22, y - h * .7, 7 * s, 11 * s); x.fillRect(px + w * .22 - 7 * s, y - h * .7, 7 * s, 11 * s); }
  }
  x.fillRect(px - 1.5 * s, base - 4 * (32 + 8) * s - 40 * s, 3 * s, 34 * s);
}
function stageNinja(cx, t) {
  var g = x.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, '#140b38'); g.addColorStop(.45, '#6d2a78'); g.addColorStop(.78, '#ee6a6a'); g.addColorStop(1, '#ffc27a');
  x.fillStyle = g; x.fillRect(-60, -60, W + 120, GY + 60);
  for (var i = 0; i < 36; i++) { x.globalAlpha = .3 + .4 * Math.abs(Math.sin(t * 2 + i)); x.fillStyle = '#fff'; x.fillRect((i * 173) % W, (i * 59) % 190, 2, 2); } x.globalAlpha = 1;
  var mx = 700 - cx * .03, my = 150, mg = x.createRadialGradient(mx, my, 20, mx, my, 190); mg.addColorStop(0, 'rgba(255,240,200,.75)'); mg.addColorStop(1, 'rgba(255,200,150,0)');
  x.fillStyle = mg; x.fillRect(mx - 200, my - 200, 400, 400); x.fillStyle = '#fff4d6'; x.beginPath(); x.arc(mx, my, 66, 0, 7); x.fill();
  x.fillStyle = 'rgba(230,200,170,.35)'; x.beginPath(); x.arc(mx - 18, my - 12, 14, 0, 7); x.arc(mx + 22, my + 16, 9, 0, 7); x.fill();
  ridge('#7d3d7e', 330, 46, -cx * .05, 1); ridge('#512a6a', 372, 42, -cx * .1, 4);
  pagoda(170 - cx * .16, 372, .95, '#2e1b4d', true); pagoda(800 - cx * .16, 372, .8, '#2e1b4d', true);
  ridge('#2a1747', 410, 22, -cx * .2, 7);
  x.strokeStyle = '#1c1030'; x.lineWidth = 2; x.beginPath(); x.moveTo(-20, 150); x.quadraticCurveTo(W / 2, 205, W + 20, 150); x.stroke();
  for (var j = 0; j < 8; j++) {
    var lx = 70 + j * 118, ly = 150 + Math.sin(j / 7 * Math.PI) * 44 + 12, sw = Math.sin(t * 1.5 + j) * 2;
    var lg = x.createRadialGradient(lx + sw, ly + 14, 2, lx + sw, ly + 14, 34); lg.addColorStop(0, 'rgba(255,120,80,.65)'); lg.addColorStop(1, 'rgba(255,120,80,0)');
    x.fillStyle = lg; x.fillRect(lx - 40, ly - 20, 80, 80); x.fillStyle = '#e5383b'; x.beginPath(); x.ellipse(lx + sw, ly + 14, 9, 12, 0, 0, 7); x.fill(); x.strokeStyle = '#1c1030'; x.lineWidth = 2; x.stroke();
  }
  for (var k = 0; k < 24; k++) {
    var px = ((k * 97 + t * (22 + k % 5 * 9)) % (W + 60)) - 30, py = ((k * 53 + t * (30 + k % 4 * 10)) % (GY + 20));
    x.save(); x.translate(px, py); x.rotate(t * 2 + k); x.fillStyle = k % 3 ? '#ffb3c7' : '#ff8fb0'; x.beginPath(); x.ellipse(0, 0, 4.5, 2.4, 0, 0, 7); x.fill(); x.restore();
  }
  var fg = x.createLinearGradient(0, GY - 14, 0, H); fg.addColorStop(0, '#8a5a3c'); fg.addColorStop(.12, '#6a4630'); fg.addColorStop(1, '#241513');
  x.fillStyle = fg; x.fillRect(-60, GY - 14, W + 120, H - GY + 80);
  x.fillStyle = '#b98a5e'; x.fillRect(-60, GY - 14, W + 120, 5);
  x.strokeStyle = 'rgba(20,10,8,.55)'; x.lineWidth = 2;
  for (var r = 1; r < 6; r++) { var yy = GY - 14 + r * r * 3.2; x.beginPath(); x.moveTo(-60, yy); x.lineTo(W + 60, yy); x.stroke(); }
  for (var c = -2; c < 22; c++) { x.beginPath(); x.moveTo(c * 56 - cx * .1, GY - 9); x.lineTo(c * 56 - (W / 2 - c * 56) * .35 - cx * .1, H + 10); x.stroke(); }
}
function stageShip(cx, t) {
  var g = x.createLinearGradient(0, 0, 0, 340); g.addColorStop(0, '#1b3a78'); g.addColorStop(.55, '#4a7fd0'); g.addColorStop(1, '#ffc27a');
  x.fillStyle = g; x.fillRect(-60, -60, W + 120, 400);
  var sx = 300 - cx * .03, sg = x.createRadialGradient(sx, 300, 8, sx, 300, 230); sg.addColorStop(0, 'rgba(255,244,200,.95)'); sg.addColorStop(1, 'rgba(255,220,150,0)');
  x.fillStyle = sg; x.fillRect(sx - 240, 90, 480, 260); x.fillStyle = '#fff6d6'; x.beginPath(); x.arc(sx, 300, 44, 0, 7); x.fill();
  [[90, 70, 1], [420, 110, 1.4], [700, 60, .9]].forEach(function (c) {
    var cxp = ((c[0] + t * (6 + c[2] * 3)) % (W + 240)) - 120; x.fillStyle = 'rgba(255,255,255,.7)';
    x.beginPath(); x.ellipse(cxp, c[1], 56 * c[2], 13 * c[2], 0, 0, 7); x.ellipse(cxp + 30 * c[2], c[1] - 9 * c[2], 34 * c[2], 12 * c[2], 0, 0, 7); x.fill();
  });
  x.fillStyle = '#3a4a6b'; x.beginPath(); x.moveTo(640 - cx * .04, 332); x.quadraticCurveTo(700 - cx * .04, 280, 770 - cx * .04, 332); x.fill();
  var sea = x.createLinearGradient(0, 330, 0, GY); sea.addColorStop(0, '#2b86c5'); sea.addColorStop(1, '#0b3a5e'); x.fillStyle = sea; x.fillRect(-60, 330, W + 120, GY - 330);
  for (var w = 0; w < 5; w++) {
    x.beginPath(); x.moveTo(-60, GY);
    for (var i = -60; i <= W + 60; i += 16) x.lineTo(i, 338 + w * 22 + Math.sin(i * .02 + t * (1.2 + w * .3) + w) * (3 + w * 1.6));
    x.lineTo(W + 60, GY); x.closePath(); x.fillStyle = 'rgba(' + (30 + w * 6) + ',' + (110 + w * 10) + ',' + (170 - w * 8) + ',.45)'; x.fill();
  }
  x.save(); x.translate(W / 2, GY); x.rotate(Math.sin(t * .7) * .008); x.translate(-W / 2, -GY);
  [[130, -1], [830, 1]].forEach(function (m) {
    var mxp = m[0] - cx * .08;
    x.fillStyle = '#4a3020'; x.fillRect(mxp - 8, 30, 16, GY - 30); x.fillRect(mxp - 70, 120, 140, 9);
    var sw = Math.sin(t * 1.2 + m[0]) * 8; x.beginPath(); x.moveTo(mxp - 66, 129); x.quadraticCurveTo(mxp - 80 + sw, 205, mxp - 62, 296); x.lineTo(mxp + 62, 296); x.quadraticCurveTo(mxp + 80 + sw, 205, mxp + 66, 129); x.closePath();
    x.fillStyle = '#f3e6c8'; x.fill(); x.strokeStyle = '#a58b5f'; x.lineWidth = 2; x.stroke();
    x.beginPath(); x.moveTo(mxp - 40, 160); x.lineTo(mxp + 40, 160); x.moveTo(mxp - 44, 220); x.lineTo(mxp + 44, 220); x.strokeStyle = 'rgba(120,90,50,.4)'; x.stroke();
    x.strokeStyle = '#3a2618'; x.lineWidth = 2; x.beginPath(); x.moveTo(mxp, 34); x.lineTo(mxp + m[1] * 220, GY - 112); x.moveTo(mxp, 34); x.lineTo(mxp - m[1] * 210, GY - 112); x.stroke();
  });
  x.fillStyle = '#5a3a24'; x.fillRect(-60, GY - 116, W + 120, 10); x.fillStyle = '#3a2618';
  for (var p = -1; p < 14; p++) x.fillRect(p * 80 + 20 - cx * .05, GY - 106, 10, 92);
  for (var q = 0; q < 3; q++) {
    var cxp = 300 + q * 190 - cx * .05; x.fillStyle = '#2c313d'; x.beginPath(); x.ellipse(cxp, GY - 66, 26, 15, 0, 0, 7); x.fill(); x.fillRect(cxp, GY - 74, 34, 16); x.fillStyle = '#12151c'; x.beginPath(); x.ellipse(cxp + 34, GY - 66, 5, 8, 0, 0, 7); x.fill();
  }
  [[56, 30], [908, 34]].forEach(function (b) {
    var bx = b[0] - cx * .05; x.fillStyle = '#8a5a2b'; x.fillRect(bx - b[1], GY - 54, b[1] * 2, 54); x.strokeStyle = '#3a2618'; x.lineWidth = 3;
    x.strokeRect(bx - b[1], GY - 54, b[1] * 2, 54); x.beginPath(); x.moveTo(bx - b[1], GY - 40); x.lineTo(bx + b[1], GY - 40); x.moveTo(bx - b[1], GY - 14); x.lineTo(bx + b[1], GY - 14); x.stroke();
  });
  x.restore();
  var fg = x.createLinearGradient(0, GY - 14, 0, H); fg.addColorStop(0, '#a06a3c'); fg.addColorStop(1, '#3a2316'); x.fillStyle = fg; x.fillRect(-60, GY - 14, W + 120, H - GY + 80);
  x.fillStyle = '#c99763'; x.fillRect(-60, GY - 14, W + 120, 5); x.strokeStyle = 'rgba(30,15,8,.6)'; x.lineWidth = 2;
  for (var r = 1; r < 7; r++) { var yy = GY - 14 + r * r * 2.6; x.beginPath(); x.moveTo(-60, yy); x.lineTo(W + 60, yy); x.stroke(); }
  for (var c = -2; c < 24; c++) { var bx = c * 62 + (c % 2) * 30 - cx * .1; x.beginPath(); x.moveTo(bx, GY - 9 + (c % 3) * 9); x.lineTo(bx + 6, GY + 3 + (c % 3) * 9); x.stroke(); }
}
function drawStage(idx, cam) { var cx = cam.cx - W / 2; if (idx == 0) stageNinja(cx, G.t); else stageShip(cx, G.t); }

function drawAura(f) {
  var up = f.act == 'ult' || f.act == 'blitz', on = f.buffT > 0 || up; if (!on || f.vis <= 0) return;
  var r = up ? 70 : 52, g = x.createRadialGradient(f.x, f.y - 58, 4, f.x, f.y - 58, r);
  g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(.5, f.ch.sc); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.globalAlpha = (up ? .55 : .35) + Math.sin(G.t * 12) * .08; x.fillStyle = g; x.beginPath(); x.ellipse(f.x, f.y - 58, r * .75, r * 1.2, 0, 0, 7); x.fill(); x.globalAlpha = 1;
}

function drawFX() {
  RINGS.forEach(function (r) {
    x.globalAlpha = clamp(r.l / r.ml, 0, 1); x.strokeStyle = r.col; x.lineWidth = r.w * clamp(r.l / r.ml, .2, 1) + 1;
    x.beginPath(); if (r.flat) x.ellipse(r.x, r.y, r.r, r.r * .22, 0, 0, 7); else x.arc(r.x, r.y, r.r, 0, 7); x.stroke();
  }); x.globalAlpha = 1;
  BEAMS.forEach(function (b) {
    var pul = 1 + Math.sin(G.t * 40) * .08, a = clamp(b.life / .15, 0, 1), hh = b.h * pul * a, x0 = b.dir > 0 ? b.x : b.x - b.len, y0 = b.y - hh / 2;
    x.globalAlpha = .35 * a; x.fillStyle = b.col; x.fillRect(x0, y0 - hh * .3, b.len, hh * 1.6);
    x.globalAlpha = .75 * a; x.fillRect(x0, y0, b.len, hh); x.globalAlpha = a; x.fillStyle = '#fff'; x.fillRect(x0, y0 + hh * .3, b.len, hh * .4); x.globalAlpha = 1;
  });
  PRJ.forEach(function (p) {
    var d = p.vx >= 0 ? 1 : -1;
    if (p.k == 'orb') {
      for (var i = 4; i >= 1; i--) { x.globalAlpha = .1 * (5 - i); x.fillStyle = p.col; x.beginPath(); x.arc(p.x - p.vx * .014 * i, p.y - p.vy * .014 * i, p.r * (1 - i * .12), 0, 7); x.fill(); }
      var g = x.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.r * 2.3); g.addColorStop(0, '#fff'); g.addColorStop(.3, p.col); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.globalAlpha = 1; x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, p.r * 2.3, 0, 7); x.fill();
    } else if (p.k == 'wave') {
      var h = 56; x.beginPath(); x.moveTo(p.x - d * 26, GY - 2); x.quadraticCurveTo(p.x - d * 6, GY - h, p.x + d * 30, GY - h * .35); x.quadraticCurveTo(p.x + d * 14, GY - h * .15, p.x + d * 8, GY - 2); x.closePath();
      x.fillStyle = p.col; x.globalAlpha = .9; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke(); x.globalAlpha = 1;
    } else if (p.k == 'needle') {
      x.save(); x.translate(p.x, p.y); x.rotate(Math.atan2(p.vy, p.vx)); x.fillStyle = p.col; x.strokeStyle = '#fff'; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(16, 0); x.lineTo(-10, -4); x.lineTo(-6, 0); x.lineTo(-10, 4); x.closePath(); x.fill(); x.stroke(); x.restore();
    } else if (p.k == 'drop') {
      x.fillStyle = p.col; x.globalAlpha = .35; x.fillRect(p.x - 4, p.y - 50, 8, 46); x.globalAlpha = 1;
      x.beginPath(); x.moveTo(p.x, p.y + 14); x.quadraticCurveTo(p.x + 11, p.y - 4, p.x, p.y - 14); x.quadraticCurveTo(p.x - 11, p.y - 4, p.x, p.y + 14); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.stroke();
    } else if (p.k == 'hook') {
      var o = p.own, hx = o.x + o.face * 24, hy = o.y - 56; x.strokeStyle = OUT; x.lineWidth = 5; x.beginPath(); x.moveTo(hx, hy); x.lineTo(p.x, p.y); x.stroke();
      x.strokeStyle = p.col; x.lineWidth = 2.5; x.stroke(); dot(p.x, p.y, 8, p.col);
    }
  });
  PTS.forEach(function (p) {
    var a = clamp(p.l / p.ml, 0, 1);
    if (p.kind == 'dust') { x.globalAlpha = a * .5; x.fillStyle = p.col; x.beginPath(); x.arc(p.x, p.y, p.r * (2 - a), 0, 7); x.fill(); }
    else if (p.kind == 'slash') {
      x.globalAlpha = a; x.strokeStyle = p.col; x.lineWidth = p.r * a + 2; x.lineCap = 'round'; x.beginPath();
      x.arc(p.x - p.d * 10, p.y, p.r * 1.7, p.d > 0 ? -1.2 : Math.PI - .5 + 0, p.d > 0 ? .5 : Math.PI + 1.2); x.stroke();
    } else if (p.kind == 'streak') { x.globalAlpha = a * .5; x.strokeStyle = p.col; x.lineWidth = 5; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - p.d * 70, p.y); x.stroke(); }
    else if (p.kind == 'glow') { x.globalAlpha = a * .8; x.fillStyle = p.col; x.beginPath(); x.arc(p.x, p.y, p.r * a + 1, 0, 7); x.fill(); }
    else { x.globalAlpha = a; x.strokeStyle = p.col; x.lineWidth = 2.5; x.lineCap = 'round'; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - p.vx * .035, p.y - p.vy * .035); x.stroke(); }
  }); x.globalAlpha = 1;
  POPS.forEach(function (p) {
    var a = clamp(p.l * 2, 0, 1); x.globalAlpha = a; x.font = 'italic 900 ' + p.size + 'px system-ui'; x.textAlign = 'center';
    x.strokeStyle = '#000'; x.lineWidth = 4; x.strokeText(p.txt, p.x, p.y); x.fillStyle = p.col; x.fillText(p.txt, p.x, p.y);
  }); x.globalAlpha = 1;
}

function trap(x0, y0, w, h, s) { x.beginPath(); x.moveTo(x0 + s, y0); x.lineTo(x0 + w + s, y0); x.lineTo(x0 + w, y0 + h); x.lineTo(x0, y0 + h); x.closePath(); }
function bigText(txt, px, py, size, col, sc) {
  x.save(); x.translate(px, py); x.scale(sc, sc); x.font = 'italic 900 ' + size + 'px system-ui'; x.textAlign = 'center'; x.lineJoin = 'round';
  x.strokeStyle = '#000'; x.lineWidth = size / 6; x.strokeText(txt, 0, 0); x.fillStyle = col; x.fillText(txt, 0, 0); x.restore();
}
function drawHUD() {
  var F = G.F; if (!F.length) return;
  F.forEach(function (f, i) {
    var r = i == 1, bw = 380, bx = r ? W - 36 - bw : 36, fr = clamp(f.hp / f.mhp, 0, 1), s = r ? -16 : 16;
    x.fillStyle = 'rgba(0,0,0,.6)'; trap(bx - 3, 17, bw + 6, 26, s); x.fill();
    x.fillStyle = '#fff'; var lw = bw * clamp(f.lag / f.mhp, 0, 1); if (r) { trap(bx + bw - lw, 20, lw, 20, s); } else trap(bx, 20, lw, 20, s); x.fill();
    var hc = fr > .5 ? '#4ade80' : fr > .25 ? '#facc15' : '#ef4444', gr = x.createLinearGradient(0, 20, 0, 40); gr.addColorStop(0, shade(hc.length == 7 ? hc : '#4ade80', 1.35)); gr.addColorStop(1, hc);
    x.fillStyle = gr; if (r) trap(bx + bw - bw * fr, 20, bw * fr, 20, s); else trap(bx, 20, bw * fr, 20, s); x.fill();
    x.fillStyle = 'rgba(0,0,0,.55)'; trap(bx - 3, 46, bw * .8, 9, s); x.fill();
    var full = f.en >= 100, ec = full ? (Math.floor(G.t * 6) % 2 ? '#ffd54a' : '#fff') : '#38bdf8'; x.fillStyle = ec;
    if (r) trap(bx + bw * .8 - bw * .8 * f.en / 100 - 3, 47, bw * .8 * f.en / 100, 7, s); else trap(bx - 2, 47, bw * .8 * f.en / 100, 7, s); x.fill();
    x.font = 'italic 900 17px system-ui'; x.textAlign = r ? 'right' : 'left'; x.fillStyle = '#fff'; x.strokeStyle = '#000'; x.lineWidth = 3.5;
    var nm = FACS[f.ch.f].icon + ' ' + f.ch.n, nx = r ? W - 36 : 36; x.strokeText(nm, nx, 76); x.fillText(nm, nx, 76);
    if (full) { x.font = '900 12px system-ui'; x.fillStyle = '#ffd54a'; x.fillText('ULT TAYYOR!', nx, 92); }
    for (var k = 0; k < 2; k++) { x.beginPath(); x.arc(r ? W - 46 - k * 20 - (bw * .8) : 46 + k * 20 + bw * .8 + 6, 51, 6, 0, 7); x.fillStyle = k < f.win ? '#ffd54a' : 'rgba(255,255,255,.22)'; x.fill(); x.strokeStyle = '#000'; x.lineWidth = 1.5; x.stroke(); }
    if (f.combo > 1 && f.comboT > 0) bigText(f.combo + ' KOMBO!', r ? W - 150 : 150, 150, 30, '#ffd54a', 1 + Math.min(.25, (f.comboT - 1) * 1));
  });
  x.beginPath(); x.arc(W / 2, 40, 29, 0, 7); x.fillStyle = 'rgba(0,0,0,.7)'; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2.5; x.stroke();
  x.font = '900 28px system-ui'; x.textAlign = 'center'; x.fillStyle = G.timer < 10 ? '#ff6b6b' : '#fff'; x.fillText(Math.max(0, Math.ceil(G.timer)), W / 2, 50);
  x.font = '700 12px system-ui'; x.fillStyle = '#cbd5ff'; x.fillText('RAUND ' + G.round, W / 2, 84);
  if (G.msgT > 0 && G.msg) { var sc = 1 + Math.max(0, G.msgT - (G.msgMax - .25)) * 4; bigText(G.msg, W / 2, 230, G.msg.length > 10 ? 54 : 78, '#ffd54a', clamp(sc, 1, 2)); }
  if (G.ultMsg) {
    var u = G.ultMsg, a = clamp(u.t / .3, 0, 1);
    x.globalAlpha = a * .55; x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.globalAlpha = a; x.fillStyle = u.col; x.save(); x.transform(1, 0, -.25, 1, 60, 0); x.fillRect(0, 205, W, 62); x.restore();
    bigText(u.txt, W / 2, 252, 46, '#fff', 1 + (1.2 - u.t) * .06); x.globalAlpha = 1;
  }
}
