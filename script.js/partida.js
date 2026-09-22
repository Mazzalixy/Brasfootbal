let simTimer=null;
document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Partida");if(!s)return;
  const c=document.getElementById("pageContent"),f=currentFixture(s);
  if(!f){c.innerHTML=`${pageHead("Partida","Não há jogo pendente.")}<div class="empty"><b>Temporada encerrada</b>Aguarde a próxima temporada começar.</div>`;return;}
  const home=getTeam(f.homeId),away=getTeam(f.awayId),isUserHome=f.homeId===s.clubId;
  c.innerHTML=`${pageHead("Partida ao vivo",`Rodada ${f.round} do Campeonato Nacional.`)}
    <section class="board">
      <div class="board-top"><span>${esc(home.stadium)}</span><span id="attendanceTag">Portões abertos</span></div>
      <div class="board-main">
        <div class="board-team">${crest(home,84)}<h2>${esc(home.name)}</h2><small>${isUserHome?"Mandante — seu time":"Mandante"}</small></div>
        <div class="board-mid"><div class="board-score" id="score">0 — 0</div><div class="board-clock" id="minute">PRÉ-JOGO</div></div>
        <div class="board-team">${crest(away,84)}<h2>${esc(away.name)}</h2><small>${!isUserHome?"Visitante — seu time":"Visitante"}</small></div>
      </div>
      <div class="meter thick" style="margin-bottom:18px"><i id="progress" style="width:0%"></i></div>
      <div class="board-foot"><button id="start" class="btn primary">${icon("play",18)}Iniciar simulação</button></div>
    </section>
    <div class="cols-73 mt">
      <section class="panel"><h2>Ao vivo</h2><div id="events" class="stack" style="margin-top:12px;max-height:360px;overflow:auto"><div class="note">O juiz apita e a partida vai começar.</div></div></section>
      <section class="panel"><h2>Estatísticas</h2><div class="strip mt" id="stats" style="grid-template-columns:1fr"></div></section>
    </div>
    <div id="resultBox"></div>`;
  document.getElementById("start").onclick=()=>simulate(s,f,home,away,isUserHome);
});

function statRow(label,a,b,unit){
  const total=a+b||1;
  return `<div class="stat" style="padding:12px 16px">
    <div style="display:flex;justify-content:space-between;font-weight:700"><span>${a}${unit||""}</span><span>${b}${unit||""}</span></div>
    <div class="meter thick" style="margin-top:8px;background:#241c0d"><i style="width:${a/total*100}%"></i></div>
    <small class="muted" style="display:block;margin-top:6px">${label}</small></div>`;
}

function simulate(s,f,home,away,isUserHome){
  const btn=document.getElementById("start");btn.disabled=true;btn.textContent="Simulando…";
  playSound("whistle");
  let min=0,hg=0,ag=0,shotsH=0,shotsA=0,events=[];
  const userStrength=lineupStrength(s);
  const homeStrength=isUserHome?userStrength:home.strength;
  const awayStrength=!isUserHome?userStrength:away.strength;
  const fx=tacticEffects(s.tactic);
  const homeAttack=homeStrength+3+(isUserHome?fx.attack:0);
  const homeDefense=homeStrength+(isUserHome?fx.defense:0);
  const awayAttack=awayStrength+(!isUserHome?fx.attack:0);
  const awayDefense=awayStrength+(!isUserHome?fx.defense:0);
  const homeShotRate=clamp(.15+(homeAttack-awayDefense)*.0022,.07,.30);
  const awayShotRate=clamp(.15+(awayAttack-homeDefense)*.0022,.07,.30);
  const homeConv=clamp(.24+(homeAttack-awayDefense)*.0035,.08,.55);
  const awayConv=clamp(.24+(awayAttack-homeDefense)*.0035,.08,.55);
  let posH=Math.round(clamp(50+(homeStrength-awayStrength)*.65+(isUserHome?fx.possession:-fx.possession),30,70));
  const homeRoster=eventRoster(s,f.homeId),awayRoster=eventRoster(s,f.awayId);

  const scoreEl=document.getElementById("score"),minEl=document.getElementById("minute"),progEl=document.getElementById("progress"),evEl=document.getElementById("events"),statsEl=document.getElementById("stats");

  function addEvent(text,cls){
    events.push({min,text,cls});
    evEl.innerHTML=events.slice().reverse().map(e=>`<div class="note ${e.cls||""}"><b style="color:var(--gold)">${e.min}'</b> ${e.text}</div>`).join("");
    evEl.scrollTop=0;
  }
  function drawStats(){
    statsEl.innerHTML=statRow("Finalizações",shotsH,shotsA)+statRow("Posse de bola",posH,100-posH,"%");
  }
  drawStats();

  simTimer=setInterval(()=>{
    min++;
    minEl.textContent=min>=90?"90+'":min+"'";
    progEl.style.width=Math.min(100,min/90*100)+"%";
    let hadAction=false;
    if(Math.random()<homeShotRate){
      shotsH++;
      hadAction=true;
      if(Math.random()<.45) addEvent(`📣 ${esc(home.name)} chega ao ataque e finaliza.`,"shot");
      if(Math.random()<homeConv){
        hg++;playSound("goal");
        const scorer=creditGoal(homeRoster);
        addEvent(`⚽ GOL do ${esc(home.name)}!${scorer?" "+esc(scorer.name)+" balança as redes.":""}`,"goal");
      }
    }
    if(Math.random()<awayShotRate){
      shotsA++;
      hadAction=true;
      if(Math.random()<.45) addEvent(`📣 ${esc(away.name)} responde e leva perigo ao gol adversário.`,"shot");
      if(Math.random()<awayConv){
        ag++;playSound("goal");
        const scorer=creditGoal(awayRoster);
        addEvent(`⚽ GOL do ${esc(away.name)}!${scorer?" "+esc(scorer.name)+" balança as redes.":""}`,"goal");
      }
    }
    if(Math.random()<.05){hadAction=true;playSound("card");addEvent(`🟨 Cartão amarelo para o ${Math.random()<.5?esc(home.name):esc(away.name)}.`);}
    else if(Math.random()<.04){hadAction=true;addEvent(`🔄 Substituição no ${Math.random()<.5?esc(home.name):esc(away.name)}.`);}
    if(!hadAction&&Math.random()<.7){
      const leading=posH>=55?home.name:posH<=45?away.name:null;
      const commentary=leading
        ? `${esc(leading)} troca passes e controla o ritmo da partida.`
        : "As duas equipes disputam o meio-campo em um jogo equilibrado.";
      addEvent(commentary,"commentary");
    }
    scoreEl.textContent=`${hg} — ${ag}`;
    drawStats();
    if(min>=90){clearInterval(simTimer);finishMatch(s,f,home,away,isUserHome,hg,ag,shotsH,shotsA,posH,events);}
  },300);
}

function finishMatch(s,f,home,away,isUserHome,hg,ag,shotsH,shotsA,posH,events){
  f.events=events.map(e=>({min:e.min,text:e.text}));
  registerResult(s,f,hg,ag);
  const gf=isUserHome?hg:ag, ga=isUserHome?ag:hg;
  const userShots=isUserHome?shotsH:shotsA, oppShots=isUserHome?shotsA:shotsH, userPoss=isUserHome?posH:100-posH;
  const attendance=Math.round(home.capacity*(.55+Math.random()*.35));
  const income=payMatch(s,f.homeId,attendance);
  document.getElementById("attendanceTag").textContent=`Público: ${attendance.toLocaleString("pt-BR")}`;
  s.teamStats.shots+=userShots;s.teamStats.possession+=userPoss;
  evaluateManager(s,f,gf,ga,userShots,oppShots,userPoss);
  const xi=(s.tacticalXI||[]).map(id=>s.squad.find(p=>p.id===id)).filter(p=>p&&p.morale>=50);
  xi.forEach(p=>p.matches++);
  s.lastMatch={date:today(),round:f.round,homeId:f.homeId,awayId:f.awayId,homeGoals:hg,awayGoals:ag,shotsHome:shotsH,shotsAway:shotsA,possessionHome:posH,attendance,managerConfidence:s.manager.confidence,managerDelta:s.manager.history[0]?.delta||0};
  advanceRound(s);
  saveGame(s);refreshTopbar(s);

  const delta=s.manager.history[0]?.delta||0;
  const verdict=gf>ga?"Vitória":gf===ga?"Empate":"Derrota";
  const box=document.getElementById("resultBox");
  box.innerHTML=`<section class="panel mt match-summary">
    <div class="panel-head"><div><p class="muted" style="margin:0 0 4px">Resultado final</p><h2>${esc(home.name)} ${hg} × ${ag} ${esc(away.name)}</h2></div><span class="badge ${delta>=0?"green":"red"}">${verdict}</span></div>
    <div class="strip mt">
      <div class="stat"><small>Finalizações</small><strong>${shotsH} × ${shotsA}</strong></div>
      <div class="stat"><small>Posse</small><strong>${posH}% × ${100-posH}%</strong></div>
      <div class="stat"><small>Público</small><strong>${attendance.toLocaleString("pt-BR")}</strong></div>
      <div class="stat"><small>Renda de bilheteria</small><strong>${income?moneyShort(income):"—"}</strong></div>
    </div>
    <div class="note mt"><b>Avaliação da diretoria:</b> <span class="${delta>=0?"positive":"negative"}">${delta>=0?"+":""}${delta} de confiança</span>. Nível ${s.manager.history[0]?.level||"Regular"}, agora em ${s.manager.confidence}%.</div>
    <a class="btn secondary mt" href="diretoria.html">${icon("building",18)}Ver avaliação completa</a>
  </section>`;
  const btn=document.getElementById("start");
  if(s.manager.status==="dismissed"){
    btn.innerHTML=`${icon("building",18)}Ver decisão da diretoria`;btn.disabled=false;
    btn.onclick=()=>location.href="diretoria.html";
  }else{
    btn.innerHTML=`${icon("play",18)}Próxima partida`;btn.disabled=false;
    btn.onclick=()=>location.reload();
  }
}
