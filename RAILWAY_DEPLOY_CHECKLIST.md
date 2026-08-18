# 🚀 Deploy no Railway - Checklist Detalhado

## Pré-requisitos
- [ ] Conta no GitHub (seu projeto deve estar versionado)
- [ ] Conta no Railway.app (gratuita)
- [ ] Credenciais do .env disponíveis (já copiadas abaixo)

---

## 📋 PASSO 1: Preparar Repositório GitHub

### 1.1 Fazer commit do projeto
```powershell
cd "c:/Users/SnyX/Downloads/projeto organico divulgaçao mussi fretes"
git add .
git commit -m "feat: deploy backend automation + whatsapp integration"
git push origin main
```

Se o repositório não existir ainda:
```powershell
git init
git add .
git commit -m "initial: mussi fretes automation backend"
git remote add origin https://github.com/SEU_USER/projeto-organico.git
git push -u origin main
```

---

## 🚂 PASSO 2: Railway Setup

### 2.1 Acessar Railway
1. Abra https://railway.app
2. Clique **Sign Up** ou **Login**
3. Conecte com GitHub

### 2.2 Criar novo projeto
1. Clique **New Project**
2. Selecione **Deploy from GitHub**
3. Procure por seu repositório: `projeto-organico...` (ou similar)
4. Clique em **Deploy now**

### 2.3 Railway criará automaticamente o build
- Detectará `package.json` e `railway.json`
- Build começará automaticamente
- Aguarde ~3-5 minutos

---

## ⚙️ PASSO 3: Configurar Variáveis de Ambiente

### 3.1 No painel do Railway
1. No projeto recém-criado, clique em **Variables**
2. Clique **Raw Editor** (ou **Add Variable**)
3. Cole estas variáveis exatamente:

```
VITE_SUPABASE_URL=https://adsdgfrbdhjkaubsfban.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2RnZnJiZGhqa2F1YnNmYmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzcwODgsImV4cCI6MjEwMjU1MzA4OH0.pXw3OW3V7_qNd8X_fJut9qjJZqT-y7f2WxBJRQE4hDk
SUPABASE_URL=https://adsdgfrbdhjkaubsfban.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2RnZnJiZGhqa2F1YnNmYmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzcwODgsImV4cCI6MjEwMjU1MzA4OH0.pXw3OW3V7_qNd8X_fJut9qjJZqT-y7f2WxBJRQE4hDk
WHATSAPP_TO=5562986369013
WHATSAPP_API_TOKEN=EAAyZCTyEIEAkBSeqiflaAwOf3YcTrk14ZC3NDPx3ZCNq4q2J6UrgXZAoIZA3z8GPZArZAe6cgfZAiUbOuIVO4hnCJOfn7hrqQ02XGVwi6NdQf61rK9rBOMupKMpFU48ZChg38tHZAOx6L8PPYFmk4bHmdLvAG3p281nZBLmN7bKY2T26zIZBc5XxmRHWB8nwBmnQfoXVqPZAqAbDFXj9zERT8vo9oAbE0kIhqvjpURum3LzhRiZBrEIuXlxzTU6qibvk4ttnp0CvR4oqEofWgrJ5XlsTtQ
WHATSAPP_PHONE_NUMBER_ID=1317299671463717
WHATSAPP_ENABLED=true
PORT=3001
AUTOMATION_INTERVAL_MINUTES=5
AUTOMATION_SCHEDULER=true
AUTOMATION_WEBHOOK_URL=
```

4. Clique **Save**

---

## ✅ PASSO 4: Verificar Deploy

### 4.1 Aguardar conclusão
1. No Railway, vá em **Deployments**
2. Aguarde status **Success** (verde)
3. Copie a **URL pública** no formato:
   ```
   https://SEU-PROJETO.up.railway.app
   ```

### 4.2 Testar health endpoint
```powershell
$url = "https://SEU-PROJETO.up.railway.app/health"
$response = Invoke-WebRequest -Uri $url -UseBasicParsing
$response.Content
```

Resultado esperado:
```json
{"ok":true,"service":"mussi-automation","timestamp":"2026-08-17T..."}
```

### 4.3 Testar webhook
```powershell
$url = "https://SEU-PROJETO.up.railway.app/webhook/automation"
$body = @{
  "source" = "test-railway"
  "dryRun" = $true
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

---

## 📲 PASSO 5: Testar WhatsApp em Produção

### 5.1 Fazer chamada HTTP ao webhook
```powershell
$url = "https://SEU-PROJETO.up.railway.app/webhook/automation"
$body = @{
  "source" = "railway-test"
  "dryRun" = $false
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
$response.Content
```

Resultado esperado:
```json
{
  "ok": true,
  "result": {
    "notification": {
      "status": "sent",
      "to": "5562986369013"
    }
  }
}
```

---

## 🔗 PASSO 6: Integração com ChatGPT Sites (Opcional)

Se estiver usando ChatGPT Sites:

### 6.1 Configurar no frontend
No seu site customizado, use:
```
Backend URL: https://SEU-PROJETO.up.railway.app
Webhook: https://SEU-PROJETO.up.railway.app/webhook/automation
```

### 6.2 Ativar automação via Supabase
```sql
UPDATE app_settings 
SET modo_operacao = 'AUTONOMO' 
WHERE id = 1;
```

Valores válidos:
- `OBSERVACAO` = não executa
- `ASSISTIDO` = executa, aguarda aprovação
- `AUTONOMO` = executa automaticamente

---

## 📊 Status do Railway

### Monitorar logs
1. No Railway, clique em **Logs**
2. Você verá automação rodando a cada 5 minutos:
   ```json
   {
     "source": "scheduler",
     "status": "ok",
     "counts": { "leads": 1, "cargas": 0, ... },
     "notification": { "status": "sent", ... }
   }
   ```

### Métricas
- Na aba **Metrics**, veja uso de CPU/memória/banda

---

## ✨ Pronto!

Seu backend agora está rodando 24/7 no Railway:
- ✅ Automação a cada 5 minutos
- ✅ WhatsApp enviando notificações
- ✅ Webhook disponível publicamente
- ✅ Health check monitorado

---

## 🆘 Troubleshooting

### Build falhou
- Abra os **Logs** do Railway e veja a mensagem de erro
- Comum: variáveis de ambiente faltando (cheque se todas foram adicionadas)

### WhatsApp não envia
- Verifique se o número foi autorizado na Meta (passo final do documento anterior)
- Teste local com `npm run automation:once` primeiro

### Conexão com Supabase falha
- Verifique URLs e keys (cópia exata do .env)
- Teste ping: abra Supabase Dashboard e confirme acesso

---

**Próximo passo após deploy:**
1. Confirmar URL pública do Railway
2. Testar `/health` endpoint
3. Deixar rodando 24/7 ✅
