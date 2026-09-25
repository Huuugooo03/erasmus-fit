const ROUTINE = [
  {
    day: "Lunes",
    short: "LUN",
    focus: "Tren inferior · atrás",
    material: "Goma corta y larga, mancuernas/barra y esterilla",
    exercises: [
      {name:"Aperturas con goma", sets:3, reps:"10", muscle:"Glúteo y TFL", equipment:"Goma corta", video:null},
      {name:"Pasos laterales con goma", sets:3, reps:"10", muscle:"Glúteo y TFL", equipment:"Goma corta", video:null},
      {name:"Hip-thrust con barra/mancuerna", sets:4, planned:"3–4", reps:"6", muscle:"Glúteo", equipment:"Banco plano + barra/mancuerna", video:null, range:true},
      {name:"Peso muerto con mancuernas", sets:4, planned:"3–4", reps:"6", muscle:"Isquio", equipment:"Mancuernas", video:null, range:true},
      {name:"Puente de glúteo con pies alejados", sets:4, reps:"8", muscle:"Isquio", equipment:"Esterilla", video:null},
      {name:"Aducción de cadera con goma larga", sets:4, reps:"6 / lado", muscle:"Aductores", equipment:"Goma larga", video:null}
    ]
  },
  {
    day: "Miércoles",
    short: "MIÉ",
    focus: "Tren inferior · delante + espalda",
    material: "Mancuernas, cuerda trenzada y banco bajo/superficie elevada",
    exercises: [
      {name:"Extensión de pierna", sets:4, planned:"3×8 (2 piernas) + 1×6 por lado", reps:"8", setReps:["8","8","8","6 / lado"], muscle:"Cuádriceps", equipment:"Máquina sentada", video:null, special:true},
      {name:"Sentadilla búlgara", sets:3, reps:"6–8", muscle:"Cuádriceps", equipment:"Banco plano", video:null},
      {name:"Elevaciones de talones", sets:3, reps:"10", muscle:"Gemelos", equipment:"Banco bajo / superficie elevada", video:null},
      {name:"Remo unilateral con mancuerna", sets:3, reps:"por lado", muscle:"Dorsal", equipment:"Mancuerna", video:null},
      {name:"Face pull con cuerda", sets:3, reps:"8", muscle:"Deltoides / trapecio", equipment:"Polea + cuerda trenzada", video:null},
      {name:"Jalón al pecho · agarre neutro", sets:3, reps:"8", muscle:"Espalda", equipment:"Máquina con polea alta", video:null}
    ]
  },
  {
    day: "Viernes",
    short: "VIE",
    focus: "Tren superior",
    material: "Mancuernas y cuerda trenzada",
    exercises: [
      {name:"Press plano", sets:3, reps:"8", muscle:"Pecho", equipment:"Banco plano + mancuernas", video:null},
      {name:"Press inclinado", sets:3, reps:"8", muscle:"Pecho superior", equipment:"Banco inclinado + mancuernas", video:null},
      {name:"Elevaciones laterales", sets:3, reps:"8", muscle:"Hombro lateral", equipment:"Mancuernas", video:null},
      {name:"Curl de bíceps", sets:4, reps:"8 / lado", muscle:"Bíceps", equipment:"Mancuernas", video:null},
      {name:"Extensión de tríceps", sets:4, reps:"8", muscle:"Tríceps", equipment:"Polea + cuerda trenzada", video:null}
    ],
    optional:"¿Core/abdomen? — ejercicio opcional, pendiente de definir"
  }
];

const KEY = "erasmusFitDataV3";
let data = JSON.parse(localStorage.getItem(KEY) || '{"logs":[],"draft":{},"calendar":{}}');
let selectedDay = 0;
let selectedProgressExercise = null;

function save(){ localStorage.setItem(KEY, JSON.stringify(data)); }
function esc(v){ return String(v ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c])); }
function key(d,e,s){ return `${d}-${e}-${s}`; }
function page(id,btn){
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));
  if(btn) btn.classList.add("active");
  if(id==="progress") renderProgress();
  if(id==="calendar") renderCalendar();
}
function renderTabs(){
  const el=document.getElementById("daytabs"); el.innerHTML="";
  ROUTINE.forEach((d,i)=>{
    const b=document.createElement("button"); b.textContent=d.day; b.className=i===selectedDay?"active":"";
    b.onclick=()=>{selectedDay=i;renderTabs();renderWorkout();}; el.appendChild(b);
  });
}
function renderWorkout(){
  const d=ROUTINE[selectedDay], el=document.getElementById("workout");
  const total=d.exercises.reduce((a,e)=>a+e.sets,0);
  const done=d.exercises.reduce((a,e,ei)=>a+Array.from({length:e.sets},(_,si)=>data.draft[key(selectedDay,ei,si)]?.done?1:0).reduce((x,y)=>x+y,0),0);
  const pct=total?Math.round(done/total*100):0;
  el.innerHTML=`
    <div class="hero-card">
      <div class="eyebrow">${esc(d.day.toUpperCase())}</div>
      <h2>${esc(d.focus)}</h2>
      <p>${total} series programadas</p>
      <div class="progress"><div class="bar" style="width:${pct}%"></div></div>
      <div class="progress-meta"><span>${pct}% completado</span><span>${done}/${total} series</span></div>
    </div>
    <div class="material-card"><span>🏋️</span><div><b>Material / máquinas</b><br><span>${esc(d.material)}</span></div></div>`;
  if(!d.exercises.length){el.innerHTML+=`<div class="empty">Día de descanso 🌿</div>`;return;}
  d.exercises.forEach((e,ei)=>{
    let sets="";
    for(let si=0;si<e.sets;si++){
      const k=key(selectedDay,ei,si),v=data.draft[k]||{};
      const plannedRep=e.setReps?.[si] || e.reps;
      sets+=`<div class="set-row">
        <div class="set-number">${si+1}</div>
        <input inputmode="decimal" aria-label="Kilos serie ${si+1}" placeholder="kg" value="${esc(v.kg)}" onchange="setVal('${k}','kg',this.value)">
        <input inputmode="numeric" aria-label="Repeticiones serie ${si+1}" placeholder="${esc(plannedRep)}" value="${esc(v.reps)}" onchange="setVal('${k}','reps',this.value)">
        <label class="check"><input type="checkbox" ${v.done?"checked":""} onchange="setVal('${k}','done',this.checked)"><span>✓</span></label>
      </div>`;
    }
    const rangeLabel=e.range?"3–4 series · 6 reps":"";
    el.innerHTML+=`<article class="exercise-card">
      <div class="exercise-top"><div><div class="exercise-title">${esc(e.name)}</div><div class="muscle">${esc(e.muscle)}</div></div><div class="pill">${esc(e.planned || `${e.sets}×${e.reps}`)}</div></div>
      <div class="machine"><span>⚙️</span><span><b>Máquina / material:</b> ${esc(e.equipment)}</span></div>
      ${rangeLabel?`<div class="note">${rangeLabel} según la rutina original.</div>`:""}
      <div class="video-box ${e.video?"has-video":""}">${e.video?`<a href="${esc(e.video)}" target="_blank" rel="noopener">▶ Ver vídeo</a>`:`<span>🎥 Vídeo pendiente de añadir</span>`}</div>
      <div class="sets-head"><span>SERIE</span><span>KG</span><span>REPS</span><span>OK</span></div>
      <div class="sets">${sets}</div>
    </article>`;
  });
  if(d.optional) el.innerHTML+=`<div class="optional">${esc(d.optional)}</div>`;
  el.innerHTML+=`<button class="finish" onclick="finishWorkout()">✓ Guardar entrenamiento</button>`;
}
function setVal(k,field,val){ data.draft[k]=data.draft[k]||{}; data.draft[k][field]=val; save(); renderWorkout(); }
function finishWorkout(){
  const d=ROUTINE[selectedDay], sets=[];
  d.exercises.forEach((e,ei)=>{for(let si=0;si<e.sets;si++){const v=data.draft[key(selectedDay,ei,si)]||{};if(v.kg!==undefined||v.reps!==undefined||v.done) sets.push({exercise:e.name,kg:Number(v.kg)||0,reps:Number(v.reps)||0,done:!!v.done});}});
  if(!sets.length){alert("Registra al menos una serie antes de guardar.");return;}
  const now=new Date();
  data.logs.unshift({date:now.toISOString(),day:d.day,focus:d.focus,dayIndex:selectedDay,sets});
  const dateKey=now.toISOString().slice(0,10); data.calendar[dateKey]=selectedDay;
  data.draft={}; save(); renderWorkout(); renderProgress(); alert("Entrenamiento guardado 🩵");
}
function renderProgress(){
  let volume=0,count=0;
  data.logs.forEach(l=>l.sets.forEach(s=>{volume+=s.kg*s.reps;count++;}));
  document.getElementById("sessions").textContent=data.logs.length;
  document.getElementById("sets").textContent=count;
  document.getElementById("volume").textContent=Math.round(volume);
  const h=document.getElementById("history");
  h.innerHTML=data.logs.length?data.logs.slice(0,30).map(l=>`<div class="history-row"><b>${new Date(l.date).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"})}</b> · ${esc(l.day)}<br><span>${l.sets.length} series · ${Math.round(l.sets.reduce((a,s)=>a+s.kg*s.reps,0))} kg de volumen</span></div>`).join(""):`<div class="empty">Todavía no hay entrenamientos guardados.</div>`;
  renderExerciseProgress();
}
function renderExerciseProgress(){
  const select=document.getElementById("exerciseSelect");
  const all=[]; ROUTINE.forEach(d=>d.exercises.forEach(e=>{if(!all.some(x=>x.name===e.name)) all.push(e);}));
  if(!selectedProgressExercise) selectedProgressExercise=all[0]?.name;
  select.innerHTML=all.map(e=>`<option ${e.name===selectedProgressExercise?"selected":""}>${esc(e.name)}</option>`).join("");
  select.onchange=()=>{selectedProgressExercise=select.value;renderExerciseProgress();};
  const rows=[];
  data.logs.slice().reverse().forEach(l=>l.sets.filter(s=>s.exercise===selectedProgressExercise && s.kg>0).forEach(s=>rows.push({date:l.date,kg:s.kg,reps:s.reps})));
  const box=document.getElementById("loadEvolution");
  if(!rows.length){box.innerHTML=`<div class="empty">Cuando registres kilos, aquí verás su evolución.</div>`;return;}
  const max=Math.max(...rows.map(r=>r.kg));
  box.innerHTML=rows.slice(-12).map(r=>`<div class="load-row"><div><b>${new Date(r.date).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"})}</b><span>${r.reps} reps</span></div><div class="load-bar"><i style="width:${Math.max(8,Math.round(r.kg/max*100))}%"></i></div><strong>${r.kg} kg</strong></div>`).join("");
}
function renderCalendar(){
  const grid=document.getElementById("calendarGrid"), now=new Date();
  const monday=new Date(now); const day=(monday.getDay()+6)%7; monday.setDate(monday.getDate()-day);
  const names=["L","M","X","J","V","S","D"];
  grid.innerHTML=names.map(n=>`<div class="cal-head">${n}</div>`).join("");
  for(let i=0;i<7;i++){
    const d=new Date(monday); d.setDate(monday.getDate()+i);
    const dateKey=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const idx=data.calendar[dateKey]; const today=dateKey===now.toISOString().slice(0,10);
    grid.innerHTML+=`<div class="cal-day ${today?"today":""} ${idx!==undefined?"trained":""}"><b>${d.getDate()}</b>${idx!==undefined?`<span>${ROUTINE[idx].short}</span>`:`<small>—</small>`}</div>`;
  }
  const end=new Date(monday); end.setDate(monday.getDate()+6);
  document.getElementById("calendarTitle").textContent=`${monday.toLocaleDateString("es-ES",{day:"numeric",month:"short"})} – ${end.toLocaleDateString("es-ES",{day:"numeric",month:"short"})}`;
}
function startRest(seconds){
  clearInterval(window.restTimer); let remaining=seconds; const box=document.getElementById("restTimer");
  box.classList.add("show"); box.innerHTML=`<b>Descanso</b><strong>${formatTime(remaining)}</strong><button onclick="stopRest()">✕</button>`;
  window.restTimer=setInterval(()=>{remaining--; box.querySelector("strong").textContent=formatTime(remaining); if(remaining<=0){clearInterval(window.restTimer); box.classList.add("done"); box.querySelector("strong").textContent="¡Listo! 🩵";}},1000);
}
function stopRest(){clearInterval(window.restTimer); const box=document.getElementById("restTimer"); box.classList.remove("show","done"); box.innerHTML="";}
function formatTime(s){return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;}
function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="erasmus-fit-datos.json";a.click();URL.revokeObjectURL(a.href);}
function clearData(){if(confirm("¿Borrar todos los entrenamientos y registros?")){data={logs:[],draft:{},calendar:{}};save();renderProgress();renderWorkout();renderCalendar();}}
renderTabs();renderWorkout();
if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
