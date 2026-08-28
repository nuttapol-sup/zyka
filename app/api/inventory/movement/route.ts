import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inventory from "@/models/Inventory";
import Product from "@/models/Product";
import StorageLocation from "@/models/StorageLocation";
import StockMovement from "@/models/StockMovement";
import { getSession } from "@/lib/auth";

// POST /api/inventory/movement - Record stock movement (IN, OUT, ADJUST)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/inventory"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ปรับปรุงสต็อกสินค้า" }, { status: 403 });
    }

    const { productId, locationId, type, quantity, refDoc, attachmentUrl, attachmentName, note } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "กรุณาเลือกสินค้า" }, { status: 400 });
    }
    if (!type || !["IN", "OUT", "ADJUST"].includes(type)) {
      return NextResponse.json({ error: "ประเภทรายการไม่ถูกต้อง (IN, OUT, ADJUST)" }, { status: 400 });
    }

    const moveQty = parseInt(quantity, 10);
    if (isNaN(moveQty) || moveQty < 0) {
      return NextResponse.json({ error: "จำนวนสินค้าต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "ไม่พบข้อมูลสินค้า" }, { status: 404 });
    }

    if (locationId) {
      const loc = await StorageLocation.findById(locationId);
      if (!loc) {
        return NextResponse.json({ error: "ไม่พบข้อมูลสถานที่เก็บสินค้า" }, { status: 404 });
      }
    }

    // Find or initialize inventory record
    const filter = {
      productId,
      locationId: locationId || null,
    };

    let inventory = await Inventory.findOne(filter);
    if (!inventory) {
      inventory = new Inventory({
        productId,
        locationId: locationId || undefined,
        quantity: 0,
      });
    }

    const balanceBefore = inventory.quantity || 0;
    let balanceAfter = balanceBefore;

    if (type === "IN") {
      if (moveQty <= 0) {
        return NextResponse.json({ error: "จำนวนการรับเข้าต้องมากกว่า 0" }, { status: 400 });
      }
      balanceAfter = balanceBefore + moveQty;
    } else if (type === "OUT") {
      if (moveQty <= 0) {
        return NextResponse.json({ error: "จำนวนการเบิกออกต้องมากกว่า 0" }, { status: 400 });
      }
      if (balanceBefore < moveQty) {
        return NextResponse.json(
          { error: `สินค้าไม่พอเบิกออก (คงเหลือปัจจุบัน: ${balanceBefore} ชิ้น, เบิกออก: ${moveQty} ชิ้น)` },
          { status: 400 }
        );
      }
      balanceAfter = balanceBefore - moveQty;
    } else if (type === "ADJUST") {
      balanceAfter = moveQty;
    }

    // Save updated inventory balance
    inventory.quantity = balanceAfter;
    await inventory.save();

    // Log movement audit entry
    const movement = await StockMovement.create({
      productId,
      locationId: locationId || undefined,
      type,
      quantity: moveQty,
      balanceBefore,
      balanceAfter,
      refDoc: refDoc ? refDoc.trim() : undefined,
      attachmentUrl: attachmentUrl || undefined,
      attachmentName: attachmentName || undefined,
      note: note ? note.trim() : undefined,
      createdByName: session.username || "System",
    });

    const populatedMovement = await StockMovement.findById(movement._id)
      .populate("productId")
      .populate("locationId");

    return NextResponse.json({
      message:
        type === "IN"
          ? "รับสินค้าเข้าสำเร็จ"
          : type === "OUT"
          ? "เบิกสินค้าออกสำเร็จ"
          : "ปรับปรุงสต็อกสำเร็จ",
      inventory,
      movement: populatedMovement,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการบันทึกสต็อก" }, { status: 500 });
  }
}
