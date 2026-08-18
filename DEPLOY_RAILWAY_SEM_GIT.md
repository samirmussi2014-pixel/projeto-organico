# 🚀 Deploy no Railway - Sem Git

## ⚡ Método Rápido (SEM Git necessário)

Se Git não está instalado, use este método:

---

## PASSO 1: Preparar Arquivos para Upload

### 1.1 Criar arquivo ZIP do projeto
1. Abra o Windows Explorer
2. Vá para: `c:\Users\SnyX\Downloads\projeto organico divulgaçao mussi fretes`
3. Selecione TUDO (Ctrl+A)
4. Clique com botão direito → **Enviar para** → **Pasta compactada**
5. Renomeie para: `mussi-fretes-backend.zip`

---

## PASSO 2: Railway Setup (Sem GitHub)

### 2.1 Criar conta no Railway
1. Abra https://railway.app
2. Clique **Sign Up**
3. Use GitHub, Google ou email
4. Confirme email

### 2.2 Criar novo projeto
1. Na dashboard, clique **New Project**
2. Clique **Deploy from Repo** (ou **GitHub**)
3. Se pedir GitHub:
   - Clique **Skip for now** (não obrigatório)
   - Ou copie/cole este repositório: https://github.com/railwayapp/starters

### 2.3 Alternativa: Upload direto (mais rápido)
1. Na dashboard, clique **New Project**
2. Selecione **Node.js** ou **Empty Service**
3. Clique **Deploy**

---

## PASSO 3: Configurar Serviço

### 3.1 Na dashboard do Railway
1. Seu projeto foi criado
2. Clique nele para abrir
3. Vá em **Services** → **New Service**
4. Selecione **Node.js**

### 3.2 Upload de arquivos (se não usou GitHub)
1. Clique no serviço
2. Vá em **Source**
3. Clique **Upload from local**
4. Selecione o arquivo `mussi-fretes-backend.zip`
5. Aguarde upload (2-3 min)

### 3.3 Configurar start command
1. No serviço, vá em **Deploy**
2. Procure por **Start Command**
3. Coloque: `npm start`
4. Salve

---

## PASSO 4: Adicionar Variáveis de Ambiente

### 4.1 No painel do Railway
1. Clique no seu serviço
2. Vá em **Variables**
3. Clique **Raw Editor**
4. Cole exatamente isto:

```env
VITE_SUPABASE_URL=https://adsdgfrbdhjkaubsfban.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2RnZnJiZGhqa2F1YnNmYmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzcwODgsImV4cCI6MjEwMjU1MzA4OH0.pXw3OW3V7_qNd8X_fJut9qjJZqT-y7f2WxBJRQE4hDk
SUPABASE_URL=https://adsdgfrbdhjkaubsfban.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2RnZnJiZGhqa2F1YnNmYmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzcwODgsImV4cCI6MjEwMjU1MzA4OH0.pXw3OW3V7_qNd8X_fJut9qjJZqT-y7f2WxBJRQE4hDk
WHATSAPP_TO=5562986369013
WHATSAPP_API_TOKEN=EAAyZCTyEIEAkBSeqiflaAwOf3YcTrk14ZC3NDPx3ZCNq4q2J6UrgXZAoIZA3z8GPZArZAe6cgfZAiUbOuIVO4hnCJOfn7hrqQ02XGVwi6NdQf61rK9rBOMupKMpFU48ZChg38tHZAOx6L8PPYFmk4bHmdLvAG3p281nZBLmN7bKY2T26zIZBc5XxmRHWB8nwBmnQfoXVqPZAqAbDFXj9zERT8vo9oAbE0kIhqvjpURum3LzhRiZBrEIuXlxzTU6qibvk4ttnp0CvR4oqEofWgrJ5XlsTtQ
WHATSAPP_PHONE_NUMBER_ID=1317299671463717
WHATSAPP_ENABLED=true
INSTAGRAM_API_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
INSTAGRAM_RECIPIENT_ID=
FACEBOOK_API_TOKEN=
FACEBOOK_PAGE_ID=
FACEBOOK_RECIPIENT_ID=
WEBHOOK_VERIFY_TOKEN=mussi-fretes-webhook-token-2026
PORT=3001
AUTOMATION_INTERVAL_MINUTES=5
AUTOMATION_SCHEDULER=true
AUTOMATION_WEBHOOK_URL=
```

5. Clique **Save Variables**

---

## PASSO 5: Iniciar Deploy

### 5.1 Na dashboard
1. Clique no serviço
2. Vá em **Deployments**
3. Clique **Deploy**
4. Aguarde 3-5 minutos (status fica verde quando pronto)

### 5.2 Ver logs
1. Clique em **Logs**
2. Você deve ver:
   ```
   Automation webhook server listening on http://localhost:3001
   Automation scheduler started. Next run every 5 minutes.
   ```

---

## PASSO 6: Obter URL Pública

### 6.1 No Railway
1. Serviço → **Settings** ou **Domains**
2. Copie a URL pública (ex: `https://projeto.up.railway.app`)

### 6.2 Testar health check
Abra no navegador:
```
https://seu-url-railway.up.railway.app/health
```

Você deve ver:
```json
{
  "ok": true,
  "service": "mussi-automation",
  "channels": {
    "whatsapp": { "configured": true }
  }
}
```

✅ **Pronto!** Backend está rodando 24/7 no Railway

---

## 📊 Dashboard Após Deploy

Você verá:

```
┌─ Railway Dashboard
├─ Seu Projeto
│  ├─ Services (1)
│  │  └─ mussi-fretes-backend
│  │     ├─ Status: Running ✅
│  │     ├─ URL: https://xxx.up.railway.app
│  │     ├─ Logs: automação a cada 5 min
│  │     └─ Metrics: CPU/Memória
│  └─ Variables (ativo)
│     └─ 20 variáveis de ambiente
```

---

## 🔗 Endpoints Disponíveis

### Health Check
```
GET https://seu-url.up.railway.app/health
```
Retorna: Status omnichannel

### Webhook de Automação
```
POST https://seu-url.up.railway.app/webhook/automation
```
Body: `{ "source": "manual", "dryRun": false }`

### Webhook do Meta Business
```
GET/POST https://seu-url.up.railway.app/webhook/meta
```
Recebe: Mensagens de WhatsApp, Instagram, Facebook

---

## 📝 Checklist Final

- [ ] Projeto em ZIP criado
- [ ] Conta Railway criada
- [ ] Serviço Node.js criado
- [ ] Arquivo ZIP feito upload
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy iniciado
- [ ] Status fica verde ✅
- [ ] Health check respondendo
- [ ] Logs mostram "Automation webhook server listening"

---

## 🚨 Se Algo der Erro

### Build failed
1. Vá em **Logs**
2. Procure por "ERROR" ou "failed"
3. Comum: faltam variáveis de ambiente

### Porta já em uso
1. Railway usa porta dinâmica automaticamente
2. Não precisa fazer nada

### Webhook não responde
1. Aguarde 2 minutos após deploy
2. Teste health check novamente
3. Veja os Logs para erros

### Automação não dispara
1. Verifique `AUTOMATION_SCHEDULER=true`
2. Veja os Logs para mensagens de erro
3. Confirme conexão com Supabase

---

## 🎯 Após Deploy Bem-Sucedido

1. **Configurar webhooks** no Meta Business:
   - Apontar para: `https://seu-url.up.railway.app/webhook/meta`
   - Verify token: `mussi-fretes-webhook-token-2026`

2. **Conectar ChatGPT Sites**:
   - Frontend continua usando Supabase direto
   - Backend em: `https://seu-url.up.railway.app`

3. **Adicionar Instagram/Facebook**:
   - Preencher IDs no Railway Variables
   - Omnichannel ativa automaticamente

---

**Seu backend está rodando 24/7 na nuvem!** 🚀
