# Deploy do Mussi Fretes

## 1) Publicar o frontend
Use qualquer provedor compatível com Vite:
- Vercel
- Netlify
- Cloudflare Pages
- host próprio

Configure as variáveis de ambiente do frontend:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## 2) Publicar o backend/worker
O worker fica em `backend/automation-server.js` e pode ser publicado em:
- Railway
- Render
- Fly.io
- VPS / Azure / AWS
- qualquer serviço com Node.js

Variáveis de ambiente do worker:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- WHATSAPP_TO=5562986369013
- WHATSAPP_API_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
- PORT=3001
- AUTOMATION_INTERVAL_MINUTES=5
- AUTOMATION_SCHEDULER=true

## 3) Endpoint público do webhook
Se for necessário expor para fora do localhost, configure um host público e use o endpoint:
- https://SEU_DOMINIO/webhook/automation

## 4) WhatsApp Business
Para disparar mensagens reais, configure no Meta Business Manager:
- um número WhatsApp Business ativo
- token de longa duração
- ID do número do WhatsApp

Depois basta preencher no .env:
- WHATSAPP_API_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
