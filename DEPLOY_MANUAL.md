# 🚀 Deploy Railway - Passo a Passo Manual

## ⚠️ Primeiro: Instalar Git (se necessário)

Se o comando `git --version` não funcionar, instale:

**Windows:**
1. Abra https://git-scm.com/download/win
2. Baixe o instalador (versão mais recente)
3. Instale com as configurações padrão
4. Reinicie o PowerShell após instalação
5. Verifique: `git --version`

---

## PASSO 1: Preparar GitHub

### 1.1 Criar repositório no GitHub
1. Abra https://github.com
2. Clique **Sign In** ou **Sign Up** (crie conta se não tiver)
3. Clique **+** (canto superior direito)
4. **New repository**
5. Preencha:
   - **Repository name:** `projeto-organico-mussi`
   - **Description:** "Mussi Fretes - Automação leads, cargas, WhatsApp"
   - **Visibility:** Private (recomendado)
   - ❌ Não marque "Initialize this repository with a README"
6. Clique **Create repository**

### 1.2 Copiar URL do repositório
A página mostrará uma URL como:
```
https://github.com/SEU_USERNAME/projeto-organico-mussi.git
```

**Salve essa URL** - você usará em breve!

---

## PASSO 2: Fazer Git Push (PowerShell)

### 2.1 Abra PowerShell e execute estes comandos em ordem:

```powershell
# 1. Ir para a pasta do projeto
cd "c:/Users/SnyX/Downloads/projeto organico divulgaçao mussi fretes"

# 2. Inicializar git
git init

# 3. Configurar seu nome e email
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"

# 4. Adicionar todos os arquivos
git add .

# 5. Fazer primeiro commit
git commit -m "initial: mussi fretes automation backend + whatsapp integration"

# 6. Renomear branch para main (se necessário)
git branch -M main

# 7. Adicionar remote do GitHub (copie a URL exata do passo 1.2)
git remote add origin https://github.com/SEU_USERNAME/projeto-organico-mussi.git

# 8. Fazer push
git push -u origin main
```

### 2.2 Resultado esperado
```
Enumerating objects: 150, done.
...
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **Código enviado para GitHub!**

---

## PASSO 3: Verificar GitHub

Abra no navegador:
```
https://github.com/SEU_USERNAME/projeto-organico-mussi
```

Você deve ver:
- ✅ Pasta `backend/`
- ✅ Pasta `src/`
- ✅ Arquivo `railway.json`
- ✅ Arquivo `package.json`
- ✅ Arquivo `RAILWAY_DEPLOY_CHECKLIST.md`
- ✅ E mais arquivos

---

## PASSO 4: Deploy no Railway

### 4.1 Abra Railway.app
1. https://railway.app
2. **Sign Up** (crie conta gratuita)
3. **New Project**
4. **Deploy from GitHub**

### 4.2 Conectar GitHub com Railway
1. Clique **GitHub** (ou sua opção de login)
2. Railway pedirá acesso ao seu GitHub
3. Clique **Authorize railway-app**
4. Selecione:
   - ✅ Only select repositories
   - ✅ Selecione `projeto-organico-mussi`
5. Clique **Install**

### 4.3 Selecionar repositório no Railway
1. Volta para Railway
2. Clique em `projeto-organico-mussi`
3. Clique **Deploy**
4. Railway fará o build automaticamente

Aguarde 3-5 minutos...

---

## PASSO 5: Configurar Variáveis de Ambiente

### 5.1 No painel do Railway
1. Clique no projeto que foi criado
2. Vá em **Variables** (no menu lateral)
3. Clique **Raw Editor**
4. Cole exatamente isto:

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

5. Clique **Save**

---

## PASSO 6: Testar Deploy

### 6.1 Aguardar conclusão
- Vá em **Deployments**
- Espere status ficar **Success** (✅ verde)

### 6.2 Copiar URL pública
Na aba **Settings** ou **Deployments**, você verá:
```
https://projeto-organico-mussi-prod.up.railway.app
```

### 6.3 Testar health check
Abra no navegador:
```
https://seu-url-railway.up.railway.app/health
```

Resultado esperado:
```json
{"ok":true,"service":"mussi-automation","timestamp":"2026-08-17T..."}
```

✅ **Backend rodando!**

---

## PASSO 7: Monitorar Automação

No Railway:
1. Vá em **Logs**
2. Você verá a automação executando a cada 5 minutos:

```json
{
  "source": "scheduler",
  "status": "ok",
  "counts": { "leads": 1, "palavras_chave": 30 },
  "notification": {
    "status": "sent",
    "to": "5562986369013"
  }
}
```

✅ **WhatsApp enviando notificações!**

---

## 🎯 Resumo do que foi feito

| Etapa | O quê | Onde |
|-------|-------|------|
| 1 | Criar repositório | GitHub.com |
| 2 | Fazer push do código | PowerShell (git push) |
| 3 | Conectar ao Railway | Railway.app (Deploy from GitHub) |
| 4 | Adicionar variáveis | Railway Variables |
| 5 | Testar | Abrir health check no navegador |

---

## 📞 URLs Importantes

- GitHub: `https://github.com/SEU_USERNAME/projeto-organico-mussi`
- Railway: `https://railway.app` (seu projeto)
- Health: `https://seu-url-railway.up.railway.app/health`
- Webhook: `https://seu-url-railway.up.railway.app/webhook/automation`

---

## ✨ Pronto!

Seu backend agora está:
- ✅ Versionado no GitHub
- ✅ Rodando 24/7 no Railway
- ✅ Automação a cada 5 minutos
- ✅ WhatsApp enviando notificações
- ✅ Health check monitorado

🎉 **Deploy completo!**
