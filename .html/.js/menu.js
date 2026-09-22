document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Menu");if(!s)return;
  const c=document.getElementById("pageContent"),f=currentFixture(s);
  const table=sortedStandings(s),pos=table.findIndex(x=>x.teamId===s.clubId)+1,me=table[pos-1];
  const played=s.teamStats.played,rank=s.objectiveRank||8;
  const progress=played?clamp(Math.round((21-pos)/(21-rank)*100),4,100):0;
  const conf=s.manager.confidence;
  const first=esc((s.managerName||"Treinador").split(" ")[0]);
  const gd=me.gd>0?"+"+me.gd:String(me.gd);
  const use=played?Math.round(me.pts/(played*3)*100):0;

  // janela de 7 linhas da tabela ao redor do clube
  const start=clamp(pos-4,0,table.length-7);
  const windowRows=table.slice(start,start+7);

  let board="";
  if(f){
    const H=getTeam(f.homeId),A=getTeam(f.awayId),home=f.homeId===s.clubId;
    board=`<section class="board">
      <div class="board-top"><span>Rodada ${f.round} do Campeonato Nacional</span><span>${home?"Você joga em casa":"Você joga fora de casa"}, ${esc(H.stadium)}</span></div>
      <div class="board-main">
        <div class="board-team">${crest(H,88)}<h2>${esc(H.name)}</h2><small>Força ${H.strength}</small></div>
        <div class="board-mid"><div class="board-vs">VS</div></div>
        <div class="board-team">${crest(A,88)}<h2>${esc(A.name)}</h2><small>Força ${A.strength}</small></div>
      </div>
      <div class="board-foot"><a class="btn primary" href="partida.html">${icon("play",18)}Ir para a partida</a><a class="btn secondary" href="tactica.html">${icon("target",18)}Ajustar tática</a></div>
    </section>`;
  }else board=`<section class="panel"><div class="empty"><b>Sem jogos pendentes</b>A temporada terminou.</div></section>`;

  c.innerHTML=`${pageHead("Olá, "+first,`Rodada ${Math.min(s.round,TOTAL_ROUNDS)} de ${TOTAL_ROUNDS}. Veja como está o clube antes de entrar em campo.`)}
    ${board}
    <div class="strip mt">
      <div class="stat"><small>Posição</small><strong>${positionText(s)}</strong><span class="hint">${played?`de ${table.length} clubes`:"Antes do 1º jogo"}</span></div>
      <div class="stat"><small>Pontos</small><strong>${me.pts}</strong><span class="hint">${played?use+"% de aproveitamento":"Nenhum ponto ainda"}</span></div>
      <div class="stat"><small>Saldo de gols</small><strong>${gd}</strong><span class="hint">${me.gf} marcados, ${me.ga} sofridos</span></div>
      <div class="stat"><small>Últimos jogos</small><div style="margin-top:9px">${formDots(recentForm(s,5))}</div></div>
    </div>
    <div class="grid-2 mt">
      <section class="panel">
        <div class="panel-head"><h2>Tabela</h2><a class="btn ghost sm" href="classificacao.html">Ver completa</a></div>
        <div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Clube</th><th class="num">J</th><th class="num">SG</th><th class="num">Pts</th></tr></thead>
          <tbody>${windowRows.map(x=>{const p=table.indexOf(x)+1;return `<tr class="${x.teamId===s.clubId?"my-row":""} ${zoneOf(p)}"><td class="rank">${p}</td><td><div class="team-cell">${crest(teamObj(x.teamId),22)}<b>${esc(teamName(x.teamId))}</b></div></td><td class="num">${x.p}</td><td class="num">${x.gd}</td><td class="num"><b>${x.pts}</b></td></tr>`;}).join("")}</tbody>
        </table></div>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>Diretoria</h2><span class="badge ${conf>=65?"green":conf>=40?"gold":"red"}">${managerLevel(conf)}</span></div>
        <p class="muted" style="margin:0 0 6px">Meta da temporada</p>
        <p style="margin:0 0 10px;font-size:17px;font-weight:600">${esc(s.objective)}</p>
        <div class="meter gold thick"><i style="width:${progress}%"></i></div>
        <p class="muted small" style="margin:8px 0 20px">${played?`Você está em ${pos}º. A meta é ${rank}º ou melhor.`:"O progresso aparece depois do primeiro jogo."}</p>
        <p class="muted" style="margin:0 0 6px">Confiança no treinador: ${conf}%</p>
        <div class="meter thick"><i style="width:${conf}%"></i></div>
        <p class="muted small" style="margin:18px 0 0">Folha salarial: ${money(weeklyWages(s))} por rodada.</p>
      </section>
    </div>`;
});
