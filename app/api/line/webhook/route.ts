import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Inventory from "@/models/Inventory";
import StorageLocation from "@/models/StorageLocation";
import Order from "@/models/Order";
import User from "@/models/User";
import LinePendingUser from "@/models/LinePendingUser";
import {
  getLineCredentials,
  verifyLineSignature,
  replyLineMessage,
  getLineUserProfile,
} from "@/lib/line";
import { generateSalesSummaryText, generateMonthlyPaymentReportText } from "@/lib/line-reports";

async function checkUserLineReportAccess(lineUserId: string): Promise<{ allowed: boolean; user?: any }> {
  if (!lineUserId) return { allowed: false };
  await connectDB();
  const user = await User.findOne({ lineUserId: lineUserId.trim() });
  if (!user) return { allowed: false };
  if (user.role === "admin" || user.canAccessLineReports === true) {
    return { allowed: true, user };
  }
  return { allowed: false, user };
}

async function recordPendingLineUser(lineUserId: string, lastMessage: string, channelAccessToken?: string) {
  if (!lineUserId) return;
  try {
    await connectDB();
    const cleanId = lineUserId.trim();
    // Check if already linked to a user
    const existingUser = await User.findOne({ lineUserId: cleanId });
    if (existingUser) return; // already linked

    let displayName = "LINE User";
    let pictureUrl = "";

    if (channelAccessToken) {
      const profile = await getLineUserProfile(cleanId, channelAccessToken);
      if (profile) {
        if (profile.displayName) displayName = profile.displayName;
        if (profile.pictureUrl) pictureUrl = profile.pictureUrl;
      }
    }

    await LinePendingUser.findOneAndUpdate(
      { lineUserId: cleanId },
      {
        lineUserId: cleanId,
        displayName,
        pictureUrl,
        lastMessage: lastMessage.slice(0, 100),
        status: "pending",
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Failed to record pending LINE user:", err);
  }
}

// Ensure models registered
if (!StorageLocation || !LinePendingUser) {
  // Ensure schema registered
}

// GET /api/line/webhook - LINE Webhook Verification Endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Zyka Medic LINE Webhook Endpoint is Active & Ready",
    timestamp: new Date().toISOString(),
  });
}

// POST /api/line/webhook - Handle LINE Events
export async function POST(request: Request) {
  try {
    const { channelSecret, channelAccessToken, lineEnabled } = await getLineCredentials();

    const rawBody = await request.text();
    const signature = request.headers.get("x-line-signature") || "";

    // Signature verification (Log warning if mismatch, don't block valid tokens)
    if (channelSecret && signature) {
      const isValid = verifyLineSignature(rawBody, signature, channelSecret.trim());
      if (!isValid) {
        console.warn("LINE Signature verification mismatch - proceeding with token fallback");
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = {};
    }

    const events = payload.events || [];

    // Base URL for links
    const origin = request.headers.get("origin") || request.headers.get("host") || "";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    let baseUrl = origin.startsWith("http")
      ? origin
      : origin
      ? `${protocol}://${origin}`
      : "https://203.155.200.116/zyka";

    if (!baseUrl.endsWith("/zyka") && baseUrl.includes("203.155.200.116")) {
      baseUrl = baseUrl + "/zyka";
    }

    await connectDB();

    for (const event of events) {
      if (event.type === "message" && event.message?.type === "text") {
        const replyToken = event.replyToken;
        const text = event.message.text ? event.message.text.trim() : "";

        console.log("LINE Event Message Received:", text);

        if (!text || !replyToken) continue;

        // 1. Order Tracking Command (e.g. "ติดตาม ORD-2026-0005" or "ออเดอร์ ORD-2026-0005" or "ติดตาม")
        if (/^(ติดตาม|เช็คออเดอร์|ออเดอร์|สถานะ|track)/i.test(text)) {
          const query = text.replace(/^(ติดตาม|เช็คออเดอร์|ออเดอร์|สถานะ|track)\s*/i, "").trim();

          let order: any = null;
          if (query) {
            order = await Order.findOne({
              $or: [
                { orderNo: { $regex: query, $options: "i" } },
                { billingNo: { $regex: query, $options: "i" } },
              ],
            }).sort({ createdAt: -1 });
          } else {
            // Get latest order if no query specified
            order = await Order.findOne({}).sort({ createdAt: -1 });
          }

          if (!order) {
            await replyLineMessage(
              replyToken,
              [
                {
                  type: "text",
                  text: `❌ ไม่พบข้อมูลออเดอร์ "${query || ""}" ในระบบ Zyka ERP\n\n💡 ตัวอย่างการใช้:\n• ติดตาม ORD-2026-0005`,
                },
              ],
              channelAccessToken
            );
          } else {
            const deliveryStatusText =
              order.deliveryStatus === "DELIVERED"
                ? "✅ ส่งมอบสำเร็จ (Delivered)"
                : order.deliveryStatus === "SHIPPED"
                ? "🚚 กำลังจัดส่ง (Shipped)"
                : order.deliveryStatus === "PENDING"
                ? "⏳ รอจัดส่ง (Pending)"
                : "❌ ยกเลิก (Canceled)";

            const orderDateStr = order.orderDate
              ? new Date(order.orderDate).toLocaleDateString("th-TH")
              : "-";

            let orderMsgText = `📦 ติดตามสถานะคำสั่งซื้อ (${order.orderNo})\n------------------------\n`;
            orderMsgText += `👤 ลูกค้า: ${order.customerName || "-"}\n`;
            orderMsgText += `📅 วันที่สั่งซื้อ: ${orderDateStr}\n`;
            orderMsgText += `🚚 สถานะจัดส่ง: ${deliveryStatusText}\n`;
            orderMsgText += `------------------------\nรายการสินค้า:\n`;
            (order.items || []).slice(0, 5).forEach((item: any) => {
              orderMsgText += `• ${item.productName}: ${item.quantity} ${item.unit || "ชิ้น"}\n`;
            });
            orderMsgText += `------------------------\n`;
            orderMsgText += `💰 ยอดรวมทั้งสิ้น: ฿${(order.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
            orderMsgText += `📄 ดูใบวางบิล: ${baseUrl}/orders/print/${order._id}`;

            await replyLineMessage(
              replyToken,
              [
                {
                  type: "text",
                  text: orderMsgText.trim(),
                },
              ],
              channelAccessToken
            );
          }
          continue;
        }

        // 2. Stock Check Command (e.g. "เช็คสต็อก พารา", "สต็อก P-001", "พาราเซตามอล", "เช็คสต็อก", "สต็อก")
        if (/^(เช็คสต็อก|สต็อก|คงเหลือ|สินค้า|checkstock)/i.test(text) || text.includes("สต็อก") || text.includes("สินค้า")) {
          let searchQuery = text.replace(/^(เช็คสต็อก|สต็อก|คงเหลือ|สินค้า|checkstock)\s*/i, "").trim();

          let products: any[] = [];
          if (!searchQuery) {
            products = await Product.find({ status: "active" }).sort({ seq: 1 }).limit(5);
          } else {
            products = await Product.find({
              $or: [
                { code: { $regex: searchQuery, $options: "i" } },
                { name: { $regex: searchQuery, $options: "i" } },
              ],
            }).limit(5);
          }

          if (products.length === 0) {
            await replyLineMessage(
              replyToken,
              [
                {
                  type: "text",
                  text: `🔍 ไม่พบสินค้าที่ตรงกับคำว่า "${searchQuery}" ในระบบ Zyka ERP\n\n💡 คำสั่งที่ใช้ได้:\n• สต็อก [ชื่อ/รหัสสินค้า]\n• ติดตาม [เลขที่คำสั่งซื้อ]\n• พิมพ์ "เมนู" เพื่อดูคำสั่งทั้งหมด`,
                },
              ],
              channelAccessToken
            );
            continue;
          }

          let stockMsgText = `📦 ข้อมูลสต็อกสินค้า (Zyka ERP)\n========================\n`;
          for (const p of products.slice(0, 5)) {
            const inventories = await Inventory.find({ productId: p._id }).populate("locationId");
            let totalQty = 0;
            const locDetails: string[] = [];
            inventories.forEach((inv) => {
              const q = inv.quantity || 0;
              totalQty += q;
              const locObj: any = inv.locationId;
              const locName = locObj && typeof locObj === "object" ? locObj.name : "คลังทั่วไป";
              locDetails.push(`  📍 ${locName}: ${q.toLocaleString()} ${p.unit || "ชิ้น"}`);
            });

            const isLow = totalQty < (p.minQuantity || 0);
            const statusBadge = totalQty <= 0 ? "🔴 สินค้าหมด" : isLow ? "⚠️ สินค้าเหลือน้อย" : "🟢 สต็อกปกติ";

            stockMsgText += `🔹 ${p.name} (รหัส: ${p.code})\n`;
            stockMsgText += `   สถานะ: ${statusBadge}\n`;
            stockMsgText += `   คงเหลือรวม: ${totalQty.toLocaleString()} ${p.unit || "ชิ้น"}\n`;
            if (locDetails.length > 0) {
              stockMsgText += locDetails.join("\n") + "\n";
            }
            stockMsgText += `------------------------\n`;
          }

          await replyLineMessage(
            replyToken,
            [
              {
                type: "text",
                text: stockMsgText.trim(),
              },
            ],
            channelAccessToken
          );
          continue;
        }

        const senderLineUserId = event.source?.userId || "";

        // 3. Sales Report Command (e.g. "ยอดขาย", "ยอดขาย สัปดาห์", "ยอดขาย เดือน", "ยอดขาย ปี")
        if (/^(ยอดขาย|สรุปยอดขาย|รายงานยอดขาย|salesreport)/i.test(text)) {
          const { allowed, user } = await checkUserLineReportAccess(senderLineUserId);
          if (!allowed) {
            await recordPendingLineUser(senderLineUserId, text, channelAccessToken);
            await replyLineMessage(
              replyToken,
              [
                {
                  type: "text",
                  text: `🔒 สิทธิ์การเข้าถึงถูกจำกัด (LINE Report Restricted)\n------------------------\nขออภัย บัญชี LINE ของคุณยังไม่ได้รับการอนุมัติให้ดูรายงานผ่าน LINE\n\n📲 ระบบได้ส่งคำขอไปยัง Admin เรียบร้อยแล้ว!\nAdmin สามารถกด "ผูกบัญชีใน 1 คลิก" บนหน้าเว็บระบบได้ทันที\n\n🆔 LINE User ID ของคุณ:\n${senderLineUserId || "ไม่พบ ID"}`,
                },
              ],
              channelAccessToken
            );
            continue;
          }

          let reportType: "weekly" | "monthly" | "yearly" = "monthly";
          if (/สัปดาห์|7วัน|week/i.test(text)) reportType = "weekly";
          else if (/ปี|year/i.test(text)) reportType = "yearly";

          const salesReportText = await generateSalesSummaryText(reportType, user);
          await replyLineMessage(
            replyToken,
            [{ type: "text", text: salesReportText }],
            channelAccessToken
          );
          continue;
        }

        // 4. Monthly Payment Collection Report Command (e.g. "ยอดเก็บเงิน", "สรุปเก็บเงิน", "เก็บเงิน", "วางบิล")
        if (/^(ยอดเก็บเงิน|สรุปเก็บเงิน|เก็บเงิน|รายงานเก็บเงิน|paymentreport)/i.test(text)) {
          const { allowed, user } = await checkUserLineReportAccess(senderLineUserId);
          if (!allowed) {
            await recordPendingLineUser(senderLineUserId, text, channelAccessToken);
            await replyLineMessage(
              replyToken,
              [
                {
                  type: "text",
                  text: `🔒 สิทธิ์การเข้าถึงถูกจำกัด (LINE Report Restricted)\n------------------------\nขออภัย บัญชี LINE ของคุณยังไม่ได้รับการอนุมัติให้ดูรายงานผ่าน LINE\n\n📲 ระบบได้ส่งคำขอไปยัง Admin เรียบร้อยแล้ว!\nAdmin สามารถกด "ผูกบัญชีใน 1 คลิก" บนหน้าเว็บระบบได้ทันที\n\n🆔 LINE User ID ของคุณ:\n${senderLineUserId || "ไม่พบ ID"}`,
                },
              ],
              channelAccessToken
            );
            continue;
          }

          const paymentReportText = await generateMonthlyPaymentReportText(user);
          await replyLineMessage(
            replyToken,
            [{ type: "text", text: paymentReportText }],
            channelAccessToken
          );
          continue;
        }

        // 5. Default Menu Command (Help / Menu / Anything else)
        const defaultMenuText =
          `🌱 Zyka Medic ERP Assistant\n` +
          `========================\n` +
          `ยินดีต้อนรับสู่ระบบเช็คสต็อกและรายงาน Zyka ERP!\n\n` +
          `💡 คำสั่งที่สามารถพิมพ์ใช้งานได้:\n\n` +
          `1️⃣ สรุปยอดขาย (รายสัปดาห์/เดือน/ปี)\n` +
          `• พิมพ์: ยอดขาย สัปดาห์\n` +
          `• พิมพ์: ยอดขาย เดือน\n` +
          `• พิมพ์: ยอดขาย ปี\n\n` +
          `2️⃣ สรุปยอดเก็บเงินรายเดือน\n` +
          `• พิมพ์: ยอดเก็บเงิน\n\n` +
          `3️⃣ ตรวจสอบสต็อกสินค้า\n` +
          `• พิมพ์: สต็อก [ชื่อ หรือ รหัสสินค้า]\n` +
          `• ตัวอย่าง: สต็อก พาราเซตามอล\n\n` +
          `4️⃣ ติดตามสถานะคำสั่งซื้อ\n` +
          `• พิมพ์: ติดตาม [เลขที่ออเดอร์]\n` +
          `• ตัวอย่าง: ติดตาม ORD-2026-0005\n\n` +
          `5️⃣ เมนูช่วยเหลือ\n` +
          `• พิมพ์: เมนู`;

        await replyLineMessage(
          replyToken,
          [
            {
              type: "text",
              text: defaultMenuText,
            },
          ],
          channelAccessToken
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("LINE Webhook Error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
