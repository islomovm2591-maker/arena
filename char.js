// ===== Stickman chizish va animatsiya =====
var L = {th:27, sh:27, to:38, ua:20, fa:20};
var OUT = '#0a0a14', SKIN = '#f4efe6';
var WL = {none:14, dagger:24, sword:42, staff:54, axe:46, hook:34, anchor:40, cannon:28, fan:26, harpoon:62};

function mix(a, b, t) { var r = []; for (var i = 0; i < a.length; i++) r.push(lerp(a[i], b[i], t)); return r; }
function keys(arr, p) {
  if (p <= arr[0][0]) return arr[0][1];
  for (var i = 1; i < arr.length; i++) if (p <= arr[i][0]) { var a = arr[i - 1], b = arr[i]; return mix(a[1], b[1], ease((p - a[0]) / (b[0] - a[0]))); }
  return arr[arr.length - 1][1];
}
// poza: [egilish, orqa son, orqa tizza, old son, old tizza, orqa yelka, orqa tirsak, old yelka, old tirsak]
var G0 = [.12, -.3, -.15, .35, -.35, .6, 1.9, .9, 1.5], G1 = [.16, -.32, -.18, .38, -.38, .68, 1.8, .98, 1.4];
var STK = [.4, -.55, -.05, .55, -.2, .6, 1.9, 1.55, .03], STK2 = [.4, .5, -.2, -.55, -.05, 1.55, .03, .9, 1.5];
var KS_ = {
  punch: [[0, G0], [.26, [-.12, -.5, -.1, .2, -.4, .6, 1.9, .1, 2.5]], [.46, STK], [.7, STK], [1, G0]],
  punch2: [[0, G0], [.26, [-.12, .5, -.1, -.2, -.4, .1, 2.5, .9, 1.5]], [.46, STK2], [.7, STK2], [1, G0]],
  kick: [[0, G0], [.28, [-.3, -.1, -.2, .1, -1.7, 1.1, 1.1, -.2, .7]], [.5, [-.5, -.1, -.05, 1.6, 0, .2, .6, .5, .6]], [.74, [-.5, -.1, -.05, 1.6, 0, .2, .6, .5, .6]], [1, G0]],
  air: [[0, [.1, -.3, -.9, .7, -1, 1.9, .5, 2.2, .4]], [.3, [-.2, -.4, -1.1, .2, -1.7, 1.1, 1, -.2, .7]], [.5, [-.45, -.4, -.9, 1.5, 0, .2, .6, .5, .6]], [1, [-.45, -.4, -.9, 1.5, 0, .2, .6, .5, .6]]],
  block: [[0, G0], [.2, [.08, -.4, -.5, .5, -.6, 1.3, 1.8, 1.1, 1.9]], [1, [.08, -.4, -.5, .5, -.6, 1.3, 1.8, 1.1, 1.9]]],
  hurt: [[0, [-.45, -.2, -.3, .1, -.4, .3, .3, .1, .5]], [1, [-.3, -.2, -.3, .1, -.4, .4, .4, .2, .6]]],
  cast: [[0, G0], [.4, [-.1, -.4, -.2, .3, -.4, .2, 2.3, .4, 2.3]], [.62, [.25, -.4, -.1, .5, -.3, 1.5, .1, 1.6, 0]], [1, [.2, -.4, -.1, .5, -.3, 1.5, .1, 1.6, 0]]],
  ult: [[0, G0], [.12, [-.2, -.5, -.2, .4, -.3, 2.8, .3, 3, .2]], [.6, [-.2, -.5, -.2, .4, -.3, 2.8, .3, 3, .2]], [.75, [.4, -.5, -.1, .6, -.25, 1.55, 0, 1.6, 0]], [1, [.4, -.5, -.1, .6, -.25, 1.55, 0, 1.6, 0]]],
  jump: [[0, [.1, -.35, -.9, .7, -1, 1.9, .5, 2.2, .4]], [1, [.1, -.35, -.9, .7, -1, 1.9, .5, 2.2, .4]]],
  dash: [[0, [.75, -.9, -.1, .9, -.3, -.6, .4, 1.7, 0]], [1, [.75, -.9, -.1, .9, -.3, -.6, .4, 1.7, 0]]],
  ko: [[0, [-.3, -.2, -.3, .1, -.4, .3, .3, .1, .5]], [1, [0, -.5, -.2, .6, -.3, 2.2, .5, 1.2, .4]]]
};
var POSEACT = {punch:1, punch2:1, kick:1, air:1, block:1, hurt:1, cast:1, ult:1, jump:1, dash:1};

function getPose(f) {
  var a = f.act, p = f.ad > 0 ? Math.min(1, f.at / f.ad) : 0, T = G.t;
  if (a == 'blitz') a = 'dash';
  if (a == 'dive') a = f.ph == 2 ? 'air' : 'jump';
  if (POSEACT[a]) return keys(KS_[a], a == 'jump' ? 0 : p);
  if (a == 'ko' || a == 'down') return keys(KS_.ko, Math.min(1, f.at / .3));
  if (a == 'walk') {
    var ph = f.wk;
    return [.2, Math.sin(ph) * .75, -.2 - Math.max(0, Math.cos(ph)) * .9, -Math.sin(ph) * .75, -.2 - Math.max(0, -Math.cos(ph)) * .9,
            .6 - Math.sin(ph) * .45, 1.7, .9 + Math.sin(ph) * .45, 1.5];
  }
  return mix(G0, G1, (Math.sin(T * 3.2 + f.num * 2) + 1) / 2);
}

function skeleton(f) {
  var P = getPose(f);
  function leg(h, k) { var kx = Math.sin(h) * L.th, ky = Math.cos(h) * L.th, a2 = h + k; return {kx:kx, ky:ky, fx:kx + Math.sin(a2) * L.sh, fy:ky + Math.cos(a2) * L.sh}; }
  var lb = leg(P[1], P[2]), lf = leg(P[3], P[4]);
  var hy = -Math.max(lb.fy, lf.fy), ln = P[0];
  var sx = Math.sin(ln) * L.to, sy = hy - Math.cos(ln) * L.to;
  var J = {P:P, hip:{x:0, y:hy}, sh:{x:sx, y:sy}, head:{x:sx + Math.sin(ln) * 17, y:sy - Math.cos(ln) * 17},
           kb:{x:lb.kx, y:hy + lb.ky}, fb:{x:lb.fx, y:hy + lb.fy}, kf:{x:lf.kx, y:hy + lf.ky}, ff:{x:lf.fx, y:hy + lf.fy}};
  function arm(s, e) { var ex = sx + Math.sin(s) * L.ua, ey = sy + Math.cos(s) * L.ua; return {e:{x:ex, y:ey}, h:{x:ex + Math.sin(s + e) * L.fa, y:ey + Math.cos(s + e) * L.fa}}; }
  var ab = arm(P[5], P[6]), af = arm(P[7], P[8]);
  J.eb = ab.e; J.hb = ab.h; J.ef = af.e; J.hf = af.h; J.wd = P[7] + P[8];
  return J;
}
function tipPos(f) {
  var J = skeleton(f), len = WL[f.ch.wp] || 14, sz = (f.ch.sz || 1) * (f.zoom || 1);
  var lx = J.hf.x + Math.sin(J.wd) * len, ly = J.hf.y + Math.cos(J.wd) * len;
  return {x:f.x + f.face * sz * lx, y:f.y + sz * ly};
}

function limb(pts, w, col) {
  x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(pts[0].x, pts[0].y);
  for (var i = 1; i < pts.length; i++) x.lineTo(pts[i].x, pts[i].y);
  x.strokeStyle = OUT; x.lineWidth = w + 4; x.stroke();
  x.strokeStyle = col; x.lineWidth = w; x.stroke();
}
function dot(px, py, r, col) { x.beginPath(); x.arc(px, py, r, 0, 7); x.fillStyle = col; x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke(); }

function drawHat(ch, hx, hy, f) {
  var t = G.t, a = ch.acc, c = ch.col, k = ch.hat, wv = Math.sin(t * 8 + f.num) * 4;
  if (k == 'band') {
    limb([{x:hx - 11, y:hy - 4}, {x:hx - 24, y:hy - 4 + wv * .4}, {x:hx - 36, y:hy + 4 + wv}], 4, a);
    limb([{x:hx - 11, y:hy - 4}, {x:hx - 22, y:hy - 8 + wv * .3}, {x:hx - 32, y:hy - 3 + wv * .8}], 3, a);
    limb([{x:hx - 12, y:hy - 4}, {x:hx + 12, y:hy - 4}], 5, a); dot(hx + 6, hy - 4, 3, shade(a, .75));
  } else if (k == 'hood') {
    x.beginPath(); x.arc(hx, hy, 13.5, Math.PI * .85, Math.PI * 2.1); x.lineTo(hx - 14, hy + 12); x.quadraticCurveTo(hx - 17, hy + 4, hx - 13, hy - 4);
    x.fillStyle = shade(c, .45); x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
    limb([{x:hx - 12, y:hy + 8}, {x:hx - 26, y:hy + 14 + wv * .6}], 4, shade(c, .45));
  } else if (k == 'spikes') {
    x.fillStyle = a; x.strokeStyle = OUT; x.lineWidth = 2;
    [[-9, -9, -17, -26], [-3, -12, 0, -31], [4, -11, 12, -27], [9, -6, 22, -17], [-11, -4, -26, -12]].forEach(function (s) {
      x.beginPath(); x.moveTo(hx + s[0] - 4, hy + s[1] + 2); x.lineTo(hx + s[2], hy + s[3]); x.lineTo(hx + s[0] + 5, hy + s[1] + 2); x.closePath(); x.fill(); x.stroke();
    });
  } else if (k == 'bun') {
    x.beginPath(); x.arc(hx - 1, hy - 1, 12.5, Math.PI * 1.05, Math.PI * 2.05); x.fillStyle = a; x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
    dot(hx - 5, hy - 17, 6.5, a);
  } else if (k == 'mask') {
    x.beginPath(); x.moveTo(hx - 12, hy + 1); x.lineTo(hx + 12, hy + 1); x.lineTo(hx + 10, hy + 12); x.lineTo(hx - 10, hy + 12); x.closePath();
    x.fillStyle = shade(c, .6); x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
    limb([{x:hx - 12, y:hy - 4}, {x:hx + 12, y:hy - 4}], 4, a);
    limb([{x:hx - 12, y:hy - 4}, {x:hx - 28, y:hy + wv * .5}], 3, a);
  } else if (k == 'helmet') {
    x.beginPath(); x.arc(hx, hy - 1, 14, Math.PI, Math.PI * 2); x.lineTo(hx + 14, hy + 2); x.lineTo(hx - 14, hy + 2); x.closePath();
    x.fillStyle = a; x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
    limb([{x:hx, y:hy - 15}, {x:hx - 6, y:hy - 24}, {x:hx - 16, y:hy - 22}], 4, shade(c, .8));
  } else if (k == 'tricorn') {
    x.beginPath(); x.moveTo(hx - 21, hy - 4); x.lineTo(hx - 8, hy - 20); x.lineTo(hx + 8, hy - 20); x.lineTo(hx + 22, hy - 4); x.lineTo(hx, hy - 9); x.closePath();
    x.fillStyle = '#23232f'; x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
    limb([{x:hx - 20, y:hy - 4}, {x:hx, y:hy - 9}, {x:hx + 21, y:hy - 4}], 2.5, a);
  } else if (k == 'captain') {
    x.beginPath(); x.moveTo(hx - 24, hy - 3); x.quadraticCurveTo(hx - 16, hy - 24, hx, hy - 24); x.quadraticCurveTo(hx + 16, hy - 24, hx + 24, hy - 3);
    x.quadraticCurveTo(hx, hy - 11, hx - 24, hy - 3); x.fillStyle = shade(c, .5); x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
    limb([{x:hx - 23, y:hy - 3}, {x:hx, y:hy - 9}, {x:hx + 23, y:hy - 3}], 2.5, a); dot(hx, hy - 15, 3.2, '#ffd54a');
  } else if (k == 'bandana') {
    x.beginPath(); x.arc(hx, hy, 13, Math.PI * 1.02, Math.PI * 2.02); x.fillStyle = shade(c, .85); x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
    limb([{x:hx - 11, y:hy - 5}, {x:hx - 22, y:hy - 2 + wv * .5}, {x:hx - 28, y:hy + 5 + wv}], 3.5, shade(c, .85));
    limb([{x:hx - 11, y:hy - 5}, {x:hx - 20, y:hy - 8 + wv * .4}, {x:hx - 25, y:hy - 4 + wv * .7}], 3, shade(c, .85));
    limb([{x:hx - 12, y:hy - 5}, {x:hx + 12, y:hy - 5}], 2.5, a);
  } else if (k == 'eyepatch') {
    x.beginPath(); x.arc(hx, hy, 12.5, Math.PI * 1.1, Math.PI * 2); x.fillStyle = a; x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
    limb([{x:hx - 11, y:hy - 8}, {x:hx + 12, y:hy + 2}], 1.8, '#15151f'); dot(hx + 5, hy - 1, 4.2, '#15151f');
  } else if (k == 'crown') {
    x.beginPath(); x.moveTo(hx - 11, hy - 8); x.lineTo(hx - 12, hy - 22); x.lineTo(hx - 5, hy - 14); x.lineTo(hx, hy - 24); x.lineTo(hx + 5, hy - 14); x.lineTo(hx + 12, hy - 22); x.lineTo(hx + 11, hy - 8); x.closePath();
    x.fillStyle = '#ffd54a'; x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke(); dot(hx, hy - 12, 2.5, '#ff4d6d');
  } else if (k == 'bald') {
    x.beginPath(); x.arc(hx - 4, hy - 7, 5, Math.PI * 1.1, Math.PI * 1.7); x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 2; x.stroke();
  }
}

function drawWeapon(f, J) {
  var ch = f.ch, wp = ch.wp; if (wp == 'none') return;
  var d = J.wd, a = ch.acc, steel = '#dfe6f2';
  x.save(); x.translate(J.hf.x, J.hf.y); x.rotate(Math.PI / 2 - d); x.lineCap = 'round'; x.lineJoin = 'round';
  function ln(x1, y1, x2, y2, w, c) { x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.strokeStyle = OUT; x.lineWidth = w + 3; x.stroke(); x.strokeStyle = c; x.lineWidth = w; x.stroke(); }
  if (wp == 'sword') { ln(-6, 0, 3, 0, 3.5, '#4a3322'); ln(5, -7, 5, 7, 3.2, a); ln(5, 0, 42, 0, 3.6, steel); }
  else if (wp == 'dagger') { ln(-5, 0, 2, 0, 3.4, '#4a3322'); ln(3, -4, 3, 4, 3, a); ln(3, 0, 24, 0, 3.4, steel); }
  else if (wp == 'staff') { ln(-14, 0, 54, 0, 4, '#8a5a2b'); ln(-14, 0, -10, 0, 5, a); ln(50, 0, 54, 0, 5.5, a); }
  else if (wp == 'axe') {
    ln(-8, 0, 40, 0, 4, '#8a5a2b'); x.beginPath(); x.moveTo(28, -2); x.lineTo(38, -15); x.lineTo(48, -7); x.lineTo(46, 7); x.lineTo(38, 15); x.lineTo(28, 2); x.closePath();
    x.fillStyle = steel; x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
  } else if (wp == 'hook') {
    ln(-4, 0, 22, 0, 4, '#8a5a2b'); x.beginPath(); x.moveTo(22, 0); x.quadraticCurveTo(38, 0, 36, -14); x.strokeStyle = OUT; x.lineWidth = 7; x.stroke(); x.strokeStyle = steel; x.lineWidth = 4; x.stroke();
  } else if (wp == 'anchor') {
    ln(-6, 0, 32, 0, 5, '#5b6577'); ln(24, -10, 24, 10, 4, '#5b6577'); x.beginPath(); x.arc(34, 0, 9, -1.4, 1.4); x.strokeStyle = OUT; x.lineWidth = 7; x.stroke(); x.strokeStyle = '#7d8aa3'; x.lineWidth = 4; x.stroke();
    x.beginPath(); x.arc(-2, 0, 3.4, 0, 7); x.strokeStyle = OUT; x.lineWidth = 5; x.stroke(); x.strokeStyle = '#7d8aa3'; x.lineWidth = 2.5; x.stroke();
  } else if (wp == 'cannon') {
    x.beginPath(); x.moveTo(-4, -6); x.lineTo(24, -8); x.lineTo(24, 8); x.lineTo(-4, 6); x.closePath(); x.fillStyle = '#3a3f4d'; x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
    ln(10, -7, 10, 7, 3, a); ln(24, -9, 24, 9, 4, '#1b1f29');
  } else if (wp == 'fan') {
    for (var i = -2; i <= 2; i++) ln(0, 0, Math.cos(i * .3) * 26, Math.sin(i * .3) * 26, 3, i % 2 ? a : shade(a, .85));
    x.beginPath(); x.arc(0, 0, 26, -.6, .6); x.strokeStyle = OUT; x.lineWidth = 2.5; x.stroke();
  } else if (wp == 'harpoon') {
    ln(-10, 0, 52, 0, 3.6, '#8a5a2b'); x.beginPath(); x.moveTo(50, -6); x.lineTo(64, 0); x.lineTo(50, 6); x.closePath(); x.fillStyle = steel; x.fill(); x.strokeStyle = OUT; x.lineWidth = 2; x.stroke();
  }
  x.restore();
}

function drawFighter(f) {
  var ch = f.ch, J = skeleton(f), sz = (ch.sz || 1) * (f.zoom || 1), lying = f.act == 'ko' || f.act == 'down', q = lying ? Math.min(1, f.at / .3) : 0;
  if (f.vis <= 0) return;
  var hurtc = f.flash > 0, bc = hurtc ? '#fff' : ch.col, dk = hurtc ? '#fff' : shade(ch.col, .55), md = hurtc ? '#fff' : shade(ch.col, .8);
  x.save(); x.globalAlpha = f.vis;
  if (!f.noShadow) { var hh = clamp((GY - f.y) / 260, 0, 1); x.fillStyle = 'rgba(0,0,0,' + (.38 - hh * .25) + ')'; x.beginPath(); x.ellipse(f.x, GY + 4, 30 * sz * (1 - hh * .5), 7 * (1 - hh * .5), 0, 0, 7); x.fill(); }
  x.translate(f.x, f.y - 9 * q); x.scale(f.face * sz, sz); x.rotate(-1.5 * q);
  var ninja = ch.f == 'n', P = J.P;
  // orqa qo'l va oyoq
  limb([J.sh, J.eb, J.hb], 6, md); dot(J.hb.x, J.hb.y, 3.4, SKIN);
  limb([J.hip, J.kb, J.fb], 7.5, dk);
  limb([J.fb, {x:J.fb.x + 9, y:J.fb.y + 1}], 6, ninja ? '#1a1a28' : '#3a2a22');
  // tana
  limb([J.hip, J.sh], 9.5, bc);
  if (ninja) {
    var sw = Math.sin(G.t * 9 + f.num) * 4;
    limb([{x:J.sh.x - 2, y:J.sh.y + 2}, {x:J.sh.x - 20, y:J.sh.y + 5 + sw}, {x:J.sh.x - 36, y:J.sh.y + 14 + sw * 1.4}], 5, ch.acc);
    limb([{x:J.hip.x - 7, y:J.hip.y - 2}, {x:J.hip.x + 7, y:J.hip.y - 2}], 5, ch.acc);
  } else {
    limb([{x:J.hip.x - 8, y:J.hip.y - 3}, {x:J.hip.x + 8, y:J.hip.y - 3}], 6, ch.acc);
    dot(J.hip.x + 2, J.hip.y - 3, 3, '#ffd54a');
    limb([{x:J.hip.x - 6, y:J.hip.y}, {x:J.hip.x - 10, y:J.hip.y + 14}], 4, ch.acc);
  }
  // bosh
  drawHatBack(ch, J.head.x, J.head.y, f);
  dot(J.head.x, J.head.y, 12, SKIN);
  x.fillStyle = '#15151f'; x.beginPath(); x.arc(J.head.x + 5.5, J.head.y - 1, f.act == 'hurt' ? 1 : 1.9, 0, 7); x.fill();
  limb([{x:J.head.x + 2, y:J.head.y - 6}, {x:J.head.x + 9, y:J.head.y - (f.act == 'hurt' ? 7 : 3.5)}], 1.4, '#15151f');
  drawHat(ch, J.head.x, J.head.y, f);
  // old oyoq va qo'l
  limb([J.hip, J.kf, J.ff], 7.5, dk);
  limb([J.ff, {x:J.ff.x + 9, y:J.ff.y + 1}], 6, ninja ? '#1a1a28' : '#3a2a22');
  limb([J.sh, J.ef, J.hf], 6.5, bc); dot(J.hf.x, J.hf.y, 3.6, SKIN);
  drawWeapon(f, J);
  x.restore();
}
function drawHatBack(ch, hx, hy, f) { }

// kichik portret / ko'rinish uchun
function drawPortrait(c2, ch, w, h, zoom, act, at, ad) {
  var old = x; x = c2; c2.clearRect(0, 0, w, h);
  var fk = {ch:ch, x:w / 2, y:h - 8, face:1, act:act || 'idle', at:at || 0, ad:ad || 0, flash:0, vis:1, wk:0, num:0, ph:0, zoom:zoom, noShadow:true};
  c2.save(); drawFighter(fk); c2.restore(); x = old;
}
