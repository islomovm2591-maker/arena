// ===== Stickman Arena: Soya va Dengiz — ma'lumotlar =====
var W = 960, H = 540, GY = 452, AL = 50, AR = W - 50;
var FACS = {
  n: {name:"Soya klani", icon:'🥷', col:'#8b6cff'},
  p: {name:"Dengiz bo'rilari", icon:'🏴‍☠️', col:'#38bdf8'}
};
var SPD = {orb:"Uchuvchi shar", wave:"Yer bo'ylab to'lqin", dash:"Tez zarba", tele:"Orqaga sakrash", multi:"Uch o'q",
           slam:"Yer zarbasi", buff:"Kuchaytirish", heal:"Davolash", pull:"Tortib olish", rain:"Osmondan yomg'ir"};
var UTD = {beam:"Katta nur", barrage:"O'qlar yomg'iri", quake:"Zilzila", dive:"Sakrab tushish", blitz:"Tezkor zarbalar"};
var WR = {none:0, dagger:6, sword:20, staff:30, axe:18, hook:12, anchor:24, cannon:4, fan:6, harpoon:32};
var STAGES = ["Soya qishlog'i", "Kema palubasi", "Cho'l xarobasi"];

// [nom, guruh, tana rangi, aksent, bosh kiyim, qurol, hp, tezlik, kuch, maxsus, ult, hujum rangi, maxsus nomi, ult nomi]
var RAW = [
  ['Shamol','n','#5ec8ff','#ffffff','band','dagger',95,185,7,'dash','blitz','#8fe3ff',"Shamol zarbasi","Bo'ron raqsi"],
  ['Zulmat','n','#8b6cff','#2a1a66','hood','sword',100,170,7,'tele','dive','#b79cff',"Soya yurishi","Qora tushish"],
  ['Chaqmoq','n','#ffe14a','#fff3a0','spikes','none',92,190,7,'dash','beam','#fff176',"Chaqmoq tig'i","Momaqaldiroq nuri"],
  ['Muz','n','#9fe8ff','#e8fbff','bun','staff',100,160,6,'wave','quake','#c9f3ff',"Muz to'lqini","Qor bo'roni"],
  ['Alanga','n','#ff6a3d','#ffd36b','spikes','none',100,170,8,'orb','barrage','#ff9a4d',"Olov shari","Olov yomg'iri"],
  ['Qoya','n','#b08a5a','#6b4a2a','bald','axe',125,130,8,'slam','quake','#d9b27a',"Tosh zarbasi","Zilzila"],
  ['Soya','n','#5a6384','#9aa5cc','mask','dagger',92,185,7,'tele','blitz','#8e9ad0',"Soya sakrashi","Ming iz"],
  ['Zahar','n','#5ddb7a','#1b5e32','hood','dagger',95,170,6,'multi','barrage','#7bff9a',"Zahar ignalari","Zahar bulutlari"],
  ['Tuman','n','#cfd8e8','#8a97b3','band','fan',98,165,6,'rain','beam','#e3ebff',"Tuman ignalari","Oq nur"],
  ["Po'lat",'n','#9aa4b5','#e0e6f2','helmet','sword',118,135,8,'slam','dive','#c9d3e6',"Po'lat zarbasi","Temir sho'ng'in"],
  ['Oy','n','#eeeeff','#8f7cff','bun','staff',96,165,6,'orb','beam','#cdbfff',"Oy shari","Oy nuri"],
  ['Tong','n','#ff9fc0','#ffe3ec','band','fan',98,170,6,'heal','barrage','#ffc2d6',"Tong nuri","Gul yomg'iri"],
  ["Bo'ron",'n','#46d7b8','#0f6b57','spikes','none',96,180,7,'multi','quake','#7af0d6',"Bo'ron pichoqlari","Dovul"],
  ['Yashin','n','#ffb800','#7a4f00','mask','sword',100,175,7,'buff','blitz','#ffd54d',"Yashin tezligi","Oltin chiziq"],
  ['Ilon','n','#7bd95a','#2a6b14','hood','dagger',100,170,7,'pull','dive','#a2f27f',"Ilon changali","Zaharli sakrash"],

  ['Langar','p','#3a7bd5','#c9d6ea','tricorn','anchor',125,125,8,'slam','quake','#7fb2ff',"Langar zarbasi","Chuqur zilzila"],
  ["To'p",'p','#d9534f','#2b2b2b','captain','cannon',105,140,7,'orb','barrage','#ff8a65',"To'p o'qi","To'plar yomg'iri"],
  ['Ilgak','p','#8b5cf6','#dcdcdc','tricorn','hook',100,160,7,'pull','blitz','#b794ff',"Ilgak tortishi","Ilgak bo'roni"],
  ['Garpun','p','#14b8a6','#e6fffb','bandana','harpoon',100,155,7,'multi','beam','#5eead4',"Garpun yomg'iri","Chuqur nur"],
  ["To'lqin",'p','#38bdf8','#e0f6ff','bandana','sword',100,170,7,'wave','quake','#7dd3fc',"Dengiz to'lqini","Tsunami"],
  ['Dovul','p','#64748b','#e2e8f0','captain','sword',110,150,8,'dash','beam','#94a3b8',"Dovul zarbasi","Momaqaldiroq"],
  ['Xazina','p','#fbbf24','#fff3c4','crown','dagger',95,175,6,'rain','barrage','#fde68a',"Oltin yomg'ir","Oltin bo'ron"],
  ["Sho'r",'p','#94a3b8','#ffffff','bald','axe',120,135,8,'slam','dive','#cbd5e1',"Sho'r zarba","To'fon"],
  ['Kompas','p','#34d399','#064e3b','tricorn','sword',100,170,7,'tele','dive','#6ee7b7',"Kompas sakrashi","Yo'nalish"],
  ['Arqon','p','#c08457','#f5d9b8','bandana','none',98,175,7,'pull','blitz','#e0b185',"Arqon changali","Tugun"],
  ['Bochka','p','#b45309','#fcd34d','bald','none',130,120,8,'buff','quake','#f59e0b',"Rom kuchi","Bochka portlashi"],
  ['Mayoq','p','#fde047','#854d0e','eyepatch','staff',100,160,6,'orb','beam','#fff59d',"Mayoq nuri","Katta mayoq"],
  ["Chig'anoq",'p','#f472b6','#ffe4f1','bandana','dagger',96,175,6,'heal','barrage','#f9a8d4',"Dengiz shifosi","Marjon yomg'iri"],
  ['Burgut','p','#f97316','#fff1e6','eyepatch','sword',98,180,7,'dash','blitz','#fdba74',"Burgut cho'qqisi","Burgut hujumi"],
  ['Shtorm','p','#6366f1','#e0e7ff','captain','axe',108,150,8,'multi','beam','#a5b4fc',"Shtorm pichoqlari","Qora bulut"]
];
var FIGHTERS = RAW.map(function (r, i) {
  return {id:i, n:r[0], f:r[1], col:r[2], acc:r[3], hat:r[4], wp:r[5], hp:r[6], spd:r[7], pow:r[8],
          sp:r[9], ult:r[10], sc:r[11], spn:r[12], ultn:r[13], sz:r[6] >= 118 ? 1.1 : r[6] <= 95 ? .96 : 1};
});

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }
function lerp(a, b, t) { return a + (b - a) * t; }
function ease(t) { return t * t * (3 - 2 * t); }
function shade(c, k) {
  var n = parseInt(c.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
  if (k < 1) { r *= k; g *= k; b *= k; } else { k -= 1; r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
  return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
}
