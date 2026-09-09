import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inventory from "@/models/Inventory";
import StockMovement from "@/models/StockMovement";
import { getSession } from "@/lib/auth";

// PUT /api/inventory/movement/[id] - Edit movement log metadata (refDoc, attachment, note)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/inventory"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขประวัติการเคลื่อนไหวสต็อก" }, { status: 403 });
    }

    const { id } = await params;
    const { refDoc, attachmentUrl, attachmentName, note } = await request.json();

    await connectDB();
    const movement = await StockMovement.findById(id);
    if (!movement) {
      return NextResponse.json({ error: "ไม่พบรายการประวัติที่ต้องการแก้ไข" }, { status: 404 });
    }

    if (refDoc !== undefined) movement.refDoc = refDoc.trim() || undefined;
    if (attachmentUrl !== undefined) movement.attachmentUrl = attachmentUrl || undefined;
    if (attachmentName !== undefined) movement.attachmentName = attachmentName || undefined;
    if (note !== undefined) movement.note = note.trim() || undefined;

    await movement.save();

    const updated = await StockMovement.findById(id)
      .populate("productId")
      .populate("locationId")
      .populate("zoneId");

    return NextResponse.json({
      message: "อัปเดตข้อมูลประวัติการเคลื่อนไหวสำเร็จ",
      movement: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/movement/[id] - Delete movement log record and automatically recalculate inventory stock balance
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/inventory"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบประวัติการเคลื่อนไหวสต็อก" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();
    const movement = await StockMovement.findById(id);
    if (!movement) {
      return NextResponse.json({ error: "ไม่พบรายการประวัติที่ต้องการลบ" }, { status: 404 });
    }

    // Revert inventory stock balance according to movement type and exact product+location+zone filter
    const inventory = await Inventory.findOne({
      productId: movement.productId,
      locationId: movement.locationId || null,
      zoneId: movement.zoneId || null,
    });

    if (inventory) {
      if (movement.type === "IN") {
        // Revert IN: Decrease stock balance
        inventory.quantity = Math.max(0, (inventory.quantity || 0) - movement.quantity);
      } else if (movement.type === "OUT") {
        // Revert OUT: Increase stock balance back
        inventory.quantity = (inventory.quantity || 0) + movement.quantity;
      } else if (movement.type === "ADJUST") {
        // Revert ADJUST: Revert back to balance before adjust
        inventory.quantity = movement.balanceBefore || 0;
      }
      await inventory.save();
    }

    // Delete the movement record
    await StockMovement.findByIdAndDelete(id);

    return NextResponse.json({
      message: "ลบรายการประวัติและปรับปรุงยอดสต็อกเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการลบรายการประวัติ" },
      { status: 500 }
    );
  }
}
