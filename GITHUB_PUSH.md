# 📤 Subir Projeto no GitHub

## Pré-requisito
- Conta GitHub criada: https://github.com

---

## PASSO 1: Criar repositório no GitHub

### 1.1 Abra GitHub.com
- Clique **+** (canto superior direito)
- Clique **New repository**

### 1.2 Configurar repositório
- **Repository name:** `projeto-organico` (ou similar)
- **Description:** "Mussi Fretes - Automação de leads, cargas e notificações WhatsApp"
- **Visibility:** Private (recomendado) ou Public
- ❌ NÃO marque "Initialize with README"
- Clique **Create repository**

GitHub mostrará a URL: `https://github.com/SEU_USER/projeto-organico.git`

---

## PASSO 2: Fazer push do código local

### 2.1 PowerShell - dentro da pasta do projeto

```powershell
cd "c:/Users/SnyX/Downloads/projeto organico divulgaçao mussi fretes"

# Inicializar git (se ainda não foi feito)
git init
git add .
git commit -m "initial: mussi fretes automation backend + whatsapp integration"

# Adicionar remote do GitHub
git remote add origin https://github.com/SEU_USER/projeto-organico.git

# Fazer push
git branch -M main
git push -u origin main
```

### 2.2 Resultado esperado
```
Enumerating objects: XXX, done.
...
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ Código está no GitHub!

---

## PASSO 3: Conectar Railway ao GitHub

### 3.1 Abra Railway.app
1. https://railway.app
2. **New Project**
3. **Deploy from GitHub**

### 3.2 Autorizar Railway com GitHub
- Railway pedirá permissão
- Clique **Authorize railway-app**
- Selecione suas organizações/repositórios

### 3.3 Selecionar repositório
- Procure por `projeto-organico`
- Clique nele
- Railway detectará `railway.json` automaticamente

### 3.4 Deploy automático
- Clique **Deploy now**
- Railway vai:
  1. Clonar do GitHub
  2. Rodar `npm install`
  3. Iniciar `npm start`
  4. Gerar URL pública

---

## ✅ Verifikação Final

Após ~3-5 minutos:

### 1. Acessar URL pública do Railway
```powershell
# Substitua por sua URL do Railway
Invoke-WebRequest -Uri "https://projeto-organico-prod.up.railway.app/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

Resultado esperado:
```json
{"ok":true,"service":"mussi-automation","timestamp":"2026-08-17T..."}
```

### 2. Ver logs no Railway
- Clique em **Logs**
- Você verá a automação rodando:
  ```
  Automation scheduler started. Next run every 5 minutes.
  Automation webhook server listening on http://localhost:3001
  ```

### 3. Automação a cada 5 minutos
```json
{
  "source": "scheduler",
  "mode": "ASSISTIDO",
  "status": "ok",
  "counts": { "leads": 1, "cargas": 0, "oportunidades": 0, "palavras_chave": 30 },
  "generated": { "opportunities": 0, "contents": 0, "keywords": 10 },
  "notification": {
    "status": "sent",  // ✅ Notificação WhatsApp enviada
    "to": "5562986369013"
  }
}
```

---

## 🔄 Atualizações Futuras

Depois de fazer commit local:
```powershell
git add .
git commit -m "chore: update configs"
git push
```

Railway detectará o push e **refará o deploy automaticamente** ✨

---

## 📝 Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código enviado (`git push`)
- [ ] Railway conectado ao repositório
- [ ] Deploy completado no Railway
- [ ] URL pública testada (health check OK)
- [ ] Automação rodando a cada 5 minutos
- [ ] WhatsApp enviando notificações ✅

**Seu backend está rodando 24/7 na nuvem!** 🚀
