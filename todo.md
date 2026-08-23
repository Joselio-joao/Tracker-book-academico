# Conversão para aplicativo iOS com IA

- [x] Confirmar os requisitos da documentação Antigravity e a licença/compatibilidade do repositório dio-agent.
- [x] Definir a abordagem iOS e o modelo seguro de persistência local e sincronização opcional.
- [x] Criar o projeto Expo iOS e migrar o tracker: estudo, avaliações, universidade, bolsas, hábitos, currículo e exportação.
- [x] Integrar o assistente de IA por uma interface segura, sem expor chaves no cliente.
- [x] Testar os fluxos e preparar um arquivo completo do projeto para descarregamento.
- [x] Restaurar a versão web estável do Super Tracker para uso sem computador.
- [x] Adicionar manifest, ícones e metadados de instalação no Safari/iPhone.
- [x] Validar o painel no tamanho de ecrã de iPhone e guardar a versão publicável.
- [x] Guardar o checkpoint da versão PWA e confirmar que a cópia entregue mantém a apresentação no iPhone.
- [x] Adicionar eliminação de histórico de estudo e avaliações com confirmação explícita.
- [x] Adicionar limpeza geral dos dados locais com confirmação explícita e opção de exportar antes de apagar.
- [x] Testar os fluxos de eliminação no formato de iPhone e guardar a versão atualizada.

- [x] Corrigir o cache do service worker para guardar todos os ficheiros da aplicação após a primeira abertura online.
- [x] Validar o cache do service worker e a persistência dos registos no navegador.
- [x] Confirmar manualmente a abertura offline da PWA no iPhone depois da publicação.
- [x] Guardar novo checkpoint da versão offline corrigida.

- [x] Mostrar no cabeçalho se o Super Tracker está online ou offline.
- [x] Confirmar a persistência local no navegador e orientar a validação manual no iPhone.

- [x] Migrar dados estruturados de localStorage para IndexedDB com migração automática da versão existente.
- [x] Adicionar camada opcional OPFS para ficheiros maiores e metadados de armazenamento.
- [x] Mostrar quota e espaço usado através de Storage Manager e manter Cache API para os assets offline.
- [x] Testar persistência, migração, eliminação segura e funcionamento offline em navegador compatível.
- [x] Guardar checkpoint da atualização de armazenamento.

- [x] Escolher o alojamento externo: GitHub Pages para a PWA estática; backend não é necessário para o uso pessoal offline.
- [x] Exportar o código e separar os componentes dependentes do Manus.
- [x] Definir substituto para OAuth, base de dados, storage e APIs Manus, caso sejam necessários fora da plataforma: a cópia offline não usa OAuth, base de dados remota, storage remoto nem APIs Manus.
- [x] Configurar domínio, HTTPS, variáveis de ambiente e publicação externa. GitHub Pages ativo em https://joselio-joao.github.io/Tracker-book-academico/; a PWA estática não requer variáveis de ambiente.
- [x] Testar a PWA publicada, o modo offline e os fluxos de dados depois da migração. O URL público carrega o painel em sessão limpa, o service worker está registado, a cache `super-tracker-shell-v3` existe, IndexedDB foi detetado e build/TypeScript/9 testes unitários passaram. Recomenda-se repetir a abertura sem rede no Safari do iPhone.

- [x] Escolher não usar servidor Node nem domínio próprio nesta primeira publicação; GitHub Pages é suficiente para a PWA.
- [x] Escolher não usar TiDB/MySQL nem storage remoto; IndexedDB e OPFS permanecem locais no dispositivo.
- [x] Optar por aplicação pessoal single-tenant sem login, preservando o funcionamento offline.
- [x] Definir que a IA online é opcional e não faz parte da PWA offline; qualquer integração futura deverá usar um proxy externo seguro.

- [x] Simplificar a exportação para PWA estática sem backend, login ou Supabase.
- [x] Preparar a publicação externa da PWA e as instruções de domínio.
- [x] Confirmar que IndexedDB, OPFS, Cache API e modo offline permanecem funcionais após a exportação.

- [x] Adicionar eliminação individual por registo nas opções/áreas de gestão, com confirmação e feedback.
- [x] Criar bloco de notas académico offline, com criar, editar, pesquisar, fixar e eliminar notas individualmente.
- [x] Testar persistência IndexedDB, confirmações de eliminação, exportação/importação e responsividade das novas funções.

- [x] Publicar no GitHub Pages a atualização do bloco de notas e das remoções individuais, usando o repositório Tracker-book-academico como destino final.
- [x] Confirmar no URL público que a nova versão do GitHub Pages está disponível.

- [x] Substituir “Caderno de Josélio” pelo logotipo fornecido e atualizar os metadados visuais da PWA.
- [x] Criar aba Tutores com contactos persistentes, adicionar, editar, pesquisar e remover individualmente.
- [x] Adicionar contador de estudo com duração configurável, pausa/reinício, conclusão e despertador local persistente.
- [x] Testar as novas funções offline e publicar a atualização diretamente no GitHub Pages.

- [x] Adicionar pesquisa e edição de contactos de tutores existentes.
- [x] Persistir o estado do contador/despertador e restaurá-lo depois de recarregar a PWA.
- [x] Criar cobertura de testes para tutores e temporizador e publicar/verificar a nova versão no GitHub Pages. Build, TypeScript e 9 testes passaram; GitHub Actions concluído com sucesso para 2dac6a7; URL público confirmou logo, Tutores, contador e ausência do nome antigo.

- [x] Diagnosticar por que o GitHub Pages/iPhone ainda apresenta a versão antiga.
- [x] Atualizar a versão do service worker e forçar a invalidação da cache pública.
- [x] Confirmar no URL público a nova marca, aba Tutores e contador após a atualização.

- [x] Definir proteção de acesso do GitHub Pages sem confundir link não listado com autenticação real.
- [x] Implementar a proteção escolhida e manter os dados académicos locais/offline.
- [x] Testar acesso autorizado, acesso sem o segredo e funcionamento offline após desbloqueio.

- [ ] Confirmar conta Cloudflare, domínio/subdomínio disponível e método de autenticação pretendido.
- [ ] Ligar o repositório Tracker-book-academico ao Cloudflare Pages com deploy automático da branch main.
- [ ] Configurar Cloudflare Access gratuito e testar o endereço protegido antes de desativar o GitHub Pages.

- [x] Configurar Supabase Auth com URL do projeto e chave pública anon, sem incluir service role ou segredos no frontend.
- [x] Adicionar ecrã de login/logout e bloquear a aplicação quando não houver sessão autenticada.
- [x] Confirmar que sessões, notas, tutores e progresso continuam apenas no IndexedDB/OPFS local.
- [ ] Testar autenticação, bloqueio, logout e reabertura offline; publicação no GitHub Pages concluída no workflow `3242645` e bundle público contém login/logout.

- [x] Corrigir o ecrã branco sem Internet depois do login Supabase.
- [x] Permitir fallback offline com sessão local persistida, sem depender da rede para renderizar a aplicação.
- [ ] Testar novamente online/offline e publicar a correção no GitHub Pages. Build, TypeScript, 11 testes e publicação GitHub Pages concluídos; falta confirmar no iPhone sem rede.

- [ ] Corrigir o shell offline da PWA para que HTML, JavaScript, CSS, logo e service worker sejam carregados sem rede no iPhone.
- [ ] Evitar que a verificação Supabase bloqueie o primeiro render quando não houver Internet.
- [ ] Atualizar a cache pública, testar novamente no iPhone e confirmar que o ecrã deixa de ficar branco.

- [x] Adicionar visualização offline de imagens e PDFs já guardados, sem apagar nem migrar destrutivamente os ficheiros existentes.
- [x] Adicionar testes para abrir ficheiros suportados e manter ficheiros existentes intactos.
- [ ] Validar visualização responsiva no iPhone e publicar a atualização.

- [x] Preparar exportação seletiva dos dados locais para uma cópia de segurança, sem apagar o armazenamento do iPhone.
- [x] Implementar envio manual para o repositório GitHub privado através de servidor protegido, sem expor o token no cliente.
- [x] Adicionar configuração segura do caminho/ficheiro de backup e mensagens claras de sucesso ou erro.
- [x] Testar falhas de rede, autorização e preservação local antes de publicar a sincronização, com testes unitários e HTTP locais.
- [ ] Confirmar o primeiro POST real pelo botão do iPhone e verificar a criação/atualização do ficheiro de backup no repositório privado.
- [x] Corrigir o erro de contacto do servidor de backup apresentado mesmo com Internet e validar o endpoint público.
- [x] Fazer revisão completa do fluxo de backup no iPhone, desde o clique no cliente até à resposta do GitHub.
- [x] Verificar publicação do servidor, CORS, secrets, endpoint público, bundle e logs sem expor tokens.
- [x] Corrigir estruturalmente a falha encontrada e cobrir o cenário com testes ponta a ponta.
- [ ] Repetir testes de rede, CORS e autenticação após a correção e orientar novo teste no iPhone.
- [x] Adicionar aviso visível sobre onde os dados ficam guardados, quando se mantêm e quando podem ser perdidos.
- [x] Testar a pequena atualização sem apagar nem modificar os dados locais existentes.
- [x] Adicionar regressão que confirme que o aviso de persistência não inicia escrita ou limpeza no IndexedDB/OPFS.
- [x] Validar que os dados locais existentes continuam a carregar depois da atualização do aviso, coberto pelos testes de carregamento IndexedDB e regressão da área estática.
- [x] Remover do aplicativo o envio de novos dados académicos para o GitHub sem apagar os dados locais.
- [x] Atualizar a interface para indicar que o armazenamento é exclusivamente no telefone.
- [x] Testar que a atualização não altera IndexedDB/OPFS e que não existe ação de sincronização online.
- [x] Cobrir falhas de rede e respostas 4xx/5xx no botão, mantendo os dados locais intactos.
- [x] Cobrir sessão ausente/inválida e e-mail não autorizado no endpoint protegido.
