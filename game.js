// ===== O'yin mantig'i =====
var G = {state:'menu', t:0, ts:1, hs:0, shake:0, timer:60, msg:'', msgT:0, msgMax:1, dark:0, ultMsg:null, stage:0, cam:{cx:W / 2, z:1},
         F:[], mode:'cpu', diff:1, round:1, paused:false, stT:0, winner:-1};
var PRJ = [], PTS = [], RINGS = [], POPS = [], BEAMS = [], SCH = [], ITM = [];
G.gang = null;
if (typeof sfx == 'undefined') sfx = function () {};

function later(d, fn) { SCH.push({t:d, fn:fn}); }
function say(txt, d) { G.msg = txt; G.msgT = d; G.msgMax = d; }
function foes(f) { var r = []; for (var i = 0; i < G.F.length; i++) { var q = G.F[i]; if (q.team != f.team && q.act != 'ko') r.push(q); } return r; }
function mkF(ch, side, human) {
  return {ch:ch, num:side, x:side ? W * .72 : W * .28, y:GY, vx:0, vy:0, face:side ? -1 : 1, hp:ch.hp, mhp:ch.hp, lag:ch.hp, en:30, act:'idle', at:0, ad:0, cd:0,
          hitF:false, chain:0, chainT:0, combo:0, comboT:0, inv:0, stun:0, buffT:0, wk:0, flash:0, vis:1, noG:false, launched:false, ph:0, human:human,
          in:{l:0, r:0, u:0, b:0}, pr:{a:0, s:0, t:0, d:0}, win:0, aiT:0, aiB:0, opp:null, hp0:.46, team:side, rd:0, dcd:0, rm:0, minion:false, boss:false};
}
function resetF(f, i) {
  f.x = i ? W * .72 : W * .28; f.y = GY; f.vx = f.vy = 0; f.face = i ? -1 : 1; f.hp = f.mhp; f.lag = f.mhp; f.en = Math.max(f.en * .4, 25); f.act = 'idle'; f.at = f.ad = 0;
  f.cd = f.inv = f.stun = f.buffT = f.comboT = f.chainT = f.flash = 0; f.vis = 1; f.noG = false; f.launched = false; f.combo = 0; f.ph = 0; f.pr.a = f.pr.s = f.pr.t = f.pr.d = 0; f.dcd = 0;
}
function startMatch(o) {
  G.gang = null; if (o.mode == 'hell') { o.mode = 'gang'; o.hard = true; } if (o.mode == 'gang') { startGang(o); return; }
  G.mode = o.mode; G.diff = o.diff == null ? 1 : o.diff; G.stage = o.stage; G.round = 1;
  G.F = [mkF(o.c1, 0, true), mkF(o.c2, 1, o.mode == 'pvp')]; G.F[0].opp = G.F[1]; G.F[1].opp = G.F[0];
  G.F[0].en = G.F[1].en = 30; startRound();
}
function startRound() {
  PRJ.length = PTS.length = RINGS.length = POPS.length = BEAMS.length = SCH.length = ITM.length = 0;
  G.F.forEach(resetF); G.timer = 60; G.state = 'intro'; G.stT = 0; G.ts = 1; G.hs = 0; G.dark = 0; G.ultMsg = null; G.paused = false;
  say(G.mode == 'gang' ? "TO'LQIN " + G.gang.wave : G.mode == 'train' ? 'MASHQ' : 'RAUND ' + G.round, 1.4); sfx('round');
}

// ----- effektlar -----
function burst(px, py, col, n, sp) { for (var i = 0; i < n; i++) { var a = rand(0, 6.28), v = rand(.3, 1) * sp; PTS.push({kind:'spark', x:px, y:py, vx:Math.cos(a) * v, vy:Math.sin(a) * v - 40, l:.4, ml:.4, col:col}); } }
function dust(px, py, n) { for (var i = 0; i < n; i++) PTS.push({kind:'dust', x:px + rand(-14, 14), y:py, vx:rand(-60, 60), vy:rand(-50, -5), l:.5, ml:.5, r:rand(5, 11), col:'#d9c9b0'}); }
function ringFx(px, py, mr, col, flat, w) { RINGS.push({x:px, y:py, r:6, mr:mr, l:.35, ml:.35, col:col, flat:flat, w:w || 5}); }
function pop(px, py, txt, col, size) { POPS.push({x:px, y:py, l:.8, txt:txt, col:col, size:size || 22}); }
function updFX(dt) {
  PTS.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind == 'spark') p.vy += 500 * dt; p.l -= dt; }); PTS = PTS.filter(function (p) { return p.l > 0; });
  RINGS.forEach(function (r) { r.r += (r.mr - r.r) * Math.min(1, dt * 9); r.l -= dt; }); RINGS = RINGS.filter(function (r) { return r.l > 0; });
  POPS.forEach(function (p) { p.y -= 40 * dt; p.l -= dt; }); POPS = POPS.filter(function (p) { return p.l > 0; });
  for (var i = SCH.length - 1; i >= 0; i--) { SCH[i].t -= dt; if (SCH[i].t <= 0) { var s = SCH.splice(i, 1)[0]; s.fn(); } }
}

// ----- zarba va zarar -----
function hurt(t, dmg, dir, kb, stun, launch, src, fl) {
  if (t.inv > 0 || t.act == 'ko' || t.act == 'down' || G.state != 'fight') return 0;
  fl = fl || {};
  if (src && src.buffT > 0) dmg *= 1.3;
  if (t.act == 'block' && dir == -t.face && !fl.unb) {
    t.hp = Math.max(1, t.hp - dmg * .12); t.vx = dir * kb * .35; t.en = Math.min(100, t.en + dmg * .6); burst(t.x + t.face * 22, t.y - 56, '#9fd8ff', 8, 220);
    ringFx(t.x + t.face * 22, t.y - 56, 26, '#9fd8ff', false, 3); G.hs = Math.max(G.hs, .04); sfx('block'); return 2;
  }
  if (src) { src.combo = src.comboT > 0 ? src.combo + 1 : 1; src.comboT = 1.3; dmg *= Math.max(.45, 1 - .07 * (src.combo - 1)); src.en = Math.min(100, src.en + dmg * .9); }
  t.en = Math.min(100, t.en + dmg * .5); t.hp -= dmg; t.flash = .1;
  var px = t.x - dir * 4, py = t.y - 58; burst(px, py, '#fff', 8, 300); burst(px, py, src ? src.ch.sc : '#ffd54a', 8, 260); ringFx(px, py, 34 + dmg, '#fff', false, 4);
  pop(t.x, t.y - 108, Math.round(dmg), dmg > 14 ? '#ff6b6b' : '#fff', dmg > 14 ? 34 : 24);
  G.shake = Math.max(G.shake, .08 + dmg * .008); G.hs = Math.max(G.hs, .04 + dmg * .004); sfx(dmg > 14 ? 'big' : 'hit');
  t.noG = false; t.vis = 1; t.ph = 0;
  if (t.hp <= 0 && G.mode == 'train') t.hp = t.mhp;
  if (typeof buzz == 'function' && t.human) buzz(t.hp <= 0 ? 160 : dmg > 14 ? 45 : 18);
  if (t.hp <= 0) { t.hp = 0; koF(t, dir); return 1; }
  t.act = 'hurt'; t.at = 0; t.ad = stun || .3; t.stun = stun || .3; t.vx = dir * kb; t.hitF = true;
  if (launch) { t.vy = -launch; t.launched = true; t.ad = 9; }
  return 1;
}
function koF(t, dir) {
  t.act = 'ko'; t.at = 0; t.ad = 0; t.vx = dir * 320; t.vy = -480; t.noG = false; t.vis = 1; t.launched = false;
  if (G.mode == 'gang') {
    if (t.team == 0) { G.winner = 1; G.state = 'ko'; G.stT = 0; G.ts = .3; G.dark = 0; say('TUGADI!', 2.4); G.shake = .5; sfx('ko'); }
    else gangKill(t);
    return;
  }
  var w = t.opp; G.winner = w.num; w.win++; G.state = 'ko'; G.stT = 0; G.ts = .3; G.dark = 0; say('K.O.!', 2.4); G.shake = .5; sfx('ko');
}
function aoe(f, rad, dmg, launch, kb, stun, col) {
  ringFx(f.x, f.y - 6, rad, col, true, 7); ringFx(f.x, f.y - 6, rad * .6, '#fff', true, 4); dust(f.x - rad * .5, f.y, 6); dust(f.x + rad * .5, f.y, 6); G.shake = .3; sfx('boom');
  foes(f).forEach(function (o) { if (Math.abs(o.x - f.x) < rad + 14 && Math.abs(o.y - f.y) < 90) hurt(o, dmg, o.x >= f.x ? 1 : -1, kb, stun, launch, f, {unb:true}); });
}
function strike(f) {
  var ch = f.ch, kick = f.act == 'kick', air = f.act == 'air', reach = (kick ? 70 : 58) + WR[ch.wp] + (air ? 10 : 0), any = false;
  PTS.push({kind:'slash', x:f.x + f.face * 38, y:f.y - 62, d:f.face, r:kick ? 30 : 22, l:.16, ml:.16, vx:0, vy:0, col:ch.sc});
  foes(f).forEach(function (o) {
    var dx = (o.x - f.x) * f.face;
    if (dx > -14 && dx < reach + 16 && Math.abs(o.y - f.y) < 80) { any = true; hurt(o, ch.pow * (kick ? 1.35 : 1) * (air ? 1.1 : 1), f.face, kick ? 300 : 200, kick ? .4 : .28, (kick && f.chain == 2 && !air) ? 360 : 0, f); }
  });
  if (!any) sfx('whiff');
}
function startAtk(f) {
  var air = f.y < GY - 1;
  if (air) { f.act = 'air'; f.ad = .45; f.hp0 = .45; }
  else {
    f.chain = f.chainT > 0 ? (f.chain + 1) % 3 : 0; f.chainT = .9;
    f.act = ['punch', 'punch2', 'kick'][f.chain]; f.ad = [.34, .34, .5][f.chain]; f.hp0 = f.chain == 2 ? .5 : .46;
  }
  f.at = 0; f.hitF = false; f.cd = 0; f.pr.a = 0; sfx('swing');
}
function startCast(f) { f.act = 'cast'; f.at = 0; f.ad = .55; f.hitF = false; f.en -= 30; f.cd = .35; f.vx = 0; f.pr.s = 0; sfx('cast'); }
function startUlt(f) {
  f.act = 'ult'; f.at = 0; f.ad = 1; f.hitF = false; f.en = 0; f.vx = 0; f.inv = 1.1; f.pr.t = 0;
  G.ultMsg = {txt:f.ch.ultn, col:f.ch.sc, t:1.2}; G.hs = .3; G.dark = 1; sfx('ult'); if (typeof buzz == 'function' && f.human) buzz(70);
}

// ----- maxsus hujumlar -----
function shot(f, k, vx, vy, r, dmg, o) {
  o = o || {}; PRJ.push({k:k, x:o.x == null ? f.x + f.face * 40 : o.x, y:o.y == null ? f.y - 62 : o.y, vx:vx, vy:vy, r:r, dmg:dmg, own:f, col:f.ch.sc, life:o.life || 2, stun:o.stun || .35, kb:o.kb || 260, launch:o.launch || 0});
}
function fireSpecial(f, o) {
  var ch = f.ch, k = ch.sp, d = f.face, pw = ch.pow / 7;
  if (k == 'orb') shot(f, 'orb', d * 560, 0, 16, 14 * pw);
  else if (k == 'wave') shot(f, 'wave', d * 440, 0, 24, 13 * pw, {y:GY - 20, launch:260, life:1.8});
  else if (k == 'dash') { f.act = 'dash'; f.at = 0; f.ad = .3; f.hitF = false; f.vx = d * 700; f.inv = .1; }
  else if (k == 'tele') {
    burst(f.x, f.y - 50, ch.sc, 14, 300); f.x = clamp(o.x - o.face * 62, AL, AR); f.face = o.x >= f.x ? 1 : -1; burst(f.x, f.y - 50, ch.sc, 14, 300);
    hurt(o, 15 * pw, f.face, 280, .4, 300, f);
  }
  else if (k == 'multi') [-120, 0, 120].forEach(function (vy, i) { shot(f, 'needle', d * 600, vy, 9, 7 * pw, {y:f.y - 70, life:1.1}); });
  else if (k == 'slam') aoe(f, 130, 16 * pw, 430, 240, .5, ch.sc);
  else if (k == 'buff') { f.buffT = 7; burst(f.x, f.y - 55, ch.sc, 24, 260); ringFx(f.x, f.y - 6, 70, ch.sc, true, 6); }
  else if (k == 'heal') { f.hp = Math.min(f.mhp, f.hp + 22); burst(f.x, f.y - 55, '#8bff9e', 22, 200); ringFx(f.x, f.y - 6, 60, '#8bff9e', true, 6); pop(f.x, f.y - 120, '+22', '#8bff9e', 26); }
  else if (k == 'pull') shot(f, 'hook', d * 820, 0, 14, 8 * pw, {life:.7, kb:0, stun:.6});
  else if (k == 'rain') for (var i = 0; i < 5; i++) (function (i) {
    later(i * .1, function () { var tx = clamp(f.opp.x + (i - 2) * 46, AL, AR); PRJ.push({k:'drop', x:tx, y:-30, vx:0, vy:760, r:12, dmg:7 * pw, own:f, col:ch.sc, life:1.6, stun:.3, kb:140, launch:0}); });
  })(i);
}
function fireUlt(f, o) {
  var ch = f.ch, k = ch.ult, d = f.face, pw = ch.pow / 7;
  if (k == 'beam') BEAMS.push({own:f, x:f.x + d * 28, y:f.y - 62, dir:d, len:900, h:50, life:.8, tk:0, n:0, dmg:7 * pw, col:ch.sc});
  else if (k == 'barrage') for (var i = 0; i < 9; i++) (function (i) {
    later(i * .1, function () { if (f.act == 'ko') return; shot(f, 'orb', f.face * 640, rand(-70, 70), 13, 5.2 * pw, {y:f.y - 62 + rand(-16, 16), stun:.22, kb:120}); sfx('cast'); });
  })(i);
  else if (k == 'quake') {
    aoe(f, 230, 26 * pw, 560, 300, .6, ch.sc);
    [-1, 1].forEach(function (s) { shot(f, 'wave', s * 480, 0, 24, 10 * pw, {y:GY - 20, launch:300, life:1.6}); });
  }
  else if (k == 'dive') {
    f.act = 'dive'; f.at = 0; f.ad = 9; f.ph = 0; f.noG = true; f.vy = -700; f.hitF = false; f.inv = 2.4;
  }
  else if (k == 'blitz') {
    f.act = 'blitz'; f.at = 0; f.ad = .95; f.inv = 1.2;
    [0, .22, .44, .66].forEach(function (t, i) {
      later(t, function () {
        if (f.act != 'blitz') return;
        var s = i % 2 ? 1 : -1; burst(f.x, f.y - 50, ch.sc, 10, 260); f.x = clamp(o.x + s * 58, AL, AR); f.face = o.x >= f.x ? 1 : -1; f.y = GY; f.vy = 0; burst(f.x, f.y - 50, ch.sc, 10, 260);
        o.inv = 0; o.act == 'down' && (o.act = 'idle'); hurt(o, (i == 3 ? 14 : 6) * pw, f.face, 160, .3, i == 3 ? 470 : 0, f, {unb:true}); sfx('swing');
      });
    });
  }
}

// ----- yangilash -----
function updF(f, o, dt) {
  var ch = f.ch, i = f.in, p = f.pr, grounded = f.y >= GY - .5;
  f.cd -= dt; f.inv -= dt; f.stun -= dt; f.buffT -= dt; f.comboT -= dt; f.chainT -= dt; f.flash -= dt; f.at += dt; p.a -= dt; p.s -= dt; p.t -= dt; p.d -= dt; f.dcd -= dt;
  f.lag = f.lag > f.hp ? Math.max(f.hp, f.lag - 28 * dt) : f.hp;
  if (G.state == 'fight' && f.act != 'ko') f.en = Math.min(100, f.en + 3 * dt);
  if (f.buffT > 0 && Math.random() < .35) PTS.push({kind:'glow', x:f.x + rand(-18, 18), y:f.y - rand(10, 90), vx:0, vy:-60, l:.5, ml:.5, r:4, col:ch.sc});
  var a = f.act, pr = f.ad > 0 ? f.at / f.ad : 0;
  if (a == 'down') { if (f.at >= f.ad) { f.act = 'idle'; f.inv = .35; } }
  else if (a == 'hurt') {
    if (f.launched) { if (grounded && f.vy >= 0 && f.at > .08) { f.launched = false; f.act = 'down'; f.at = 0; f.ad = .55; dust(f.x, f.y, 8); G.shake = Math.max(G.shake, .15); sfx('thud'); } }
    else if (f.at >= f.ad) f.act = 'idle';
  }
  else if (a == 'punch' || a == 'punch2' || a == 'kick' || a == 'air') {
    if (!f.hitF && pr >= f.hp0) { f.hitF = true; strike(f, o); }
    if (a != 'air') f.vx = pr > .2 && pr < .5 ? f.face * (a == 'kick' ? 150 : 110) : 0;
    if (p.a > 0 && pr >= .5 && f.cd <= 0) startAtk(f);
    else if (f.at >= f.ad) { f.act = f.y < GY - 1 ? 'jump' : 'idle'; f.vx = 0; }
  }
  else if (a == 'cast') { f.vx = 0; if (!f.hitF && pr >= .5) { f.hitF = true; fireSpecial(f, o); } if (f.act == 'cast' && f.at >= f.ad) f.act = 'idle'; }
  else if (a == 'ult') { f.vx = 0; if (!f.hitF && pr >= .75) { f.hitF = true; fireUlt(f, o); } if (f.act == 'ult' && f.at >= f.ad) f.act = 'idle'; }
  else if (a == 'dash') {
    f.vx = f.face * 700; PTS.push({kind:'streak', x:f.x, y:f.y - 55, d:f.face, l:.2, ml:.2, vx:0, vy:0, col:ch.sc});
    if (!f.hitF) { var dq = foes(f).filter(function (q) { return Math.abs(q.x - f.x) < 54 && Math.abs(q.y - f.y) < 80; })[0]; if (dq) { f.hitF = true; hurt(dq, 15 * ch.pow / 7, f.face, 300, .4, 320, f); burst(dq.x, dq.y - 55, ch.sc, 14, 340); } }
    if (f.at >= f.ad) { f.act = 'idle'; f.vx = 0; }
  }
  else if (a == 'blitz') { PTS.push({kind:'streak', x:f.x, y:f.y - 55, d:f.face, l:.15, ml:.15, vx:0, vy:0, col:ch.sc}); if (f.at >= f.ad) f.act = 'idle'; }
  else if (a == 'dive') {
    if (f.ph == 0) { f.vis = Math.max(0, 1 - f.at / .3); if (f.at >= .35) { f.ph = 1; f.at = 0; f.vis = 0; f.x = clamp(o.x, AL, AR); f.y = GY - 340; f.vy = 0; f.vx = 0; } }
    else if (f.ph == 1) { f.vx = 0; f.vy = 0; f.x = clamp(o.x, AL, AR); if (Math.random() < .5) PTS.push({kind:'glow', x:f.x + rand(-30, 30), y:GY, vx:0, vy:-30, l:.3, ml:.3, r:6, col:ch.sc}); if (f.at >= .5) { f.ph = 2; f.vis = 1; f.vy = 1700; f.face = o.x >= f.x ? 1 : -1; f.at = 0; } }
    else if (f.y >= GY - .5 && f.vy >= 0) { f.noG = false; f.ph = 0; f.act = 'idle'; f.inv = .2; aoe(f, 150, 32 * ch.pow / 7, 520, 300, .6, ch.sc); }
  }
  else if (a == 'roll') {
    PTS.push({kind:'streak', x:f.x, y:f.y - 55, d:f.rd || -f.face, l:.18, ml:.18, vx:0, vy:0, col:ch.sc}); f.vx = (f.rd || -f.face) * 640 * (1 - pr * .55);
    if (f.at >= f.ad) { f.act = 'idle'; f.vx = 0; }
  }
  else if (a != 'ko' && G.state == 'fight' && f.stun <= 0) {
    var air = !grounded, spd = ch.spd * (f.buffT > 0 ? 1.3 : 1);
    if (p.d > 0 && f.dcd <= 0 && !air) { p.d = 0; f.act = 'roll'; f.at = 0; f.ad = .3; f.inv = Math.max(f.inv, .28); f.vx = (f.rd || -f.face) * 640; f.cd = .1; f.dcd = .85; f.pr.a = 0; dust(f.x, f.y, 5); sfx('jump'); }
    else if (i.b && !air) { if (f.act != 'block') { f.act = 'block'; f.at = 0; f.ad = .2; } f.vx = 0; if (grounded) f.face = o.x >= f.x ? 1 : -1; }
    else {
      var dir = (i.r ? 1 : 0) - (i.l ? 1 : 0);
      f.vx = dir * spd * (air ? .9 : 1); if (!air) f.face = o.x >= f.x ? 1 : -1;
      if (air) f.act = 'jump'; else if (dir) { f.act = 'walk'; f.wk += dt * Math.abs(f.vx) / 20 * (dir == f.face ? 1 : -1); } else f.act = 'idle';
      if (i.u && !air) { f.vy = -760; f.act = 'jump'; dust(f.x, f.y, 4); sfx('jump'); }
      if (p.a > 0 && f.cd <= 0) startAtk(f);
      else if (p.s > 0 && f.en >= 30 && f.cd <= 0) startCast(f);
      else if (p.t > 0 && f.en >= 100) startUlt(f);
    }
  }
  if (a == 'ko' || a == 'hurt' || a == 'down') f.vx *= Math.pow(.03, dt);
  if (!f.noG) f.vy += 1900 * dt;
  f.y += f.vy * dt; f.x += f.vx * dt;
  if (f.y >= GY) { f.y = GY; if (f.vy > 0) f.vy = 0; }
  f.x = clamp(f.x, AL, AR);
}
function updPRJ(dt) {
  for (var n = 0; n < PRJ.length; n++) {
    var p = PRJ[n]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.k == 'needle' && Math.random() < .5) PTS.push({kind:'glow', x:p.x, y:p.y, vx:0, vy:0, l:.15, ml:.15, r:4, col:p.col});
    var fl = foes(p.own);
    for (var q = 0; q < fl.length && p.life > 0; q++) {
      var t = fl[q], cy = t.y - 52, hit = false;
      if (p.k == 'wave') hit = Math.abs(p.x - t.x) < p.r + 18 && t.y > GY - 52;
      else hit = Math.abs(p.x - t.x) < p.r + 18 && Math.abs(p.y - cy) < p.r + 46;
      if (hit) {
        var dir = p.vx > 0 ? 1 : p.vx < 0 ? -1 : p.own.face, res = hurt(t, p.dmg, dir, p.kb, p.stun, p.launch, p.own);
        if (res) {
          if (p.k == 'hook' && res == 1) { t.x = clamp(p.own.x + p.own.face * 70, AL, AR); t.stun = .6; t.ad = .6; }
          burst(p.x, p.y, p.col, 10, 300); p.life = 0;
        }
      }
    }
    if (p.y > GY + 6 && p.k != 'wave') { p.life = 0; dust(p.x, GY, 4); ringFx(p.x, GY - 4, 26, p.col, true, 3); }
    if (p.x < -90 || p.x > W + 90) p.life = 0;
  }
  for (var a = 0; a < PRJ.length; a++) for (var b = a + 1; b < PRJ.length; b++) {
    var u = PRJ[a], v = PRJ[b];
    if (u.k == 'orb' && v.k == 'orb' && u.own.team != v.own.team && Math.abs(u.x - v.x) < 26 && Math.abs(u.y - v.y) < 26) { u.life = v.life = 0; burst(u.x, u.y, '#fff', 14, 300); ringFx(u.x, u.y, 40, '#fff', false, 4); sfx('block'); }
  }
  PRJ = PRJ.filter(function (p) { return p.life > 0; });
  BEAMS.forEach(function (b) {
    b.life -= dt; b.tk -= dt;
    if (b.tk <= 0 && b.n < 5) {
      b.tk = .12; b.n++; var x0 = b.dir > 0 ? b.x : b.x - b.len;
      foes(b.own).forEach(function (t) { if (t.x > x0 && t.x < x0 + b.len && Math.abs(t.y - 52 - b.y) < b.h + 30) { t.inv = 0; hurt(t, b.dmg, b.dir, 120, .25, b.n == 5 ? 430 : 0, b.own, {unb:true}); } });
    }
  });
  BEAMS = BEAMS.filter(function (b) { return b.life > 0; });
}
// ----- sun'iy intellekt -----
function ai(f, o, dt) {
  var i = f.in, p = f.pr, ch = f.ch, df = G.diff, react = [.3, .19, .1][df];
  if (G.mode == 'train') { i.l = i.r = i.u = i.b = 0; return; }
  if (f.aiB > 0) { f.aiB -= dt; i.b = 1; } else i.b = 0;
  f.aiT -= dt; if (f.aiT > 0) return; f.aiT = react * rand(.7, 1.3);
  i.l = i.r = i.u = 0;
  if (G.state != 'fight' || f.stun > 0 || f.act == 'hurt' || f.act == 'down' || f.act == 'roll') return;
  var dx = o.x - f.x, d = Math.abs(dx), dir = dx > 0 ? 1 : -1, sp = ch.sp, grounded = f.y >= GY - 1, slot = true;
  if (G.mode == 'gang' && f.team == 1) {
    var rank = 0; G.F.forEach(function (q) { if (q != f && q.team == 1 && q.act != 'ko' && Math.abs(q.x - o.x) < d) rank++; });
    slot = rank < (o.hp < o.mhp * .35 ? 1 : 2);
  }
  var threat = PRJ.find(function (q) { return q.own.team != f.team && Math.abs(q.x - f.x) < 230 && (q.vx == 0 || (f.x - q.x) * q.vx > 0); });
  var melee = (o.act == 'punch' || o.act == 'punch2' || o.act == 'kick' || o.act == 'dash') && d < 120;
  if ((threat || melee) && grounded && Math.random() < [.3, .55, .8][df]) {
    if (f.dcd <= 0 && Math.random() < [.1, .2, .3][df]) { p.d = .15; f.rd = -dir; return; }
    if (threat && threat.k == 'wave' && Math.random() < .7) i.u = 1; else { f.aiB = rand(.3, .6); i.b = 1; return; }
  }
  if (!f.minion && f.en >= 100 && d < 560 && Math.random() < .5) { p.t = .15; return; }
  if (f.en >= 30 && f.cd <= 0 && Math.random() < [.25, .35, .5][df] * (f.minion ? .5 : 1)) {
    var go = false;
    if (sp == 'orb' || sp == 'multi' || sp == 'wave' || sp == 'rain') go = d > 180 && d < 620;
    else if (sp == 'dash' || sp == 'tele' || sp == 'pull') go = d > 130 && d < 460;
    else if (sp == 'slam') go = d < 140;
    else if (sp == 'buff') go = f.buffT <= 0;
    else if (sp == 'heal') go = f.hp < f.mhp * .6;
    if (go) { p.s = .15; return; }
  }
  var want = (sp == 'orb' || sp == 'multi' || sp == 'wave') && Math.random() < .3 ? 300 : 64;
  if (!slot) want = 210;
  if (d > want + 16) { if (dir > 0) i.r = 1; else i.l = 1; }
  else if (d < want - 30 && Math.random() < .4) { if (dir > 0) i.l = 1; else i.r = 1; }
  if (d < 92 && (slot || d < 70) && Math.random() < [.4, .6, .8][df]) p.a = .15;
  if (grounded && Math.random() < .04) i.u = 1;
}
// ----- asosiy yangilash -----
function endRound(w) {
  if (w >= 0) { G.F[w].win++; say('K.O.!', 2.2); } else say('DURANG!', 2.2);
  G.winner = w; G.state = 'ko'; G.stT = 0;
}
function nextRound() {
  if (G.mode == 'gang') { G.state = 'over'; if (typeof onMatchEnd == 'function') onMatchEnd(1); return; }
  var a = G.F[0], b = G.F[1];
  if (a.win >= 2 || b.win >= 2 || G.round >= 5) { G.state = 'over'; var w = a.win == b.win ? -1 : (a.win > b.win ? 0 : 1); if (typeof onMatchEnd == 'function') onMatchEnd(w); }
  else { G.round++; startRound(); }
}
function updCam(dt) {
  var lo = 1e9, hi = -1e9; G.F.forEach(function (f) { if (f.act != 'ko' || f.team == 0 || G.F.length < 3) { lo = Math.min(lo, f.x); hi = Math.max(hi, f.x); } });
  if (lo > hi) return;
  var z = clamp(1.22 - (hi - lo) / 1100, 1, 1.2), vw = W / z, cx = clamp((lo + hi) / 2, vw / 2, W - vw / 2);
  G.cam.cx = lerp(G.cam.cx, cx, Math.min(1, dt * 6)); G.cam.z = lerp(G.cam.z, z, Math.min(1, dt * 4));
}
function tick(dt) {
  G.t += dt * (G.paused ? 0 : 1);
  if (G.paused || !G.F.length || G.state == 'menu') return;
  if (G.shake > 0) G.shake -= dt;
  if (G.ultMsg) { G.ultMsg.t -= dt; if (G.ultMsg.t <= 0) G.ultMsg = null; }
  if (G.dark > 0) G.dark -= dt;
  G.msgT -= dt; updCam(dt);
  if (G.hs > 0) { G.hs -= dt; return; }
  if (G.state == 'ko') { G.stT += dt; if (G.stT > 1.3) G.ts = Math.min(1, G.ts + dt * 2); if (G.stT > 3) nextRound(); }
  var sd = dt * G.ts; if (G.state == 'over') return;
  G.stT += G.state == 'ko' ? 0 : dt;
  if (G.state == 'intro' && G.stT >= 1.4) { G.state = 'fight'; say(G.mode == 'train' ? 'MASHQ!' : 'BOSHLA!', .9); sfx('go'); }
  updFX(sd); updITM(sd);
  if (G.mode == 'gang') { gangLink(); gangTick(sd); }
  G.F.forEach(function (f) { if (!f.human && G.state == 'fight') ai(f, f.opp, sd); });
  G.F.slice().forEach(function (f) { updF(f, f.opp, sd); });
  for (var m = 0; m < G.F.length; m++) for (var n = m + 1; n < G.F.length; n++) {
    var u = G.F[m], v = G.F[n];
    if (Math.abs(u.y - v.y) < 70 && Math.abs(u.x - v.x) < 38 && u.act != 'ko' && v.act != 'ko') { var pu = (38 - Math.abs(u.x - v.x)) / 2 + .5, s = u.x <= v.x ? -1 : 1; u.x = clamp(u.x + s * pu, AL, AR); v.x = clamp(v.x - s * pu, AL, AR); }
  }
  updPRJ(sd);
  if (G.mode == 'gang') for (var k = G.F.length - 1; k > 0; k--) { var e = G.F[k]; if (e.act == 'ko') { e.rm -= sd; e.vis = clamp(e.rm / .5, 0, 1); if (e.rm <= 0) G.F.splice(k, 1); } }
  if (G.state == 'fight') {
    if (G.mode == 'train') { G.timer = 99; G.F[0].hp = G.F[0].mhp; G.F[0].en = 100; }
    else if (G.mode != 'gang') {
      var a = G.F[0], b = G.F[1]; G.timer -= sd;
      if (G.timer <= 0) { var fa = a.hp / a.mhp, fb = b.hp / b.mhp; endRound(Math.abs(fa - fb) < .005 ? -1 : (fa > fb ? 0 : 1)); }
    }
  }
}

// ----- To'daga qarshi rejim (omon qolish) -----
function startGang(o) {
  G.mode = 'gang'; G.diff = 0; G.stage = o.stage; G.round = 1;
  var p = mkF(o.c1, 0, true); G.F = [p]; p.en = 30; p.opp = p;
  G.gang = {hard:!!o.hard, wave:1, score:0, kills:0, q:[], alive:2, spT:0, clearing:false, boss:false, pool:FIGHTERS.filter(function (q) { return q.id != o.c1.id; })};
  startRound(); gangWave(1);
}
function gangWave(n) {
  var g = G.gang, H_ = g.hard, total = Math.min(H_ ? 18 : 14, (H_ ? 4 : 3) + n + Math.floor(n / 2)), boss = n % (H_ ? 3 : 5) == 0; g.wave = n; g.boss = boss; g.q = [];
  G.diff = H_ ? Math.min(2, Math.floor(n / 2)) : Math.min(2, Math.floor((n - 1) / 3));
  for (var i = 0; i < total; i++) {
    var base = g.pool[Math.floor(Math.random() * g.pool.length)], c = Object.assign({}, base), isBoss = boss && i == 0;
    if (isBoss) { c.hp = Math.round(base.hp * (H_ ? 3.6 + n * .12 : 2.6 + n * .08)); c.pow = base.pow * (H_ ? 1.35 : 1.15); c.sz = (base.sz || 1) * 1.22; c.spd = base.spd * .95; }
    else if (H_) { c.hp = Math.round(base.hp * clamp(.55 + n * .08, .6, 1.5)); c.pow = base.pow * clamp(.7 + n * .05, .75, 1.4); }
    else { c.hp = Math.round(base.hp * clamp(.45 + n * .04, .45, .9)); c.pow = base.pow * clamp(.55 + n * .03, .55, .9); }
    g.q.push({ch:c, boss:isBoss});
  }
  if (boss) { var bs = g.q.shift(); g.q.splice(Math.min(2, g.q.length), 0, bs); }
  g.alive = H_ ? Math.min(5, 2 + Math.floor(n / 2)) : Math.min(4, 2 + Math.floor((n - 1) / 3)); g.spT = .9; g.clearing = false;
}
function spawnEnemy(c) {
  var f = mkF(c.ch, 1, false), r = Math.random() < .5; f.team = 1; f.boss = !!c.boss; f.minion = !c.boss; f.num = G.F.length + 1;
  f.x = r ? AR : AL; f.face = r ? -1 : 1; f.inv = .6; f.en = rand(0, 35); f.opp = G.F[0]; G.F.push(f);
  dust(f.x, f.y, 6); ringFx(f.x, f.y - 6, 50, c.ch.sc, true, 5); sfx('thud');
  if (c.boss) { say('BOSS: ' + c.ch.n, 1.8); G.shake = .4; sfx('boom'); }
}
function gangLink() {
  var p = G.F[0], best = null, bd = 1e9;
  G.F.forEach(function (f) { if (f.team == 1) { f.opp = p; if (f.act != 'ko') { var d = Math.abs(f.x - p.x); if (d < bd) { bd = d; best = f; } } } });
  p.opp = best || {x:p.x + p.face * 120, y:GY, act:'ko', team:1, hp:1, mhp:1, en:0, ch:p.ch, vx:0, vy:0};
}
function gangTick(dt) {
  var g = G.gang; if (!g || G.state != 'fight' || G.F[0].act == 'ko') return;
  g.spT -= dt; var alive = 0; G.F.forEach(function (f) { if (f.team == 1 && f.act != 'ko') alive++; });
  if (g.q.length && alive < g.alive && g.spT <= 0) { spawnEnemy(g.q.shift()); g.spT = g.boss ? 1.6 : 1.1; }
  else if (!g.q.length && alive == 0 && !g.clearing) gangClear();
}
function gangClear() {
  var g = G.gang, p = G.F[0], n = g.wave; g.clearing = true; var bonus = (40 * n + Math.round(p.hp / p.mhp * 60)) * (g.hard ? 2 : 1); g.score += bonus;
  p.hp = Math.min(p.mhp, p.hp + p.mhp * (g.hard ? .12 : .3)); p.en = Math.min(100, p.en + 30); say("TO'LQIN " + n + ' TOZALANDI!', 2.2); pop(p.x, p.y - 140, '+' + bonus, '#ffd54a', 30);
  burst(p.x, p.y - 55, '#8bff9e', 20, 240); sfx('round');
  later(2.6, function () { if (G.state != 'fight') return; gangWave(n + 1); say("TO'LQIN " + g.wave + (g.boss ? ' · BOSS' : ''), 1.5); sfx('round'); });
}
function gangKill(t) {
  var g = G.gang, p = G.F[0]; t.rm = t.boss ? 2.4 : 1.4; g.kills++;
  var pts = (t.boss ? 150 + 20 * g.wave : 10 + 3 * g.wave) * (g.hard ? 2 : 1); g.score += pts; pop(t.x, t.y - 130, '+' + pts, '#ffd54a', 22);
  p.en = Math.min(100, p.en + 12); G.shake = Math.max(G.shake, .18); G.hs = Math.max(G.hs, .09); sfx('big'); if (typeof buzz == 'function') buzz(t.boss ? 120 : 30);
  var drops = t.boss ? (g.hard ? 2 : 3) : (Math.random() < (g.hard ? .16 : .3) ? 1 : 0);
  for (var i = 0; i < drops; i++) ITM.push({x:clamp(t.x + rand(-30, 30), AL, AR), y:t.y - 90, vy:-260, k:(Math.random() < .55 ? 'hp' : 'en'), life:14, ph:rand(0, 6)});
}
function updITM(dt) {
  var p = G.F[0];
  for (var i = ITM.length - 1; i >= 0; i--) {
    var it = ITM[i]; it.vy += 900 * dt; it.y = Math.min(GY - 14, it.y + it.vy * dt); if (it.y >= GY - 14) it.vy = 0; it.life -= dt; it.ph += dt * 5;
    if (p && p.act != 'ko' && Math.abs(it.x - p.x) < 34 && Math.abs(it.y - (p.y - 40)) < 70) {
      if (it.k == 'hp') { p.hp = Math.min(p.mhp, p.hp + p.mhp * .18); pop(p.x, p.y - 120, '+JON', '#8bff9e', 22); burst(p.x, p.y - 50, '#8bff9e', 12, 220); }
      else { p.en = Math.min(100, p.en + 35); pop(p.x, p.y - 120, '+ENERGIYA', '#7ad7ff', 20); burst(p.x, p.y - 50, '#7ad7ff', 12, 220); }
      sfx('round'); ITM.splice(i, 1); continue;
    }
    if (it.life <= 0) ITM.splice(i, 1);
  }
}
