# 🚀 Deploy no Railway - Passo a Passo

## ✅ Status Atual

- ✅ Código commitado no GitHub
- ✅ Repositório: https://github.com/samirmussi2014-pixel/projeto-organico
- ✅ WhatsApp operacional localmente
- ⏳ Railway: Pronto para deploy

---

## 📋 Passo 1: Abrir Railway

1. Acesse: **https://railway.app**
2. Faça login com sua conta (pode usar GitHub)

---

## 📋 Passo 2: Criar Novo Projeto

1. Clique **New Project**
2. Clique **Deploy from GitHub**
3. Selecione sua conta GitHub e autorize se pedido

---

## 📋 Passo 3: Selecionar Repositório

1. Procure por: **projeto-organico**
2. Clique nele
3. Railway detectará o arquivo `railway.json` automaticamente

---

## 📋 Passo 4: Configurar Variáveis de Ambiente

Railway mostrará um formulário. Preencha com:

```env
# Supabase
VITE_SUPABASE_URL=https://adsdgfrbdhjkaubsfban.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2RnZnJiZGhqa2F1YnNmYmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzcwODgsImV4cCI6MjEwMjU1MzA4OH0.pXw3OW3V7_qNd8X_fJut9qjJZqT-y7f2WxBJRQE4hDk

# WhatsApp (✅ Já configurado)
WHATSAPP_TO=5562986369013
WHATSAPP_API_TOKEN=EAAyZCTyEIEAkBSURUwrUVT59ccciY9kZAxGVEG8o5c14bk6YrC1At0R0jApxMvpGuMIsJlZC7D12eJB5ZAPFD1OpxiljytJz6e3RI62SnNw8ZCIZBnLFu63R5TvulKMZBpWRmkS9aL7ZAnTBwSyJJgZBknRbv814JaCW2W9dRG97XPvIRomK3iHSyq2FeEM2pgRSeUaPTBlteH0Nl4ZAN3l4akmliZCdiuorsZBsZB8B5JlZCso0YbjgjOr2vGuAkyBYzmGK0hmqftN69iiD7mb91XZAriY
WHATSAPP_PHONE_NUMBER_ID=1317299671463717
WHATSAPP_ENABLED=true

# Instagram
INSTAGRAM_API_TOKEN=EAAyZCTyEIEAkBSTRSlnbcQwvrrOAWKbV75ZCHSm503HqNrizsS6AicKGDNG7afygqPZCd0ffFqNgk4PcB3MYg416jKXcEUSb6aOc6ZB9tyYLgvBAiQoZBxg6bEODAmYHZC5aaZAEOXb0exP0ICHBlR0KknOKbt2aW3R0oixH7PZAXXRHi3lSGo4gy1mjXQZAF7DTXlChO3nApK60lyvhPMhfgc6nn4CIqNiSnT0Vw7jtHZBCgWC3dJf27ULTFM7emgwCEDtZATcD7I3v4yzfTJv90uY
INSTAGRAM_BUSINESS_ACCOUNT_ID=2282784092263093
INSTAGRAM_RECIPIENT_ID=mussi_fretesbrasil

# Facebook
FACEBOOK_API_TOKEN=EAAyZCTyEIEAkBSTRSlnbcQwvrrOAWKbV75ZCHSm503HqNrizsS6AicKGDNG7afygqPZCd0ffFqNgk4PcB3MYg416jKXcEUSb6aOc6ZB9tyYLgvBAiQoZBxg6bEODAmYHZC5aaZAEOXb0exP0ICHBlR0KknOKbt2aW3R0oixH7PZAXXRHi3lSGo4gy1mjXQZAF7DTXlChO3nApK60lyvhPMhfgc6nn4CIqNiSnT0Vw7jtHZBCgWC3dJf27ULTFM7emgwCEDtZATcD7I3v4yzfTJv90uY
FACEBOOK_PAGE_ID=2282784092263093
FACEBOOK_RECIPIENT_ID=61588558383289

# Automação
AUTOMATION_SCHEDULER=true
AUTOMATION_INTERVAL_MINUTES=5
WEBHOOK_VERIFY_TOKEN=mussi-fretes-webhook-token-2026
PORT=3001
```

---

## 📋 Passo 5: Deploy

1. Clique **Deploy**
2. Railway começará a:
   - Clonar do GitHub
   - Instalar dependências (`npm install`)
   - Iniciar o servidor (`npm start`)
3. Espere ~3-5 minutos

---

## ✅ Verificar Deploy

Após deploy completar:

### 1. Ver URL Pública
- No Railway, você verá uma URL como:
  ```
  https://projeto-organico-prod.up.railway.app
  ```

### 2. Testar Health Check
```powershell
Invoke-WebRequest -Uri "https://projeto-organico-prod.up.railway.app/health" -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

**Resultado esperado:**
```json
{
  "ok": true,
  "service": "mussi-automation",
  "timestamp": "2026-08-18T...",
  "channels": {
    "whatsapp": { "configured": true, "recipientPhone": "5562986369013" },
    "instagram": { "configured": true, "recipientId": "mussi_fretesbrasil" },
    "facebook": { "configured": true, "recipientId": "61588558383289" }
  }
}
```

### 3. Ver Logs
- No Railway, clique **Logs**
- Você verá mensagens como:
  ```
  Automation scheduler started. Next run every 5 minutes.
  Automation webhook server listening on http://localhost:3001
  ```

### 4. Receber Notificações
A cada 5 minutos, você receberá uma mensagem no WhatsApp:
```
Mussi Fretes: automação scheduler concluída. Modo ASSISTIDO. 
Leads 1 | Cargas 0 | Oportunidades 0.
```

---

## 🔄 Deploy Automático

Sempre que você fizer um **push** no GitHub:
```powershell
git add .
git commit -m "sua mensagem"
git push origin main
```

Railway detectará e refará o deploy **automaticamente** ✨

---

## 🎯 Pronto!

Seu backend está rodando **24/7** na nuvem! 🚀

---

## 📞 Suporte

Se algo não funcionar:

1. **Verificar Logs** no Railway
2. **Testar Health Check** endpoint
3. **Verificar variáveis** de ambiente
4. **Conferir token** do Meta Business (pode ter expirado)

---

**Comece agora:** Acesse https://railway.app e clique em **New Project** 🚀
