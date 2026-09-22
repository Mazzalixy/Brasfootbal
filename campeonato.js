document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Campeonato");if(!s)return;
  const c=document.getElementById("pageContent"),stand=sortedStandings(s),f=currentFixture(s);
  const champion=s.round>TOTAL_ROUNDS?stand[0]:null;
  c.innerHTML=`${pageHead("Campeonato Nacional",`Temporada ${s.season} • 20 clubes • ${TOTAL_ROUNDS} rodadas (turno e returno)`)}
    <section class="board" style="padding:26px 28px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
        <div><p class="muted" style="margin:0 0 6px">${champion?"Campeão da temporada":"Seu próximo desafio"}</p>
        <h2 style="font:700 30px var(--display)">${champion?esc(teamName(champion.teamId)):f?esc(teamName(f.homeId===s.clubId?f.awayId:f.homeId)):"Fim da temporada"}</h2></div>
        ${f?`<a class="btn primary" href="partida.html">${icon("play",18)}Jogar rodada ${f.round}</a>`:""}
      </div>
    </section>
    <section class="panel mt">
      <div class="panel-head"><h2>Classificação</h2><a class="btn ghost sm" href="classificacao.html">Tela completa</a></div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Clube</th><th class="num">J</th><th class="num">V</th><th class="num">E</th><th class="num">D</th><th class="num">SG</th><th class="num">Pts</th></tr></thead><tbody>
        ${stand.slice(0,10).map((x,i)=>`<tr class="${x.teamId===s.clubId?"my-row":""} ${zoneOf(i+1)}"><td class="rank">${i+1}</td><td><div class="team-cell">${crest(teamObj(x.teamId),22)}<b>${esc(teamName(x.teamId))}</b></div></td><td class="num">${x.p}</td><td class="num">${x.w}</td><td class="num">${x.d}</td><td class="num">${x.l}</td><td class="num">${x.gd}</td><td class="num"><b>${x.pts}</b></td></tr>`).join("")}
      </tbody></table></div>
      <div class="legend"><span><i style="background:var(--green)"></i>G-4</span><span><i style="background:var(--blue)"></i>G-8</span><span><i style="background:var(--red)"></i>Rebaixamento</span></div>
    </section>`;
});
