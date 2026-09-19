// ==============================
// EDITA SOLO ESTA PARTE: RUTINA
// ==============================
const ROUTINE = [
 {day:"Lunes",focus:"Pierna + glúteo", exercises:[
  {name:"Ejercicio 1",sets:3,reps:"10-12",video:"https://www.youtube.com/",notes:"Técnica controlada."},
  {name:"Ejercicio 2",sets:4,reps:"8-10",video:"https://www.youtube.com/",notes:""}
 ]},
 {day:"Martes",focus:"Tren superior", exercises:[
  {name:"Ejercicio 3",sets:3,reps:"10-12",video:"https://www.youtube.com/",notes:""},
  {name:"Ejercicio 4",sets:3,reps:"10",video:"https://www.youtube.com/",notes:""}
 ]},
 {day:"Miércoles",focus:"Descanso",exercises:[]},
 {day:"Jueves",focus:"Pierna + glúteo",exercises:[
  {name:"Ejercicio 5",sets:3,reps:"10-12",video:"https://www.youtube.com/",notes:""}
 ]},
 {day:"Viernes",focus:"Full body",exercises:[
  {name:"Ejercicio 6",sets:3,reps:"10",video:"https://www.youtube.com/",notes:""}
 ]}
];

const KEY="erasmusFitDataV2";
let data=JSON.parse(localStorage.getItem(KEY)||'{"logs":[],"draft":{}}');
let selectedDay=0;

function save(){localStorage.setItem(KEY,JSON.stringify(data));}
function page(id,btn){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 document.getElementById(id).classList.add("active");
 document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
 if(id==="progress")renderProgress();
}
function renderTabs(){
 const el=document.getElementById("daytabs"); el.innerHTML="";
 ROUTINE.forEach((d,i)=>{const b=document.createElement("button");b.textContent=d.day;b.className=i===selectedDay?"active":"";b.onclick=()=>{selectedDay=i;renderTabs();renderWorkout()};el.appendChild(b)});
}
function key(d,e,s){return `${d}-${e}-${s}`}
function renderWorkout(){
 const d=ROUTINE[selectedDay], el=document.getElementById("workout");
 const total=d.exercises.reduce((a,e)=>a+e.sets,0);
 const done=d.exercises.reduce((a,e,ei)=>a+Array.from({length:e.sets},(_,si)=>data.draft[key(selectedDay,ei,si)]?.done?1:0).reduce((x,y)=>x+y,0),0);
 const pct=total?Math.round(done/total*100):0;
 el.innerHTML=`<div class="card"><h2>${d.focus}</h2><p class="muted">${d.day} · ${total} series</p><div class="progress"><div class="bar" style="width:${pct}%"></div></div><p class="muted">${pct}% completado</p></div>`;
 if(!d.exercises.length){el.innerHTML+=`<div class="empty">🌿 Día de descanso.<br>Recupera y prepárate para el siguiente entrenamiento.</div>`;return;}
 d.exercises.forEach((e,ei)=>{
  let sets="";
  for(let si=0;si<e.sets;si++){
   const k=key(selectedDay,ei,si), v=data.draft[k]||{};
   sets+=`<div class="set"><span>${si+1}</span><input inputmode="decimal" placeholder="kg" value="${v.kg??""}" onchange="setVal('${k}','kg',this.value)"><input inputmode="numeric" placeholder="reps" value="${v.reps??""}" onchange="setVal('${k}','reps',this.value)"><input class="done" type="checkbox" ${v.done?"checked":""} onchange="setVal('${k}','done',this.checked)"></div>`;
  }
  el.innerHTML+=`<div class="card"><div class="exercise-head"><div><div class="exname">${e.name}</div><div class="muted">${e.sets} series · ${e.reps} reps</div></div><div class="tag">SERIES</div></div>
  <div class="actions"><a class="btn video" href="${e.video}" target="_blank">▶ Vídeo</a><button class="btn ghost" onclick="alert(${JSON.stringify(e.notes||"Sin indicaciones adicionales.")})">ℹ️ Técnica</button></div>
  <div class="sets">${sets}</div></div>`;
 });
 el.innerHTML+=`<button class="btn start" onclick="finishWorkout()">✓ Terminar entrenamiento</button>`;
}
function setVal(k,field,val){data.draft[k]=data.draft[k]||{};data.draft[k][field]=val;save();renderWorkout();}
function finishWorkout(){
 const d=ROUTINE[selectedDay], sets=[];
 d.exercises.forEach((e,ei)=>{for(let si=0;si<e.sets;si++){const v=data.draft[key(selectedDay,ei,si)]||{};if(v.kg||v.reps)sets.push({exercise:e.name,kg:Number(v.kg)||0,reps:Number(v.reps)||0,done:!!v.done});}});
 if(!sets.length){alert("Registra al menos una serie antes de guardar.");return;}
 data.logs.unshift({date:new Date().toISOString(),day:d.day,focus:d.focus,sets}); data.draft={}; save(); renderWorkout(); alert("Entrenamiento guardado 💜");}
function renderProgress(){
 let volume=0,count=0; data.logs.forEach(l=>l.sets.forEach(s=>{volume+=s.kg*s.reps;count++}));
 document.getElementById("sessions").textContent=data.logs.length;
 document.getElementById("sets").textContent=count;
 document.getElementById("volume").textContent=Math.round(volume);
 const h=document.getElementById("history");
 h.innerHTML=data.logs.length?data.logs.slice(0,30).map(l=>`<div class="history-row"><b>${new Date(l.date).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}</b> · ${l.day}<br><span class="muted">${l.sets.length} series · ${Math.round(l.sets.reduce((a,s)=>a+s.kg*s.reps,0))} kg de volumen</span></div>`).join(""):`<div class="empty">Todavía no hay entrenamientos guardados.</div>`;
}
function exportData(){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="erasmus-fit-datos.json";a.click();URL.revokeObjectURL(a.href);
}
function clearData(){if(confirm("¿Borrar todos los entrenamientos y registros?")){data={logs:[],draft:{}};save();renderProgress();renderWorkout();}}
renderTabs();renderWorkout();
