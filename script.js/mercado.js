document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Mercado");if(!s)return;
  const c=document.getElementById("pageContent");
  const posLabel=pos=>({GOL:"Goleiro",ZAG:"Zagueiro",VOL:"Volante",MEI:"Meia",ATA:"Atacante",LAT:"Lateral"}[pos]||pos);
  let currentPos="TODOS",tradeOut=null,tradeIn=null;

  function layout(){
    const positions=["TODOS",...POSITIONS];
    const counts=Object.fromEntries(positions.map(x=>[x,x==="TODOS"?s.market.length:s.market.filter(p=>p.position===x).length]));
    c.innerHTML=`${pageHead("Mercado de transferências","Contrate reforços ou troque um jogador do elenco por outro do mercado.")}
      <section class="panel">
        <div class="panel-head"><h2>Jogadores disponíveis</h2><input id="marketSearch" class="input" style="max-width:260px" type="search" placeholder="Buscar jogador" aria-label="Buscar jogador"></div>
        <div class="tabs" id="marketTabs">${positions.map(x=>`<button class="tab ${x==="TODOS"?"active":""}" data-pos="${x}">${x==="TODOS"?"Todos":posLabel(x)} <small>(${counts[x]})</small></button>`).join("")}</div>
        <div id="marketGrid" class="grid-3 mt"></div>
      </section>
      <section class="panel mt">
        <div class="panel-head"><h2>Trocar jogador</h2><p>Troque um titular ou reserva por um jogador do mercado. A diferença de valor é paga como taxa quando o jogador recebido vale mais.</p></div>
        <div class="grid-3" style="align-items:end">
          <div class="field"><label for="sellSelect">Seu jogador</label><select id="sellSelect" class="select"></select></div>
          <div class="field"><label for="buySelect">Jogador do mercado</label><select id="buySelect" class="select"></select></div>
          <button id="tradeBtn" class="btn primary">${icon("swap",18)}Fazer troca</button>
        </div>
        <p id="tradeInfo" class="muted small" style="margin:12px 0 0"></p>
      </section>`;
      c.innerHTML+=`<section class="panel mt"><div class="panel-head"><div><h2>Histórico de contratações</h2><p class="muted">Movimentações realizadas pelos clubes durante o campeonato.</p></div></div><div class="table-wrap"><table><thead><tr><th>Rodada</th><th>Jogador</th><th>Clube comprador</th><th>Clube vendedor</th><th>Força</th><th class="num">Valor</th></tr></thead><tbody id="transferHistory"></tbody></table></div></section>`;
    document.querySelectorAll("[data-pos]").forEach(b=>b.onclick=()=>{currentPos=b.dataset.pos;document.querySelectorAll("[data-pos]").forEach(x=>x.classList.toggle("active",x===b));drawGrid();});
    document.getElementById("marketSearch").oninput=drawGrid;
    document.getElementById("sellSelect").onchange=document.getElementById("buySelect").onchange=updateTradeInfo;
    document.getElementById("tradeBtn").onclick=trade;
    drawGrid();fillTradeSelects();drawHistory();
  }
  function drawGrid(){
    const q=(document.getElementById("marketSearch")?.value||"").toLowerCase();
    const list=s.market.filter(p=>(currentPos==="TODOS"||p.position===currentPos)&&p.name.toLowerCase().includes(q));
    document.getElementById("marketGrid").innerHTML=list.map(p=>`
      <article class="panel" style="padding:16px">
        <div style="display:flex;gap:12px;align-items:center">${avatar(p,"lg")}<div style="min-width:0;flex:1"><b style="display:block">${esc(p.name)}</b><span class="muted small">${posLabel(p.position)} • ${p.age} anos • ${esc(teamName(p.ownerId))}</span></div>${ratingPill(p.rating)}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
          <b style="color:#c9f3d9">${moneyShort(p.price)}</b>
          <button class="btn ${s.finance.balance<p.price?"secondary":"primary"} sm" data-buy="${esc(p.id)}" ${s.finance.balance<p.price?"disabled":""}>Contratar</button>
        </div>
      </article>`).join("")||`<div class="empty" style="grid-column:1/-1"><b>Nenhum jogador encontrado</b>Ajuste a busca ou escolha outra posição.</div>`;
    document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>buy(b.dataset.buy));
  }
  function fillTradeSelects(){
    const ss=document.getElementById("sellSelect"),bs=document.getElementById("buySelect");
    ss.innerHTML=s.squad.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} — ${p.position} — Força ${p.rating}</option>`).join("");
    bs.innerHTML=s.market.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} — ${p.position} — Força ${p.rating} — ${moneyShort(p.price)}</option>`).join("");
    updateTradeInfo();
  }
  function updateTradeInfo(){
    const out=s.squad.find(p=>p.id===document.getElementById("sellSelect").value);
    const inc=s.market.find(p=>p.id===document.getElementById("buySelect").value);
    const info=document.getElementById("tradeInfo");
    if(!out||!inc){info.textContent="";return;}
    const fee=Math.max(0,Math.round((inc.price-out.price)*.12));
    info.innerHTML=fee>0?`Taxa da troca: <b style="color:var(--text)">${money(fee)}</b> (${inc.name} vale mais que ${out.name}).`:`Sem taxa: ${out.name} vale igual ou mais que ${inc.name}.`;
  }
  function drawHistory(){
    const box=document.getElementById("transferHistory");
    const history=s.transferHistory||[];
    box.innerHTML=history.slice(0,30).map(item=>`<tr><td>R${item.round}</td><td><b>${esc(item.playerName)}</b><small class="muted" style="display:block">${item.position}</small></td><td>${esc(teamName(item.buyerId))}</td><td>${esc(teamName(item.sellerId))}</td><td>${item.rating}</td><td class="num">${moneyShort(item.value)}</td></tr>`).join("")||`<tr><td colspan="6"><div class="empty"><b>Nenhuma contratação registrada</b>As movimentações aparecerão conforme o campeonato avançar.</div></td></tr>`;
  }
  function buy(id){
    const p=s.market.find(x=>x.id===id);if(!p)return;
    if(s.finance.balance<p.price){toast("Saldo insuficiente para essa contratação.","error");return;}
    const sellerId=p.ownerId;
    removeOriginalPlayer(s,sellerId,p.originalId);
    s.finance.balance-=p.price;s.finance.expenses+=p.price;
    if(s.clubFinances[sellerId]){const received=Math.round(p.price*.85);s.clubFinances[sellerId].balance+=received;s.clubFinances[sellerId].income+=received;}
    s.finance.history.unshift({date:today(),type:"Despesa",description:`Compra de ${p.name}`,value:p.price});
    recordTransfer(s,s.clubId,sellerId,p,p.price,"Jogador");
    const bought={...p,id:uid("p"),ownerId:undefined};
    delete bought.ownerId;
    s.squad.push(bought);
    s.market=s.market.filter(x=>x.id!==id);
    fixLineup(s);saveGame(s);refreshTopbar(s);
    toast(`${p.name} contratado!`);
    layout();
  }
  async function trade(){
    const out=s.squad.find(p=>p.id===document.getElementById("sellSelect").value);
    const inc=s.market.find(p=>p.id===document.getElementById("buySelect").value);
    if(!out||!inc)return;
    const why=canSell(s,out);
    if(why){toast(why,"error");return;}
    const fee=Math.max(0,Math.round((inc.price-out.price)*.12));
    if(s.finance.balance<fee){toast(`Você precisa de ${money(fee)} para concluir a troca.`,"error");return;}
    const ok=await askConfirm({title:"Confirmar troca?",text:`Sai <b>${esc(out.name)}</b>, entra <b>${esc(inc.name)}</b>.${fee>0?` Taxa: <b>${money(fee)}</b>.`:""}`,ok:"Confirmar troca"});
    if(!ok)return;
    if(fee>0){s.finance.balance-=fee;s.finance.expenses+=fee;s.finance.history.unshift({date:today(),type:"Despesa",description:`Taxa de troca: ${out.name} por ${inc.name}`,value:fee});}
    const sellerId=inc.ownerId;
    removeOriginalPlayer(s,sellerId,inc.originalId);
    if(s.clubFinances[sellerId]){const received=Math.round(inc.price*.85);s.clubFinances[sellerId].balance+=received;s.clubFinances[sellerId].income+=received;}
    const idx=s.squad.findIndex(p=>p.id===out.id);
    s.squad[idx]={...inc,id:uid("p"),ownerId:undefined};
    delete s.squad[idx].ownerId;
    s.market=s.market.filter(p=>p.id!==inc.id);
    s.market.push({...out,id:uid("m-return"),originalId:out.originalId||out.id,ownerId:s.clubId,price:Math.max(50000,Math.round(out.price*.9))});
    recordTransfer(s,s.clubId,sellerId,inc,inc.price,"Troca");
    fixLineup(s);saveGame(s);refreshTopbar(s);
    toast(`Troca concluída: ${out.name} → ${inc.name}.`);
    layout();
  }
  layout();
});
