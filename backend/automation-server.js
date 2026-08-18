import http from 'node:http';
import { URL } from 'node:url';
import { runAutomationCycle, startScheduler } from './automation.js';
import { getOmnichannelStatus } from './omnichannel.js';

const port = Number(process.env.PORT || 3001);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const status = await getOmnichannelStatus();
    res.end(JSON.stringify({ ok: true, service: 'mussi-automation', ...status }));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/webhook/meta') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || 'mussi-fretes-webhook-token-2026';

    if (mode === 'subscribe' && token === verifyToken) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(challenge);
      return;
    }

    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid token' }));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/webhook/automation') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        const result = await runAutomationCycle({
          source: payload.source || 'webhook',
          dryRun: Boolean(payload.dryRun),
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, result }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/webhook/meta') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        console.log('Meta webhook received:', JSON.stringify(payload, null, 2));

        // Processar mensagens de WhatsApp
        if (payload.entry?.[0]?.changes?.[0]?.value?.messages) {
          const messages = payload.entry[0].changes[0].value.messages;
          for (const msg of messages) {
            console.log(`WhatsApp message from ${msg.from}: ${msg.text?.body}`);
          }
        }

        // Processar mensagens de Instagram
        if (payload.entry?.[0]?.messaging) {
          const messaging = payload.entry[0].messaging;
          for (const event of messaging) {
            if (event.message?.text) {
              console.log(`Instagram message from ${event.sender.id}: ${event.message.text}`);
            }
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, received: true }));
      } catch (error) {
        console.error('Meta webhook error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Webhook processing failed' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Not found' }));
});

if (process.argv.includes('--once')) {
  runAutomationCycle({ source: 'cli' })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} else {
  if (process.env.AUTOMATION_SCHEDULER !== 'false') {
    startScheduler({ intervalMinutes: Number(process.env.AUTOMATION_INTERVAL_MINUTES || 5) });
  }

  server.listen(port, () => {
    console.log(`Automation webhook server listening on http://localhost:${port}`);
  });
}
