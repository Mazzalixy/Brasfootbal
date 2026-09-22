document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Artilharia");if(!s)return;
  const c=document.getElementById("pageContent");
  const scorers=globalScorers(s).filter(p=>p.goals>0).sort((a,b)=>b.goals-a.goals||b.assists-a.assists).slice(0,30);
  const assisters=globalScorers(s).filter(p=>p.assists>0).sort((a,b)=>b.assists-a.assists).slice(0,10);
  c.innerHTML=`${pageHead("Artilharia","Ranking de goleadores e garçons da temporada.")}
    <div class="cols-64">
      <section class="panel"><h2>Goleadores</h2>${scorers.length?`<div class="table-wrap mt"><table><thead><tr><th>#</th><th>Jogador</th><th>Clube</th><th>Pos.</th><th class="num">Gols</th></tr></thead><tbody>
        ${scorers.map((p,i)=>`<tr class="${p.teamId===s.clubId?"my-row":""}"><td class="rank">${i+1}</td><td><div class="player-name">${avatar(p)}<b>${esc(p.name)}</b></div></td><td>${esc(teamName(p.teamId))}</td><td>${posChip(p.position)}</td><td class="num"><b style="color:var(--gold)">${p.goals}</b></td></tr>`).join("")}
      </tbody></table></div>`:`<div class="empty mt"><b>Nenhum gol ainda</b>Os artilheiros aparecem aqui após as primeiras rodadas.</div>`}</section>
      <section class="panel"><h2>Assistências</h2><div class="stack mt">
        ${assisters.length?assisters.map((p,i)=>`<div class="detail" style="display:flex;align-items:center;gap:10px"><span class="rank" style="width:20px">${i+1}</span>${avatar(p)}<div style="flex:1;min-width:0"><b style="display:block">${esc(p.name)}</b><span class="muted small">${esc(teamName(p.teamId))}</span></div><b>${p.assists}</b></div>`).join(""):`<div class="empty"><b>Sem assistências</b>Aparecem após os primeiros gols.</div>`}
      </div></section>
    </div>`;
});
