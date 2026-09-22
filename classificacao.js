document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Classificação");if(!s)return;
  const c=document.getElementById("pageContent"),stand=sortedStandings(s);
  c.innerHTML=`${pageHead("Classificação",`Temporada ${s.season} • Atualizada após cada partida.`)}
    <section class="panel"><div class="table-wrap"><table>
      <thead><tr><th>#</th><th>Clube</th><th class="num">J</th><th class="num">V</th><th class="num">E</th><th class="num">D</th><th class="num">GP</th><th class="num">GC</th><th class="num">SG</th><th class="num">Pts</th></tr></thead>
      <tbody>${stand.map((x,i)=>`<tr class="${x.teamId===s.clubId?"my-row":""} ${zoneOf(i+1)}"><td class="rank">${i+1}</td><td><div class="team-cell">${crest(teamObj(x.teamId),24)}<b>${esc(teamName(x.teamId))}</b></div></td><td class="num">${x.p}</td><td class="num">${x.w}</td><td class="num">${x.d}</td><td class="num">${x.l}</td><td class="num">${x.gf}</td><td class="num">${x.ga}</td><td class="num">${x.gd}</td><td class="num"><b>${x.pts}</b></td></tr>`).join("")}</tbody>
    </table></div>
    <div class="legend"><span><i style="background:var(--green)"></i>Classificação (G-4)</span><span><i style="background:var(--blue)"></i>Zona intermediária (G-8)</span><span><i style="background:var(--red)"></i>Rebaixamento</span></div>
    </section>`;
});
