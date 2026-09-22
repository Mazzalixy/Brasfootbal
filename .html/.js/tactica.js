document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Tática");if(!s)return;
  const c=document.getElementById("pageContent"),t=s.tactic;
  const ids=Object.keys(TACTIC_OPTIONS);

  c.innerHTML=`${pageHead("Tática e formação","Monte a escalação e defina o estilo de jogo do seu clube.",
      `<button id="assistantBtn" class="btn secondary">${icon("wand",18)}Pedir ao Assistente</button><button id="autoBtn" class="btn secondary">${icon("wand",18)}Escalação automática</button><button id="saveTactic" class="btn primary">${icon("check",18)}Salvar tática</button>`)}
    <div class="tactic-layout">
      <section class="panel">
        <div class="panel-head"><h2>Campo</h2><span id="formationName" class="badge gold">${t.formation}</span></div>
        <div class="tactic-board"><div class="field-line"></div><div class="penalty top"></div><div class="penalty bottom"></div><div id="playersBoard" class="players-board"></div></div>
        <div class="formation-grid mt">${Object.keys(FORMATIONS).map(f=>`<button class="tab ${t.formation===f?"active":""}" data-formation="${f}">${f}</button>`).join("")}</div>
      </section>
      <div class="stack">
        <section class="panel"><h2>Estilo de jogo</h2><p class="muted small" style="margin:2px 0 14px">Essas escolhas influenciam a simulação das partidas.</p>
          <div class="grid-2" style="gap:12px">
            ${ids.map(id=>`<div class="field"><label for="${id}">${TACTIC_OPTIONS[id].label}</label><select id="${id}" class="select">${TACTIC_OPTIONS[id].values.map(v=>`<option>${v}</option>`).join("")}</select></div>`).join("")}
          </div>
          <div class="scores-4 mt">
            <div class="stat" style="padding:12px"><small>Ataque</small><strong id="attackScore" style="font-size:24px">-</strong></div>
            <div class="stat" style="padding:12px"><small>Defesa</small><strong id="defenseScore" style="font-size:24px">-</strong></div>
            <div class="stat" style="padding:12px"><small>Posse</small><strong id="possScore" style="font-size:24px">-</strong></div>
            <div class="stat" style="padding:12px"><small>Risco</small><strong id="riskScore" style="font-size:24px">-</strong></div>
          </div>
        </section>
        <section class="panel"><h2>Dica do treinador</h2><p id="tip" class="muted" style="margin:0"></p></section>
        <section class="panel"><div class="panel-head"><h2>Titulares</h2><span class="muted small" id="strengthTag"></span></div><div class="starter-list" id="starterList"></div></section>
      </div>
    </div>
    <section id="assistantPanel" class="panel mt hidden"></section>`;

  function renderBoard(){
    const board=document.getElementById("playersBoard");
    board.innerHTML=lineupPlayers(s).map(x=>`<div class="tactic-player" style="left:${x.x}%;top:${x.y}%">
      <div class="token ${x.out?"out":""}">${x.player?esc(x.player.position):x.slot}</div><small>${x.player?esc(surname(x.player.name)):"Vaga livre"}</small></div>`).join("");
    document.getElementById("strengthTag").textContent="Força do time titular: "+Math.round(lineupStrength(s));
  }
  function renderStarters(){
    const box=document.getElementById("starterList");
    const spots=FORMATIONS[t.formation];
    box.innerHTML=spots.map((sp,i)=>{
      const valid=s.squad.filter(p=>p.position===sp[0]);
      const options=valid.length?valid:s.squad;
      const selected=s.tacticalXI[i];
      return `<div class="starter-row"><span class="pos-chip pos-${sp[0]}">${sp[0]}</span>
        <select data-starter="${i}">${options.sort((a,b)=>b.rating-a.rating).map(p=>`<option value="${esc(p.id)}" ${selected===p.id?"selected":""}>${esc(p.name)} — Força ${p.rating}${p.position!==sp[0]?" (fora de posição)":""}</option>`).join("")}</select></div>`;
    }).join("");
    box.querySelectorAll("[data-starter]").forEach(sel=>sel.onchange=()=>{
      const index=Number(sel.dataset.starter),newId=sel.value,oldId=s.tacticalXI[index];
      if(s.tacticalXI.includes(newId)&&newId!==oldId){
        const swapIdx=s.tacticalXI.indexOf(newId);
        s.tacticalXI[swapIdx]=oldId;
      }
      s.tacticalXI[index]=newId;
      saveGame(s);renderBoard();renderStarters();toast("Escalação atualizada.");
    });
  }
  function refresh(){
    const fx=tacticEffects(Object.assign({},t,{formation:t.formation}));
    document.getElementById("attackScore").textContent=(fx.attack>=0?"+":"")+fx.attack;
    document.getElementById("defenseScore").textContent=(fx.defense>=0?"+":"")+fx.defense;
    document.getElementById("possScore").textContent=(fx.possession>=0?"+":"")+fx.possession;
    document.getElementById("riskScore").textContent=fx.risk+"%";
    document.getElementById("tip").textContent = t.mentality==="Ofensiva"
      ? "A equipe empurra mais jogadores para o ataque, mas deixa espaços na saída de bola adversária."
      : t.mentality==="Defensiva"
      ? "A equipe prioriza a marcação e busca sair em contra-ataques rápidos."
      : "A equipe mantém equilíbrio entre posse de bola, defesa e ataque.";
  }
  ids.forEach(id=>document.getElementById(id).value=t[id]);
  document.querySelectorAll("[data-formation]").forEach(b=>b.onclick=()=>{
    document.querySelectorAll("[data-formation]").forEach(x=>x.classList.toggle("active",x===b));
    t.formation=b.dataset.formation;document.getElementById("formationName").textContent=t.formation;
    fixLineup(s);renderBoard();renderStarters();
  });
  ids.forEach(id=>document.getElementById(id).onchange=()=>{t[id]=document.getElementById(id).value;refresh();});
  document.getElementById("autoBtn").onclick=()=>{autoLineup(s);saveGame(s);renderBoard();renderStarters();toast("Escalação automática aplicada.");};
  document.getElementById("saveTactic").onclick=()=>{saveGame(s);toast("Tática salva com sucesso.");};
  document.getElementById("assistantBtn").onclick=()=>{
    const result=analyzeAssistant(s,t),labels={attack:"Ataque",midfield:"Meio-campo",defense:"Defesa"},panel=document.getElementById("assistantPanel");
    panel.classList.remove("hidden");
    panel.innerHTML=`<div class="panel-head"><div><h2>Análise do Assistente</h2><p class="muted">Setor mais fraco: <b>${labels[result.weakest]}</b> (${result.scores[result.weakest]}).</p></div><button id="applyTacticSuggestion" class="btn primary">${icon("check",18)}Aplicar sugestão</button></div><div class="assistant-grid">${result.recommendations.slice(0,4).map(item=>`<article class="assistant-card ${item.tone}"><span class="badge ${item.tone}">${item.title}</span><p>${item.text}</p></article>`).join("")}</div>`;
    document.getElementById("applyTacticSuggestion").onclick=()=>{applyAssistantSuggestion(s,result.suggestedChanges);t.formation=s.tactic.formation;ids.forEach(id=>document.getElementById(id).value=s.tactic[id]);document.getElementById("formationName").textContent=t.formation;document.querySelectorAll("[data-formation]").forEach(b=>b.classList.toggle("active",b.dataset.formation===t.formation));renderBoard();renderStarters();refresh();toast("Sugestão aplicada e salva. Revise a escalação antes de jogar.");};
  };
  renderBoard();renderStarters();refresh();
});
