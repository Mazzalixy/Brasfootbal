BRASFOOTBALL — Manager de futebol brasileiro
=============================================

Como abrir:
- Descompacte a pasta e abra "index.html" no navegador (Chrome, Edge ou Firefox).
- Não precisa de servidor nem internet: tudo roda localmente e o progresso fica
  salvo no armazenamento do próprio navegador (localStorage).

Estrutura:
- index.html          Login e escolha de clube
- menu.html ... etc.   Telas do jogo (uma por página)
- style.css/style.css  Sistema visual principal
- style.css/login.css  Estilos exclusivos da tela de login
- style.css/tactica.css Estilos exclusivos do campo tático
- script.js/dados.js   Dados fixos: clubes, jogadores, formações
- script.js/app.js     Núcleo do jogo: save, temporada, partidas, diretoria
- script.js/*.js       Um arquivo por página

Para apagar o progresso salvo, use "Configurações > Apagar carreira" dentro
do jogo, ou limpe o localStorage do navegador para este arquivo.
