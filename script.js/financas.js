document.addEventListener("DOMContentLoaded",()=>{
  const s=renderShell("Finanças");if(!s)return;
  const c=document.getElementById("pageContent");
  c.innerHTML=`${pageHead("Finanças","Controle do caixa e movimentações do clube.")}
    <div class="strip">
      <div class="stat"><small>Saldo atual</small><strong>${moneyShort(s.finance.balance)}</strong></div>
      <div class="stat"><small>Receitas totais</small><strong class="positive">${moneyShort(s.finance.income)}</strong></div>
      <div class="stat"><small>Despesas totais</small><strong class="negative">${moneyShort(s.finance.expenses)}</strong></div>
      <div class="stat"><small>Folha salarial</small><strong>${moneyShort(weeklyWages(s))}</strong><span class="hint">por rodada</span></div>
    </div>
    <section class="panel mt">
      <div class="panel-head"><h2>Movimentações</h2></div>
      <div class="table-wrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th class="num">Valor</th></tr></thead><tbody>
        ${s.finance.history.slice(0,60).map(x=>{const pos=x.type==="Receita"||x.type==="Prêmio";return `<tr><td>${x.date}</td><td><span class="badge ${pos?"green":"red"}">${x.type}</span></td><td>${esc(x.description)}</td><td class="num ${pos?"positive":"negative"}">${pos?"+":"-"} ${money(x.value)}</td></tr>`;}).join("")||`<tr><td colspan="4"><div class="empty"><b>Sem movimentações</b></div></td></tr>`}
      </tbody></table></div>
    </section>`;
});
