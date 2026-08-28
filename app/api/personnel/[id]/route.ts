import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Refer from "@/models/Refer";
import { getSession } from "@/lib/auth";

// PUT /api/personnel/[id] - Update personnel
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/personnel"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขข้อมูลบุคลากร" }, { status: 403 });
    }

    const { id } = await params;
    const { prefix, fullname, position, phone, note, status } = await request.json();

    await connectDB();
    const item = await Refer.findById(id);
    if (!item) {
      return NextResponse.json({ error: "ไม่พบข้อมูลบุคลากรที่ต้องการแก้ไข" }, { status: 404 });
    }

    if (prefix) item.prefix = prefix;
    if (fullname) item.fullname = fullname;
    if (position) item.position = position;
    if (phone !== undefined) item.phone = phone;
    if (note !== undefined) item.note = note;
    if (status) item.status = status;
    item.referType = "1";

    await item.save();

    return NextResponse.json({
      message: "อัปเดตข้อมูลบุคลากรสำเร็จ",
      personnel: item,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

// DELETE /api/personnel/[id] - Delete personnel
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/personnel"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบข้อมูลบุคลากร" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();
    const item = await Refer.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ error: "ไม่พบข้อมูลบุคลากรที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบข้อมูลบุคลากรสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
