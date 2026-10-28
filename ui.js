// ===== Interfeys, boshqaruv, ovoz, asosiy sikl =====
var cv = document.getElementById('c'), x = cv.getContext('2d'), ov = document.getElementById('ov'), wrap = document.getElementById('wrap');
var MUTED = false, AC = null;

// ----- Ovoz -----
function actx() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state == 'suspended') AC.resume(); return AC; }
function tone(fr, d, type, v, sl) {
  var c = actx(); if (!c || MUTED) return;
  try { var o = c.createOscillator(), g = c.createGain(), t = c.currentTime; o.type = type || 'square'; o.frequency.setValueAtTime(fr, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, fr + (sl || 0)), t + d); g.gain.setValueAtTime(v || .05, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d); } catch (e) {}
}
function noise(d, v) {
  var c = actx(); if (!c || MUTED) return;
  try { var n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0); for (var i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = c.createBufferSource(), g = c.createGain(); g.gain.value = v; s.buffer = b; s.connect(g); g.connect(c.destination); s.start(); } catch (e) {}
}
function sfx(n) {
  if (n == 'hit') { noise(.07, .16); tone(180, .08, 'square', .05, -90); }
  else if (n == 'big') { noise(.14, .26); tone(110, .16, 'sawtooth', .07, -60); }
  else if (n == 'swing') tone(520, .08, 'triangle', .03, -300);
  else if (n == 'whiff') tone(380, .06, 'triangle', .02, -200);
  else if (n == 'block') { tone(900, .06, 'square', .04, -300); noise(.04, .08); }
  else if (n == 'cast') tone(300, .22, 'sawtooth', .04, 500);
  else if (n == 'ult') { tone(120, .6, 'sawtooth', .07, 600); noise(.3, .1); }
  else if (n == 'boom') { noise(.35, .3); tone(70, .3, 'sawtooth', .08, -40); }
  else if (n == 'jump') tone(260, .1, 'triangle', .03, 260);
  else if (n == 'thud') { noise(.1, .12); tone(80, .12, 'sine', .08, -40); }
  else if (n == 'ko') { tone(220, .8, 'sawtooth', .07, -180); noise(.4, .2); }
  else if (n == 'round') { tone(440, .15, 'square', .04); setTimeout(function () { tone(660, .2, 'square', .04); }, 150); }
  else if (n == 'go') tone(880, .25, 'square', .05);
}

// ----- Kirish (klaviatura va sensor) -----
var KS = [{l:0, r:0, u:0, b:0}, {l:0, r:0, u:0, b:0}];
var KM = {a:[0, 'l'], d:[0, 'r'], w:[0, 'u'], l:[0, 'b'], j:[0, 'a'], k:[0, 's'], u:[0, 't'],
          arrowleft:[1, 'l'], arrowright:[1, 'r'], arrowup:[1, 'u'], '3':[1, 'b'], '1':[1, 'a'], '2':[1, 's'], '4':[1, 't'], numpad1:[1, 'a'], numpad2:[1, 's'], numpad3:[1, 'b'], numpad4:[1, 't']};
function press(pl, k, down) {
  if (G.mode != 'pvp') pl = 0;
  if (k == 'a' || k == 's' || k == 't') { if (down && G.F[pl] && G.F[pl].human) G.F[pl].pr[k] = .15; }
  else KS[pl][k] = down ? 1 : 0;
}
function applyInput() { G.F.forEach(function (f, i) { if (f.human) { f.in.l = KS[i].l; f.in.r = KS[i].r; f.in.u = KS[i].u; f.in.b = KS[i].b; } }); }
document.addEventListener('keydown', function (e) {
  var k = e.key.toLowerCase(); if (e.code && e.code.indexOf('Numpad') == 0) k = e.code.toLowerCase();
  if (k.indexOf('arrow') == 0 || k == ' ') e.preventDefault();
  if (e.repeat) return;
  if (k == 'p' && G.F.length && (G.state == 'fight' || G.state == 'intro')) { G.paused = !G.paused; return; }
  if (k == 'escape' && G.F.length) { G.paused = false; showMain(); return; }
  if (k == 'f') { toggleFS(); return; }
  if (k == 'm') { MUTED = !MUTED; return; }
  var m = KM[k]; if (m) press(m[0], m[1], true);
});
document.addEventListener('keyup', function (e) { var k = e.key.toLowerCase(); if (e.code && e.code.indexOf('Numpad') == 0) k = e.code.toLowerCase(); var m = KM[k]; if (m) press(m[0], m[1], false); });
document.querySelectorAll('#pad button').forEach(function (b) {
  var k = b.dataset.k;
  b.addEventListener('pointerdown', function (e) { e.preventDefault(); press(0, k, true); b.classList.add('on'); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, function () { press(0, k, false); b.classList.remove('on'); }); });
  b.oncontextmenu = function () { return false; };
});
document.addEventListener('visibilitychange', function () { if (document.hidden && (G.state == 'fight' || G.state == 'intro')) G.paused = true; });

// ----- Menyular -----
var SEL = {mode:'cpu', step:0, picks:[], fac:'n', cur:0, stage:-1, diff:1, steps:[], last:null, tour:null};
function showMain() {
  G.state = 'menu'; G.F = []; PRJ.length = PTS.length = RINGS.length = POPS.length = BEAMS.length = SCH.length = 0; ov.hidden = false; stopPrev();
  ov.innerHTML = '<h1>⚔️ Stickman Arena</h1><p>Soya klani va Dengiz bo\'rilari: 30 ta original jangchi. Istalgan ikkitasini tanlang va jang qiling!</p>' +
    '<div class="col"><button class="b" data-a="mode" data-v="cpu">🤖 Kompyuterga qarshi</button><button class="b" data-a="mode" data-v="pvp">👥 2 o\'yinchi</button>' +
    '<button class="b" data-a="mode" data-v="tour">🏆 Turnir (5 jang)</button><button class="s" data-a="help">❓ Boshqaruv</button></div>';
}
function showHelp() {
  ov.innerHTML = '<h2>Boshqaruv</h2><div class="help"><b>1-o\'yinchi:</b> A D — yurish · W — sakrash · J — zarba (3 ta ketma-ket = kombo) · K — maxsus (30 energiya) · L — himoya · U — ULT (100 energiya)<br>' +
    '<b>2-o\'yinchi:</b> ← → ↑ · 1 zarba · 2 maxsus · 3 himoya · 4 ULT<br><b>Umumiy:</b> P — pauza · F — to\'liq ekran · M — ovoz · Esc — menyu<br>' +
    '<b>Telefonda:</b> pastdagi tugmalar (2 o\'yinchi rejimi faqat klaviaturada).<br>Zarba bersangiz va zarba yesangiz energiya to\'ladi. Himoya zararni deyarli yo\'qotadi, lekin ULT va yer zarbalarini to\'xtata olmaydi.</div>' +
    '<button class="s" data-a="menu">⬅ Orqaga</button>';
}
function startSelect(mode) {
  SEL.mode = mode; SEL.step = 0; SEL.picks = []; SEL.fac = 'n'; SEL.cur = 0;
  SEL.steps = mode == 'cpu' ? ["Siz uchun jangchini tanlang", "Raqibingizni tanlang"] : mode == 'pvp' ? ["1-o'yinchi: jangchini tanlang", "2-o'yinchi: jangchini tanlang"] : ["Turnir uchun jangchini tanlang"];
  showSelect();
}
function showSelect() {
  stopPrev(); var list = FIGHTERS.filter(function (f) { return f.f == SEL.fac; });
  if (FIGHTERS[SEL.cur].f != SEL.fac) SEL.cur = list[0].id;
  var h = '<h2 style="font-size:1.25em">' + SEL.steps[SEL.step] + '</h2><div class="tabs"><button class="s ' + (SEL.fac == 'n' ? 'on' : '') + '" data-a="fac" data-v="n">' + FACS.n.icon + ' ' + FACS.n.name +
    '</button><button class="s ' + (SEL.fac == 'p' ? 'on' : '') + '" data-a="fac" data-v="p">' + FACS.p.icon + ' ' + FACS.p.name + '</button></div><div class="sel"><div class="grid">';
  list.forEach(function (f) { h += '<button class="card ' + (f.id == SEL.cur ? 'on' : '') + '" data-a="card" data-v="' + f.id + '"><canvas width="72" height="84" data-id="' + f.id + '"></canvas>' + f.n + '</button>'; });
  h += '</div><div class="prev"><canvas id="pv" width="300" height="320"></canvas><h3 id="pn"></h3><div class="bars" id="pb"></div><div class="mv" id="pm"></div></div></div>' +
    '<div class="row"><button class="s" data-a="rand">🎲 Tasodifiy</button><button class="s" data-a="stage">🏞 Maydon: ' + (SEL.stage < 0 ? 'Avto' : STAGES[SEL.stage]) + '</button>' +
    (SEL.mode == 'cpu' || SEL.mode == 'tour' ? '<button class="s" data-a="diff">🎚 Qiyinlik: ' + ['Oson', "O'rta", 'Qiyin'][SEL.diff] + '</button>' : '') +
    '<button class="b" data-a="pick" style="padding:.4em 1.2em">Tanlash ✓</button><button class="s" data-a="menu">⬅</button></div>';
  ov.innerHTML = h;
  ov.querySelectorAll('canvas[data-id]').forEach(function (c) { drawPortrait(c.getContext('2d'), FIGHTERS[+c.dataset.id], 72, 84, .62, 'idle', 0, 0); });
  fillInfo(); startPrev();
}
function fillInfo() {
  var f = FIGHTERS[SEL.cur]; document.getElementById('pn').textContent = FACS[f.f].icon + ' ' + f.n;
  function bar(n, v, m) { return '<div><span>' + n + '</span><i style="width:' + Math.round(v / m * 100) + '%"></i></div>'; }
  document.getElementById('pb').innerHTML = bar('Jon', f.hp, 130) + bar('Tezlik', f.spd, 190) + bar('Kuch', f.pow, 8);
  document.getElementById('pm').innerHTML = '<b>⚡ ' + f.spn + '</b> — ' + SPD[f.sp] + '<br><b>🔥 ' + f.ultn + '</b> — ' + UTD[f.ult];
}
var PV = {run:false, t0:0};
function startPrev() { PV.run = true; PV.t0 = G.t; }
function stopPrev() { PV.run = false; }
var PVA = [['idle', 0, 0, 1.6], ['punch', 0, .34, .34], ['punch2', 0, .34, .34], ['kick', 0, .5, .5], ['cast', 0, .55, .7], ['idle', 0, 0, 1.4]];
function drawPrev() {
  var c = document.getElementById('pv'); if (!c) return; var c2 = c.getContext('2d'), f = FIGHTERS[SEL.cur], tt = (G.t - PV.t0) % 6.5, acc = 0, a = PVA[0];
  for (var i = 0; i < PVA.length; i++) { if (tt < acc + PVA[i][3]) { a = PVA[i]; break; } acc += PVA[i][3]; a = PVA[i]; }
  drawPortrait(c2, f, 300, 320, 1.7, a[0], tt - acc, a[2]);
}

function pickDone() {
  var f = FIGHTERS[SEL.cur]; SEL.picks.push(f); SEL.cur = SEL.step == 0 ? SEL.cur : SEL.cur;
  if (SEL.step < SEL.steps.length - 1) { SEL.step++; showSelect(); return; }
  var st = function () { return SEL.stage < 0 ? Math.floor(Math.random() * STAGES.length) : SEL.stage; };
  SEL.last = {mode:SEL.mode, picks:SEL.picks.slice()};
  if (SEL.mode == 'tour') {
    var others = FIGHTERS.filter(function (q) { return q.id != SEL.picks[0].id; }).sort(function () { return Math.random() - .5; }).slice(0, 5);
    SEL.tour = {list:others, idx:0, c1:SEL.picks[0]}; beginTour();
  } else { ov.hidden = true; startMatch({mode:SEL.mode, c1:SEL.picks[0], c2:SEL.picks[1], stage:st(), diff:SEL.diff}); }
}
function beginTour() {
  var T = SEL.tour, diff = Math.min(2, Math.floor(T.idx / 2) + (SEL.diff > 0 ? 1 : 0)); ov.hidden = true;
  startMatch({mode:'cpu', c1:T.c1, c2:T.list[T.idx], stage:SEL.stage < 0 ? T.idx % 2 : SEL.stage, diff:Math.max(SEL.diff, diff)});
  say('TURNIR ' + (T.idx + 1) + '/5: ' + T.list[T.idx].n, 1.4);
}
function onMatchEnd(w) {
  ov.hidden = false; var h = '', t = SEL.tour;
  if (SEL.mode == 'tour' && t) {
    if (w == 0 && t.idx < 4) { h = '<h2>✅ G\'alaba!</h2><p>Keyingi raqib: <b>' + t.list[t.idx + 1].n + '</b> (' + (t.idx + 2) + '/5)</p><button class="b" data-a="next">Davom etish ➜</button><button class="s" data-a="menu">Menyu</button>'; }
    else if (w == 0) h = '<h2>🏆 CHEMPION!</h2><p>Siz turnirning barcha 5 raqibini yengdingiz!</p><button class="b" data-a="again">Yana o\'ynash</button><button class="s" data-a="menu">Menyu</button>';
    else h = '<h2>💥 Turnir tugadi</h2><p>' + t.list[t.idx].n + ' sizni to\'xtatdi (' + (t.idx + 1) + '/5).</p><button class="b" data-a="again">Qayta urinish</button><button class="s" data-a="menu">Menyu</button>';
  } else {
    var nm = w < 0 ? 'Durang!' : (G.F[w].ch.n + ' g\'alaba qildi!');
    h = '<h2>' + (w < 0 ? '🤝 ' : '🏆 ') + nm + '</h2><p>Hisob: ' + G.F[0].win + ' : ' + G.F[1].win + '</p><button class="b" data-a="again">Qayta o\'ynash</button><button class="s" data-a="reselect">Jangchilarni almashtirish</button><button class="s" data-a="menu">Menyu</button>';
  }
  ov.innerHTML = h;
}
ov.addEventListener('click', function (e) {
  var b = e.target.closest('[data-a]'); if (!b) return; actx(); var a = b.dataset.a, v = b.dataset.v;
  if (a == 'mode') startSelect(v);
  else if (a == 'help') showHelp();
  else if (a == 'menu') showMain();
  else if (a == 'fac') { SEL.fac = v; showSelect(); }
  else if (a == 'card') { SEL.cur = +v; ov.querySelectorAll('.card').forEach(function (c) { c.classList.toggle('on', c.dataset.v == v); }); fillInfo(); PV.t0 = G.t; }
  else if (a == 'rand') { var lst = FIGHTERS.filter(function (f) { return f.f == SEL.fac; }); SEL.cur = lst[Math.floor(Math.random() * lst.length)].id; showSelect(); }
  else if (a == 'stage') { SEL.stage = SEL.stage + 1 >= STAGES.length ? -1 : SEL.stage + 1; showSelect(); }
  else if (a == 'diff') { SEL.diff = (SEL.diff + 1) % 3; showSelect(); }
  else if (a == 'pick') pickDone();
  else if (a == 'next') { SEL.tour.idx++; beginTour(); }
  else if (a == 'again') { if (SEL.mode == 'tour') { SEL.tour.idx = 0; beginTour(); } else { ov.hidden = true; startMatch({mode:SEL.last.mode, c1:SEL.last.picks[0], c2:SEL.last.picks[1], stage:SEL.stage < 0 ? Math.floor(Math.random() * 2) : SEL.stage, diff:SEL.diff}); } }
  else if (a == 'reselect') startSelect(SEL.last.mode);
});

// ----- Chizish va sikl -----
function render() {
  x.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  if (!G.F.length) { drawStage(Math.floor(G.t / 20) % 2, {cx:W / 2 + Math.sin(G.t * .3) * 40, z:1}); if (PV.run && !ov.hidden) drawPrev(); return; }
  x.save();
  if (G.shake > 0) x.translate((Math.random() - .5) * 12 * Math.min(1, G.shake * 4), (Math.random() - .5) * 12 * Math.min(1, G.shake * 4));
  x.translate(W / 2, 330); x.scale(G.cam.z, G.cam.z); x.translate(-G.cam.cx, -330);
  drawStage(G.stage, G.cam);
  if (G.dark > 0) { x.fillStyle = 'rgba(0,0,10,' + Math.min(.55, G.dark * .6) + ')'; x.fillRect(0, 0, W, H); }
  G.F.forEach(drawAura);
  var order = G.F.slice().sort(function (a, b) { return a.y - b.y; });
  order.forEach(drawFighter);
  drawFX();
  var d = G.F.find(function (f) { return f.act == 'dive' && f.ph == 1; });
  if (d) { x.strokeStyle = d.ch.sc; x.lineWidth = 4; x.globalAlpha = .5 + Math.sin(G.t * 30) * .3; x.beginPath(); x.ellipse(d.x, GY + 2, 60, 12, 0, 0, 7); x.stroke(); x.globalAlpha = 1; }
  x.restore();
  var vg = x.createRadialGradient(W / 2, H / 2, H * .5, W / 2, H / 2, H * 1.1); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.4)'); x.fillStyle = vg; x.fillRect(0, 0, W, H);
  drawHUD();
  if (G.paused) { x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, 0, W, H); bigText('PAUZA', W / 2, 250, 70, '#fff', 1); x.font = '700 18px system-ui'; x.fillStyle = '#cbd5ff'; x.textAlign = 'center'; x.fillText('P — davom etish · Esc — menyu', W / 2, 295); }
}
var last = 0;
function loop(ts) {
  var dt = Math.min(.033, (ts - (last || ts)) / 1000); last = ts;
  applyInput(); tick(dt); render(); requestAnimationFrame(loop);
}

function resize() {
  var r = wrap.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(r.width * d); cv.height = Math.round(r.width * 9 / 16 * d); document.documentElement.style.setProperty('--u', (r.width / 960) + 'px');
}
window.addEventListener('resize', resize); document.addEventListener('fullscreenchange', function () { setTimeout(resize, 80); });
function toggleFS() { if (document.fullscreenElement) document.exitFullscreen(); else document.body.requestFullscreen().then(function () { try { screen.orientation.lock('landscape').catch(function () {}); } catch (e) {} }).catch(function () {}); }
document.getElementById('fs').onclick = toggleFS;
resize(); showMain(); requestAnimationFrame(loop);
