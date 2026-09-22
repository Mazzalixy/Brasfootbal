/* ==========================================================
   BRASFOOTBALL — núcleo do jogo
   1. utilidades   2. interface   3. save   4. carreira
   5. escalação e tática   6. temporada   7. estrutura da página
   ========================================================== */

const SAVE_KEY = "brasfootball_save_v3";
const LOGIN_KEY = "brasfootball_login_v1";
const SAVE_VERSION = 5;
const SQUAD_MIN = 16;
const TOTAL_ROUNDS = 38;

/* ---------- 1. utilidades ---------- */
function money(v){return "R$ " + Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});}
function moneyShort(v){
  const n=Number(v||0), a=Math.abs(n), sign=n<0?"-":"";
  if(a>=1e6) return sign+"R$ "+(a/1e6).toLocaleString("pt-BR",{maximumFractionDigits:1})+" mi";
  if(a>=1e3) return sign+"R$ "+Math.round(a/1e3).toLocaleString("pt-BR")+" mil";
  return sign+"R$ "+a.toLocaleString("pt-BR");
}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function clone(x){return JSON.parse(JSON.stringify(x));}
function uid(prefix){return prefix+"-"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function today(){return new Date().toLocaleDateString("pt-BR");}
function getTeam(id){return GAME_TEAMS.find(t=>t.id===id);}
function teamName(id){return getTeam(id)?.name||"Clube";}
function teamObj(id){return getTeam(id)||{};}
function surname(name){const p=String(name).split(" ");return p[p.length-1];}
function initials(name){const p=String(name||"?").trim().split(/\s+/);return ((p[0]||"?")[0]+(p.length>1?p[p.length-1][0]:"")).toUpperCase();}
function poisson(lambda){const L=Math.exp(-lambda);let k=0,p=1;do{k++;p*=Math.random();}while(p>L);return Math.min(7,k-1);}
function pickWeighted(list,wmap,excludeId){
  const pool=list.filter(p=>p.id!==excludeId);
  if(!pool.length) return null;
  const ws=pool.map(p=>(wmap[p.position]||.1)*(.5+p.rating/100));
  let r=Math.random()*ws.reduce((a,b)=>a+b,0);
  for(let i=0;i<pool.length;i++){r-=ws[i];if(r<=0)return pool[i];}
  return pool[pool.length-1];
}
const SCORER_WEIGHT={ATA:6,MEI:3,VOL:1,LAT:.6,ZAG:.5,GOL:.02};
const ASSIST_WEIGHT={MEI:5,ATA:3,LAT:3,VOL:2,ZAG:.4,GOL:.02};

/* ---------- 2. interface ---------- */
const ICONS={
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z"/>',
  users:'<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20c0-3.4 2.8-5.8 6.2-5.8s6.2 2.4 6.2 5.8"/><path d="M16 5.2a3.2 3.2 0 010 6"/><path d="M18 14.6c2 .7 3.3 2.6 3.3 5.4"/>',
  swap:'<path d="M4 8h15l-3.5-3.5"/><path d="M20 16H5l3.5 3.5"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  play:'<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5.2 3.5-5.2 3.5z" fill="currentColor"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  trophy:'<path d="M8 4h8v6a4 4 0 01-8 0z"/><path d="M8 6H4.5v1.5A3.5 3.5 0 008 11M16 6h3.5v1.5A3.5 3.5 0 0116 11"/><path d="M12 14v4M8.5 20h7"/>',
  table:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M3.5 14.5h17M9 9.5v10"/>',
  star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/>',
  chart:'<path d="M4 4v16h16"/><path d="M8 15l3.5-4 3 2.5L19 8"/>',
  wallet:'<rect x="3.5" y="6" width="17" height="13.5" rx="2.5"/><path d="M3.5 10h17"/><circle cx="16.5" cy="14.5" r="1.1" fill="currentColor"/>',
  building:'<path d="M5 20.5V5l7-2 7 2v15.5"/><path d="M9 9h1.5M13.5 9H15M9 13h1.5M13.5 13H15M10 20.5v-4h4v4"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  ball:'<circle cx="12" cy="12" r="9"/><path d="M12 8l3.6 2.6-1.4 4.2H9.8l-1.4-4.2z"/><path d="M12 3v5M20.6 9.5l-5 1.1M17.5 19l-3.3-4.2M6.5 19l3.3-4.2M3.4 9.5l5 1.1"/>',
  logout:'<path d="M9 4H5.5A1.5 1.5 0 004 5.5v13A1.5 1.5 0 005.5 20H9"/><path d="M15 8l4 4-4 4M19 12H9"/>',
  download:'<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
  upload:'<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 20h14"/>',
  tag:'<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.2" fill="currentColor"/>',
  warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  wand:'<path d="M5 19L15 9"/><path d="M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 12l.7 1.3 1.3.7-1.3.7L19 16l-.7-1.3L17 14l1.3-.7z"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>'
};
function icon(name,size){
  const s=size||18;
  return `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||""}</svg>`;
}
/* Escudo desenhado com as cores do clube */
function crest(team,size){
  const t=team||{};
  return `<span class="shield" style="--s:${size||36}px;--c1:${t.c1||"#64748b"};--c2:${t.c2||"#1e293b"};--tx:${t.tx||"#fff"}" role="img" aria-label="Escudo ${esc(t.name||"")}"><span>${esc(t.short||"")}</span></span>`;
}
function avatar(p,cls){
  return `<span class="avatar pos-${esc(p.position)} ${cls||""}" aria-hidden="true">${esc(initials(p.name))}</span>`;
}
function posChip(pos){return `<span class="pos-chip pos-${esc(pos)}" title="${esc(POSITION_NAMES[pos]||pos)}">${esc(pos)}</span>`;}
function ratingPill(r){
  const c=r>=85?"r-elite":r>=78?"r-high":r>=70?"r-mid":"r-low";
  return `<span class="rating-pill ${c}">${r}</span>`;
}
function formDots(list){
  if(!list.length) return `<span class="muted small">Sem jogos ainda</span>`;
  const label={V:"Vitória",E:"Empate",D:"Derrota"};
  return `<span class="form">${list.map(x=>`<i class="f-${x}" title="${label[x]}">${x}</i>`).join("")}</span>`;
}
function pageHead(title,sub,actions){
  return `<div class="page-head"><div><h1>${title}</h1>${sub?`<p>${sub}</p>`:""}</div>${actions?`<div class="page-actions">${actions}</div>`:""}</div>`;
}
function toast(msg,type){
  let box=document.getElementById("toasts");
  if(!box){box=document.createElement("div");box.id="toasts";box.setAttribute("role","status");box.setAttribute("aria-live","polite");document.body.appendChild(box);}
  const x=document.createElement("div");
  x.className="toast "+(type||"");
  x.textContent=msg;
  box.appendChild(x);
  setTimeout(()=>x.classList.add("out"),2600);
  setTimeout(()=>x.remove(),3000);
}
function askConfirm(o){
  o=o||{};
  return new Promise(resolve=>{
    const d=document.createElement("dialog");
    d.className="dialog";
    d.innerHTML=`<form method="dialog"><h3>${esc(o.title||"Confirmar")}</h3><p>${o.text||""}</p>
      <div class="dialog-actions"><button class="btn ghost" value="cancel" autofocus>${esc(o.cancel||"Cancelar")}</button>
      <button class="btn ${o.danger?"danger":"primary"}" value="ok">${esc(o.ok||"Confirmar")}</button></div></form>`;
    d.addEventListener("close",()=>{const ok=d.returnValue==="ok";d.remove();resolve(ok);});
    document.body.appendChild(d);
    if(typeof d.showModal==="function") d.showModal();
    else{d.remove();resolve(window.confirm(String(o.text||o.title||"").replace(/<[^>]+>/g,"")));}
  });
}
/* Sons simples (ligados/desligados em Configurações) */
let _audio=null;
function tone(freq,start,dur,type,vol){
  try{
    _audio=_audio||new (window.AudioContext||window.webkitAudioContext)();
    const o=_audio.createOscillator(),g=_audio.createGain(),t=_audio.currentTime+start;
    o.type=type||"sine";o.frequency.value=freq;
    g.gain.setValueAtTime(vol||.06,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(_audio.destination);o.start(t);o.stop(t+dur);
  }catch(e){}
}
function playSound(kind){
  if(!window.__soundOn) return;
  if(kind==="goal"){tone(523,0,.14,"triangle");tone(659,.12,.14,"triangle");tone(784,.24,.3,"triangle");}
  else if(kind==="whistle"){tone(1500,0,.35,"square",.03);tone(1500,.42,.5,"square",.03);}
  else if(kind==="card"){tone(300,0,.18,"sawtooth",.03);}
}

/* ---------- 3. save ---------- */
function defaultManager(){return {confidence:75,matches:0,wins:0,draws:0,losses:0,points:0,warnings:0,status:"active",history:[]};}
function defaultTactic(){return {formation:"4-3-3",mentality:"Equilibrada",pressing:"Médio",tempo:"Normal",marking:"Zona",width:"Normal",defensiveLine:"Normal",setPieces:"Equilibrado"};}

function loadGame(){
  let s=null;
  try{s=JSON.parse(localStorage.getItem(SAVE_KEY));}catch(e){return null;}
  if(!s||!Array.isArray(s.squad)||!s.clubId||!getTeam(s.clubId)) return null;
  return migrate(s);
}
function saveGame(s){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));return true;}
  catch(e){toast("Não foi possível salvar. O armazenamento do navegador está bloqueado ou cheio.","error");return false;}
}
/* Deixa saves antigos compatíveis com esta versão */
function migrate(s){
  s.manager=Object.assign(defaultManager(),s.manager);
  if(!Array.isArray(s.manager.history)) s.manager.history=[];
  s.settings=Object.assign({sound:true,compact:false},s.settings);
  s.tactic=Object.assign(defaultTactic(),s.tactic);
  if(!FORMATIONS[s.tactic.formation]) s.tactic.formation="4-3-3";
  s.teamStats=Object.assign({played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,shots:0,possession:0},s.teamStats);
  s.finance=Object.assign({balance:0,income:0,expenses:0,history:[]},s.finance);
  s.squad.forEach(p=>{p.goals=p.goals||0;p.assists=p.assists||0;p.cards=p.cards||0;p.matches=p.matches||0;});
  if(!s.objectiveRank) s.objectiveRank=8;
  if(!Array.isArray(s.seasonHistory)) s.seasonHistory=[];
  if(!Array.isArray(s.market)||!s.market.length||s.market.some(p=>!p.originalId||!p.ownerId)) s.market=buildMarket(s);
  fixLineup(s);
  return s;
}
function getLogin(){try{return JSON.parse(localStorage.getItem(LOGIN_KEY))||null;}catch(e){return null;}}
function saveLogin(name){const login={name:String(name||"").trim()};try{localStorage.setItem(LOGIN_KEY,JSON.stringify(login));}catch(e){}return login;}
function clearLogin(){try{localStorage.removeItem(LOGIN_KEY);}catch(e){}}

/* ---------- 4. carreira ---------- */
function createSchedule(teamIds){
  const n=teamIds.length, rounds=[];
  let list=teamIds.slice();
  for(let r=0;r<n-1;r++){
    const games=[];
    for(let i=0;i<n/2;i++){
      const a=list[i], b=list[n-1-i];
      const flip=r%2===1; // alterna o mando da rodada inteira para não empilhar jogos em casa/fora
      games.push({homeId:flip?b:a,awayId:flip?a:b,played:false,homeGoals:null,awayGoals:null,events:[]});
    }
    rounds.push(games);
    list=[list[0],list[n-1],...list.slice(1,n-1)];
  }
  const second=rounds.map(games=>games.map(g=>({homeId:g.awayId,awayId:g.homeId,played:false,homeGoals:null,awayGoals:null,events:[]})));
  return rounds.concat(second).map((games,i)=>({round:i+1,games}));
}
function initialStandings(teamIds){
  const x={};teamIds.forEach(id=>x[id]={teamId:id,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0});
  return x;
}
/* Mercado: 14 jogadores sorteados por posição, vindos dos outros clubes */
function buildMarket(s){
  const bought=new Set(s.squad.map(p=>p.originalId).filter(Boolean));
  const pool=[];
  GAME_TEAMS.forEach(t=>{
    if(t.id===s.clubId) return;
    (s.allPlayers[t.id]||[]).forEach(p=>{
      if(bought.has(p.id)) return;
      pool.push({...p,id:"m-"+p.id,originalId:p.id,ownerId:t.id});
    });
  });
  const out=[];
  POSITIONS.forEach(pos=>shuffle(pool.filter(p=>p.position===pos)).slice(0,14).forEach(p=>out.push(p)));
  return out;
}
function objectiveFor(strength){
  if(strength>=80) return {rank:4,text:"Terminar entre os 4 primeiros"};
  if(strength>=74) return {rank:8,text:"Terminar entre os 8 primeiros"};
  if(strength>=66) return {rank:12,text:"Terminar entre os 12 primeiros"};
  return {rank:16,text:"Evitar o rebaixamento (fora dos 4 últimos)"};
}
function newCareer(teamId){
  const team=getTeam(teamId);
  const allPlayers={};
  GAME_TEAMS.forEach((t,i)=>allPlayers[t.id]=makePlayers(t,i));
  const ids=GAME_TEAMS.map(t=>t.id);
  const obj=objectiveFor(team.strength);
  const state={
    version:SAVE_VERSION,season:2026,round:1,clubId:teamId,
    squad:clone(allPlayers[teamId]),market:[],
    managerName:getLogin()?.name||"Treinador",
    allPlayers,schedule:createSchedule(ids),standings:initialStandings(ids),
    finance:{balance:15000000,income:15000000,expenses:0,history:[{date:today(),type:"Receita",description:"Patrocínio inicial",value:15000000}]},
    teamStats:{played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,shots:0,possession:0},
    settings:{sound:true,compact:false},
    tactic:defaultTactic(),tacticalXI:[],
    trophies:0,objective:obj.text,objectiveRank:obj.rank,seasonHistory:[],
    lastMatch:null,manager:defaultManager()
  };
  state.market=buildMarket(state);
  fixLineup(state);
  saveGame(state);
  return state;
}
function startNewCareer(teamId){newCareer(teamId);location.href="menu.html";}
function continueGame(){const s=loadGame();if(!s)return false;location.href="menu.html";return true;}
function resetCareer(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}location.href="index.html";}
function applySettings(s){
  document.body.classList.toggle("compact",!!s.settings?.compact);
  window.__soundOn=!!s.settings?.sound;
}

/* ---------- 5. escalação e tática ---------- */
/* Mantém o time titular alinhado com as vagas da formação (uma vaga = um índice) */
function fixLineup(s){
  const spots=FORMATIONS[s.tactic.formation]||FORMATIONS["4-3-3"];
  const byId=new Map(s.squad.map(p=>[p.id,p]));
  const prev=(Array.isArray(s.tacticalXI)?s.tacticalXI:[]).map(id=>byId.get(id)).filter(Boolean);
  const used=new Set(), xi=new Array(spots.length).fill(null);
  const take=(i,p)=>{xi[i]=p.id;used.add(p.id);};
  // 1) aproveita quem já era titular e serve para a vaga
  spots.forEach((sp,i)=>{const p=prev.find(x=>!used.has(x.id)&&x.position===sp[0]);if(p)take(i,p);});
  // 2) completa com o melhor jogador livre da posição
  const best=fn=>s.squad.filter(fn).sort((a,b)=>b.rating-a.rating)[0];
  spots.forEach((sp,i)=>{if(xi[i])return;const p=best(x=>!used.has(x.id)&&x.position===sp[0]);if(p)take(i,p);});
  // 3) se faltar jogador na posição, escala o melhor que sobrou (fora de posição)
  spots.forEach((sp,i)=>{if(xi[i])return;const p=best(x=>!used.has(x.id));if(p)take(i,p);});
  s.tacticalXI=xi;
  return xi;
}
function autoLineup(s){s.tacticalXI=[];return fixLineup(s);}
function lineupPlayers(s){
  const spots=FORMATIONS[s.tactic.formation]||FORMATIONS["4-3-3"];
  return spots.map((sp,i)=>{
    const p=s.squad.find(x=>x.id===s.tacticalXI[i])||null;
    return {slot:sp[0],x:sp[1],y:sp[2],player:p,out:!!p&&p.position!==sp[0]};
  });
}
/* Força real do time: média dos titulares (−10 por jogador fora de posição) */
function lineupStrength(s){
  const l=lineupPlayers(s);
  return l.reduce((sum,x)=>sum+(x.player?x.player.rating-(x.out?10:0):40),0)/l.length;
}
function tacticEffects(t){
  const r={attack:0,defense:0,possession:0,risk:25};
  Object.keys(TACTIC_FX).forEach(k=>{
    const e=TACTIC_FX[k][t[k]];
    if(e){r.attack+=e.a||0;r.defense+=e.d||0;r.possession+=e.p||0;if(e.r)r.risk=e.r;}
  });
  return r;
}

/* Analise deterministica do elenco, tatica, mercado, financas e proximo jogo. */
function analyzeAssistant(s,tacticState){
  const tactic=tacticState||s.tactic,lineup=lineupPlayers(s);
  const groups={attack:lineup.filter(x=>x.slot==="ATA"),midfield:lineup.filter(x=>["VOL","MEI"].includes(x.slot)),defense:lineup.filter(x=>["GOL","LAT","ZAG"].includes(x.slot))};
  const scores={};
  Object.keys(groups).forEach(key=>{const players=groups[key].filter(x=>x.player);scores[key]=players.length?Math.round(players.reduce((sum,x)=>sum+x.player.rating-(x.out?10:0),0)/players.length):0;});
  const labels={attack:"ataque",midfield:"meio-campo",defense:"defesa"},weakest=Object.keys(scores).sort((a,b)=>scores[a]-scores[b])[0],recommendations=[];
  if(scores[weakest]<72) recommendations.push({tone:"red",title:"Setor prioritario",text:`O ${labels[weakest]} e o setor mais fraco, com forca ${scores[weakest]}. Considere reforcar o setor no mercado ou proteger essa area com a tatica.`});
  else recommendations.push({tone:"green",title:"Elenco equilibrado",text:`O setor mais fraco e o ${labels[weakest]}, ainda com boa forca (${scores[weakest]}). O elenco nao tem uma urgencia evidente.`});
  const xi=new Set(s.tacticalXI);
  POSITIONS.forEach(pos=>{const starter=s.squad.filter(p=>xi.has(p.id)&&p.position===pos).sort((a,b)=>b.rating-a.rating)[0],reserve=s.squad.filter(p=>!xi.has(p.id)&&p.position===pos).sort((a,b)=>b.rating-a.rating)[0];if(starter&&reserve&&reserve.rating>=starter.rating+3) recommendations.push({tone:"gold",title:"Opcao para titular",text:`${reserve.name} tem forca ${reserve.rating}, acima de ${starter.name} (${starter.rating}). Vale testar a troca na posicao ${POSITION_NAMES[pos].toLowerCase()}.`});});
  let formation=tactic.formation,nextTactic={};
  if(weakest==="defense"&&tactic.formation!=="5-3-2"){formation="5-3-2";nextTactic.defensiveLine="Baixa";nextTactic.mentality="Equilibrada";}
  else if(weakest==="midfield"&&tactic.formation!=="3-5-2"){formation="3-5-2";nextTactic.mentality="Equilibrada";nextTactic.tempo="Lento";}
  else if(weakest==="attack"&&tactic.formation!=="3-4-3"){formation="3-4-3";nextTactic.mentality="Ofensiva";nextTactic.tempo="Rapido";}
  const suggestedChanges=Object.assign({formation},nextTactic);
  recommendations.push({tone:formation!==tactic.formation?"blue":"green",title:formation!==tactic.formation?"Sugestao tatica":"Tatica atual",text:formation!==tactic.formation?`Para compensar o ${labels[weakest]}, experimente a formacao ${formation}${nextTactic.mentality?` com mentalidade ${nextTactic.mentality.toLowerCase()}`:""}.`:"A formacao atual ja protege o setor mais fraco. Mantenha o plano e observe o desempenho em campo."});
  const fixture=currentFixture(s);
  if(fixture){const home=fixture.homeId===s.clubId,opponent=getTeam(home?fixture.awayId:fixture.homeId),myTeam=teamObj(s.clubId);recommendations.push({tone:opponent.strength>myTeam.strength?"red":"gold",title:"Proximo adversario",text:`Na rodada ${fixture.round}, o adversario sera ${opponent.name}, forca ${opponent.strength}, ${home?"fora de casa":"em casa"}. ${opponent.strength>myTeam.strength?"Uma abordagem mais cautelosa pode reduzir os riscos.":"Voce chega com vantagem de forca no papel."}`});}
  const targetPos=weakest==="attack"?"ATA":weakest==="midfield"?"MEI":"ZAG",marketTarget=s.market.filter(p=>p.position===targetPos).sort((a,b)=>b.rating-a.rating||a.price-b.price)[0];
  if(marketTarget) recommendations.push({tone:s.finance.balance>=marketTarget.price?"green":"gold",title:"Mercado",text:`O melhor reforco disponivel para o setor indicado e ${marketTarget.name} (${marketTarget.rating}), por ${moneyShort(marketTarget.price)}${s.finance.balance<marketTarget.price?". O saldo atual ainda nao cobre a compra":". A contratacao cabe no saldo atual"}.`});
  const form=recentForm(s,5),wins=form.filter(x=>x==="V").length,losses=form.filter(x=>x==="D").length;
  recommendations.push({tone:losses>wins?"red":"green",title:"Momento recente",text:form.length?`Nos ultimos ${form.length} jogos: ${wins} vitoria(s), ${form.filter(x=>x==="E").length} empate(s) e ${losses} derrota(s).`:"Ainda nao ha jogos suficientes para avaliar a fase."});
  return {scores,weakest,recommendations,suggestedChanges,fixture,form};
}
function applyAssistantSuggestion(s,changes){
  if(!changes)return false;
  if(FORMATIONS[changes.formation]) s.tactic.formation=changes.formation;
  Object.keys(changes).filter(k=>k!=="formation"&&TACTIC_OPTIONS[k]?.values.includes(changes[k])).forEach(k=>s.tactic[k]=changes[k]);
  fixLineup(s);return saveGame(s);
}

/* ---------- 6. temporada, resultados e diretoria ---------- */
function currentFixture(s){
  for(const rd of s.schedule){
    for(const g of rd.games){
      if(!g.played&&(g.homeId===s.clubId||g.awayId===s.clubId)){g.round=rd.round;return g;}
    }
  }
  return null;
}
function recalcStandings(s){
  s.standings=initialStandings(GAME_TEAMS.map(t=>t.id));
  for(const rd of s.schedule) for(const g of rd.games){
    if(!g.played) continue;
    const h=s.standings[g.homeId],a=s.standings[g.awayId],hg=g.homeGoals,ag=g.awayGoals;
    h.p++;a.p++;h.gf+=hg;h.ga+=ag;a.gf+=ag;a.ga+=hg;h.gd=h.gf-h.ga;a.gd=a.gf-a.ga;
    if(hg>ag){h.w++;a.l++;h.pts+=3;}else if(hg<ag){a.w++;h.l++;a.pts+=3;}else{h.d++;a.d++;h.pts++;a.pts++;}
  }
}
function sortedStandings(s){
  recalcStandings(s);
  return Object.values(s.standings).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||teamName(a.teamId).localeCompare(teamName(b.teamId),"pt-BR"));
}
function myPosition(s){return sortedStandings(s).findIndex(x=>x.teamId===s.clubId)+1;}
/* Antes do primeiro jogo todos estão empatados: a posição ainda não significa nada */
function positionText(s){return s.teamStats.played?myPosition(s)+"º":"—";}
function zoneOf(pos){return pos<=4?"z-top":pos<=8?"z-mid":pos>=17?"z-down":"";}
function recentForm(s,n){
  const list=[];
  for(const rd of s.schedule) for(const g of rd.games){
    if(!g.played||(g.homeId!==s.clubId&&g.awayId!==s.clubId)) continue;
    const home=g.homeId===s.clubId, gf=home?g.homeGoals:g.awayGoals, ga=home?g.awayGoals:g.homeGoals;
    list.push(gf>ga?"V":gf===ga?"E":"D");
  }
  return list.slice(-(n||5));
}
function managerLevel(c){return c>=80?"Excelente":c>=65?"Boa":c>=40?"Regular":c>20?"Pressão alta":"Risco de demissão";}

function completeSeasonIfNeeded(s){
  if(s.round<=TOTAL_ROUNDS) return;
  const pos=myPosition(s);
  const st=sortedStandings(s).find(x=>x.teamId===s.clubId);
  s.seasonHistory.unshift({season:s.season,pos,pts:st?st.pts:0,champion:pos===1});
  s.trophies+=pos===1?1:0;
  const prize=pos===1?5000000:500000;
  s.finance.history.unshift({date:today(),type:"Prêmio",description:pos===1?"Título do campeonato":"Bônus de temporada",value:prize});
  s.finance.balance+=prize;s.finance.income+=prize;
  s.season++;s.round=1;
  s.schedule=createSchedule(GAME_TEAMS.map(t=>t.id));
  s.standings=initialStandings(GAME_TEAMS.map(t=>t.id));
  s.squad.forEach(p=>{p.goals=0;p.assists=0;p.cards=0;p.matches=0;});
  Object.values(s.allPlayers).forEach(list=>list.forEach(p=>{p.goals=0;p.assists=0;p.cards=0;}));
  s.teamStats={played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,shots:0,possession:0};
  s.market=buildMarket(s);
  toast(`Nova temporada: ${s.season}!`);
}
function evaluateManager(s,fixture,gf,ga,shotsFor,shotsAgainst,possession){
  const m=s.manager, pos=myPosition(s), rank=s.objectiveRank||8;
  let delta=0,reason="";
  if(gf>ga){delta+=8;m.wins++;reason="Vitória";m.points+=3;}
  else if(gf===ga){delta+=1;m.draws++;reason="Empate";m.points+=1;}
  else{delta-=9;m.losses++;reason="Derrota";}
  if(gf-ga>=3) delta+=3;
  if(ga-gf>=3) delta-=4;
  if(pos<=rank) delta+=2;
  else if(pos>rank+3) delta-=4;
  if(shotsFor>shotsAgainst+5) delta+=2;
  if(possession>=58) delta+=1;
  if(possession<42&&gf===0) delta-=2;
  m.matches++;
  m.confidence=clamp(m.confidence+delta,0,100);
  const level=managerLevel(m.confidence);
  if(m.confidence<40) m.warnings++;
  const record={date:today(),round:fixture.round,opponent:teamName(fixture.homeId===s.clubId?fixture.awayId:fixture.homeId),result:`${gf} x ${ga}`,delta,confidence:m.confidence,reason,level};
  m.history.unshift(record);
  m.history=m.history.slice(0,20);
  if(m.confidence<=20){
    m.status="dismissed";
    s.dismissal={date:record.date,round:fixture.round,reason:"A diretoria perdeu a confiança no trabalho do treinador após uma sequência de resultados abaixo das expectativas.",confidence:m.confidence};
  }else if(m.confidence<40) m.status="warning";
  else m.status="active";
}
function registerResult(s,fixture,hg,ag){
  fixture.played=true;fixture.homeGoals=hg;fixture.awayGoals=ag;
  recalcStandings(s);
  if(fixture.homeId===s.clubId||fixture.awayId===s.clubId){
    const gf=fixture.homeId===s.clubId?hg:ag, ga=fixture.homeId===s.clubId?ag:hg;
    s.teamStats.played++;s.teamStats.goalsFor+=gf;s.teamStats.goalsAgainst+=ga;
    if(gf>ga)s.teamStats.wins++;else if(gf===ga)s.teamStats.draws++;else s.teamStats.losses++;
  }
  saveGame(s);
}
/* Bilheteria: só o clube mandante recebe */
function payMatch(s,homeId,attendance){
  if(homeId!==s.clubId) return 0;
  const income=Math.round(attendance*35);
  s.finance.balance+=income;s.finance.income+=income;
  s.finance.history.unshift({date:today(),type:"Receita",description:`Bilheteria - ${teamName(homeId)}`,value:income});
  return income;
}
function weeklyWages(s){return Math.round(s.squad.reduce((sum,p)=>sum+p.price*.004,0));}
/* Credita um gol (e talvez uma assistência) a um jogador da lista; devolve quem marcou */
function creditGoal(list){
  const scorer=pickWeighted(list,SCORER_WEIGHT);
  if(!scorer) return null;
  scorer.goals++;
  if(Math.random()<.7){const a=pickWeighted(list,ASSIST_WEIGHT,scorer.id);if(a)a.assists++;}
  return scorer;
}
/* Distribui gols e assistências de um clube controlado pela máquina */
function creditGoals(s,teamId,goals){
  const list=s.allPlayers[teamId]||[];
  for(let i=0;i<goals;i++) creditGoal(list);
}
/* Escalação em campo de um clube: a do usuário (titulares reais) ou a de um clube da IA */
function eventRoster(s,teamId){
  if(teamId!==s.clubId) return s.allPlayers[teamId]||[];
  const xi=(s.tacticalXI||[]).map(id=>s.squad.find(p=>p.id===id)).filter(Boolean);
  return xi.length?xi:s.squad;
}
/* Os outros clubes jogam a rodada; o jogo do usuário fica para a tela de Partida */
function simulateOtherMatches(s){
  const rd=s.schedule.find(x=>x.round===s.round);
  if(!rd) return;
  for(const g of rd.games){
    if(g.played||g.homeId===s.clubId||g.awayId===s.clubId) continue;
    const home=getTeam(g.homeId),away=getTeam(g.awayId),diff=(home.strength+3)-away.strength;
    const hg=poisson(clamp(1.35+diff*.035,.35,3.2)), ag=poisson(clamp(1.1-diff*.035,.3,3));
    g.played=true;g.homeGoals=hg;g.awayGoals=ag;g.events=[];
    creditGoals(s,g.homeId,hg);creditGoals(s,g.awayId,ag);
  }
  recalcStandings(s);
}
function advanceRound(s){
  simulateOtherMatches(s);
  s.round++;
  const wages=weeklyWages(s);
  s.finance.balance-=wages;s.finance.expenses+=wages;
  s.finance.history.unshift({date:today(),type:"Despesa",description:"Folha salarial",value:wages});
  completeSeasonIfNeeded(s);
  saveGame(s);
}
function globalScorers(s){
  return s.squad.map(p=>({...p,teamId:s.clubId})).concat(
    GAME_TEAMS.filter(t=>t.id!==s.clubId).flatMap(t=>(s.allPlayers[t.id]||[]).map(p=>({...p,teamId:t.id})))
  );
}
function sellValue(p){return Math.round(p.price*.85);}
function canSell(s,p){
  if(s.squad.length<=SQUAD_MIN) return `O elenco precisa ter pelo menos ${SQUAD_MIN} jogadores.`;
  if(p.position==="GOL"&&s.squad.filter(x=>x.position==="GOL").length<=1) return "Você precisa manter pelo menos um goleiro.";
  return "";
}

/* ---------- 7. estrutura da página ---------- */
const NAV_GROUPS=[
  {label:"Clube",items:[["menu","home","Menu"],["clube","shield","Clube"],["elenco","users","Elenco"],["mercado","swap","Mercado"]]},
  {label:"Jogo",items:[["assistente","wand","Assistente"],["tactica","target","Tática"],["partida","play","Partida"],["jogos","calendar","Jogos"]]},
  {label:"Competição",items:[["campeonato","trophy","Campeonato"],["classificacao","table","Classificação"],["artilharia","star","Artilharia"],["estatisticas","chart","Estatísticas"]]},
  {label:"Gestão",items:[["financas","wallet","Finanças"],["diretoria","building","Diretoria"],["configuracoes","gear","Configurações"]]}
];
function refreshTopbar(s){
  const el=document.getElementById("topMoney");
  if(el) el.textContent=money(s.finance.balance);
}
function renderShell(title){
  const s=loadGame();
  if(!s){location.href="index.html";return null;}
  const current=document.body.dataset.page||"menu";
  if(s.manager?.status==="dismissed"&&current!=="diretoria"&&current!=="configuracoes"){location.href="diretoria.html";return null;}
  document.title="BRASFOOTBALL - "+(title||"Menu");
  const team=getTeam(s.clubId);
  const conf=s.manager.confidence;
  const seasonPct=Math.round((clamp(s.round-1,0,TOTAL_ROUNDS)/TOTAL_ROUNDS)*100);
  document.getElementById("app").innerHTML=`
    <a class="skip" href="#pageContent">Ir para o conteúdo</a>
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" href="menu.html" aria-label="BRASFOOTBALL - início"><span class="brand-ball">${icon("ball",24)}</span><span class="brand-name">BRAS<b>FOOTBALL</b></span></a>
        <nav class="nav" aria-label="Navegação principal">
          ${NAV_GROUPS.map(g=>`<div class="nav-group"><span class="nav-label">${g.label}</span>${g.items.map(([page,ic,label])=>`<a href="${page}.html" class="${current===page?"active":""}" ${current===page?'aria-current="page"':""}>${icon(ic)}<span>${label}</span></a>`).join("")}</div>`).join("")}
        </nav>
        <div class="coach">
          <span class="coach-avatar">${esc(initials(s.managerName))}</span>
          <div class="coach-info"><b>${esc(s.managerName||"Treinador")}</b><span>Confiança da diretoria ${conf}%</span><div class="meter"><i style="width:${conf}%"></i></div></div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="tb-club">${crest(team,38)}<div><b>${esc(team.name)}</b><span>Temporada ${s.season}</span></div></div>
          <div class="tb-season" title="Andamento da temporada"><span>Rodada ${Math.min(s.round,TOTAL_ROUNDS)} de ${TOTAL_ROUNDS}</span><div class="meter"><i style="width:${seasonPct}%"></i></div></div>
          <div class="tb-right"><div class="balance" title="Saldo do clube">${icon("wallet",16)}<span id="topMoney">${money(s.finance.balance)}</span></div>${current!=="partida"?`<a class="btn primary sm" href="partida.html">${icon("play",16)}Jogar rodada</a>`:""}</div>
        </header>
        <div id="pageContent"></div>
      </main>
    </div>`;
  applySettings(s);
  return s;
}
