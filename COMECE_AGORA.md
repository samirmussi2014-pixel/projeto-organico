# 🚀 Começar Agora - Teste Omnichannel

## 3️⃣ Etapas para Ativar Omnichannel

### ✅ Etapa 1: Obter IDs do Meta (5 min)

Siga este guia:
→ [OBTER_IDS_META.md](OBTER_IDS_META.md)

**Você vai copiar:**
1. `INSTAGRAM_BUSINESS_ACCOUNT_ID` (15 dígitos)
2. `INSTAGRAM_RECIPIENT_ID` (seu username)
3. `FACEBOOK_PAGE_ID` (15 dígitos)
4. `FACEBOOK_RECIPIENT_ID` (seu ID)

---

### ✅ Etapa 2: Preencher .env (2 min)

Abra [.env](.env) e preencha:

```env
# Já temos ✓
WHATSAPP_TO=5562986369013
WHATSAPP_API_TOKEN=EAAyZCTyEIEAkBSeqiflaAwOf3YcTrk14ZC3NDPx3ZCNq4q2J6UrgXZAoIZA3z8GPZArZAe6cgfZAiUbOuIVO4hnCJOfn7hrqQ02XGVwi6NdQf61rK9rBOMupKMpFU48ZChg38tHZAOx6L8PPYFmk4bHmdLvAG3p281nZBLmN7bKY2T26zIZBc5XxmRHWB8nwBmnQfoXVqPZAqAbDFXj9zERT8vo9oAbE0kIhqvjpURum3LzhRiZBrEIuXlxzTU6qibvk4ttnp0CvR4oqEofWgrJ5XlsTtQ
WHATSAPP_PHONE_NUMBER_ID=1317299671463717
WHATSAPP_ENABLED=true

# ← PREENCHER COM IDS DO META
INSTAGRAM_API_TOKEN=EAAyZCTyEIEAkBSeqiflaAwOf3YcTrk14ZC3NDPx3ZCNq4q2J6UrgXZAoIZA3z8GPZArZAe6cgfZAiUbOuIVO4hnCJOfn7hrqQ02XGVwi6NdQf61rK9rBOMupKMpFU48ZChg38tHZAOx6L8PPYFmk4bHmdLvAG3p281nZBLmN7bKY2T26zIZBc5XxmRHWB8nwBmnQfoXVqPZAqAbDFXj9zERT8vo9oAbE0kIhqvjpURum3LzhRiZBrEIuXlxzTU6qibvk4ttnp0CvR4oqEofWgrJ5XlsTtQ
INSTAGRAM_BUSINESS_ACCOUNT_ID=???????????????
INSTAGRAM_RECIPIENT_ID=seu_username_instagram

FACEBOOK_API_TOKEN=EAAyZCTyEIEAkBSeqiflaAwOf3YcTrk14ZC3NDPx3ZCNq4q2J6UrgXZAoIZA3z8GPZArZAe6cgfZAiUbOuIVO4hnCJOfn7hrqQ02XGVwi6NdQf61rK9rBOMupKMpFU48ZChg38tHZAOx6L8PPYFmk4bHmdLvAG3p281nZBLmN7bKY2T26zIZBc5XxmRHWB8nwBmnQfoXVqPZAqAbDFXj9zERT8vo9oAbE0kIhqvjpURum3LzhRiZBrEIuXlxzTU6qibvk4ttnp0CvR4oqEofWgrJ5XlsTtQ
FACEBOOK_PAGE_ID=???????????????
FACEBOOK_RECIPIENT_ID=123456789
```

---

### ✅ Etapa 3: Testar (1 min)

```powershell
cd "c:/Users/SnyX/Downloads/projeto organico divulgaçao mussi fretes"
npm run automation:once
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "notification": {
    "summary": {
      "sent": 3,           // ← 3 canais enviaram com sucesso!
      "failed": 0,
      "skipped": 0
    },
    "channels": [
      { "channel": "whatsapp", "status": "sent" },
      { "channel": "instagram", "status": "sent" },
      { "channel": "facebook", "status": "sent" }
    ]
  }
}
```

---

## 📱 Você Receberá Mensagens Em:

1. **WhatsApp** (62) 986369013
2. **Instagram DM** (seu_username_instagram)
3. **Mensagem Facebook** (sua página)

Cada uma com:
```
"Mussi Fretes: automação uma-vez concluída. Modo ASSISTIDO. 
Leads 1 | Cargas 0 | Oportunidades N."
```

---

## ⚡ Resultado Esperado

| Canal | Status | Você Recebe |
|-------|--------|-----------|
| WhatsApp | ✅ Enviando | Mensagem no app |
| Instagram | ✅ Enviando | DM no inbox |
| Facebook | ✅ Enviando | Mensagem na página |

---

## 🎯 Depois (Deploy no Railway)

Uma vez testado localmente:

```powershell
git add .
git commit -m "feat: omnichannel activated (instagram + facebook)"
git push origin main
```

Railway fará redeploy automático e omnichannel estará rodando **24/7** ✨

---

## ❓ Se Algo Não Funcionar

**Erro esperado (normal):**
```
INSTAGRAM_RECIPIENT_ID: skipped (não configurado)
FACEBOOK_RECIPIENT_ID: skipped (não configurado)
```
→ Significa que você ainda não preencheu [.env](.env)

**Erro no envio:**
```
"status": "failed",
"httpStatus": 401,
"response": "Invalid access token"
```
→ Token ou ID está errado (copie novamente do Meta)

**Sem receber mensagens:**
- Verifique se o recipient é realmente você
- Teste manualmente enviar mensagem primeiro para ativar a conversa

---

## 📋 Checklist Final

- [ ] Abrir [OBTER_IDS_META.md](OBTER_IDS_META.md)
- [ ] Copiar 4 IDs do Meta Business
- [ ] Editar [.env](.env)
- [ ] Rodar `npm run automation:once`
- [ ] Receber 3 mensagens (WhatsApp, Instagram, Facebook)
- [ ] Fazer git push
- [ ] Atualizar Railway com novas variáveis
- [ ] ✅ Omnichannel rodando em produção

---

**Começar agora:** Abra [OBTER_IDS_META.md](OBTER_IDS_META.md) e siga os passos! 🚀
