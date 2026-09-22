document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Elenco");if(!s)return;
  const c=document.getElementById("pageContent");
  const order={GOL:0,LAT:1,ZAG:2,VOL:3,MEI:4,ATA:5};
  const sorters={
    pos:(a,b)=>order[a.position]-order[b.position]||b.rating-a.rating,
    rating:(a,b)=>b.rating-a.rating,
    age:(a,b)=>a.age-b.age,
    goals:(a,b)=>b.goals-a.goals||b.assists-a.assists,
    price:(a,b)=>b.price-a.price
  };
  const avgAge=(s.squad.reduce((n,p)=>n+p.age,0)/s.squad.length).toFixed(1).replace(".",",");

  c.innerHTML=`${pageHead("Elenco",`${s.squad.length} jogadores sob contrato.`)}
    <div class="strip" id="summary"></div>
    <section class="panel mt">
      <div class="filters">
        <input id="search" class="input" type="search" placeholder="Pesquisar jogador" aria-label="Pesquisar jogador">
        <select id="pos" class="select" aria-label="Filtrar por posição"><option value="">Todas as posições</option>${POSITIONS.map(x=>`<option value="${x}">${POSITION_NAMES[x]}</option>`).join("")}</select>
        <select id="sort" class="select" aria-label="Ordenar por"><option value="pos">Ordenar por posição</option><option value="rating">Maior força</option><option value="age">Mais jovens</option><option value="goals">Mais gols</option><option value="price">Maior valor</option></select>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Jogador</th><th>Pos.</th><th class="num">Idade</th><th class="num">Força</th><th>Forma</th><th class="num">Gols</th><th class="num">Ast.</th><th class="num">Valor</th><th></th></tr></thead>
        <tbody id="players"></tbody>
      </table></div>
    </section>`;

  function summary(){
    document.getElementById("summary").innerHTML=`
      <div class="stat"><small>Time titular</small><strong>${Math.round(lineupStrength(s))}</strong><span class="hint">Média de força dos 11</span></div>
      <div class="stat"><small>Elenco</small><strong>${s.squad.length}</strong><span class="hint">Mínimo de ${SQUAD_MIN} jogadores</span></div>
      <div class="stat"><small>Idade média</small><strong>${avgAge}</strong><span class="hint">anos</span></div>
      <div class="stat"><small>Folha salarial</small><strong style="font-size:26px;padding-top:6px">${moneyShort(weeklyWages(s))}</strong><span class="hint">por rodada</span></div>`;
  }
  function render(){
    const q=document.getElementById("search").value.toLowerCase().trim(),pos=document.getElementById("pos").value,sort=document.getElementById("sort").value;
    const xi=new Set(s.tacticalXI);
    const list=s.squad.filter(p=>p.name.toLowerCase().includes(q)&&(!pos||p.position===pos)).sort(sorters[sort]);
    document.getElementById("players").innerHTML=list.map(p=>`<tr>
      <td><div class="player-name">${avatar(p)}<div><b>${esc(p.name)}${xi.has(p.id)?'<span class="name-tag">Titular</span>':""}</b><small>${esc(POSITION_NAMES[p.position])}</small></div></div></td>
      <td>${posChip(p.position)}</td><td class="num">${p.age}</td><td class="num">${ratingPill(p.rating)}</td>
      <td><div style="display:flex;align-items:center;gap:8px"><div class="meter" style="width:64px"><i style="width:${p.form}%;background:${p.form>=75?"var(--green)":p.form<60?"var(--red)":"var(--gold)"}"></i></div><span class="muted small">${p.form}</span></div></td>
      <td class="num">${p.goals}</td><td class="num">${p.assists}</td><td class="num">${moneyShort(p.price)}</td>
      <td class="num"><button class="btn ghost sm" data-sell="${esc(p.id)}" aria-label="Vender ${esc(p.name)}">${icon("tag",16)}Vender</button></td></tr>`).join("")
      ||`<tr><td colspan="9"><div class="empty"><b>Nenhum jogador encontrado</b>Mude a pesquisa ou o filtro de posição.</div></td></tr>`;
    document.querySelectorAll("[data-sell]").forEach(b=>b.onclick=()=>sell(b.dataset.sell));
  }
  async function sell(id){
    const p=s.squad.find(x=>x.id===id);if(!p)return;
    const why=canSell(s,p);
    if(why){toast(why,"error");return;}
    const value=sellValue(p);
    const ok=await askConfirm({title:`Vender ${p.name}?`,text:`O clube recebe <b>${money(value)}</b> (85% do valor de mercado). Essa ação não pode ser desfeita.`,ok:"Vender jogador",danger:true});
    if(!ok) return;
    s.squad=s.squad.filter(x=>x.id!==id);
    fixLineup(s);
    s.finance.balance+=value;s.finance.income+=value;
    s.finance.history.unshift({date:today(),type:"Receita",description:`Venda de ${p.name}`,value});
    saveGame(s);refreshTopbar(s);
    toast(`${p.name} vendido por ${moneyShort(value)}.`);
    summary();render();
  }
  ["search","pos","sort"].forEach(id=>document.getElementById(id).addEventListener(id==="search"?"input":"change",render));
  summary();render();
});
