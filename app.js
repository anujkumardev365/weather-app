// Atelier Weather — Open-Meteo (free, no key) + DESIGN.md tokens
const $=s=>document.querySelector(s);
const state={name:'New Delhi',lat:28.6139,lon:77.209,saved:JSON.parse(localStorage.getItem('wx-saved')||'[{"name":"New Delhi","lat":28.6139,"lon":77.209},{"name":"London","lat":51.5074,"lon":-0.1278}]')};
const WMO={0:['Clear sky','sun'],1:['Mainly clear','sun'],2:['Partly cloudy','part'],3:['Overcast','cloud'],45:['Fog','fog'],48:['Rime fog','fog'],51:['Light drizzle','rain'],53:['Drizzle','rain'],55:['Heavy drizzle','rain'],61:['Light rain','rain'],63:['Rain','rain'],65:['Heavy rain','rain'],71:['Light snow','snow'],73:['Snow','snow'],75:['Heavy snow','snow'],80:['Showers','rain'],81:['Showers','rain'],82:['Violent showers','rain'],95:['Thunderstorm','storm'],96:['Storm + hail','storm'],99:['Storm + hail','storm']};
function icon(k){const s='fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"';
if(k==='sun')return `<svg viewBox="0 0 24 24" ${s} class="w-full h-full"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
if(k==='part')return `<svg viewBox="0 0 24 24" ${s} class="w-full h-full"><circle cx="8" cy="8" r="3"/><path d="M8 2v1.5M2 8h1.5M4 4l1 1M12 4l.7.7M7 20h9a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 7 13.5V20Z"/></svg>`;
if(k==='rain')return `<svg viewBox="0 0 24 24" ${s} class="w-full h-full"><path d="M7 15h9a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 7 8.5V15Z"/><path d="M8 18v2M12 18v2M16 18v2"/></svg>`;
if(k==='storm')return `<svg viewBox="0 0 24 24" ${s} class="w-full h-full"><path d="M7 14h9a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 7 7.5V14Z"/><path d="M12 13l-2 4h3l-1 3 3-5h-3l1-2"/></svg>`;
if(k==='snow')return `<svg viewBox="0 0 24 24" ${s} class="w-full h-full"><path d="M7 14h9a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 7 7.5V14Z"/><path d="M8 18h.01M12 19h.01M16 18h.01"/></svg>`;
if(k==='fog')return `<svg viewBox="0 0 24 24" ${s} class="w-full h-full"><path d="M4 10h16M6 14h12M8 18h8"/></svg>`;
return `<svg viewBox="0 0 24 24" ${s} class="w-full h-full"><path d="M7 18h9a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 7 11.5V18Z"/></svg>`;}
function skeleton(){$('#hero').innerHTML=`<div class="skel h-[86px] w-2/3"></div><div class="skel h-6 w-1/3 mt-3"></div>`;$('#hourly').innerHTML=Array(8).fill(`<div class="skel min-w-[72px] h-[112px]"></div>`).join('');$('#daily').innerHTML=Array(5).fill(`<div class="skel h-[52px] !rounded-none"></div>`).join('');$('#metrics').innerHTML=Array(4).fill(`<div class="skel h-[110px]"></div>`).join('');}
function tint(code,isDay){document.body.classList.remove('weather-tint-clear-day','weather-tint-rain','weather-tint-cloud','weather-tint-dusk','weather-tint-night');let t='weather-tint-cloud';if(!isDay){document.body.classList.add('weather-tint-night');return;}if(code===0||code===1)t='weather-tint-clear-day';else if([51,53,55,61,63,65,80,81,82].includes(code))t='weather-tint-rain';else if(code===2)t='weather-tint-dusk';document.body.classList.add(t);}
async function loadCity(name,lat,lon){state.name=name;state.lat=lat;state.lon=lon;$('#denied').classList.add('hidden');skeleton();
try{
const u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code,time&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`;
const aq=`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,uv_index&timezone=auto`;
const r1=await fetch(u);if(!r1.ok)throw 0;const j=await r1.json();const a=await fetch(aq).then(r=>r.json()).catch(()=>({}));
render(j,a);localStorage.setItem('wx-last',JSON.stringify({name,lat,lon}));$('#offline').classList.add('hidden');
}catch(e){$('#offline').classList.remove('hidden');const last=localStorage.getItem('wx-last');
if(last){const p=JSON.parse(last);if(p.name!==name){loadCity(p.name,p.lat,p.lon);return;}}
document.querySelector('#hero').innerHTML='<div class="border border-hairline rounded-xlx p-6 text-center bg-soft"><p class="serif-d text-[28px]">Offline</p><p class="text-[14px] text-muted">Check connection and retry.</p></div>';
}
}
function render(j,a){
const c=j.current,w0=WMO[c.weather_code]||['—','cloud'];
tint(c.weather_code,c.is_day);
const d=j.daily,hi=Math.round(d.temperature_2m_max[0]),lo=Math.round(d.temperature_2m_min[0]);
document.querySelector('#hero').innerHTML=
'<p class="text-[12px] tracking-[1.5px] font-medium text-muted">'+state.name.toUpperCase()+'</p>'
+'<div class="flex items-end justify-between mt-2"><h1 class="serif-d leading-none" style="font-size:96px">'+Math.round(c.temperature_2m)+'°</h1><div class="w-[72px] h-[72px]">'+icon(w0[1])+'</div></div>'
+'<p class="serif-d text-[28px] -mt-1">'+w0[0]+'</p>'
+'<p class="text-[14px] text-body">H '+hi+'° L '+lo+'° • Feels '+Math.round(c.apparent_temperature)+'°</p>'
+'<button onclick="saveHere()" class="mt-3 text-[13px] font-medium underline underline-offset-4">+ Save location</button>';
document.querySelector('#updated').textContent='Updated '+new Date(c.time).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
let idx=j.hourly.time.findIndex(t=>new Date(t)>=new Date(c.time));if(idx<0)idx=0;
let hh='';
for(let i=0;i<24;i++){const k=i+idx,w=WMO[j.hourly.weather_code[k]]||['','cloud'],pr=j.hourly.precipitation_probability[k]??0;
hh+='<div class="chip min-w-[72px] rounded-lgx py-3 px-2 text-center shrink-0'+(i===0?' !bg-ink !text-[#FAF9F5] !border-ink':'')+'"><p class="text-[12px]'+(i===0?'':' text-muted')+'">'+(i===0?'Now':new Date(j.hourly.time[k]).toLocaleTimeString([],{hour:'numeric'}))+'</p><div class="w-6 h-6 mx-auto my-1.5">'+icon(w[1])+'</div><p class="text-[15px] font-semibold">'+Math.round(j.hourly.temperature_2m[k])+'°</p><p class="text-[12px] '+(pr>30?'text-[#2F6FED]':'text-softmuted')+'">'+pr+'%</p></div>';}
document.querySelector('#hourly').innerHTML=hh;
renderDaily(j,a);
}
function renderDaily(j,a){
const c=j.current,d=j.daily;
const mn=Math.min(...d.temperature_2m_min),mx=Math.max(...d.temperature_2m_max);
let s='';
for(let i=0;i<d.time.length;i++){
const w=WMO[d.weather_code[i]]||['','cloud'];
const L=(d.temperature_2m_min[i]-mn)/(mx-mn||1)*100;
const W=Math.max(8,(d.temperature_2m_max[i]-d.temperature_2m_min[i])/(mx-mn||1)*100);
const day=i===0?'Today':new Date(d.time[i]).toLocaleDateString([],{weekday:'short'});
s+='<div class="flex items-center gap-3 px-4 h-[52px]"><span class="w-[52px] text-[14px] font-medium">'+day+'</span><span class="w-6 h-6">'+icon(w[1])+'</span><span class="w-[38px] text-[12px] text-[#2F6FED]">'+(d.precipitation_probability_max[i]??0)+'%</span><span class="text-[14px] w-8 text-right text-muted">'+Math.round(d.temperature_2m_min[i])+'°</span><div class="range-track flex-1"><div class="range-fill" style="left:'+L+'%;width:'+W+'%"></div></div><span class="text-[14px] w-8 font-medium">'+Math.round(d.temperature_2m_max[i])+'°</span></div>';
}
document.querySelector('#daily').innerHTML=s;
const dirs=['N','NE','E','SE','S','SW','W','NW'];
const dir=dirs[Math.round(c.wind_direction_10m/45)%8];
const aqi=(a&&a.current&&a.current.us_aqi!=null)?a.current.us_aqi:'—';
const uv=(a&&a.current&&a.current.uv_index!=null)?a.current.uv_index:'—';
const card=(t,v,sub)=>'<div class="bg-white/60 border border-hairline rounded-lgx p-4"><p class="text-[12px] tracking-[1px] text-muted font-medium">'+t+'</p><p class="serif-d text-[32px] leading-tight mt-1">'+v+'</p><p class="text-[13px] text-muted">'+sub+'</p></div>';
let uvT='—';if(uv!=='—')uvT=uv<3?'Low':uv<6?'Moderate':uv<8?'High':'Very high';
let aqT='—';if(aqi!=='—')aqT=aqi<=50?'Good':aqi<=100?'Moderate':aqi<=150?'Sensitive':'Unhealthy';
document.querySelector('#metrics').innerHTML=
card('HUMIDITY',c.relative_humidity_2m+'<span style="font-size:18px">%</span>',c.relative_humidity_2m>70?'Humid':'Comfortable')
+card('WIND',Math.round(c.wind_speed_10m)+'<span style="font-size:18px"> km/h</span>',dir+' '+Math.round(c.wind_direction_10m)+'°')
+card('UV INDEX',uv,uvT)+card('AIR QUALITY',aqi,aqT);
}
let deb=null;
document.querySelector('#q').addEventListener('input',e=>{
clearTimeout(deb);
deb=setTimeout(async()=>{
const q=e.target.value.trim();
if(q.length<2){document.querySelector('#suggest').classList.add('hidden');return;}
const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(q)+'&count=5&language=en&format=json').then(r=>r.json()).catch(()=>({}));
const box=document.querySelector('#suggest');
if(!r.results||!r.results.length){box.innerHTML='<div class="p-3 text-[14px] text-muted">No matches</div>';box.classList.remove('hidden');return;}
box.innerHTML='';
r.results.forEach(p=>{
const b=document.createElement('button');
b.className='w-full text-left px-4 py-2.5 hover:bg-soft text-[14px]';
b.textContent=p.name+' '+(p.country||'');
b.onclick=()=>{box.classList.add('hidden');e.target.value='';loadCity(p.name,p.latitude,p.longitude);};
box.appendChild(b);
});
box.classList.remove('hidden');
},250);
});
document.addEventListener('click',e=>{
if(!e.target.closest('#q')&&!e.target.closest('#suggest'))document.querySelector('#suggest').classList.add('hidden');
});
function saveHere(){
const ex=state.saved.some(s=>Math.abs(s.lat-state.lat)<.01);
if(!ex){state.saved.push({name:state.name,lat:state.lat,lon:state.lon});localStorage.setItem('wx-saved',JSON.stringify(state.saved));renderSaved();}
}
function renderSaved(){
const box=document.querySelector('#savedList');box.innerHTML='';
if(!state.saved.length)box.innerHTML='<span class="text-muted text-[13px]">No saved yet</span>';
state.saved.forEach((s,i)=>{
const w=document.createElement('span');
w.className='chip rounded-full px-3 py-1.5 text-[13px] flex items-center gap-2';
const b=document.createElement('button');b.textContent=s.name;
b.onclick=()=>loadCity(s.name,s.lat,s.lon);
const x=document.createElement('button');x.textContent='×';x.className='text-softmuted';
x.onclick=()=>{state.saved.splice(i,1);localStorage.setItem('wx-saved',JSON.stringify(state.saved));renderSaved();};
w.appendChild(b);w.appendChild(x);box.appendChild(w);
});
}
window.loadCity=loadCity;window.saveHere=saveHere;
document.querySelector('#savedBtn').onclick=()=>document.querySelector('#savedPanel').classList.toggle('hidden');
document.querySelector('#locBtn').onclick=()=>{
if(!navigator.geolocation){document.querySelector('#denied').classList.remove('hidden');return;}
navigator.geolocation.getCurrentPosition(async p=>{
const la=p.coords.latitude,lo=p.coords.longitude;
const g=await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+la+'&longitude='+lo+'&localityLanguage=en').then(r=>r.json()).catch(()=>({}));
loadCity(g.city||g.locality||'Current location',la,lo);
},()=>document.querySelector('#denied').classList.remove('hidden'),{timeout:8000});
};
window.addEventListener('offline',()=>document.querySelector('#offline').classList.remove('hidden'));
window.addEventListener('online',()=>loadCity(state.name,state.lat,state.lon));
renderSaved();loadCity(state.name,state.lat,state.lon);
