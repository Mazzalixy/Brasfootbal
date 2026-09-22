document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Clube");if(!s)return;
  const t=getTeam(s.clubId),st=s.teamStats,c=document.getElementById("pageContent");
  const table=sortedStandings(s),me=table.find(x=>x.teamId===s.clubId);
  c.innerHTML=`${pageHead("Meu clube","Estrutura, desempenho e história.")}
    <section class="board" style="padding:28px">
      <div style="display:flex;align-items:center;gap:26px;flex-wrap:wrap">
        ${crest(t,110)}
        <div><h2 style="font:800 clamp(38px,6vw,60px)/.95 var(--display);text-transform:uppercase;letter-spacing:.02em">${esc(t.name)}</h2>
        <p class="muted" style="margin:8px 0 0">${esc(t.city)}. Força geral do elenco: <b style="color:var(--text)">${t.strength}</b>, força do time titular: <b style="color:var(--text)">${Math.round(lineupStrength(s))}</b>.</p></div>
      </div>
    </section>
    <div class="grid-2 mt">
      <section class="panel"><div class="panel-head"><h2>Estrutura</h2></div><div class="detail-list">
        <div class="detail"><small>Estádio</small><b>${esc(t.stadium)}</b></div>
        <div class="detail"><small>Capacidade</small><b>${t.capacity.toLocaleString("pt-BR")} lugares</b></div>
        <div class="detail"><small>Torcida associada</small><b>${Math.round(t.capacity*.78).toLocaleString("pt-BR")}</b></div>
        <div class="detail"><small>Títulos</small><b>${s.trophies}</b></div>
      </div></section>
      <section class="panel"><div class="panel-head"><h2>Temporada ${s.season}</h2></div><div class="detail-list">
        <div class="detail"><small>Posição</small><b>${positionText(s)}</b></div>
        <div class="detail"><small>Pontos</small><b>${me.pts}</b></div>
        <div class="detail"><small>Jogos</small><b>${st.played}</b></div>
        <div class="detail"><small>Campanha</small><b>${st.wins}V ${st.draws}E ${st.losses}D</b></div>
        <div class="detail"><small>Gols marcados</small><b>${st.goalsFor}</b></div>
        <div class="detail"><small>Gols sofridos</small><b>${st.goalsAgainst}</b></div>
      </div></section>
    </div>
    <section class="panel mt"><div class="panel-head"><h2>Histórico de temporadas</h2></div>
      ${s.seasonHistory.length?`<div class="table-wrap"><table><thead><tr><th>Temporada</th><th class="num">Posição final</th><th class="num">Pontos</th><th></th></tr></thead><tbody>${s.seasonHistory.map(h=>`<tr><td>${h.season}</td><td class="num">${h.pos}º</td><td class="num">${h.pts}</td><td>${h.champion?'<span class="badge gold">Campeão</span>':""}</td></tr>`).join("")}</tbody></table></div>`
      :`<div class="empty"><b>Nenhuma temporada concluída</b>Os resultados finais de cada campeonato ficam registrados aqui.</div>`}
    </section>`;
});
