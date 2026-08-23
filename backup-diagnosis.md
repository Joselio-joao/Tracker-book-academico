
## Verificação pós-correção

- Após publicar a revisão, o bundle público mudou para `assets/index-BdVXSkCZ.js`, confirmando que a PWA recebeu uma versão nova.
- No navegador público, `fetch()` para o endpoint com `Content-Type: text/plain` chegou ao servidor e devolveu HTTP 401 em modo CORS quando não havia sessão. Isso confirma que o formato sem preflight é suportado publicamente.
- O navegador reportou a resposta como `type: cors`, com corpo JSON legível. Assim, o erro genérico observado no iPhone não é reproduzido sem sessão no navegador de teste.
- O próximo passo é testar a sessão Supabase real no iPhone e, para tornar o diagnóstico independente do Safari, melhorar o cliente para mostrar endpoint/status e oferecer um segundo transporte controlado quando a resposta não chega.
