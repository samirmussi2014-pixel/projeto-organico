# Deploy do backend no Railway

## 1) Conectar o projeto
- Acesse https://railway.app
- Clique em New Project
- Conecte o repositório do projeto

## 2) Definir variáveis de ambiente
No painel do Railway, adicione estas variáveis:

VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=SEU_ANON_KEY
WHATSAPP_TO=5562986369013
WHATSAPP_API_TOKEN=SEU_TOKEN_DO_WHATSAPP_BUSINESS
WHATSAPP_PHONE_NUMBER_ID=SEU_ID_DO_NUMERO
WHATSAPP_ENABLED=true
PORT=3001
AUTOMATION_INTERVAL_MINUTES=5
AUTOMATION_SCHEDULER=true
AUTOMATION_WEBHOOK_URL=

## 3) Ajustes do serviço
- Nome do serviço: mussi-fretes-backend
- Build Command: npm install
- Start Command: npm start

## 4) URL pública
Ao subir, Railway gera uma URL pública do tipo:
https://SEU-SERVICO.up.railway.app

Use esse domínio para o webhook:
https://SEU-SERVICO.up.railway.app/webhook/automation

## 5) WhatsApp Business
No Meta Business Manager:
- configure o número do WhatsApp Business
- gere o token de longa duração
- copie o Phone Number ID

## 6) Endpoint de saúde
Teste:
https://SEU-SERVICO.up.railway.app/health

## 7) Conectar ao ChatGPT Sites
No frontend público, use a mesma URL do Supabase e configure o backend em seu site conforme o host do seu ambiente.
