# Tracker-book-academico

O **Tracker-book-academico** é uma PWA académica para acompanhar estudo, preparação universitária, bolsas, hábitos, avaliações e currículo. Foi pensado para uso pessoal no iPhone e funciona offline depois da primeira abertura com Internet.

## Funcionalidades principais

A aplicação inclui painel de progresso, sessões de estudo, avaliações, calendário académico de dezembro a julho, tarefas de preparação universitária, acompanhamento de bolsas, hábitos, currículo e gestão de armazenamento. Os dados pessoais permanecem no dispositivo através de **IndexedDB**; ficheiros maiores podem usar **OPFS** quando o navegador suporta essa API; o **Service Worker** mantém os recursos da aplicação disponíveis offline.

> Esta cópia pública não depende de Supabase, login Manus, TiDB, S3 ou APIs Manus para o funcionamento pessoal offline.

## Desenvolvimento local

É necessário Node.js 22 ou superior e pnpm 10. Depois de clonar o repositório:

```bash
pnpm install
pnpm run build:external
pnpm exec vite preview --host
```

Para desenvolvimento rápido, pode ser usado `pnpm exec vite --host`. O build destinado a alojamento externo é sempre `pnpm run build:external`; ele usa `vite.external.config.ts` e gera os ficheiros em `dist/public`.

## Publicação

O repositório inclui `.github/workflows/deploy-pages.yml`. No GitHub, abre **Settings → Pages**, seleciona **GitHub Actions** como fonte e faz push para `main`. O workflow instala as dependências, executa o build externo e publica `dist/public` no GitHub Pages.

Também é possível importar o repositório no Cloudflare Pages usando:

| Definição | Valor |
|---|---|
| Framework | Vite |
| Build command | `pnpm run build:external` |
| Output directory | `dist/public` |
| Node.js | `22` |

Depois da primeira abertura online no Safari, adiciona a página ao Ecrã Principal. A aplicação instalada poderá ser usada sem rede; os dados e o histórico continuam locais ao dispositivo e ao domínio publicado.

## IA opcional

O tracker funciona sem IA. Se for adicionada uma camada de IA online, as chaves devem permanecer num servidor externo seguro, nunca no código React nem em variáveis `VITE_*`. Um servidor externo pode expor apenas um endpoint protegido, aplicar limites e encaminhar pedidos para o provedor escolhido. A PWA deve continuar a oferecer orientação local quando não houver Internet.

## Licença e privacidade

O repositório é público para facilitar a publicação e a instalação. Não devem ser adicionados ficheiros `.env`, tokens, cookies, dados pessoais ou credenciais. Os registos académicos são guardados localmente no navegador do utilizador; a limpeza e a exportação são controladas na própria aplicação.
