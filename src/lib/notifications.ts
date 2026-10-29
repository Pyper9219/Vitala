import twilio from "twilio";
import { query } from "@/lib/db";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

let client: twilio.Twilio | null = null;

function getClient() {
  if (client) return client;
  if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
  }
  return client;
}

export type NotificationChannel = "in_app" | "email" | "sms" | "whatsapp";

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  channel?: NotificationChannel;
  phoneNumber?: string;
  data?: Record<string, unknown>;
}

/**
 * Send a notification via the best available channel.
 * Falls back gracefully when Twilio credentials are not configured (dev mode).
 */
export async function sendNotification(payload: NotificationPayload) {
  const { channel = "in_app", phoneNumber, title, body, userId } = payload;

  // In-app notification: store in DB (best-effort; non-failing)
  if (channel === "in_app" || channel === "email") {
    try {
      await query(
        `INSERT INTO notifications (user_id, title, body, channel, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, title, body, channel, false, new Date().toISOString()],
      );
    } catch {
      // notifications table may not exist yet; non-fatal
    }
  }

  // SMS / WhatsApp via Twilio
  if ((channel === "sms" || channel === "whatsapp") && phoneNumber) {
    return sendTwilioMessage({
      to: phoneNumber,
      body: `${title}\n${body}`,
      channel,
    });
  }

  return { success: true, devMode: !client, channel };
}

/**
 * Send a message via Twilio SMS or WhatsApp.
 * If Twilio credentials are missing, log to console (dev mode) instead of throwing.
 */
async function sendTwilioMessage({
  to,
  body,
  channel,
}: {
  to: string;
  body: string;
  channel: NotificationChannel;
}) {
  const twilioClient = getClient();
  if (!twilioClient) {
    console.log(`[Dev Mode] Twilio not configured. Would send ${channel} to ${to}:\n${body}`);
    return { success: true, devMode: true, channel, to };
  }

  const isWhatsApp = channel === "whatsapp";
  const from = isWhatsApp ? `whatsapp:${fromNumber || ""}` : fromNumber || "";
  const toAddress = isWhatsApp ? `whatsapp:${to}` : to;

  try {
    const message = await twilioClient.messages.create({
      body,
      from,
      to: toAddress,
      messagingServiceSid: isWhatsApp ? undefined : messagingServiceSid,
    });
    return { success: true, devMode: false, sid: message.sid, channel, to };
  } catch (err) {
    console.error("Twilio error:", err);
    return { success: false, error: String(err), channel, to };
  }
}

/**
 * Bulk send: reminder notifications for meal/workout check-ins.
 */
export async function sendReminder({
  userId,
  phoneNumber,
  title,
  body,
  channels = ["in_app"],
}: {
  userId: string;
  phoneNumber?: string;
  title: string;
  body: string;
  channels?: NotificationChannel[];
}) {
  const results = await Promise.all(
    channels.map((ch) => sendNotification({ userId, title, body, channel: ch, phoneNumber })),
  );
  return results;
}
