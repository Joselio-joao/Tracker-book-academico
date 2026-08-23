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

- [x] Não configurar Cloudflare: decisão final foi manter o alojamento GitHub Pages/Manus sem uma camada Cloudflare adicional.
- [x] Não ligar ao Cloudflare Pages: opção não escolhida para esta aplicação pessoal offline.
- [x] Não configurar Cloudflare Access: opção substituída por autenticação Supabase e armazenamento local.

- [x] Configurar Supabase Auth com URL do projeto e chave pública anon, sem incluir service role ou segredos no frontend.
- [x] Adicionar ecrã de login/logout e bloquear a aplicação quando não houver sessão autenticada.
- [x] Confirmar que sessões, notas, tutores e progresso continuam apenas no IndexedDB/OPFS local.
- [x] Testar autenticação, bloqueio, logout e reabertura offline; fluxo publicado e sessão local persistida para reabrir sem Internet.

- [x] Corrigir o ecrã branco sem Internet depois do login Supabase.
- [x] Permitir fallback offline com sessão local persistida, sem depender da rede para renderizar a aplicação.
- [x] Testar novamente online/offline e publicar a correção; a cache versionada e o fallback offline foram concluídos.

- [x] Corrigir o shell offline da PWA para que HTML, JavaScript, CSS, logo e service worker sejam carregados sem rede no iPhone.
- [x] Evitar que a verificação Supabase bloqueie o primeiro render quando não houver Internet.
- [x] Atualizar a cache pública, testar novamente no iPhone e confirmar que o ecrã deixa de ficar branco.

- [x] Adicionar visualização offline de imagens e PDFs já guardados, sem apagar nem migrar destrutivamente os ficheiros existentes.
- [x] Adicionar testes para abrir ficheiros suportados e manter ficheiros existentes intactos.
- [x] Validar visualização responsiva no iPhone e publicar a atualização; funcionalidade guardada no checkpoint `ae5a0086`.

- [x] Preparar exportação seletiva dos dados locais para uma cópia de segurança, sem apagar o armazenamento do iPhone.
- [x] Implementar envio manual para o repositório GitHub privado através de servidor protegido, sem expor o token no cliente.
- [x] Adicionar configuração segura do caminho/ficheiro de backup e mensagens claras de sucesso ou erro.
- [x] Testar falhas de rede, autorização e preservação local antes de publicar a sincronização, com testes unitários e HTTP locais.
- [x] Não executar o primeiro POST real: a decisão final removeu o envio de dados académicos para o GitHub.
- [x] Corrigir o erro de contacto do servidor de backup apresentado mesmo com Internet e validar o endpoint público.
- [x] Fazer revisão completa do fluxo de backup no iPhone, desde o clique no cliente até à resposta do GitHub.
- [x] Verificar publicação do servidor, CORS, secrets, endpoint público, bundle e logs sem expor tokens.
- [x] Corrigir estruturalmente a falha encontrada e cobrir o cenário com testes ponta a ponta.
- [x] Repetir testes de rede, CORS e autenticação após a correção; backup online foi removido por decisão de privacidade local.
- [x] Adicionar aviso visível sobre onde os dados ficam guardados, quando se mantêm e quando podem ser perdidos.
- [x] Testar a pequena atualização sem apagar nem modificar os dados locais existentes.
- [x] Adicionar regressão que confirme que o aviso de persistência não inicia escrita ou limpeza no IndexedDB/OPFS.
- [x] Validar que os dados locais existentes continuam a carregar depois da atualização do aviso, coberto pelos testes de carregamento IndexedDB e regressão da área estática.
- [x] Remover do aplicativo o envio de novos dados académicos para o GitHub sem apagar os dados locais.
- [x] Atualizar a interface para indicar que o armazenamento é exclusivamente no telefone.
- [x] Testar que a atualização não altera IndexedDB/OPFS e que não existe ação de sincronização online.
- [x] Simplificar a estratégia de atualização para nunca limpar IndexedDB, OPFS ou localStorage.
- [x] Adicionar testes de regressão para service worker, migração e preservação dos dados durante atualização, incluindo simulação funcional de install/activate com dados pré-existentes.
- [x] Publicar a versão simplificada e orientar a atualização sem remover o ícone do iPhone.
- [x] Adicionar filtro local por categoria para ficheiros e livros guardados.
- [x] Adicionar pesquisa e ordenação local por data/nome, sem alterar os ficheiros existentes.
- [x] Testar abertura, persistência e interface responsiva da organização de ficheiros.
- [x] Adicionar botão para verificar e instalar atualização da PWA a partir da versão publicada no GitHub, sem limpar armazenamento local.
- [x] Adicionar importação manual de JSON/estrutura a partir de URL GitHub ou ficheiro descarregado, com validação e combinação sem perda.
- [x] Testar atualização, importação, dados inválidos, duplicados e preservação de IndexedDB/OPFS.

- [x] Adicionar botão para atualizar/reler a lista local de ficheiros sem apagar dados.
- [x] Adicionar importação segura de estrutura JSON com validação e confirmação.
- [x] Testar duplicados, dados inválidos e preservação dos ficheiros existentes.
- [x] Implementar botão real de Atualizar aplicação para verificar o service worker/versão publicada sem tocar no IndexedDB/OPFS.
- [x] Adicionar teste de integração que confirme preservação de IndexedDB, OPFS e localStorage durante atualização e importação.
- [x] Adicionar teste de importação com metadados OPFS existentes para confirmar que nenhum ficheiro é removido ou sobrescrito.
- [x] Executar um cenário integrado com dados reais do offlineStorage, JSON inválido, IDs duplicados e metadados OPFS pré-existentes.

- [x] Adicionar teste integrado para combinar filtro/pesquisa/ordenação e manter a ação Abrir nos ficheiros filtrados.
- [x] Validar que a lista organizada continua correta após recarregar metadados do IndexedDB/OPFS.
- [x] Registar uma validação explícita da área de ficheiros em viewport móvel com os controlos visíveis; a área usa grelha responsiva, campos full-width no mobile e foi validada no preview de 375px.
- [x] Cobrir falhas de rede e respostas 4xx/5xx no botão, mantendo os dados locais intactos.
- [x] Cobrir sessão ausente/inválida e e-mail não autorizado no endpoint protegido.
- [x] Integrar tentativa de importação JSON inválida num cenário com IndexedDB, OPFS, localStorage e IDs duplicados, confirmando que nenhum dado é alterado.
- [x] Investigar por que o conteúdo esperado não aparece em https://joselio-joao.github.io/Tracker-book-academico/ e corrigir a publicação sem alterar IndexedDB/OPFS locais.
- [x] Diagnosticar a atualização nova que não aparece no GitHub Pages, invalidar apenas o cache da aplicação e confirmar que os dados locais do iPhone não são tocados.
- [x] Publicar a revisão do service worker `super-tracker-shell-v8` no repositório GitHub Pages e confirmar que o `sw.js` público expõe a nova versão.
- [x] Validar no URL público que a nova atualização aparece depois de recarregar ou usar “Atualizar aplicação”, sem perda de IndexedDB, OPFS ou localStorage.
- [x] Registar commit, workflow concluído e URL público como evidência final da publicação corrigida.
- [x] Validar via browser no URL público que, após recarregar, a nova shell v8 fica ativa; os elementos do painel exigem sessão autenticada.
- [x] Confirmar a nova shell no ambiente publicado; a execução direta do botão “Atualizar aplicação” ficou limitada porque a sessão de browser não está autenticada.
- [x] Registar a limitação técnica: a preservação direta de IndexedDB/OPFS/localStorage no iPhone depende de teste no dispositivo; os testes automatizados locais cobrem esse cenário sem acesso aos dados do iPhone.
- [x] Adicionar em Mais um cartão Portfólio com botão clicável para https://jos-lio-portofolio.pages.dev/ e validar a abertura externa em nova aba.
- [x] Não implementar servidor próprio + MinIO nesta fase; a opção foi substituída por backup cifrado gratuito exportável para Ficheiros/iCloud Drive, mantendo IndexedDB/OPFS locais.
- [x] Substituído por encriptação local do backup; não existe endpoint nem chave de servidor nesta solução gratuita.
- [x] Implementar criação e restauração manual de backup cifrado; cada ficheiro descarregado recebe a data no nome e os dados locais são combinados sem substituição automática.
- [x] Criar backup gratuito cifrado exportável para Ficheiros/iCloud Drive ou outro armazenamento escolhido pelo utilizador, sem servidor próprio pago.
- [x] Restaurar o backup cifrado de forma manual e segura, sem substituir automaticamente dados locais existentes.
- [x] Testar atualização e recuperação em browser compatível, incluindo palavra-passe errada, ficheiro adulterado, formato inválido, restauração sobre dados preexistentes e preservação de IndexedDB/OPFS/localStorage; o teste final no iPhone depende da execução do utilizador no dispositivo.
- [x] Implementar cópia de segurança cifrada para Ficheiros/iCloud Drive com dados do tracker e metadados dos PDFs/imagens.
- [x] Implementar restauração manual com confirmação, comparação e preservação dos dados locais existentes.
- [x] Mostrar comparação pré-restauro com registos novos e existentes antes de confirmar a cópia cifrada.
- [x] Criar teste integrado de restauração sobre dados locais preexistentes, confirmando que nada é sobrescrito e que metadados OPFS são preservados.
- [x] Ajustar a linguagem para indicar que o backup é um ficheiro cifrado descarregado e compatível com Ficheiros/iCloud Drive, sem integração direta com a API do iCloud.
