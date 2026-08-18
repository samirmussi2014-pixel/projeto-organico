# 🚀 Próximos Passos - Ativação WhatsApp e Deploy

## 1️⃣ AGORA: Autorizar número no Meta Business

### ⏱️ Tempo: ~2 minutos

1. Abra **https://business.facebook.com**
2. Clique em **WhatsApp** (menu esquerdo)
3. Clique em **Configurações** / **Settings**
4. Na aba **Números de telefone** / **Phone Numbers**, procure por:
   - "Números autorizados" ou "Approved Recipients"
   - "Lista de destinatários permitidos" ou "Allowed Recipients List"
5. Clique **Adicionar** / **Add**
6. Cole ou digite: `5562986369013`
7. Se pedir verificação, clique **Verificar** (pode levar 1-5 min)
8. Após aprovação, **Salve**

**⚠️ Importante:** Use exatamente esse número, sem espaços ou formatação.

---

## 2️⃣ TESTAR: Validar envio após autorização

### ⏱️ Tempo: ~1 minuto

Após o número ser aprovado no Meta, execute:

```powershell
cd "c:/Users/SnyX/Downloads/projeto organico divulgaçao mussi fretes"
npm run automation:once
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "notification": {
    "status": "sent",
    "to": "5562986369013",
    "message": "Mussi Fretes: automação..."
  }
}
```

**Se receber `"status": "sent"` → ✅ WhatsApp pronto**

---

## 3️⃣ DEPLOY: Railway (opcional agora, necessário para produção)

### ⏱️ Tempo: ~10 minutos

Se quiser hospedar o backend:

1. Abra **https://railway.app**
2. Clique **New Project**
3. Selecione **Deploy from GitHub**
4. Conecte seu repositório do projeto
5. Railway detectará `railway.json` automaticamente
6. Vá em **Variables** e copie de `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `WHATSAPP_API_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_TO`
7. **Deploy**
8. Copie a URL pública (ex: `https://proj.up.railway.app`)
9. Teste: `https://proj.up.railway.app/health`

Ver [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md) para instruções completas.

---

## 4️⃣ CONECTAR: ChatGPT Sites ao backend

### ⏱️ Tempo: ~5 minutos (após deploy no Railway)

Se estiver usando ChatGPT Sites:

1. No seu site customizado, configure a URL do backend:
   ```
   https://SEU-SERVICO.up.railway.app
   ```

2. Use o webhook:
   ```
   POST https://SEU-SERVICO.up.railway.app/webhook/automation
   ```

3. Ative a automação via `app_settings.modo_operacao` no Supabase

---

## ✅ Checklist Final

- [ ] Número `5562986369013` adicionado à lista permitida no Meta
- [ ] `npm run automation:once` retorna `"status": "sent"`
- [ ] (Opcional) Backend deployado no Railway
- [ ] (Opcional) Webhook conectado no ChatGPT Sites

---

## 📱 Status Atual

| Componente | Status | Ação |
|-----------|--------|------|
| Backend automação | ✅ Online | Aguardando | 
| WhatsApp autenticação | ✅ OK | Autorizar número |
| Supabase | ✅ Conectado | - |
| Deploy Railway | 📋 Pronto | Fazer quando quiser |
| ChatGPT Sites | 📋 Pronto | Configurar URL |

---

## 💡 Dicas

- **Teste local:** `npm run automation:server` mant o servidor rodando e monitora execuções a cada 5 min
- **Teste único:** `npm run automation:once` executa uma vez e sai
- **Resetar porta:** `npm run automation:server:reset` se precisar liberar porta 3001
- **Logs:** Você verá todas as mensagens do WhatsApp em JSON nos logs (sucesso ou erro)

---

**Começar agora:** Siga o Passo 1️⃣ e depois volte para testar! 🎯
