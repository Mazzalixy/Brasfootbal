document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Diretoria");if(!s)return;
  const c=document.getElementById("pageContent"),m=s.manager;
  const conf=m.confidence;
  const status=m.status==="dismissed"?"Demitido":m.status==="warning"?"Sob pressão":"Em atividade";
  const badge=m.status==="dismissed"?"red":m.status==="warning"?"gold":"green";
  const avg=m.matches?((m.wins*3+m.draws)/m.matches).toFixed(2):"0,00";
  const last=(m.history||[]).slice(0,8);
  const levels=[["0–20%","Risco de demissão",[0,20]],["21–39%","Pressão alta",[21,39]],["40–64%","Regular",[40,64]],["65–79%","Boa",[65,79]],["80–100%","Excelente",[80,100]]];

  c.innerHTML=`${pageHead("Diretoria","A diretoria acompanha seu desempenho como treinador.",`<span class="badge ${badge}">${status}</span>`)}
    ${m.status==="dismissed"?`<section class="panel dismissal-panel">
      <p class="muted" style="margin:0 0 6px">Decisão da diretoria</p>
      <h2>Você perdeu o comando do ${esc(teamName(s.clubId))}</h2>
      <p class="muted" style="margin-top:8px">${esc(s.dismissal?.reason||"A diretoria decidiu encerrar seu trabalho.")}</p>
      <div class="strip mt"><div class="stat"><small>Confiança final</small><strong>${conf}%</strong></div><div class="stat"><small>Jogos no comando</small><strong>${m.matches}</strong></div><div class="stat"><small>Campanha</small><strong>${m.wins}V ${m.draws}E ${m.losses}D</strong></div></div>
      <a class="btn primary wide mt" href="index.html">${icon("logout",18)}Começar nova carreira</a>
    </section>`:""}
    <div class="strip mt">
      <div class="stat"><small>Confiança</small><strong>${conf}%</strong><div class="meter mt" style="margin-top:8px"><i style="width:${conf}%"></i></div></div>
      <div class="stat"><small>Jogos</small><strong>${m.matches||0}</strong></div>
      <div class="stat"><small>Campanha</small><strong>${m.wins||0}V ${m.draws||0}E ${m.losses||0}D</strong></div>
      <div class="stat"><small>Pontos por jogo</small><strong>${avg}</strong></div>
    </div>
    <div class="grid-2 mt">
      <section class="panel">
        <h2>Como a diretoria avalia</h2>
        <p class="muted">Os resultados alteram sua confiança. Vitórias, boa posição na tabela e desempenho ofensivo ajudam; derrotas e campanhas abaixo da meta aumentam a pressão.</p>
        <div class="zones"><i></i><i></i><i></i><i></i><i></i><span class="marker" style="left:${conf}%" data-v="${conf}%"></span></div>
        <div class="mt">${levels.map(([range,label,[lo,hi]])=>`<div class="level ${conf>=lo&&conf<=hi?"on":""}"><span>${range}</span><b>${label}</b></div>`).join("")}</div>
      </section>
      <section class="panel"><h2>Última partida</h2>
        ${s.lastMatch?`<h3 style="margin-top:10px">${esc(teamName(s.lastMatch.homeId))} ${s.lastMatch.homeGoals} × ${s.lastMatch.awayGoals} ${esc(teamName(s.lastMatch.awayId))}</h3>
        <p class="muted small">Rodada ${s.lastMatch.round} • ${s.lastMatch.date}</p>
        <div class="detail-list mt">
          <div class="detail"><small>Finalizações</small><b>${s.lastMatch.shotsHome} × ${s.lastMatch.shotsAway}</b></div>
          <div class="detail"><small>Posse</small><b>${s.lastMatch.possessionHome}% × ${100-s.lastMatch.possessionHome}%</b></div>
        </div>
        <p class="mt" style="margin-bottom:0">Variação da confiança: <b class="${s.lastMatch.managerDelta>=0?"positive":"negative"}">${s.lastMatch.managerDelta>=0?"+":""}${s.lastMatch.managerDelta}</b></p>`
        :`<div class="empty"><b>Nenhuma partida disputada</b>Jogue sua primeira rodada para ver os detalhes aqui.</div>`}
      </section>
    </div>
    <section class="panel mt"><h2>Histórico da avaliação</h2>
      ${last.length?`<div class="table-wrap mt"><table><thead><tr><th class="num">Rodada</th><th>Adversário</th><th>Resultado</th><th class="num">Variação</th><th class="num">Confiança</th><th>Nível</th></tr></thead><tbody>
        ${last.map(x=>`<tr><td class="num">${x.round}</td><td>${esc(x.opponent)}</td><td>${x.result}</td><td class="num ${x.delta>=0?"positive":"negative"}">${x.delta>=0?"+":""}${x.delta}</td><td class="num">${x.confidence}%</td><td>${x.level}</td></tr>`).join("")}
      </tbody></table></div>`:`<div class="empty mt"><b>Sem histórico ainda</b>Cada partida disputada aparece nesta lista.</div>`}
    </section>`;
});
