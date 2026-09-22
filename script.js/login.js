document.addEventListener("DOMContentLoaded",()=>{
  const $=id=>document.getElementById(id);
  const nameInput=$("managerName"),msg=$("loginMsg"),savedBox=$("savedCard");
  const newBtn=$("newGameBtn"),continueBtn=$("continueBtn");
  const stepLogin=$("stepLogin"),stepClub=$("stepClub");
  const grid=$("clubChoices"),startBtn=$("startCareerBtn"),picked=$("picked"),clubBar=$("clubBar");
  let selected=null;

  $("backBtn").innerHTML=icon("back",18);
  $("heroFacts").innerHTML=`<li>${icon("shield",18)}20 clubes com força e elenco próprios</li><li>${icon("target",18)}Tática, formação e estilo de jogo</li><li>${icon("building",18)}Diretoria que avalia cada resultado</li>`;
  $("continueBtn").innerHTML=icon("play",18)+"Continuar carreira";
  $("newGameBtn").innerHTML=icon("shield",18)+"Nova carreira";

  const login=getLogin();
  if(login?.name) nameInput.value=login.name;
  const save=loadGame();

  if(save){
    const t=getTeam(save.clubId);
    const dismissed=save.manager?.status==="dismissed";
    savedBox.innerHTML=`${crest(t,44)}<div><b>${esc(t.name)}</b><span class="info">Treinador ${esc(save.managerName||login?.name||"")}. Temporada ${save.season}, rodada ${Math.min(save.round,TOTAL_ROUNDS)} de ${TOTAL_ROUNDS}.</span></div>${dismissed?'<span class="badge red" style="margin-left:auto">Demitido</span>':""}`;
    savedBox.classList.remove("hidden");
    continueBtn.classList.add("primary");
    newBtn.classList.add("secondary");
  }else{
    continueBtn.classList.add("hidden");
    newBtn.classList.add("primary","only");
  }

  function fail(text){
    msg.textContent=text;
    nameInput.setAttribute("aria-invalid","true");
    nameInput.focus();
  }
  function getName(){
    const name=nameInput.value.trim();
    if(!name){fail("Digite o nome do treinador para continuar.");return null;}
    msg.textContent="";nameInput.removeAttribute("aria-invalid");
    saveLogin(name);
    return name;
  }
  nameInput.addEventListener("input",()=>{msg.textContent="";nameInput.removeAttribute("aria-invalid");});
  nameInput.addEventListener("keydown",e=>{
    if(e.key!=="Enter") return;
    (save?continueBtn:newBtn).click();
  });

  continueBtn.onclick=()=>{
    const name=getName();if(!name)return;
    const s=loadGame();if(!s)return;
    s.managerName=name;saveGame(s);
    continueGame();
  };
  newBtn.onclick=()=>{
    if(!getName())return;
    stepLogin.classList.add("hidden");stepClub.classList.remove("hidden");
    window.scrollTo({top:0});
  };
  $("backBtn").onclick=()=>{stepClub.classList.add("hidden");stepLogin.classList.remove("hidden");};

  GAME_TEAMS.forEach(t=>{
    const b=document.createElement("button");
    b.type="button";b.className="club-choice";b.setAttribute("aria-pressed","false");
    b.innerHTML=`${crest(t,44)}<span><strong>${esc(t.name)}</strong><small>${esc(t.city)}</small></span>
      <span class="cc-power" title="Força do elenco"><b>${t.strength}</b><span class="meter"><i style="width:${Math.round((t.strength-50)/40*100)}%"></i></span></span>`;
    b.onclick=()=>{
      grid.querySelectorAll(".club-choice").forEach(x=>x.setAttribute("aria-pressed","false"));
      b.setAttribute("aria-pressed","true");
      selected=t.id;
      picked.innerHTML=`${crest(t,40)}<div><b>${esc(t.name)}</b><span class="info">${esc(t.stadium)}, ${t.capacity.toLocaleString("pt-BR")} lugares. Meta: ${esc(objectiveFor(t.strength).text.toLowerCase())}.</span></div>`;
      clubBar.classList.remove("hidden");
      startBtn.disabled=false;
    };
    grid.appendChild(b);
  });

  startBtn.onclick=async()=>{
    if(!selected||!getName())return;
    if(loadGame()){
      const ok=await askConfirm({title:"Substituir a carreira salva?",text:"Você já tem uma carreira neste navegador. Começar uma nova apaga a anterior.",ok:"Substituir e começar",danger:true});
      if(!ok) return;
    }
    startNewCareer(selected);
  };
});
