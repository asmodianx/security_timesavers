"use strict";
(() => {
  const STORAGE_KEY = "conScroller.config.v2";
  const MAX_EVENTS = 5000;
  const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
  const SAFE_COLOR = /^#[0-9a-f]{6}$/i;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const $ = id => document.getElementById(id);
  let state = { config: null, events: [], followNow: false, summaryMode: false, summaryTimer: 0, userScrollingUntil: 0 };

  function text(value, max = 500) { return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max); }
  function timeToMin(value) { if (!TIME_RE.test(value)) return null; const [h,m]=value.split(":").map(Number); return h*60+m; }
  function localDateKey(date) { const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,"0"); const d=String(date.getDate()).padStart(2,"0"); return `${y}-${m}-${d}`; }
  function validDate(value) { if (!DATE_RE.test(value)) return false; const d=new Date(`${value}T00:00:00`); return !Number.isNaN(d.valueOf()) && localDateKey(d)===value; }
  function randomId() { return globalThis.crypto?.randomUUID?.() ?? `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  function setStatus(message) { $("status").textContent = message; }

  function normalizeCategories(input) {
    const fallback = { talk:{label:"Talk",color:"#3b82f6"}, workshop:{label:"Workshop",color:"#10b981"}, village:{label:"Village",color:"#f59e0b"}, social:{label:"Social",color:"#8b5cf6"} };
    if (!input || typeof input !== "object" || Array.isArray(input)) return fallback;
    const out = {};
    for (const [rawKey, rawVal] of Object.entries(input).slice(0,50)) {
      const key=text(rawKey,40).toLowerCase().replace(/[^a-z0-9_-]/g,"");
      if (!key || !rawVal || typeof rawVal !== "object") continue;
      out[key]={label:text(rawVal.label || key,50),color:SAFE_COLOR.test(rawVal.color || "")?rawVal.color:"#64748b"};
    }
    return Object.keys(out).length ? out : fallback;
  }
  function normalizeEvent(raw, categories) {
    if (!raw || typeof raw !== "object") return null;
    const date=text(raw.date,10), start=text(raw.start,5), end=text(raw.end,5);
    const startMin=timeToMin(start), endMin=timeToMin(end);
    if (!validDate(date) || startMin===null || endMin===null || endMin<=startMin) return null;
    const candidate=text(raw.category ?? raw.cat ?? "talk",40).toLowerCase();
    const category=Object.hasOwn(categories,candidate)?candidate:Object.keys(categories)[0];
    return {id:text(raw.id || randomId(),100),date,start,end,startMin,endMin,name:text(raw.name || "Untitled event",160),location:text(raw.location ?? raw.loc ?? "",120),category,track:text(raw.track ?? raw.group ?? "",80),description:text(raw.description ?? raw.desc ?? "",1500)};
  }
  function normalizeConfig(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    const categories=normalizeCategories(raw.categories);
    const events=Array.isArray(raw.events)?raw.events.slice(0,MAX_EVENTS).map(e=>normalizeEvent(e,categories)).filter(Boolean):[];
    return {version:1,name:text(raw.name || "Conference Name",120),theme:raw.theme==="dark"?"dark":"light",pixelsPerMinute:Math.min(8,Math.max(1,Number(raw.pixelsPerMinute)||3)),followNow:Boolean(raw.followNow),summaryIntervalSeconds:Math.min(60,Math.max(3,Number(raw.summaryIntervalSeconds)||8)),logo:(typeof raw.logo==="string" && /^(?:data:image\/(?:png|jpeg|gif|webp);base64,)/.test(raw.logo) && raw.logo.length<2_000_000)?raw.logo:"",categories,events};
  }
  function loadInitialConfig() {
    let source = window.CON_SCROLLER_CONFIG || {};
    try { const saved=localStorage.getItem(STORAGE_KEY); if (saved) source=JSON.parse(saved); } catch { setStatus("Saved browser configuration could not be read; config.js was loaded."); }
    state.config=normalizeConfig(source); state.events=state.config.events; state.followNow=state.config.followNow;
  }
  function snapshot() { return {...state.config,name:$("confName").textContent.trim(),theme:document.body.dataset.theme,followNow:state.followNow,events:state.events.map(({startMin,endMin,...e})=>e),logo:$("logoDisplay").src.startsWith("data:image/")?$("logoDisplay").src:""}; }
  function saveLocal() { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot())); } catch { setStatus("Unable to save locally. Export JSON to preserve changes."); } }
  function make(tag,className,textValue) { const el=document.createElement(tag); if(className)el.className=className; if(textValue!==undefined)el.textContent=textValue; return el; }

  function computeColumns(dayEvents) {
    const sorted=[...dayEvents].sort((a,b)=>a.startMin-b.startMin || b.endMin-a.endMin || a.name.localeCompare(b.name));
    const clusters=[]; let cluster=[]; let clusterEnd=-1;
    for (const event of sorted) { if (cluster.length && event.startMin>=clusterEnd) { clusters.push(cluster); cluster=[]; clusterEnd=-1; } cluster.push(event); clusterEnd=Math.max(clusterEnd,event.endMin); }
    if(cluster.length)clusters.push(cluster);
    const layout=new Map();
    for(const group of clusters){ const columnEnds=[]; for(const event of group){ let col=columnEnds.findIndex(end=>end<=event.startMin); if(col<0){col=columnEnds.length;columnEnds.push(event.endMin);}else columnEnds[col]=event.endMin; layout.set(event.id,{col,cols:0}); } const cols=columnEnds.length; group.forEach(e=>layout.get(e.id).cols=cols); }
    return layout;
  }
  function eventCard(event, summary=false) {
    const category=state.config.categories[event.category];
    const card=make("article",summary?"summary-card":"event-node"); card.style.setProperty("--cat-color",category.color); card.dataset.id=event.id; card.tabIndex=0;
    if(summary){ card.append(make("div","summary-time",`${event.start}–${event.end}`)); const body=make("div"); body.append(make("div","event-name",event.name)); body.append(make("div","summary-track",[category.label,event.track,event.location].filter(Boolean).join(" • "))); if(event.description)body.append(make("div","event-desc",event.description)); card.append(body); }
    else { card.append(make("div","event-name",event.name)); card.append(make("div","event-meta",[event.location,`${event.start}–${event.end}`,event.track].filter(Boolean).join(" • "))); if(event.description)card.append(make("div","event-desc",event.description)); }
    card.addEventListener("contextmenu",e=>{e.preventDefault(); if(confirm(`Delete “${event.name}”?`)){state.events=state.events.filter(x=>x.id!==event.id);saveLocal();render();}});
    return card;
  }
  function renderTimeline() {
    const root=$("timelineRoot"); root.replaceChildren();
    if(!state.events.length){root.append(make("p","empty","No scheduled events. Add events in Settings or edit config.js."));return;}
    const grouped=new Map(); for(const e of state.events){if(!grouped.has(e.date))grouped.set(e.date,[]);grouped.get(e.date).push(e);}
    for(const date of [...grouped.keys()].sort()){
      const dayEvents=grouped.get(date), layout=computeColumns(dayEvents), ppm=state.config.pixelsPerMinute;
      const minStart=Math.max(0,Math.floor((Math.min(...dayEvents.map(e=>e.startMin))-60)/60)*60);
      const maxEnd=Math.min(1440,Math.ceil((Math.max(...dayEvents.map(e=>e.endMin))+60)/60)*60);
      const section=make("section","day-section");section.dataset.date=date;
      section.append(make("header","day-header",new Date(`${date}T00:00:00`).toLocaleDateString([], {weekday:"long",year:"numeric",month:"long",day:"numeric"})));
      const grid=make("div","timeline-grid");grid.style.height=`${(maxEnd-minStart)*ppm}px`;grid.dataset.minStart=String(minStart);
      const gutter=make("div","time-gutter"), stage=make("div","event-stage");
      for(let m=minStart;m<=maxEnd;m+=60){const top=(m-minStart)*ppm;const mark=make("div","hour-mark",`${String(Math.floor(m/60)).padStart(2,"0")}:00`);mark.style.top=`${top}px`;gutter.append(mark);const line=make("div","hour-line");line.style.top=`${top}px`;grid.append(line);}
      for(const ev of dayEvents){const p=layout.get(ev.id), card=eventCard(ev);const gap=8;card.style.top=`${(ev.startMin-minStart)*ppm}px`;card.style.height=`${Math.max(36,(ev.endMin-ev.startMin)*ppm-gap)}px`;card.style.left=`calc(${p.col*100/p.cols}% + ${p.col?gap/2:0}px)`;card.style.width=`calc(${100/p.cols}% - ${gap}px)`;stage.append(card);}
      grid.append(gutter,stage);section.append(grid);root.append(section);
    }
  }
  function renderSummary(){const root=$("summaryRoot");root.replaceChildren();const grouped=new Map();for(const e of [...state.events].sort((a,b)=>a.date.localeCompare(b.date)||a.startMin-b.startMin)){if(!grouped.has(e.date))grouped.set(e.date,[]);grouped.get(e.date).push(e);}if(!grouped.size){root.append(make("p","empty","No scheduled events."));return;}for(const [date,items] of grouped){const sec=make("section","summary-day");sec.append(make("h2","",new Date(`${date}T00:00:00`).toLocaleDateString([], {weekday:"long",year:"numeric",month:"long",day:"numeric"})));const list=make("div","summary-list");items.forEach(e=>list.append(eventCard(e,true)));sec.append(list);root.append(sec);}}
  function renderLegend(){const legend=$("legend");legend.replaceChildren();for(const value of Object.values(state.config.categories)){const item=make("span","legend-item",value.label);item.style.borderLeft=`7px solid ${value.color}`;legend.append(item);}}
  function renderCategoryOptions(){const select=$("inCat");select.replaceChildren();for(const [key,value] of Object.entries(state.config.categories)){const option=make("option","",value.label);option.value=key;select.append(option);}}
  function render(){renderTimeline();renderSummary();renderLegend();updateClock();}

  function centerNow(force=false){if(!state.followNow || state.summaryMode)return;if(!force && Date.now()<state.userScrollingUntil)return;const now=new Date(),section=document.querySelector(`.day-section[data-date="${localDateKey(now)}"]`);if(!section)return;const grid=section.querySelector(".timeline-grid"),minStart=Number(grid.dataset.minStart),position=section.offsetTop+section.querySelector(".day-header").offsetHeight+(now.getHours()*60+now.getMinutes()-minStart)*state.config.pixelsPerMinute;$("scrollBox").scrollTo({top:Math.max(0,position-$("scrollBox").clientHeight*.42),behavior:force?"smooth":"auto"});}
  function updateClock(){const now=new Date(),today=localDateKey(now),cur=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;$("liveClock").textContent=now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});$("liveDate").textContent=now.toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"});document.querySelectorAll(".now-line").forEach(n=>n.remove());document.querySelectorAll(".event-node.active").forEach(n=>n.classList.remove("active"));const sec=document.querySelector(`.day-section[data-date="${today}"]`);if(sec){const grid=sec.querySelector(".timeline-grid"),stage=sec.querySelector(".event-stage"),minStart=Number(grid.dataset.minStart);if(cur>=minStart){const line=make("div","now-line");line.style.top=`${(cur-minStart)*state.config.pixelsPerMinute}px`;stage.append(line);}}for(const ev of state.events){if(ev.date===today&&cur>=ev.startMin&&cur<ev.endMin){const node=document.querySelector(`.event-node[data-id="${CSS.escape(ev.id)}"]`);node?.classList.add("active");}}centerNow();}
  function setFollow(enabled){state.followNow=enabled;$("followBtn").setAttribute("aria-pressed",String(enabled));$("followBtn").textContent=enabled?"Following now":"Follow now";if(enabled){setSummary(false);centerNow(true);}saveLocal();}
  function scheduleSummaryAdvance(){clearInterval(state.summaryTimer);if(!state.summaryMode)return;state.summaryTimer=setInterval(()=>{const box=$("scrollBox"),cards=[...document.querySelectorAll(".summary-card")];if(!cards.length)return;const current=cards.findIndex(c=>c.getBoundingClientRect().top>=box.getBoundingClientRect().top+30);const next=cards[current<0?0:(current+1)%cards.length];next.scrollIntoView({behavior:"smooth",block:"center"});},state.config.summaryIntervalSeconds*1000);}
  function setSummary(enabled){state.summaryMode=enabled;$("summaryBtn").setAttribute("aria-pressed",String(enabled));$("summaryBtn").textContent=enabled?"Exit summary":"Summary mode";$("timelineRoot").hidden=enabled;$("summaryRoot").hidden=!enabled;if(enabled){state.followNow=false;$("followBtn").setAttribute("aria-pressed","false");$("followBtn").textContent="Follow now";$("scrollBox").scrollTo({top:0,behavior:"smooth"});}scheduleSummaryAdvance();}
  function applyConfig(){document.body.dataset.theme=state.config.theme;document.documentElement.style.setProperty("--ppm",`${state.config.pixelsPerMinute}px`);$("confName").textContent=state.config.name;$("followBtn").setAttribute("aria-pressed",String(state.followNow));if(state.config.logo){$("logoDisplay").src=state.config.logo;$("logoDisplay").hidden=false;}else{$("logoDisplay").removeAttribute("src");$("logoDisplay").hidden=true;}renderCategoryOptions();render();if(state.followNow)setTimeout(()=>centerNow(true),0);}

  $("adminBtn").addEventListener("click",()=>{const p=$("adminPanel"),open=p.hidden;p.hidden=!open;$("adminBtn").setAttribute("aria-expanded",String(open));});
  $("followBtn").addEventListener("click",()=>setFollow(!state.followNow));
  $("summaryBtn").addEventListener("click",()=>setSummary(!state.summaryMode));
  $("themeBtn").addEventListener("click",()=>{document.body.dataset.theme=document.body.dataset.theme==="dark"?"light":"dark";state.config.theme=document.body.dataset.theme;saveLocal();});
  $("confName").addEventListener("dblclick",()=>{const proposed=prompt("Conference name",$("confName").textContent);if(proposed!==null){$("confName").textContent=text(proposed,120)||"Conference Name";saveLocal();}});
  $("eventForm").addEventListener("submit",e=>{e.preventDefault();const raw={id:randomId(),date:$("inDate").value,start:$("inStart").value,end:$("inEnd").value,name:$("inName").value,location:$("inLoc").value,category:$("inCat").value,track:$("inTrack").value,description:$("inDesc").value};const event=normalizeEvent(raw,state.config.categories);if(!event){setStatus("Event rejected: use a valid date and an end time later than the start time.");return;}state.events.push(event);saveLocal();render();e.target.reset();setStatus("Event added and saved locally.");});
  $("exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(snapshot(),null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="conference-schedule.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $("importBtn").addEventListener("click",()=>$("importFile").click());
  $("importFile").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>MAX_IMPORT_BYTES){setStatus("Import rejected: file exceeds 5 MB.");return;}try{const parsed=JSON.parse(await file.text());state.config=normalizeConfig(parsed);state.events=state.config.events;state.followNow=state.config.followNow;saveLocal();applyConfig();setStatus("Configuration imported and saved locally.");}catch{setStatus("Import rejected: invalid JSON.");}finally{e.target.value="";}});
  $("clearSavedBtn").addEventListener("click",()=>{localStorage.removeItem(STORAGE_KEY);state.config=normalizeConfig(window.CON_SCROLLER_CONFIG||{});state.events=state.config.events;state.followNow=state.config.followNow;applyConfig();setStatus("Browser override cleared; config.js reloaded.");});
  $("logoInput").addEventListener("change",e=>{const file=e.target.files?.[0];if(!file)return;if(!["image/png","image/jpeg","image/gif","image/webp"].includes(file.type)||file.size>2_000_000){setStatus("Logo rejected: use PNG, JPEG, GIF, or WebP under 2 MB.");return;}const reader=new FileReader();reader.onload=()=>{$("logoDisplay").src=String(reader.result);$("logoDisplay").hidden=false;saveLocal();};reader.readAsDataURL(file);});
  $("scrollBox").addEventListener("wheel",()=>{state.userScrollingUntil=Date.now()+10000;},{passive:true});
  $("scrollBox").addEventListener("touchmove",()=>{state.userScrollingUntil=Date.now()+10000;},{passive:true});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("adminPanel").hidden){$("adminPanel").hidden=true;$("adminBtn").setAttribute("aria-expanded","false");}});

  loadInitialConfig(); applyConfig(); setInterval(updateClock,1000);
})();
