import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Setting from "@/models/Setting";

export interface LineCredentials {
  channelSecret: string;
  channelAccessToken: string;
  lineGroupId?: string;
  lineEnabled: boolean;
}

// Get LINE credentials from Environment variables OR MongoDB Setting document
export async function getLineCredentials(): Promise<LineCredentials> {
  const envSecret = process.env.LINE_CHANNEL_SECRET;
  const envToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const envGroup = process.env.LINE_GROUP_ID;

  if (envSecret && envToken) {
    return {
      channelSecret: envSecret.trim(),
      channelAccessToken: envToken.trim().replace(/[\r\n\s]+/g, ""),
      lineGroupId: envGroup ? envGroup.trim() : "",
      lineEnabled: true,
    };
  }

  try {
    await connectDB();
    const setting = (await Setting.findOne({ key: "app_settings" })) || (await Setting.findOne({}));
    if (setting && setting.lineChannelSecret && setting.lineChannelAccessToken) {
      return {
        channelSecret: setting.lineChannelSecret.trim(),
        channelAccessToken: setting.lineChannelAccessToken.trim().replace(/[\r\n\s]+/g, ""),
        lineGroupId: setting.lineGroupId ? setting.lineGroupId.trim() : "",
        lineEnabled: setting.lineEnabled !== false,
      };
    }
  } catch (err) {
    console.error("Error loading LINE settings:", err);
  }

  return {
    channelSecret: "",
    channelAccessToken: "",
    lineGroupId: "",
    lineEnabled: false,
  };
}

// Verify X-Line-Signature HMAC-SHA256
export function verifyLineSignature(
  rawBody: string,
  signature: string,
  channelSecret: string
): boolean {
  if (!signature || !channelSecret) return false;
  const hmac = crypto.createHmac("sha256", channelSecret);
  const digest = hmac.update(rawBody).digest("base64");
  return digest === signature;
}

// Send reply message back to LINE
export async function replyLineMessage(
  replyToken: string,
  messages: any[],
  accessToken: string
) {
  const cleanToken = (accessToken || "").trim().replace(/[\r\n\s]+/g, "");
  if (!replyToken || !cleanToken) {
    console.error("LINE reply cancelled: missing replyToken or accessToken", {
      replyToken: replyToken ? "present" : "missing",
      hasToken: !!cleanToken,
    });
    return;
  }

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("LINE reply API error:", res.status, errText);
    } else {
      console.log("LINE reply sent successfully!");
    }
  } catch (err) {
    console.error("Failed to reply LINE message:", err);
  }
}

// Send push message to user or group
export async function pushLineMessage(
  toId: string,
  messages: any[],
  accessToken: string
) {
  const cleanToken = (accessToken || "").trim().replace(/[\r\n\s]+/g, "");
  if (!toId || !cleanToken) return;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanToken}`,
      },
      body: JSON.stringify({
        to: toId,
        messages,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("LINE push error:", errText);
    }
  } catch (err) {
    console.error("Failed to push LINE message:", err);
  }
}

export function buildStockFlexMessage(
  product: any,
  stockByLocation: { locationName: string; quantity: number }[],
  totalStock: number,
  baseUrl: string
) {
  return {
    type: "text",
    text: `📦 ข้อมูลสต็อก: ${product.name} (${totalStock} ${product.unit || "ชิ้น"})`,
  };
}

export function buildOrderFlexMessage(order: any, baseUrl: string) {
  return {
    type: "text",
    text: `📦 ออเดอร์: ${order.orderNo}`,
  };
}

export function buildMenuFlexMessage() {
  return {
    type: "text",
    text: "🌱 Zyka ERP Assistant\nพิมพ์ 'สต็อก' หรือ 'ติดตาม'",
  };
}
