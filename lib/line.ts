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
      channelSecret: envSecret,
      channelAccessToken: envToken,
      lineGroupId: envGroup || "",
      lineEnabled: true,
    };
  }

  try {
    await connectDB();
    const setting = await Setting.findOne({ key: "app_settings" });
    if (setting && setting.lineChannelSecret && setting.lineChannelAccessToken) {
      return {
        channelSecret: setting.lineChannelSecret,
        channelAccessToken: setting.lineChannelAccessToken,
        lineGroupId: setting.lineGroupId || "",
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
  if (!replyToken || !accessToken) return;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("LINE reply error:", errText);
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
  if (!toId || !accessToken) return;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
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

// Helper: Build LINE Flex Message Card for Stock Check Result
export function buildStockFlexMessage(
  product: any,
  stockByLocation: { locationName: string; quantity: number }[],
  totalStock: number,
  baseUrl: string
) {
  const isLow = totalStock < (product.minQuantity || 0);
  const isOut = totalStock <= 0;

  const statusColor = isOut ? "#ef4444" : isLow ? "#f59e0b" : "#10b981";
  const statusBadgeText = isOut
    ? "🔴 สินค้าหมด (Out of Stock)"
    : isLow
    ? "⚠️ สินค้าเหลือน้อย (Low Stock)"
    : "🟢 สต็อกปกติ (In Stock)";

  // Format absolute image URL
  let fullImgUrl = product.imageUrl || "";
  if (fullImgUrl && !fullImgUrl.startsWith("http")) {
    const cleanPath = fullImgUrl.startsWith("/") ? fullImgUrl : "/" + fullImgUrl;
    fullImgUrl = `${baseUrl}${cleanPath}`;
  }

  const locationContents = stockByLocation.length > 0
    ? stockByLocation.map((loc) => ({
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: `📍 ${loc.locationName}`,
            size: "xs",
            color: "#4b5563",
            flex: 3,
            wrap: true,
          },
          {
            type: "text",
            text: `${loc.quantity.toLocaleString()} ${product.unit || "ชิ้น"}`,
            size: "xs",
            color: "#111827",
            weight: "bold",
            align: "end",
            flex: 2,
          },
        ],
        margin: "md",
      }))
    : [
        {
          type: "text",
          text: "ยังไม่ได้ระบุคลังสินค้า",
          size: "xs",
          color: "#9ca3af",
          align: "center",
          margin: "md",
        },
      ];

  const bodyContents: any[] = [
    {
      type: "text",
      text: "📦 ข้อมูลสต็อกสินค้า (Zyka ERP)",
      size: "xs",
      color: "#284532",
      weight: "bold",
    },
    {
      type: "text",
      text: product.name || "ไม่ระบุชื่อสินค้า",
      weight: "bold",
      size: "md",
      margin: "xs",
      wrap: true,
      color: "#111827",
    },
    {
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [
        {
          type: "text",
          text: `รหัสสินค้า: ${product.code}`,
          size: "xs",
          color: "#6b7280",
          flex: 1,
        },
        {
          type: "text",
          text: statusBadgeText,
          size: "xs",
          color: statusColor,
          weight: "bold",
          align: "end",
          flex: 1,
        },
      ],
    },
    {
      type: "separator",
      margin: "lg",
    },
    {
      type: "box",
      layout: "horizontal",
      margin: "lg",
      contents: [
        {
          type: "text",
          text: "จำนวนคงเหลือรวม",
          size: "sm",
          color: "#374151",
          weight: "bold",
          flex: 2,
        },
        {
          type: "text",
          text: `${totalStock.toLocaleString()} ${product.unit || "ชิ้น"}`,
          size: "lg",
          color: statusColor,
          weight: "bold",
          align: "end",
          flex: 2,
        },
      ],
    },
    {
      type: "text",
      text: `(ขั้นต่ำเตือน: ${product.minQuantity || 0} ${product.unit || "ชิ้น"})`,
      size: "xxs",
      color: "#9ca3af",
      align: "end",
      margin: "xs",
    },
    {
      type: "separator",
      margin: "lg",
    },
    {
      type: "text",
      text: "รายชื่อสถานที่เก็บ (Locations)",
      size: "xs",
      color: "#374151",
      weight: "bold",
      margin: "lg",
    },
    ...locationContents,
  ];

  const flexBubble: any = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      contents: bodyContents,
      paddingAll: "lg",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "🌐 เปิดดูในระบบ Zyka ERP",
            uri: `${baseUrl}/products`,
          },
          style: "primary",
          color: "#284532",
          height: "sm",
        },
      ],
      paddingAll: "md",
    },
  };

  if (fullImgUrl && fullImgUrl.startsWith("http")) {
    flexBubble.hero = {
      type: "image",
      url: fullImgUrl,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    };
  }

  return {
    type: "flex",
    altText: `📦 ข้อมูลสต็อก: ${product.name} (คงเหลือ ${totalStock} ${product.unit || "ชิ้น"})`,
    contents: flexBubble,
  };
}

// Helper: Build LINE Flex Message Card for Order Status Tracking
export function buildOrderFlexMessage(order: any, baseUrl: string) {
  const deliveryStatusText =
    order.deliveryStatus === "DELIVERED"
      ? "✅ ส่งมอบสำเร็จ (Delivered)"
      : order.deliveryStatus === "SHIPPED"
      ? "🚚 กำลังจัดส่ง (Shipped)"
      : order.deliveryStatus === "PENDING"
      ? "⏳ รอจัดส่ง (Pending)"
      : "❌ ยกเลิก (Canceled)";

  const statusColor =
    order.deliveryStatus === "DELIVERED"
      ? "#10b981"
      : order.deliveryStatus === "SHIPPED"
      ? "#3b82f6"
      : order.deliveryStatus === "PENDING"
      ? "#f59e0b"
      : "#ef4444";

  const orderDateStr = order.orderDate
    ? new Date(order.orderDate).toLocaleDateString("th-TH")
    : "-";

  const itemsList = (order.items || []).slice(0, 4).map((item: any) => ({
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: `• ${item.productName || "สินค้า"}`,
        size: "xs",
        color: "#374151",
        flex: 3,
        wrap: true,
      },
      {
        type: "text",
        text: `${item.quantity || 1} ${item.unit || "ชิ้น"}`,
        size: "xs",
        color: "#6b7280",
        align: "end",
        flex: 1,
      },
    ],
    margin: "sm",
  }));

  const flexBubble: any = {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "📦 ติดตามสถานะคำสั่งซื้อ",
          size: "xs",
          color: "#ffffff",
          weight: "bold",
        },
        {
          type: "text",
          text: `เลขที่: ${order.orderNo}`,
          size: "lg",
          color: "#ffffff",
          weight: "bold",
          margin: "xs",
        },
      ],
      backgroundColor: "#284532",
      paddingAll: "lg",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "ลูกค้า:",
              size: "xs",
              color: "#6b7280",
              flex: 1,
            },
            {
              type: "text",
              text: order.customerName || "-",
              size: "xs",
              color: "#111827",
              weight: "bold",
              flex: 3,
              align: "end",
            },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "sm",
          contents: [
            {
              type: "text",
              text: "วันที่สั่งซื้อ:",
              size: "xs",
              color: "#6b7280",
              flex: 1,
            },
            {
              type: "text",
              text: orderDateStr,
              size: "xs",
              color: "#111827",
              flex: 2,
              align: "end",
            },
          ],
        },
        {
          type: "separator",
          margin: "lg",
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "lg",
          contents: [
            {
              type: "text",
              text: "สถานะการจัดส่ง:",
              size: "xs",
              color: "#374151",
              weight: "bold",
              flex: 1,
            },
            {
              type: "text",
              text: deliveryStatusText,
              size: "xs",
              color: statusColor,
              weight: "bold",
              align: "end",
              flex: 2,
            },
          ],
        },
        {
          type: "separator",
          margin: "lg",
        },
        {
          type: "text",
          text: "รายการสินค้า:",
          size: "xs",
          color: "#374151",
          weight: "bold",
          margin: "lg",
        },
        ...itemsList,
        {
          type: "separator",
          margin: "lg",
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "lg",
          contents: [
            {
              type: "text",
              text: "ยอดรวมสุทธิ:",
              size: "sm",
              color: "#111827",
              weight: "bold",
              flex: 1,
            },
            {
              type: "text",
              text: `฿${(order.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              size: "md",
              color: "#284532",
              weight: "bold",
              align: "end",
              flex: 2,
            },
          ],
        },
      ],
      paddingAll: "lg",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "📄 เปิดดูใบวางบิล / พิมพ์เอกสาร",
            uri: `${baseUrl}/orders/print/${order._id}`,
          },
          style: "primary",
          color: "#284532",
          height: "sm",
        },
      ],
      paddingAll: "md",
    },
  };

  return {
    type: "flex",
    altText: `📦 สถานะคำสั่งซื้อ ${order.orderNo}: ${deliveryStatusText}`,
    contents: flexBubble,
  };
}

// Helper: Build LINE Quick Menu Message Card
export function buildMenuFlexMessage() {
  return {
    type: "flex",
    altText: "💡 วิธีใช้งานระบบ Zyka ERP ผ่าน LINE",
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🌱 Zyka Medic ERP Assistant",
            size: "sm",
            color: "#ffffff",
            weight: "bold",
          },
          {
            type: "text",
            text: "คำสั่งที่รองรับใน LINE",
            size: "lg",
            color: "#ffffff",
            weight: "bold",
            margin: "xs",
          },
        ],
        backgroundColor: "#284532",
        paddingAll: "lg",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "1️⃣ ตรวจสอบสต็อกสินค้า",
            weight: "bold",
            size: "sm",
            color: "#111827",
          },
          {
            type: "text",
            text: "พิมพ์: สต็อก [ชื่อสินค้า หรือ รหัสสินค้า]\nตัวอย่าง: สต็อก พาราเซตามอล หรือ เช็คสต็อก P-001",
            size: "xs",
            color: "#4b5563",
            wrap: true,
            margin: "xs",
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "text",
            text: "2️⃣ ติดตามสถานะคำสั่งซื้อ",
            weight: "bold",
            size: "sm",
            color: "#111827",
            margin: "lg",
          },
          {
            type: "text",
            text: "พิมพ์: ติดตาม [เลขคำสั่งซื้อ]\nตัวอย่าง: ติดตาม ORD-2026-0001",
            size: "xs",
            color: "#4b5563",
            wrap: true,
            margin: "xs",
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "text",
            text: "3️⃣ สรุปคำสั่งซื้อวันนี้",
            weight: "bold",
            size: "sm",
            color: "#111827",
            margin: "lg",
          },
          {
            type: "text",
            text: "พิมพ์: สรุปวันนี้",
            size: "xs",
            color: "#4b5563",
            margin: "xs",
          },
        ],
        paddingAll: "lg",
      },
    },
  };
}
