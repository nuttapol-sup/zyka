import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Inventory from "@/models/Inventory";
import StorageLocation from "@/models/StorageLocation";
import Order from "@/models/Order";
import {
  getLineCredentials,
  verifyLineSignature,
  replyLineMessage,
  buildStockFlexMessage,
  buildOrderFlexMessage,
  buildMenuFlexMessage,
} from "@/lib/line";

// Ensure models registered
if (!StorageLocation) {
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

    // Signature verification if channelSecret configured
    if (channelSecret && signature) {
      const isValid = verifyLineSignature(rawBody, signature, channelSecret);
      if (!isValid) {
        console.warn("Invalid LINE Signature");
        return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const events = payload.events || [];

    // Base URL for image thumbnails and direct links
    const origin = request.headers.get("origin") || request.headers.get("host") || "";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = origin.startsWith("http")
      ? origin
      : origin
      ? `${protocol}://${origin}`
      : "http://localhost:3000";

    await connectDB();

    for (const event of events) {
      if (event.type === "message" && event.message?.type === "text") {
        const replyToken = event.replyToken;
        const text = event.message.text.trim();

        // 1. Help / Menu Command
        if (/^(เมนู|วิธีใช้|ช่วยเหลือ|help|menu|\?)$/i.test(text)) {
          const menuFlex = buildMenuFlexMessage();
          await replyLineMessage(replyToken, [menuFlex], channelAccessToken);
          continue;
        }

        // 2. Order Tracking Command (e.g. "ติดตาม ORD-2026-0005" or "ออเดอร์ ORD-2026-0005")
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
                  text: `❌ ไม่พบข้อมูลออเดอร์ "${query || ""}" ในระบบ Zyka ERP\nกรุณาตรวจสอบเลขคำสั่งซื้ออีกครั้ง เช่น: ติดตาม ORD-2026-0005`,
                },
              ],
              channelAccessToken
            );
          } else {
            const orderFlex = buildOrderFlexMessage(order, baseUrl);
            await replyLineMessage(replyToken, [orderFlex], channelAccessToken);
          }
          continue;
        }

        // 3. Stock Check Command (e.g. "เช็คสต็อก พารา", "สต็อก P-001", "พาราเซตามอล")
        let searchQuery = text;
        if (/^(เช็คสต็อก|สต็อก|คงเหลือ|สินค้า|checkstock)\s*/i.test(text)) {
          searchQuery = text.replace(/^(เช็คสต็อก|สต็อก|คงเหลือ|สินค้า|checkstock)\s*/i, "").trim();
        }

        // Search Product in MongoDB
        const products = await Product.find({
          $or: [
            { code: { $regex: searchQuery, $options: "i" } },
            { name: { $regex: searchQuery, $options: "i" } },
          ],
        }).limit(5);

        if (products.length === 0) {
          // Fallback message if no product found
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

        // If product found, compile location breakdown for the first matching product
        const matchedProduct = products[0];

        const inventories = await Inventory.find({ productId: matchedProduct._id }).populate("locationId");

        const locationMap: Record<string, number> = {};
        let totalStock = 0;

        inventories.forEach((inv) => {
          const qty = inv.quantity || 0;
          totalStock += qty;
          const locObj: any = inv.locationId;
          const locName = locObj && typeof locObj === "object" ? locObj.name : "คลังทั่วไป";
          locationMap[locName] = (locationMap[locName] || 0) + qty;
        });

        const stockByLocation = Object.entries(locationMap).map(([locationName, quantity]) => ({
          locationName,
          quantity,
        }));

        const stockFlex = buildStockFlexMessage(matchedProduct, stockByLocation, totalStock, baseUrl);
        await replyLineMessage(replyToken, [stockFlex], channelAccessToken);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("LINE Webhook Error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
