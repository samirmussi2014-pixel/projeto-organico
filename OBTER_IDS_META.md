# 🔍 Obter IDs do Meta Business Manager

## Como Localizar Cada ID

### 🟢 Instagram Business Account ID

**Passo 1:** Abra https://business.facebook.com

**Passo 2:** No menu lateral esquerdo, clique em:
```
Contas → Contas do Instagram
```

**Passo 3:** Clique em sua conta Instagram Business

**Passo 4:** Copie a URL da página - o ID está nela:
```
https://business.facebook.com/settings/instagram-accounts/123456789012345
                                                            ↑
                                            Copie este número
```

**Resultado:** Um número de 15 dígitos
```
INSTAGRAM_BUSINESS_ACCOUNT_ID=123456789012345
```

---

### 🔵 Facebook Page ID

**Passo 1:** Abra https://business.facebook.com

**Passo 2:** No menu lateral, clique em:
```
Contas → Páginas do Facebook
```

**Passo 3:** Clique em "Mussi Fretes Brasil"

**Passo 4:** Copie a URL - o ID está nela:
```
https://business.facebook.com/settings/pages/987654321098765
                                             ↑
                                Copie este número
```

**Resultado:** Um número de 15 dígitos
```
FACEBOOK_PAGE_ID=987654321098765
```

---

### 📱 Recipient IDs (para quem enviar mensagens)

#### **WhatsApp Recipient** (já temos ✓)
```
WHATSAPP_TO=5562986369013
```
Este é seu número de telefone formatado (55 + código área + número)

#### **Instagram Recipient**
Há 2 opções:

**Opção A:** Usar seu próprio ID do Instagram
1. Acesse https://www.instagram.com/seu_usuario/
2. Clique no seu avatar
3. Veja a URL: `https://www.instagram.com/seu_usuario/?hl=pt`
4. Para obter o ID numérico, use ferramentas online ou:
   - Inspecione elemento na página
   - Procure por `ig_user` nos dados

**Opção B:** Usar o ID do Meta Business
1. Acesse https://business.facebook.com/settings
2. Vá em **Informações da Conta**
3. Copie **Business Account ID** (não é Account ID, é Business Account ID)

**Resultado:**
```
INSTAGRAM_RECIPIENT_ID=123456789 (seu ID do Instagram)
OU
INSTAGRAM_RECIPIENT_ID=seu_username_instagram
```

#### **Facebook Recipient**
Seu ID pessoal do Facebook

**Passo 1:** Abra Facebook.com

**Passo 2:** Vá para seu perfil

**Passo 3:** URL mostra seu ID:
```
https://www.facebook.com/123456789
                        ↑
                Copie este número
```

**Resultado:**
```
FACEBOOK_RECIPIENT_ID=123456789
```

---

## 🎯 Método Rápido (Recomendado)

Se quiser simplesmente testar com **você mesmo** como destinatário:

### Para Instagram:
1. Vá em https://www.instagram.com
2. Procure seu nome de usuário (seu_username)
3. Use como:
   ```
   INSTAGRAM_RECIPIENT_ID=seu_username_instagram
   ```

### Para Facebook:
1. Vá em https://facebook.com/[seu_usuario]
2. Na URL, copie o número após `/`
3. Use como:
   ```
   FACEBOOK_RECIPIENT_ID=123456789
   ```

---

## 📋 Checklist para Preencher .env

```env
# Já temos ✓
WHATSAPP_TO=5562986369013
WHATSAPP_API_TOKEN=EAAyZCT...
WHATSAPP_PHONE_NUMBER_ID=1317299671463717

# Instagram - OBTER AGORA
INSTAGRAM_API_TOKEN=EAAyZCT... (mesmo token do WhatsApp)
INSTAGRAM_BUSINESS_ACCOUNT_ID=[PREENCHER - 15 dígitos]
INSTAGRAM_RECIPIENT_ID=[PREENCHER - seu username]

# Facebook - OBTER AGORA
FACEBOOK_API_TOKEN=EAAyZCT... (mesmo token do WhatsApp)
FACEBOOK_PAGE_ID=[PREENCHER - 15 dígitos]
FACEBOOK_RECIPIENT_ID=[PREENCHER - seu ID numérico]
```

---

## 🔑 Token de Acesso

**Importante:** Todos os 3 canais podem usar o **mesmo token**:
```
WHATSAPP_API_TOKEN = INSTAGRAM_API_TOKEN = FACEBOOK_API_TOKEN
```

Ele está aqui (mesmo do WhatsApp):
```
EAAyZCTyEIEAkBSeqiflaAwOf3YcTrk14ZC3NDPx3ZCNq4q2J6UrgXZAoIZA3z8GPZArZAe6cgfZAiUbOuIVO4hnCJOfn7hrqQ02XGVwi6NdQf61rK9rBOMupKMpFU48ZChg38tHZAOx6L8PPYFmk4bHmdLvAG3p281nZBLmN7bKY2T26zIZBc5XxmRHWB8nwBmnQfoXVqPZAqAbDFXj9zERT8vo9oAbE0kIhqvjpURum3LzhRiZBrEIuXlxzTU6qibvk4ttnp0CvR4oqEofWgrJ5XlsTtQ
```

---

## ✅ Validar IDs Obtidos

Após preencher [.env](.env), teste:

```powershell
cd "c:/Users/SnyX/Downloads/projeto organico divulgaçao mussi fretes"

node -e "import('./backend/omnichannel.js').then(async m => {
  const creds = await m.validateMetaCredentials();
  console.log(JSON.stringify(creds, null, 2));
}).catch(e => console.error('Error:', e.message))"
```

Você verá:
```json
{
  "whatsapp": {
    "token": "✓ Configurado",
    "phoneNumberId": "✓ Configurado"
  },
  "instagram": {
    "token": "✓ Configurado",
    "businessAccountId": "✓ Configurado",
    "recipientId": "✓ Configurado"
  },
  "facebook": {
    "token": "✓ Configurado",
    "pageId": "✓ Configurado",
    "recipientId": "✓ Configurado"
  }
}
```

---

## 🎬 Próximos Passos

1. **Obter os 6 valores** acima (IDs e token)
2. **Editar [.env](.env)** com os valores
3. **Testar** com `npm run automation:once`
4. **Ver resultado** com mensagens em todos os canais

---

## 💡 Dicas

- **Business Account ID:** Aparece em Settings/Business Info do Meta Business Manager
- **Page ID:** Número único da sua página (aparece em URL do Settings)
- **Instagram ID:** Pode ser `@seu_usuario` ou `123456789` (teste qual funciona)
- **Facebook ID:** Seu ID pessoal (número único do seu perfil)

**Precisando de ajuda?** Veja os screenshots do Meta Business Manager na documentação completa: [OMNICHANNEL_SETUP.md](OMNICHANNEL_SETUP.md)
