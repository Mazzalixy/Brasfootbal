document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Estatísticas");if(!s)return;
  const c=document.getElementById("pageContent"),st=s.teamStats;
  const avgGoals=st.played?(st.goalsFor/st.played).toFixed(2):"0,00";
  const avgConceded=st.played?(st.goalsAgainst/st.played).toFixed(2):"0,00";
  const avgPoss=st.played?Math.round(st.possession/st.played):0;
  const avgShots=st.played?(st.shots/st.played).toFixed(1):"0,0";
  const top=[...s.squad].sort((a,b)=>b.goals-a.goals||b.assists-a.assists).slice(0,5);
  c.innerHTML=`${pageHead("Estatísticas","Desempenho do seu clube ao longo da temporada.")}
    <div class="strip">
      <div class="stat"><small>Jogos</small><strong>${st.played}</strong></div>
      <div class="stat"><small>Vitórias</small><strong>${st.wins}</strong></div>
      <div class="stat"><small>Gols marcados</small><strong>${st.goalsFor}</strong></div>
      <div class="stat"><small>Gols sofridos</small><strong>${st.goalsAgainst}</strong></div>
    </div>
    <div class="grid-2 mt">
      <section class="panel"><h2>Indicadores por jogo</h2>
        <div class="stack mt">
          <div><div style="display:flex;justify-content:space-between"><span class="muted">Posse média</span><b>${avgPoss}%</b></div><div class="meter thick" style="margin-top:6px"><i style="width:${avgPoss}%"></i></div></div>
          <div><div style="display:flex;justify-content:space-between"><span class="muted">Finalizações por jogo</span><b>${avgShots}</b></div><div class="meter thick" style="margin-top:6px"><i style="width:${clamp(Number(avgShots)*7,4,100)}%"></i></div></div>
          <div><div style="display:flex;justify-content:space-between"><span class="muted">Gols marcados por jogo</span><b>${avgGoals}</b></div><div class="meter thick" style="margin-top:6px"><i style="width:${clamp(Number(avgGoals.replace(",","."))*33,4,100)}%"></i></div></div>
          <div><div style="display:flex;justify-content:space-between"><span class="muted">Gols sofridos por jogo</span><b>${avgConceded}</b></div><div class="meter thick" style="margin-top:6px"><i style="width:${clamp(Number(avgConceded.replace(",","."))*33,4,100)}%;background:var(--red)"></i></div></div>
        </div>
      </section>
      <section class="panel"><h2>Melhores do elenco</h2><div class="stack mt">
        ${top.some(p=>p.goals>0)?top.map((p,i)=>`<div class="detail" style="display:flex;align-items:center;gap:10px"><span class="rank" style="width:20px">${i+1}</span>${avatar(p)}<div style="flex:1;min-width:0"><b style="display:block">${esc(p.name)}</b><span class="muted small">${esc(POSITION_NAMES[p.position])}</span></div><b>${p.goals} gol(s)</b></div>`).join(""):`<div class="empty"><b>Sem destaques ainda</b>Jogue algumas rodadas para ver os artilheiros do elenco.</div>`}
      </div></section>
    </div>`;
});
