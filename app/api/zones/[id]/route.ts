import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Zone from "@/models/Zone";
import Inventory from "@/models/Inventory";
import StockMovement from "@/models/StockMovement";
import { getSession } from "@/lib/auth";

// GET /api/zones/[id] - Get zone by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const zone = await Zone.findById(id);
    if (!zone) {
      return NextResponse.json({ error: "ไม่พบข้อมูลโซนสินค้า" }, { status: 404 });
    }

    return NextResponse.json({ zone });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลโซนสินค้า" },
      { status: 500 }
    );
  }
}

// PUT /api/zones/[id] - Update zone
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (
      session.role !== "admin" &&
      (!session.allowedPages || !session.allowedPages.includes("/zones"))
    ) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขโซนสินค้า" }, { status: 403 });
    }

    const { id } = await params;
    const { code, name, description, status } = await request.json();

    if (!code || !name) {
      return NextResponse.json(
        { error: "กรุณากรอกรหัสและชื่อโซนสินค้า" },
        { status: 400 }
      );
    }

    await connectDB();

    const zone = await Zone.findById(id);
    if (!zone) {
      return NextResponse.json({ error: "ไม่พบข้อมูลโซนสินค้า" }, { status: 404 });
    }

    const formattedCode = code.toUpperCase().trim();

    // Check code collision with other zones
    if (formattedCode !== zone.code) {
      const existing = await Zone.findOne({ code: formattedCode });
      if (existing) {
        return NextResponse.json(
          { error: `รหัสโซน "${formattedCode}" มีในระบบแล้ว` },
          { status: 400 }
        );
      }
    }

    zone.code = formattedCode;
    zone.name = name.trim();
    zone.description = description !== undefined ? description.trim() : zone.description;
    zone.status = status || zone.status;

    await zone.save();

    return NextResponse.json({
      message: "อัปเดตข้อมูลโซนสินค้าสำเร็จ",
      zone,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการอัปเดตโซนสินค้า" },
      { status: 500 }
    );
  }
}

// DELETE /api/zones/[id] - Delete zone
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (
      session.role !== "admin" &&
      (!session.allowedPages || !session.allowedPages.includes("/zones"))
    ) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบโซนสินค้า" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const zone = await Zone.findById(id);
    if (!zone) {
      return NextResponse.json({ error: "ไม่พบข้อมูลโซนสินค้า" }, { status: 404 });
    }

    // Check usage in Inventory & StockMovement
    if (Inventory) {
      const inUseInv = await Inventory.findOne({ zoneId: id });
      if (inUseInv) {
        return NextResponse.json(
          { error: `ไม่สามารถลบโซน "${zone.name}" ได้เนื่องจากมีสินค้าคงเหลือเก็บในโซนนี้` },
          { status: 400 }
        );
      }
    }

    if (StockMovement) {
      const inUseMove = await StockMovement.findOne({ zoneId: id });
      if (inUseMove) {
        return NextResponse.json(
          { error: `ไม่สามารถลบโซน "${zone.name}" ได้เนื่องจากมีประวัติรับเข้า/เบิกออกที่อ้างอิงโซนนี้` },
          { status: 400 }
        );
      }
    }

    await Zone.findByIdAndDelete(id);

    return NextResponse.json({
      message: "ลบโซนสินค้าเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการลบโซนสินค้า" },
      { status: 500 }
    );
  }
}
