# 📱 Integração Omnichannel - WhatsApp + Instagram + Facebook

## 🎯 Objetivo
Conectar agente com múltiplos canais:
- ✅ WhatsApp Business (já configurado)
- 🔲 Instagram Direct Messages (DMs)
- 🔲 Facebook Messenger (página Mussi Fretes Brasil)
- 🔲 Webhooks para receber mensagens

---

## 📊 Arquitetura

```
Meta Business Manager
├── WhatsApp Business Account
│   ├── Phone Number ID: 1317299671463717 ✅
│   └── Token: EAAyZCT... ✅
├── Instagram Business Account
│   ├── Business Account ID: (obtém abaixo)
│   └── Token: (obtém abaixo)
└── Facebook Page (Mussi Fretes Brasil)
    ├── Page ID: (obtém abaixo)
    └── Token: (obtém abaixo)
        ↓
   Backend (Node.js)
   ├── /webhook/meta (GET/POST)
   ├── /webhook/automation
   └── /health
        ↓
   Supabase + Automação
```

---

## ✅ PASSO 1: Meta Business Setup

### 1.1 Abrir Meta Business Manager
1. Acesse https://business.facebook.com
2. Login com a conta que gerencia o WhatsApp Business
3. Clique em **Configurações** (canto inferior esquerdo)

### 1.2 Verificar WhatsApp Business Account
1. Vá em **Contas** > **Contas do WhatsApp Business**
2. Confirme que o número `(62) 986369013` está listado
3. Clique no número para abrir detalhes
4. Copie e verifique:
   - **Phone Number ID:** `1317299671463717` ✅
   - **Business Account ID:** `(copie este valor)`

### 1.3 Conectar Instagram Business Account
1. Vá em **Contas** > **Contas do Instagram**
2. Se não tiver conta Instagram Business conectada:
   - Clique **Adicionar**
   - Selecione sua conta Instagram pessoal ou crie uma nova
   - Siga os passos para converter para Business (se necessário)
3. Após conectar, anote:
   - **Instagram Business Account ID:** `(copie este valor)`
   - **Instagram Business Account Email:** (deve ser profissional)

### 1.4 Conectar Página Facebook (Mussi Fretes Brasil)
1. Vá em **Contas** > **Páginas do Facebook**
2. Se a página "Mussi Fretes Brasil" não estiver listada:
   - Clique **Adicionar**
   - Procure pela página existente ou crie nova
   - Autorize acesso
3. Após conectar, anote:
   - **Facebook Page ID:** `(copie este valor)`
   - **Facebook Page URL:** `https://facebook.com/mussi-fretes-brasil` (ou similar)

---

## 🔑 PASSO 2: Gerar Tokens de Acesso

### 2.1 Token de Acesso Longo Prazo (recomendado)
1. No Meta Business Manager, vá em **Configurações** > **Dados de acesso**
2. Clique em **Gerar token de acesso**
3. Selecione a aplicação (WhatsApp Business ou crie uma nova)
4. Permissões necessárias:
   - ✅ `whatsapp_business_messaging`
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_messages`
   - ✅ `pages_manage_messaging`
   - ✅ `pages_read_engagement`
5. Gere o token
6. **Copie e salve** (válido por até 5 anos)

### 2.2 Formato do Token
Seu token terá este formato:
```
EAAyZCTyEIEAk... (muito longo, 200+ caracteres)
```

---

## 📝 PASSO 3: Preencher Variáveis de Ambiente

Abra o arquivo [.env](.env) e preencha:

```env
# WhatsApp (já preenchido)
WHATSAPP_TO=5562986369013
WHATSAPP_API_TOKEN=EAAyZCTyEIEAkBSeqiflaAwOf3YcTrk14ZC3NDPx3ZCNq4q2J6UrgXZAoIZA3z8GPZArZAe6cgfZAiUbOuIVO4hnCJOfn7hrqQ02XGVwi6NdQf61rK9rBOMupKMpFU48ZChg38tHZAOx6L8PPYFmk4bHmdLvAG3p281nZBLmN7bKY2T26zIZBc5XxmRHWB8nwBmnQfoXVqPZAqAbDFXj9zERT8vo9oAbE0kIhqvjpURum3LzhRiZBrEIuXlxzTU6qibvk4ttnp0CvR4oqEofWgrJ5XlsTtQ
WHATSAPP_PHONE_NUMBER_ID=1317299671463717

# Instagram (preencheria com os valores do Meta Business)
INSTAGRAM_API_TOKEN=SEU_TOKEN_DE_ACESSO (igual ao WHATSAPP_API_TOKEN ou novo)
INSTAGRAM_BUSINESS_ACCOUNT_ID=123456789012345 (copie do Meta Business)
INSTAGRAM_RECIPIENT_ID=recipient.instagram.id (ID do seu perfil ou contato)

# Facebook (preencheria com os valores do Meta Business)
FACEBOOK_API_TOKEN=SEU_TOKEN_DE_ACESSO (igual ao WHATSAPP_API_TOKEN ou novo)
FACEBOOK_PAGE_ID=987654321098765 (copie do Meta Business)
FACEBOOK_RECIPIENT_ID=recipient.facebook.id (ID da pessoa para receber mensagens)

# Webhook
WEBHOOK_VERIFY_TOKEN=mussi-fretes-webhook-token-2026 (pode customizar)
```

---

## 🔗 PASSO 4: Configurar Webhooks no Meta

### 4.1 Ativar Webhook no WhatsApp Business
1. No Meta Business, vá em **WhatsApp** > **Configuração**
2. Procure por **Webhooks** ou **Callback URL**
3. Clique **Editar**
4. Preencha:
   - **Callback URL:** `https://seu-url-railway.up.railway.app/webhook/meta`
   - **Verify Token:** `mussi-fretes-webhook-token-2026`
5. Clique **Verificar e Salvar**
6. Meta enviará um GET com `hub.challenge` - nosso servidor responde automaticamente ✓

### 4.2 Inscrever-se em eventos
1. Procure por **Webhook Fields** ou **Subscribe to**
2. Marque as caixas:
   - ✅ `messages` (receber mensagens)
   - ✅ `message_template_status_update`
   - ✅ `message_echo`
3. Clique **Salvar**

### 4.3 Ativar Webhook no Instagram (se usar DMs)
1. Vá em **Instagram** > **Configuração**
2. Procure por **Webhooks**
3. Repita os passos 4.1 e 4.2
4. Eventos a marcar:
   - ✅ `messaging`
   - ✅ `message_reads`

### 4.4 Ativar Webhook no Facebook Messenger
1. Vá em **Aplicações** > **Seu App** > **Messenger** > **Configuração**
2. Procure por **Webhook**
3. Repita os passos 4.1 e 4.2
4. Eventos a marcar:
   - ✅ `messages`
   - ✅ `messaging_postbacks`

---

## 🎯 PASSO 5: Testar Integração

### 5.1 Testar localmente
```powershell
cd "c:/Users/SnyX/Downloads/projeto organico divulgaçao mussi fretes"

# Verificar status dos canais
npm run automation:once

# Ver resposta esperada
{
  "notification": {
    "timestamp": "2026-08-17T...",
    "channels": [
      {
        "channel": "whatsapp",
        "status": "sent",
        "to": "5562986369013"
      },
      {
        "channel": "instagram",
        "status": "skipped|sent|failed",
        ...
      },
      {
        "channel": "facebook",
        "status": "skipped|sent|failed",
        ...
      }
    ]
  }
}
```

### 5.2 Testar webhook de recebimento
1. Envie uma mensagem para:
   - Número WhatsApp: (62) 986369013
   - DM Instagram: seu perfil
   - Mensagem Facebook: sua página
2. Verifique os logs do Railway:
   ```
   WhatsApp message from 5562986369013: (texto da mensagem)
   Instagram message from 123456789: (texto da mensagem)
   ```

### 5.3 Verificar health check
```powershell
Invoke-WebRequest -Uri "https://seu-url-railway.up.railway.app/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

Resultado esperado:
```json
{
  "ok": true,
  "service": "mussi-automation",
  "channels": {
    "whatsapp": {
      "configured": true,
      "recipientPhone": "5562986369013"
    },
    "instagram": {
      "configured": false,
      "recipientId": "não configurado"
    },
    "facebook": {
      "configured": false,
      "recipientId": "não configurado"
    }
  }
}
```

---

## 📋 Checklist de Configuração

### WhatsApp
- [ ] Número `(62) 986369013` verificado no Meta
- [ ] Token configurado em `.env` (já está)
- [ ] Phone Number ID verificado (já está)
- [x] WhatsApp testado e funcionando

### Instagram
- [ ] Business Account criada/conectada
- [ ] Business Account ID copiado
- [ ] Instagram Recipient ID obtido (seu ID ou contato)
- [ ] Token configurado em `.env`
- [ ] Webhook ativado no Meta
- [ ] Testado envio de DM

### Facebook
- [ ] Página "Mussi Fretes Brasil" conectada
- [ ] Page ID copiado
- [ ] Facebook Recipient ID obtido
- [ ] Token configurado em `.env`
- [ ] Webhook ativado no Meta
- [ ] Testado envio de mensagem

### Backend
- [ ] Arquivo `omnichannel.js` criado ✓
- [ ] Arquivo `automation.js` atualizado ✓
- [ ] Arquivo `automation-server.js` atualizado ✓
- [ ] `.env` atualizado ✓
- [ ] Teste local: `npm run automation:once`
- [ ] Deploy no Railway com variáveis
- [ ] Webhook respondendo em `/webhook/meta`

---

## 🔍 Encontrar IDs no Meta Business

### Instagram Business Account ID
1. Business Manager > Contas > Contas do Instagram
2. Clique na conta
3. URL da página: `https://business.facebook.com/settings/instagram-accounts/123456789...`
4. O número na URL é o ID

### Facebook Page ID
1. Business Manager > Contas > Páginas do Facebook
2. Clique na página
3. URL: `https://business.facebook.com/settings/pages/987654321...`
4. O número é o Page ID

### Recipient ID (seu ID pessoal)
1. Para WhatsApp: seu número de telefone formatado
2. Para Instagram: `https://www.instagram.com/seu_usuario/` > copie o número no perfil (ou use `instagram:user_id`)
3. Para Facebook: seu ID pessoal do Facebook

---

## 📊 Estrutura de Mensagens

### WhatsApp
```json
{
  "messaging_product": "whatsapp",
  "to": "5562986369013",
  "type": "text",
  "text": { "body": "Sua mensagem aqui" }
}
```

### Instagram
```json
{
  "recipient": { "id": "123456789" },
  "message": { "text": "Sua mensagem aqui" }
}
```

### Facebook Messenger
```json
{
  "recipient": { "id": "987654321" },
  "message": { "text": "Sua mensagem aqui" }
}
```

---

## 🚀 Deploy no Railway com Omnichannel

Após configurar tudo, atualize as variáveis no Railway:

1. Railway Dashboard > Seu Projeto > **Variables**
2. Adicione/atualize:
   ```
   INSTAGRAM_API_TOKEN=...
   INSTAGRAM_BUSINESS_ACCOUNT_ID=...
   INSTAGRAM_RECIPIENT_ID=...
   FACEBOOK_API_TOKEN=...
   FACEBOOK_PAGE_ID=...
   FACEBOOK_RECIPIENT_ID=...
   WEBHOOK_VERIFY_TOKEN=mussi-fretes-webhook-token-2026
   ```
3. Salve e Railway fará redeploy automaticamente

---

## 🆘 Troubleshooting

### Webhook não verifica
- Verifique o `WEBHOOK_VERIFY_TOKEN` é exatamente igual nos dois lados
- Cheque se a URL está correta: `https://seu-url.up.railway.app/webhook/meta`
- Veja os logs do Railway para mensagens de erro

### Mensagens não enviam para Instagram/Facebook
- Confirme Business Account conectada no Meta Business
- Verifique se o Recipient ID está correto
- Teste com `npm run automation:once` localmente
- Veja a resposta exata do erro na saída JSON

### Não recebe mensagens dos clientes
- Confirme webhook está ativado no Meta para cada plataforma
- Teste com: `curl -X POST https://seu-url/webhook/meta` manualmente
- Veja os logs: `railway logs -f` ou painel de Logs

---

## 📞 Resumo de Endpoints

| Endpoint | Método | Propósito |
|----------|--------|----------|
| `/health` | GET | Status dos canais omnichannel |
| `/webhook/meta` | GET | Verificação do Meta (challenge) |
| `/webhook/meta` | POST | Receber mensagens de todos os canais |
| `/webhook/automation` | POST | Dispara ciclo de automação |

---

**Próximo passo:** Preencher as variáveis de ambiente com os IDs do Meta Business e testar! 🚀
