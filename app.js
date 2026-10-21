const SERVICES = {
  "Волосы": [
    ["Женская стрижка", 60, 2500, "hair"],
    ["Мужская стрижка", 45, 1800, "hair"],
    ["Окрашивание в один тон", 150, 5500, "hair"],
    ["Сложное окрашивание (airtouch, балаяж)", 300, 12000, "hair"],
    ["Укладка", 45, 1800, "hair"],
    ["Уход «Восстановление»", 90, 3200, "hair"]
  ],
  "Ногти": [
    ["Маникюр с покрытием", 120, 2400, "nails"],
    ["Маникюр без покрытия", 60, 1500, "nails"],
    ["Педикюр с покрытием", 90, 3000, "nails"],
    ["Снятие и укрепление", 45, 1000, "nails"]
  ],
  "Брови и ресницы": [
    ["Коррекция и окрашивание бровей", 45, 1500, "brows"],
    ["Ламинирование бровей", 60, 2400, "brows"],
    ["Ламинирование ресниц", 75, 3200, "brows"],
    ["Наращивание ресниц, классика", 120, 3800, "brows"]
  ],
  "Лицо": [
    ["Чистка лица", 75, 4000, "face"],
    ["Уходовая процедура по типу кожи", 60, 3500, "face"],
    ["Массаж лица", 45, 2800, "face"]
  ]
};
const MASTERS = [
  {id:"alina", name:"Алина Громова", role:"Стилист-колорист", exp:"9 лет", skill:["hair"], g:"linear-gradient(135deg,#F4C9E2,#CDBDF2,#F4C9E2)"},
  {id:"timur", name:"Тимур Алиев", role:"Стилист, мужские и женские стрижки", exp:"6 лет", skill:["hair"], g:"linear-gradient(135deg,#BFE3EE,#CDBDF2,#BFE3EE)"},
  {id:"maria", name:"Мария Ким", role:"Мастер ногтевого сервиса", exp:"7 лет", skill:["nails"], g:"linear-gradient(135deg,#F7D6C9,#F4C9E2,#F7D6C9)"},
  {id:"darya", name:"Дарья Леви", role:"Бровист и лэш-мастер", exp:"5 лет", skill:["brows"], g:"linear-gradient(135deg,#CDBDF2,#BFE3EE,#CDBDF2)"},
  {id:"elena", name:"Елена Рахимова", role:"Косметолог-эстетист", exp:"11 лет", skill:["face"], g:"linear-gradient(135deg,#C9EBD9,#BFE3EE,#C9EBD9)"}
];
const money = n => n.toLocaleString("ru-RU").replace(/ /g," ") + " ₽";
const dur = m => m >= 60 ? (Math.floor(m/60) + " ч" + (m%60 ? " " + m%60 + " мин" : "")) : m + " мин";
const $ = s => document.querySelector(s);
const flat = Object.entries(SERVICES).flatMap(([cat,list]) => list.map(([n,d,p,k]) => ({cat,name:n,dur:d,price:p,kind:k})));

/* прайс */
const tabs = $("#tabs"), rows = $("#rows");
Object.keys(SERVICES).forEach((cat,i) => {
  const b = document.createElement("button");
  b.className = "tab"; b.role = "tab"; b.textContent = cat;
  b.setAttribute("aria-selected", i === 0);
  b.onclick = () => showCat(cat);
  tabs.append(b);
});
function showCat(cat){
  [...tabs.children].forEach(t => t.setAttribute("aria-selected", t.textContent === cat));
  rows.innerHTML = "";
  SERVICES[cat].forEach(([n,d,p]) => {
    const li = document.createElement("li"); li.className = "row";
    li.innerHTML = `<div><b>${n}</b><small>${dur(d)}</small></div><span class="p">${money(p)}</span><a class="go" href="#zapis">Записаться</a>`;
    li.querySelector(".go").onclick = () => { pick.service = flat.find(s => s.name === n); pick.master = null; pick.day = null; pick.time = null; step = 1; render(); };
    rows.append(li);
  });
}
showCat("Волосы");

/* мастера */
$("#crew").innerHTML = MASTERS.map(m => `
  <article class="m">
    <div class="ph" style="background:${m.g};background-size:300% 300%"><img src="assets/${m.id}.webp" alt="${m.name}, ${m.role.toLowerCase()}" width="600" height="800" loading="lazy"></div>
    <h3>${m.name}</h3>
    <p>${m.role}<br>Стаж ${m.exp}</p>
    <button data-m="${m.id}">Записаться к мастеру</button>
  </article>`).join("");
document.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
  pick.master = MASTERS.find(m => m.id === b.dataset.m);
  if (pick.service && !pick.master.skill.includes(pick.service.kind)) pick.service = null;
  pick.day = null; pick.time = null; step = pick.service ? 1 : 0; render();
  $("#zapis").scrollIntoView({behavior:"smooth"});
});

/* запись */
let step = 0;
const pick = {service:null, master:null, day:null, time:null};
const panel = $("#panel");
const days = Array.from({length:10}, (_,i) => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+i); return d; });
const dayName = d => d.toLocaleDateString("ru-RU",{weekday:"short"});
const dayFull = d => d.toLocaleDateString("ru-RU",{day:"numeric",month:"long",weekday:"long"});
const hash = s => [...s].reduce((a,c) => (a*31 + c.charCodeAt(0)) >>> 0, 7);
function taken(d,h){ const m = pick.master ? pick.master.id : "any"; return hash(d.toDateString()+m+h) % 100 < 38; }
function slots(d){ return Array.from({length:11}, (_,i) => 10+i).map(h => ({h, off: taken(d,h)})); }
function steps(){ return `<div class="steps" aria-hidden="true">${[0,1,2,3].map(i => `<i class="${i<=step?"on":""}"></i>`).join("")}</div>`; }

function render(){
  if(step === 4) return done();
  let html = steps();
  if(step === 0){
    html += `<h3>Что хотите сделать?</h3><div class="opts">` + flat
      .filter(s => !pick.master || pick.master.skill.includes(s.kind))
      .map(s => `<button class="opt" data-s="${s.name}" aria-pressed="${pick.service?.name===s.name}"><span>${s.name}</span><span>${dur(s.dur)} · ${money(s.price)}</span></button>`).join("") + `</div>`;
  }
  if(step === 1){
    const list = MASTERS.filter(m => m.skill.includes(pick.service.kind));
    html += `<h3>К кому записаться?</h3><div class="opts">
      <button class="opt" data-m="any" aria-pressed="${!pick.master}"><span>Любой свободный мастер</span><span>быстрее всего</span></button>` +
      list.map(m => `<button class="opt" data-m="${m.id}" aria-pressed="${pick.master?.id===m.id}"><span>${m.name}</span><span>${m.role.split(",")[0]}</span></button>`).join("") + `</div>`;
  }
  if(step === 2){
    html += `<h3>Когда удобно?</h3><div class="days">` + days.map((d,i) => `<button class="day" data-d="${i}" aria-pressed="${pick.day===i}"><small>${dayName(d)}</small><b>${d.getDate()}</b></button>`).join("") + `</div>`;
    html += pick.day === null ? `<p class="note">Выберите день, и появятся свободные часы.</p>` :
      `<div class="slots">` + slots(days[pick.day]).map(s => `<button class="slot" data-t="${s.h}" ${s.off?"disabled":""} aria-pressed="${pick.time===s.h}">${s.h}:00</button>`).join("") + `</div>`;
  }
  if(step === 3){
    html += `<h3>Последний шаг</h3>
      <div class="sum">
        <div><span>Услуга</span><span>${pick.service.name}</span></div>
        <div><span>Мастер</span><span>${pick.master ? pick.master.name : "любой свободный"}</span></div>
        <div><span>Время</span><span>${dayFull(days[pick.day])}, ${pick.time}:00</span></div>
        <div><span>Стоимость</span><span>${money(Math.round(pick.service.price*0.9))} <small style="color:var(--lilac)">со скидкой 10%</small></span></div>
      </div>
      <label class="fld"><span>Ваше имя</span><input id="fn" autocomplete="name"></label>
      <label class="fld"><span>Телефон</span><input id="fp" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7"></label>
      <label class="fld"><span>Пожелания, если есть</span><textarea id="fc" rows="2"></textarea></label>
      <p class="err" id="err" role="alert"></p>`;
  }
  const ready = (step===0 && pick.service) || step===1 || (step===2 && pick.time!==null) || step===3;
  html += `<div class="nav2">${step>0 ? `<button class="back" id="bk">Назад</button>` : `<span></span>`}
    <button class="btn" id="nx" ${ready?"":"disabled"}>${step===3 ? "Записаться" : "Дальше"}</button></div>`;
  panel.innerHTML = html;

  panel.querySelectorAll("[data-s]").forEach(b => b.onclick = () => { pick.service = flat.find(s => s.name === b.dataset.s); render(); });
  panel.querySelectorAll(".opt[data-m]").forEach(b => b.onclick = () => { pick.master = b.dataset.m === "any" ? null : MASTERS.find(m => m.id === b.dataset.m); pick.time = null; render(); });
  panel.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { pick.day = +b.dataset.d; pick.time = null; render(); });
  panel.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { pick.time = +b.dataset.t; render(); });
  const bk = $("#bk"); if(bk) bk.onclick = () => { step--; render(); };
  $("#nx").onclick = () => {
    if(step === 3){
      const n = $("#fn").value.trim(), p = $("#fp").value.replace(/\D/g,"");
      if(!n) return $("#err").textContent = "Напишите, как к вам обращаться.";
      if(p.length < 10) return $("#err").textContent = "Проверьте телефон: нужно минимум 10 цифр.";
      pick.name = n; step = 4; return render();
    }
    step++; render();
  };
}
function done(){
  panel.innerHTML = `<div class="done">
    <div class="tick"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#241838" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16l6 6 12-13"/></svg></div>
    <h3>${pick.name}, вы записаны</h3>
    <p class="lead" style="margin:.6rem auto 1.4rem">${pick.service.name}, ${dayFull(days[pick.day])}, в ${pick.time}:00. ${pick.master ? "Мастер: " + pick.master.name + "." : "Мастера подберём и скажем при звонке."}</p>
    <p class="note">Это демо: запись нигде не сохранена.</p>
    <button class="btn btn--ghost" id="again" style="margin-top:1rem">Записаться ещё</button></div>`;
  $("#again").onclick = () => { Object.assign(pick,{service:null,master:null,day:null,time:null}); step = 0; render(); };
}
render();

/* блик на зеркале */
const mir = $("#mirror");
mir.addEventListener("pointermove", e => {
  const r = mir.getBoundingClientRect();
  mir.style.setProperty("--x", ((e.clientX-r.left)/r.width*100)+"%");
  mir.style.setProperty("--y", ((e.clientY-r.top)/r.height*100)+"%");
});
