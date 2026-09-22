/* ==========================================================
   BRASFOOTBALL — dados do jogo
   Clubes, jogadores, formações e efeitos táticos
   ========================================================== */

// c1/c2 = cores do escudo, tx = cor do texto do escudo (opcional)
const GAME_TEAMS = [
 {id:"aurora",name:"Aurora FC",short:"AUR",strength:84,c1:"#22c55e",c2:"#14532d",city:"São Paulo",stadium:"Estádio Aurora",capacity:48000},
 {id:"realbrasil",name:"Real Brasil",short:"RBR",strength:82,c1:"#3b82f6",c2:"#1e3a8a",city:"Rio de Janeiro",stadium:"Arena Brasil",capacity:52000},
 {id:"uniao",name:"União Nacional",short:"UNA",strength:80,c1:"#fde047",c2:"#ca8a04",tx:"#3b2a00",city:"Belo Horizonte",stadium:"Estádio União",capacity:41000},
 {id:"metropole",name:"Metrópole FC",short:"MET",strength:79,c1:"#ef4444",c2:"#7f1d1d",city:"Porto Alegre",stadium:"Arena Metrópole",capacity:46000},
 {id:"atlantic",name:"Atlântico",short:"ATL",strength:78,c1:"#64748b",c2:"#0f172a",city:"Salvador",stadium:"Arena Atlântico",capacity:39000},
 {id:"bravos",name:"Bravos FC",short:"BRA",strength:77,c1:"#fb923c",c2:"#9a3412",city:"Curitiba",stadium:"Bravos Park",capacity:37000},
 {id:"sertao",name:"Sertão Clube",short:"SER",strength:75,c1:"#a855f7",c2:"#581c87",city:"Recife",stadium:"Estádio Sertão",capacity:33000},
 {id:"capital",name:"Capital Esporte",short:"CAP",strength:74,c1:"#38bdf8",c2:"#0c4a6e",city:"Brasília",stadium:"Arena Capital",capacity:44000},
 {id:"litoral",name:"Litoral FC",short:"LIT",strength:73,c1:"#2dd4bf",c2:"#115e59",city:"Santos",stadium:"Vila Litoral",capacity:32000},
 {id:"ferroviario",name:"Ferroviário",short:"FER",strength:72,c1:"#d6d3d1",c2:"#57534e",tx:"#1c1917",city:"Campinas",stadium:"Locomotiva",capacity:28000},
 {id:"verdevale",name:"Verde Vale",short:"VVE",strength:70,c1:"#a3e635",c2:"#3f6212",tx:"#1a2e05",city:"Goiânia",stadium:"Vale Arena",capacity:30000},
 {id:"montanha",name:"Montanha FC",short:"MON",strength:68,c1:"#94a3b8",c2:"#334155",city:"Caxias do Sul",stadium:"Estádio Montanha",capacity:26000},
 {id:"estrela",name:"Estrela Azul",short:"EAZ",strength:67,c1:"#818cf8",c2:"#3730a3",city:"Belém",stadium:"Estrela Park",capacity:25000},
 {id:"guarani",name:"Guará Esporte",short:"GUA",strength:66,c1:"#fbbf24",c2:"#92400e",tx:"#2b1a00",city:"Fortaleza",stadium:"Guará Arena",capacity:31000},
 {id:"pioneiros",name:"Pioneiros FC",short:"PIO",strength:64,c1:"#b45309",c2:"#451a03",city:"Manaus",stadium:"Pioneiros",capacity:22000},
 {id:"imperio",name:"Império SC",short:"IMP",strength:62,c1:"#f43f5e",c2:"#881337",city:"Vitória",stadium:"Arena Império",capacity:24000},
 {id:"rioverde",name:"Rio Verde",short:"RVD",strength:61,c1:"#34d399",c2:"#065f46",city:"Campo Grande",stadium:"Verde Arena",capacity:21000},
 {id:"nordeste",name:"Nordeste FC",short:"NOR",strength:60,c1:"#d946ef",c2:"#701a75",city:"Natal",stadium:"Arena Nordeste",capacity:23000},
 {id:"fronteira",name:"Fronteira",short:"FRO",strength:58,c1:"#22d3ee",c2:"#155e75",city:"Foz do Iguaçu",stadium:"Fronteira Park",capacity:19000},
 {id:"unidos",name:"Unidos FC",short:"UNI",strength:56,c1:"#e2e8f0",c2:"#64748b",tx:"#0f172a",city:"Maceió",stadium:"Estádio Unidos",capacity:18000}
];

const FIRST_NAMES = ["Lucas","Pedro","Gabriel","Rafael","João","Mateus","Arthur","Davi","Henrique","Caio","Bruno","Gustavo","Diego","Felipe","Murilo","Vinícius","Enzo","Samuel","André","Thiago","Leonardo","Victor","Eduardo","Matheus","Nicolas","Igor","Daniel","Luan","Alex","Renan"];
const LAST_NAMES = ["Silva","Santos","Oliveira","Costa","Souza","Lima","Almeida","Ferreira","Pereira","Carvalho","Mendes","Ribeiro","Martins","Gomes","Rocha","Barbosa","Teixeira","Moura","Nunes","Freitas"];
const POSITIONS = ["GOL","LAT","ZAG","VOL","MEI","ATA"];
const POSITION_NAMES = {GOL:"Goleiro",LAT:"Lateral",ZAG:"Zagueiro",VOL:"Volante",MEI:"Meia",ATA:"Atacante"};

function makePlayers(team, index) {
  const roles = ["GOL","GOL","LAT","LAT","ZAG","ZAG","ZAG","ZAG","VOL","VOL","MEI","MEI","MEI","ATA","ATA","ATA","ATA","MEI"];
  return roles.map((pos,i)=>{
    const base = team.strength + Math.round((Math.random()*10)-5);
    const age = 18 + ((index*7+i*3)%19);
    const name = FIRST_NAMES[(index*3+i)%FIRST_NAMES.length] + " " + LAST_NAMES[(index*5+i*2)%LAST_NAMES.length];
    const rating = Math.max(45, Math.min(92, base + (pos==="ATA"||pos==="MEI"?2:0)));
    return {id:`${team.id}-${i}`,name,position:pos,age,rating,price:Math.round((rating*rating*1200)*(1+(25-age)/100)),teamId:team.id,goals:0,assists:0,cards:0,matches:0,morale:75,form:Math.round(60+Math.random()*30)};
  });
}

/* Formações: [posição, x%, y%] — o ataque fica no topo do campo */
const FORMATIONS = {
 "4-3-3":[
  ["GOL",50,92],["LAT",16,72],["ZAG",38,78],["ZAG",62,78],["LAT",84,72],
  ["MEI",30,53],["VOL",50,58],["MEI",70,53],["ATA",20,25],["ATA",50,18],["ATA",80,25]
 ],
 "4-4-2":[
  ["GOL",50,92],["LAT",16,72],["ZAG",38,78],["ZAG",62,78],["LAT",84,72],
  ["MEI",18,53],["MEI",40,50],["MEI",60,50],["MEI",82,53],
  ["ATA",38,23],["ATA",62,23]
 ],
 "4-2-3-1":[
  ["GOL",50,92],["LAT",16,72],["ZAG",38,78],["ZAG",62,78],["LAT",84,72],
  ["VOL",36,60],["VOL",64,60],["MEI",20,40],["MEI",50,36],["MEI",80,40],["ATA",50,18]
 ],
 "3-5-2":[
  ["GOL",50,92],["ZAG",28,77],["ZAG",50,81],["ZAG",72,77],
  ["LAT",12,54],["MEI",33,52],["VOL",50,60],["MEI",67,52],["LAT",88,54],
  ["ATA",38,23],["ATA",62,23]
 ],
 "3-4-3":[
  ["GOL",50,92],["ZAG",28,77],["ZAG",50,81],["ZAG",72,77],
  ["MEI",18,54],["MEI",40,52],["MEI",60,52],["MEI",82,54],
  ["ATA",20,25],["ATA",50,18],["ATA",80,25]
 ],
 "5-3-2":[
  ["GOL",50,92],["LAT",10,68],["ZAG",30,77],["ZAG",50,81],["ZAG",70,77],["LAT",90,68],
  ["MEI",30,52],["VOL",50,57],["MEI",70,52],["ATA",38,23],["ATA",62,23]
 ]
};

/* Opções da tela de tática */
const TACTIC_OPTIONS = {
  mentality:{label:"Mentalidade",values:["Defensiva","Equilibrada","Ofensiva"]},
  pressing:{label:"Pressão",values:["Baixo","Médio","Alto"]},
  tempo:{label:"Ritmo",values:["Lento","Normal","Rápido"]},
  marking:{label:"Marcação",values:["Zona","Individual"]},
  width:{label:"Largura",values:["Fechada","Normal","Aberta"]},
  defensiveLine:{label:"Linha defensiva",values:["Baixa","Normal","Alta"]},
  setPieces:{label:"Bolas paradas",values:["Defensivo","Equilibrado","Ofensivo"]}
};

/* Efeito de cada escolha tática: a = ataque, d = defesa, p = posse, r = risco */
const TACTIC_FX = {
  formation:{"4-3-3":{a:4,d:0,p:2},"4-4-2":{a:2,d:1,p:0},"4-2-3-1":{a:2,d:2,p:2},"3-5-2":{a:2,d:0,p:3},"3-4-3":{a:5,d:-2,p:1},"5-3-2":{a:-1,d:5,p:-2}},
  mentality:{Defensiva:{a:-4,d:6,p:-3,r:12},Equilibrada:{a:1,d:1,p:0,r:25},Ofensiva:{a:7,d:-5,p:3,r:40}},
  pressing:{Baixo:{a:-1,d:1,p:-2},"Médio":{a:1,d:1,p:0},Alto:{a:3,d:-1,p:3}},
  tempo:{Lento:{a:-2,d:1,p:2},Normal:{a:0,d:0,p:0},"Rápido":{a:4,d:-2,p:-2}},
  marking:{Zona:{a:0,d:1,p:0},Individual:{a:1,d:0,p:0}},
  width:{Fechada:{a:-1,d:2,p:0},Normal:{a:0,d:0,p:0},Aberta:{a:2,d:-1,p:1}},
  defensiveLine:{Baixa:{a:-1,d:2,p:-2},Normal:{a:0,d:0,p:0},Alta:{a:1,d:-1,p:2}},
  setPieces:{Defensivo:{a:-1,d:2,p:0},Equilibrado:{a:0,d:0,p:0},Ofensivo:{a:2,d:-1,p:0}}
};
