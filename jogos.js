document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Jogos");if(!s)return;
  const c=document.getElementById("pageContent");
  const games=[];for(const rd of s.schedule)for(const g of rd.games)if(g.homeId===s.clubId||g.awayId===s.clubId)games.push({...g,round:rd.round});
  const upcoming=games.filter(g=>!g.played).slice(0,8),played=games.filter(g=>g.played).slice(-8).reverse();
  const row=(g,isUpcoming)=>{
    const home=g.homeId===s.clubId;
    const opp=getTeam(home?g.awayId:g.homeId);
    if(isUpcoming) return `<div class="detail" style="display:flex;align-items:center;justify-content:space-between;gap:12px"><span class="muted small">R${g.round} • ${home?"Casa":"Fora"}</span><div class="team-cell">${crest(opp,26)}<b>${esc(opp.name)}</b></div></div>`;
    const gf=home?g.homeGoals:g.awayGoals, ga=home?g.awayGoals:g.homeGoals;
    const cls=gf>ga?"positive":gf===ga?"":"negative";
    return `<div class="detail" style="display:flex;align-items:center;justify-content:space-between;gap:12px"><span class="muted small">R${g.round} • ${home?"Casa":"Fora"}</span><div class="team-cell">${crest(opp,26)}<b>${esc(opp.name)}</b></div><b class="${cls}">${g.homeGoals} × ${g.awayGoals}</b></div>`;
  };
  c.innerHTML=`${pageHead("Jogos","Calendário de rodadas do seu clube.",`<a class="btn primary" href="partida.html">${icon("play",18)}Simular próxima</a>`)}
    <div class="grid-2">
      <section class="panel"><h2>Próximos jogos</h2><div class="detail-list" style="grid-template-columns:1fr;margin-top:12px">${upcoming.map(g=>row(g,true)).join("")||`<div class="empty"><b>Nenhum jogo pendente</b>Você já concluiu a temporada.</div>`}</div></section>
      <section class="panel"><h2>Últimos resultados</h2><div class="detail-list" style="grid-template-columns:1fr;margin-top:12px">${played.map(g=>row(g,false)).join("")||`<div class="empty"><b>Ainda não há resultados</b>Jogue sua primeira partida para ver o histórico.</div>`}</div></section>
    </div>`;
});
