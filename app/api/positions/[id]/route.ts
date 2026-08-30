import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Position from "@/models/Position";
import { getSession } from "@/lib/auth";

// GET /api/positions/[id] - Get single position
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

    const position = await Position.findById(id);
    if (!position) {
      return NextResponse.json({ error: "ไม่พบตำแหน่งงาน" }, { status: 404 });
    }

    return NextResponse.json({ position });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลตำแหน่งงาน" },
      { status: 500 }
    );
  }
}

// PUT /api/positions/[id] - Update position
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const { id } = await params;
    const { code, name, description, status } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อตำแหน่งงาน" }, { status: 400 });
    }

    await connectDB();

    const position = await Position.findById(id);
    if (!position) {
      return NextResponse.json({ error: "ไม่พบตำแหน่งงานที่ต้องการแก้ไข" }, { status: 404 });
    }

    // Check duplicate name on other positions
    const existing = await Position.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });
    if (existing) {
      return NextResponse.json({ error: `ตำแหน่งงานชื่อ "${name.trim()}" มีอยู่ในระบบแล้ว` }, { status: 400 });
    }

    position.code = code ? code.trim() : "";
    position.name = name.trim();
    position.description = description ? description.trim() : "";
    if (status) position.status = status;

    await position.save();

    return NextResponse.json({ message: "อัปเดตข้อมูลตำแหน่งงานเรียบร้อยแล้ว", position });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการแก้ไขตำแหน่งงาน" },
      { status: 500 }
    );
  }
}

// DELETE /api/positions/[id] - Delete position
export async function DELETE(
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

    const position = await Position.findByIdAndDelete(id);
    if (!position) {
      return NextResponse.json({ error: "ไม่พบตำแหน่งงานที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบตำแหน่งงานเรียบร้อยแล้ว" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการลบตำแหน่งงาน" },
      { status: 500 }
    );
  }
}
