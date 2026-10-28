// ===== Interfeys, boshqaruv, ovoz, asosiy sikl =====
var cv = document.getElementById('c'), x = cv.getContext('2d'), ov = document.getElementById('ov'), wrap = document.getElementById('wrap');
var SET = {snd:true, vib:true}, AC = null, INST = null, PAGE = 'main';
try { var _s = JSON.parse(localStorage.getItem('arena_set') || '{}'); if (_s.snd === false) SET.snd = false; if (_s.vib === false) SET.vib = false; } catch (e) {}
var MUTED = !SET.snd;
function saveSet() { try { localStorage.setItem('arena_set', JSON.stringify(SET)); } catch (e) {} }
function buzz(ms) { if (SET.vib && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } }
function loadBest(k) { try { return JSON.parse(localStorage.getItem('arena_' + (k || 'gang')) || '{}') || {}; } catch (e) { return {}; } }
function saveBest(o, k) { try { localStorage.setItem('arena_' + (k || 'gang'), JSON.stringify(o)); } catch (e) {} }
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); INST = e; if (PAGE == 'main' && !G.F.length) showMain(); });
window.addEventListener('appinstalled', function () { INST = null; if (PAGE == 'main' && !G.F.length) showMain(); });

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
var LT = [{l:0, r:0}, {l:0, r:0}];
function press(pl, k, down) {
  if (G.mode != 'pvp') pl = 0;
  if (k == 'a' || k == 's' || k == 't') { if (down && G.F[pl] && G.F[pl].human) G.F[pl].pr[k] = .15; }
  else {
    if (down && (k == 'l' || k == 'r') && !KS[pl][k]) {
      var n = Date.now(), f = G.F[pl];
      if (n - LT[pl][k] < 280 && f && f.human) { f.pr.d = .15; f.rd = k == 'l' ? -1 : 1; LT[pl][k] = 0; } else LT[pl][k] = n;
    }
    KS[pl][k] = down ? 1 : 0;
  }
}
function applyInput() { G.F.forEach(function (f, i) { if (f.human) { f.in.l = KS[i].l; f.in.r = KS[i].r; f.in.u = KS[i].u; f.in.b = KS[i].b; } }); }
document.addEventListener('keydown', function (e) {
  var k = e.key.toLowerCase(); if (e.code && e.code.indexOf('Numpad') == 0) k = e.code.toLowerCase();
  if (k.indexOf('arrow') == 0 || k == ' ') e.preventDefault();
  if (e.repeat) return;
  if (k == 'p' || k == 'escape') { if (G.paused) resumeGame(); else if (G.F.length && G.state == 'over') showMain(); else pauseGame(); return; }
  if (k == 'f') { toggleFS(); return; }
  if (k == 'm') { SET.snd = !SET.snd; MUTED = !SET.snd; saveSet(); return; }
  var m = KM[k]; if (m) press(m[0], m[1], true);
});
document.addEventListener('keyup', function (e) { var k = e.key.toLowerCase(); if (e.code && e.code.indexOf('Numpad') == 0) k = e.code.toLowerCase(); var m = KM[k]; if (m) press(m[0], m[1], false); });
document.querySelectorAll('#pad button').forEach(function (b) {
  var k = b.dataset.k;
  b.addEventListener('pointerdown', function (e) { e.preventDefault(); press(0, k, true); b.classList.add('on'); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, function () { press(0, k, false); b.classList.remove('on'); }); });
  b.oncontextmenu = function () { return false; };
});
document.addEventListener('visibilitychange', function () { if (document.hidden) pauseGame(); });
function pauseGame() { if (!G.F.length || G.paused || !(G.state == 'fight' || G.state == 'intro' || G.state == 'ko')) return; G.paused = true; showPause(); }
function resumeGame() { G.paused = false; ov.hidden = true; ov.classList.remove('glass'); }
function showPause() {
  PAGE = 'pause'; ov.hidden = false; ov.classList.add('glass');
  ov.innerHTML = '<h2>⏸ Pauza</h2><div class="col"><button class="b" data-a="resume">▶ Davom etish</button><button class="s" data-a="set">⚙ Sozlamalar</button><button class="s" data-a="menu">🏠 Menyu</button></div>';
}
function showSettings() {
  PAGE = 'set';
  ov.innerHTML = '<h2>⚙ Sozlamalar</h2><div class="col"><button class="s" data-a="snd">🔊 Ovoz: ' + (SET.snd ? 'yoqilgan' : "o'chirilgan") + '</button><button class="s" data-a="vib">📳 Tebranish: ' + (SET.vib ? 'yoqilgan' : "o'chirilgan") + '</button></div><button class="s" data-a="back">⬅ Orqaga</button>';
}

// ----- Menyular -----
var SEL = {mode:'cpu', step:0, picks:[], fac:'n', cur:0, stage:-1, diff:1, steps:[], last:null, tour:null};
function showMain() {
  PAGE = 'main'; G.state = 'menu'; G.paused = false; G.gang = null; ov.classList.remove('glass'); G.F = []; PRJ.length = PTS.length = RINGS.length = POPS.length = BEAMS.length = SCH.length = ITM.length = 0; ov.hidden = false; stopPrev();
  var b = loadBest(), hb = loadBest('hell');
  ov.innerHTML = '<h1>⚔️ Stickman Arena</h1><p>Soya klani va Dengiz bo\'rilari: 30 ta original jangchi. Istalgan jangchini tanlang!</p>' +
    '<div class="col"><div class="row"><button class="b" data-a="mode" data-v="cpu">🤖 Kompyuterga qarshi</button><button class="b" data-a="mode" data-v="gang">👊 To\'daga qarshi</button></div>' +
    '<div class="row"><button class="b" data-a="mode" data-v="pvp">👥 2 o\'yinchi</button><button class="b" data-a="mode" data-v="tour">🏆 Turnir</button></div>' +
    '<div class="row"><button class="b" data-a="mode" data-v="hell" style="background:linear-gradient(90deg,#ff3d3d,#8b1a6b);color:#fff">☠ Jahannam (qiyin)</button></div>' +
    '<div class="row"><button class="s" data-a="mode" data-v="train">🎯 Mashq</button><button class="s" data-a="help">❓ Boshqaruv</button><button class="s" data-a="set">⚙ Sozlamalar</button>' + (INST ? '<button class="s" data-a="install">📲 O\'rnatish</button>' : '') + '</div></div>' +
    (b.score ? '<p>🏅 To\'da rekordi: <b style="color:#ffb703">' + b.score + '</b> ball (to\'lqin ' + b.wave + ')' + (hb.score ? ' · ☠ Jahannam: <b style="color:#ff6b6b">' + hb.score + '</b> (to\'lqin ' + hb.wave + ')' : '') + '</p>' : (hb.score ? '<p>☠ Jahannam rekordi: <b style="color:#ff6b6b">' + hb.score + '</b> ball (to\'lqin ' + hb.wave + ')</p>' : ''));
}
function showHelp() {
  PAGE = 'help';
  ov.innerHTML = '<h2>Boshqaruv</h2><div class="help"><b>1-o\'yinchi:</b> A D — yurish · W — sakrash · J — zarba (3 ta ketma-ket = kombo) · K — maxsus (30 energiya) · L — himoya · U — ULT (100 energiya)<br>' +
    '<b>2-o\'yinchi:</b> ← → ↑ · 1 zarba · 2 maxsus · 3 himoya · 4 ULT<br><b>Qochish (dodge):</b> yo\'nalish tugmasini <b>ikki marta tez</b> bosing — qisqa vaqt zarba o\'tmaydi.<br>' +
    '<b>To\'daga qarshi:</b> bir vaqtda bir necha dushman keladi. Yerdagi yashil (+jon) va ko\'k (⚡energiya) sharlarni oling. Har 5-to\'lqinda BOSS bor.<br>' +
    '<b>☠ Jahannam:</b> to\'da rejimining qiyin varianti: dushmanlar kuchli va ko\'p, davolanish kam, har 3-to\'lqinda boss, ball 2 barobar.<br>' +
    '<b>Umumiy:</b> P yoki Esc — pauza · F — to\'liq ekran · M — ovoz<br><b>Telefonda:</b> pastdagi tugmalar (2 o\'yinchi faqat klaviaturada). iPhone: Safari → Ulashish → «Ekranga qo\'shish».</div>' +
    '<button class="s" data-a="menu">⬅ Orqaga</button>';
}
function startSelect(mode) {
  SEL.mode = mode; SEL.step = 0; SEL.picks = []; SEL.fac = 'n'; SEL.cur = 0;
  SEL.steps = mode == 'gang' ? ["To'daga qarshi: jangchingizni tanlang"] : mode == 'hell' ? ["☠ Jahannam: jangchingizni tanlang"] : mode == 'train' ? ["Mashq uchun jangchini tanlang", "Mashq qilinadigan raqibni tanlang"] : mode == 'cpu' ? ["Siz uchun jangchini tanlang", "Raqibingizni tanlang"] : mode == 'pvp' ? ["1-o'yinchi: jangchini tanlang", "2-o'yinchi: jangchini tanlang"] : ["Turnir uchun jangchini tanlang"];
  showSelect();
}
function showSelect() {
  PAGE = 'select';
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
  startMatch({mode:'cpu', c1:T.c1, c2:T.list[T.idx], stage:SEL.stage < 0 ? T.idx % STAGES.length : SEL.stage, diff:Math.max(SEL.diff, diff)});
  say('TURNIR ' + (T.idx + 1) + '/5: ' + T.list[T.idx].n, 1.4);
}
function onMatchEnd(w) {
  ov.hidden = false; PAGE = 'end'; var h = '', t = SEL.tour;
  if ((SEL.mode == 'gang' || SEL.mode == 'hell') && G.gang) {
    var g = G.gang, bk = g.hard ? 'hell' : 'gang', best = loadBest(bk), nb = g.score > (best.score || 0); if (nb) saveBest({score:g.score, wave:g.wave}, bk);
    h = '<h2>' + (g.hard ? '☠ Jahannam: jang tugadi' : '💀 Jang tugadi') + '</h2><p>To\'lqin: <b>' + g.wave + '</b> · Mag\'lub etilgan dushman: <b>' + g.kills + '</b> · Ball: <b>' + g.score + '</b></p><p>' + (nb ? '🏆 Yangi rekord!' : 'Rekord: ' + best.score + ' ball (to\'lqin ' + best.wave + ')') + '</p>' +
      '<button class="b" data-a="again">Qayta urinish</button><button class="s" data-a="reselect">Jangchini almashtirish</button><button class="s" data-a="menu">Menyu</button>';
  } else if (SEL.mode == 'tour' && t) {
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
  else if (a == 'menu') { G.paused = false; showMain(); }
  else if (a == 'fac') { SEL.fac = v; showSelect(); }
  else if (a == 'card') { SEL.cur = +v; ov.querySelectorAll('.card').forEach(function (c) { c.classList.toggle('on', c.dataset.v == v); }); fillInfo(); PV.t0 = G.t; }
  else if (a == 'rand') { var lst = FIGHTERS.filter(function (f) { return f.f == SEL.fac; }); SEL.cur = lst[Math.floor(Math.random() * lst.length)].id; showSelect(); }
  else if (a == 'stage') { SEL.stage = SEL.stage + 1 >= STAGES.length ? -1 : SEL.stage + 1; showSelect(); }
  else if (a == 'diff') { SEL.diff = (SEL.diff + 1) % 3; showSelect(); }
  else if (a == 'pick') pickDone();
  else if (a == 'next') { SEL.tour.idx++; beginTour(); }
  else if (a == 'again') { if (SEL.mode == 'tour') { SEL.tour.idx = 0; beginTour(); } else { ov.hidden = true; startMatch({mode:SEL.last.mode, c1:SEL.last.picks[0], c2:SEL.last.picks[1], stage:SEL.stage < 0 ? Math.floor(Math.random() * STAGES.length) : SEL.stage, diff:SEL.diff}); } }
  else if (a == 'reselect') startSelect(SEL.last.mode);
  else if (a == 'resume') resumeGame();
  else if (a == 'set') showSettings();
  else if (a == 'snd') { SET.snd = !SET.snd; MUTED = !SET.snd; saveSet(); showSettings(); }
  else if (a == 'vib') { SET.vib = !SET.vib; saveSet(); if (SET.vib) buzz(40); showSettings(); }
  else if (a == 'back') { if (G.F.length) showPause(); else showMain(); }
  else if (a == 'install') { if (INST) { INST.prompt(); INST.userChoice.then(function () { INST = null; showMain(); }); } }
});

// ----- Chizish va sikl -----
function render() {
  var ing = G.F.length > 0 && ov.hidden; document.body.classList.toggle('menu', !ov.hidden); document.body.classList.toggle('ing', ing);
  x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#07080f'; x.fillRect(0, 0, cv.width, cv.height);
  x.setTransform(VP.s, 0, 0, VP.s, VP.ox, VP.oy); var EX = VP.ex;
  if (!G.F.length) { var mc = {cx:W / 2 + Math.sin(G.t * .3) * 40, z:1}, ms = Math.floor(G.t / 20) % STAGES.length; stageSides(ms, mc, EX); drawStage(ms, mc); if (PV.run && !ov.hidden) drawPrev(); return; }
  x.save();
  if (G.shake > 0) x.translate((Math.random() - .5) * 12 * Math.min(1, G.shake * 4), (Math.random() - .5) * 12 * Math.min(1, G.shake * 4));
  stageSides(G.stage, G.cam, EX);
  x.translate(W / 2, 330); x.scale(G.cam.z, G.cam.z); x.translate(-G.cam.cx, -330);
  drawStage(G.stage, G.cam);
  if (G.dark > 0) { x.fillStyle = 'rgba(0,0,10,' + Math.min(.55, G.dark * .6) + ')'; x.fillRect(-W, -H, W * 3, H * 3); }
  drawITM();
  G.F.forEach(drawAura);
  var order = G.F.slice().sort(function (a, b) { return a.y - b.y; });
  order.forEach(drawFighter);
  drawEnemyBars(); drawFX();
  var d = G.F.find(function (f) { return f.act == 'dive' && f.ph == 1; });
  if (d) { x.strokeStyle = d.ch.sc; x.lineWidth = 4; x.globalAlpha = .5 + Math.sin(G.t * 30) * .3; x.beginPath(); x.ellipse(d.x, GY + 2, 60, 12, 0, 0, 7); x.stroke(); x.globalAlpha = 1; }
  x.restore();
  var vg = x.createRadialGradient(W / 2, H / 2, H * .5, W / 2, H / 2, H * 1.1); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.4)'); x.fillStyle = vg; x.fillRect(-EX, 0, W + 2 * EX, H);
  drawHUD();
}
var VP = {s:1, ox:0, oy:0, ex:0};
var last = 0;
function loop(ts) {
  var dt = Math.min(.033, (ts - (last || ts)) / 1000); last = ts;
  applyInput(); tick(dt); render(); requestAnimationFrame(loop);
}

function resize() {
  var r = wrap.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1), sc = Math.min(r.width / W, r.height / H);
  cv.width = Math.max(2, Math.round(r.width * d)); cv.height = Math.max(2, Math.round(r.height * d));
  VP.s = sc * d; VP.ox = (cv.width - W * VP.s) / 2; VP.oy = (cv.height - H * VP.s) / 2; VP.ex = VP.ox / VP.s;
  document.documentElement.style.setProperty('--u', sc + 'px'); var side = Math.max(0, (r.width - W * sc) / 2); ov.style.left = ov.style.right = side + 'px';
}
window.addEventListener('resize', resize); document.addEventListener('fullscreenchange', function () { setTimeout(resize, 80); });
function toggleFS() { if (document.fullscreenElement) document.exitFullscreen(); else document.body.requestFullscreen().then(function () { try { screen.orientation.lock('landscape').catch(function () {}); } catch (e) {} }).catch(function () {}); }
document.getElementById('fs').onclick = toggleFS;
document.getElementById('pse').onclick = function () { if (G.paused) resumeGame(); else pauseGame(); };
resize(); showMain(); requestAnimationFrame(loop);
