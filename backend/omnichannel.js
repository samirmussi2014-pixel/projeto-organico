/**
 * Omnichannel Manager - Integração com Meta Business
 * Gerencia WhatsApp, Instagram DM, Facebook Messenger
 */

import fs from 'node:fs';
import path from 'node:path';

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }
}

/**
 * Normaliza número de telefone para WhatsApp
 */
export function normalizePhoneForWhatsApp(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55')) return digits;
  if (digits.length === 11 && digits.startsWith('62')) return `55${digits}`;
  if (digits.length === 12 && digits.startsWith('5562')) return digits;
  return `55${digits}`;
}

/**
 * Enviar notificação via WhatsApp Business
 */
export async function sendWhatsApp({
  phone,
  message,
  dryRun = false,
} = {}) {
  loadDotEnv();

  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = normalizePhoneForWhatsApp(phone || process.env.WHATSAPP_TO || '');

  if (!to) {
    return { channel: 'whatsapp', status: 'skipped', reason: 'No WhatsApp destination' };
  }

  if (!token || !phoneNumberId) {
    return {
      channel: 'whatsapp',
      status: 'disabled',
      reason: 'WhatsApp API not configured',
    };
  }

  if (dryRun) {
    return { channel: 'whatsapp', status: 'dry-run', to, message };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    });

    const body = await response.text();
    return {
      channel: 'whatsapp',
      status: response.ok ? 'sent' : 'failed',
      to,
      httpStatus: response.status,
      response: body,
    };
  } catch (error) {
    return {
      channel: 'whatsapp',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Enviar notificação via Instagram Direct Message
 */
export async function sendInstagram({
  recipientId,
  message,
  dryRun = false,
} = {}) {
  loadDotEnv();

  const token = process.env.INSTAGRAM_API_TOKEN || process.env.WHATSAPP_API_TOKEN;
  const instagramBusinessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const instagramRecipientId = recipientId || process.env.INSTAGRAM_RECIPIENT_ID;

  if (!instagramRecipientId) {
    return { channel: 'instagram', status: 'skipped', reason: 'No Instagram recipient ID' };
  }

  if (!token || !instagramBusinessAccountId) {
    return {
      channel: 'instagram',
      status: 'disabled',
      reason: 'Instagram API not configured',
    };
  }

  if (dryRun) {
    return { channel: 'instagram', status: 'dry-run', recipientId: instagramRecipientId, message };
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/v20.0/${instagramBusinessAccountId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: {
            id: instagramRecipientId,
          },
          message: {
            text: message,
          },
        }),
      }
    );

    const body = await response.text();
    return {
      channel: 'instagram',
      status: response.ok ? 'sent' : 'failed',
      recipientId: instagramRecipientId,
      httpStatus: response.status,
      response: body,
    };
  } catch (error) {
    return {
      channel: 'instagram',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Enviar notificação via Facebook Messenger
 */
export async function sendFacebookMessenger({
  recipientId,
  message,
  dryRun = false,
} = {}) {
  loadDotEnv();

  const token = process.env.FACEBOOK_API_TOKEN || process.env.WHATSAPP_API_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const facebookRecipientId = recipientId || process.env.FACEBOOK_RECIPIENT_ID;

  if (!facebookRecipientId) {
    return { channel: 'facebook', status: 'skipped', reason: 'No Facebook recipient ID' };
  }

  if (!token || !pageId) {
    return {
      channel: 'facebook',
      status: 'disabled',
      reason: 'Facebook API not configured',
    };
  }

  if (dryRun) {
    return { channel: 'facebook', status: 'dry-run', recipientId: facebookRecipientId, message };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${pageId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: {
            id: facebookRecipientId,
          },
          message: {
            text: message,
          },
        }),
      }
    );

    const body = await response.text();
    return {
      channel: 'facebook',
      status: response.ok ? 'sent' : 'failed',
      recipientId: facebookRecipientId,
      httpStatus: response.status,
      response: body,
    };
  } catch (error) {
    return {
      channel: 'facebook',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Enviar notificação omnichannel (todos os canais)
 */
export async function sendOmnichannel({
  phone,
  instagramRecipientId,
  facebookRecipientId,
  message,
  dryRun = false,
  channels = ['whatsapp', 'instagram', 'facebook'], // quais canais enviar
} = {}) {
  loadDotEnv();

  const results = [];

  // Enviar para WhatsApp
  if (channels.includes('whatsapp') && phone) {
    const result = await sendWhatsApp({ phone, message, dryRun });
    results.push(result);
  }

  // Enviar para Instagram
  if (channels.includes('instagram') && instagramRecipientId) {
    const result = await sendInstagram({ recipientId: instagramRecipientId, message, dryRun });
    results.push(result);
  }

  // Enviar para Facebook
  if (channels.includes('facebook') && facebookRecipientId) {
    const result = await sendFacebookMessenger({ recipientId: facebookRecipientId, message, dryRun });
    results.push(result);
  }

  return {
    timestamp: new Date().toISOString(),
    channels: results.length > 0 ? results : [{ status: 'skipped', reason: 'No channels configured' }],
    summary: {
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
    },
  };
}

/**
 * Validar credenciais Meta Business
 */
export async function validateMetaCredentials() {
  loadDotEnv();

  const credentials = {
    whatsapp: {
      token: process.env.WHATSAPP_API_TOKEN ? '✓ Configurado' : '✗ Falta',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? '✓ Configurado' : '✗ Falta',
    },
    instagram: {
      token: process.env.INSTAGRAM_API_TOKEN ? '✓ Configurado' : '✗ Falta',
      businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ? '✓ Configurado' : '✗ Falta',
      recipientId: process.env.INSTAGRAM_RECIPIENT_ID ? '✓ Configurado' : '✗ Falta',
    },
    facebook: {
      token: process.env.FACEBOOK_API_TOKEN ? '✓ Configurado' : '✗ Falta',
      pageId: process.env.FACEBOOK_PAGE_ID ? '✓ Configurado' : '✗ Falta',
      recipientId: process.env.FACEBOOK_RECIPIENT_ID ? '✓ Configurado' : '✗ Falta',
    },
  };

  return credentials;
}

/**
 * Health check para omnichannel
 */
export async function getOmnichannelStatus() {
  loadDotEnv();

  return {
    timestamp: new Date().toISOString(),
    channels: {
      whatsapp: {
        configured: !!(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
        recipientPhone: process.env.WHATSAPP_TO || 'não configurado',
      },
      instagram: {
        configured: !!(process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID && process.env.INSTAGRAM_API_TOKEN),
        recipientId: process.env.INSTAGRAM_RECIPIENT_ID || 'não configurado',
      },
      facebook: {
        configured: !!(process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_API_TOKEN),
        recipientId: process.env.FACEBOOK_RECIPIENT_ID || 'não configurado',
      },
    },
  };
}
