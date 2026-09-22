document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Assistente do Tecnico");if(!s)return;
  const c=document.getElementById("pageContent"),analysis=analyzeAssistant(s),labels={attack:"Ataque",midfield:"Meio-campo",defense:"Defesa"};
  const changes=analysis.suggestedChanges;
  const hasChange=Object.keys(changes).some(k=>changes[k]!==s.tactic[k]);
  c.innerHTML=`${pageHead("Assistente do técnico","Análises baseadas nos dados atuais do clube. A decisão final continua sendo sua.",`<a class="btn secondary" href="tactica.html">${icon("target",18)}Abrir tática</a>`)}
    <div class="strip assistant-scores">${Object.keys(analysis.scores).map(key=>`<div class="stat"><small>${labels[key]}</small><strong>${analysis.scores[key]}</strong><span class="hint">Força média dos titulares</span></div>`).join("")}</div>
    <section class="panel mt assistant-intro"><div><span class="badge gold">Relatório da rodada</span><h2>O que merece sua atenção</h2><p class="muted">O assistente cruza elenco, escalação, tática, mercado, fase recente e próximo adversário.</p></div><div class="assistant-disclaimer">Recomendação não é ordem. Você decide o que aplicar.</div></section>
    <div class="assistant-grid mt">${analysis.recommendations.map(item=>`<article class="panel assistant-card ${item.tone}"><span class="badge ${item.tone}">${item.title}</span><p>${item.text}</p></article>`).join("")}</div>
    <section class="panel mt"><div class="panel-head"><div><h2>Plano sugerido</h2><p class="muted">Uma opção pronta para testar na tela de tática.</p></div><button id="applySuggestion" class="btn primary" ${hasChange?"":"disabled"}>${icon("check",18)}Aplicar sugestão</button></div>
      <div class="detail-list assistant-plan"><div class="detail"><small>Formação</small><b>${changes.formation}</b></div>${Object.keys(changes).filter(k=>k!=="formation").map(k=>`<div class="detail"><small>${TACTIC_OPTIONS[k].label}</small><b>${changes[k]}</b></div>`).join("")}</div>
    </section>`;
  document.getElementById("applySuggestion").onclick=()=>{if(applyAssistantSuggestion(s,changes)){toast("Sugestão aplicada e salva. Revise a escalação antes de jogar.");document.getElementById("applySuggestion").disabled=true;}};
});
