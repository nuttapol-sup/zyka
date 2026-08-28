import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SubCategory from "@/models/SubCategory";
import { getSession } from "@/lib/auth";

// PUT /api/sub-categories/[id] - Update sub category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/sub-categories"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขหมวดสินค้า" }, { status: 403 });
    }

    const { id } = await params;
    const { code, name, categoryCode, seq, note, status } = await request.json();

    await connectDB();
    const item = await SubCategory.findById(id);
    if (!item) {
      return NextResponse.json({ error: "ไม่พบหมวดสินค้าที่ต้องการแก้ไข" }, { status: 404 });
    }

    if (code && code.trim().toUpperCase() !== item.code) {
      const existing = await SubCategory.findOne({ code: code.trim().toUpperCase() });
      if (existing) {
        return NextResponse.json({ error: `รหัสหมวดสินค้า ${code.toUpperCase()} มีในระบบแล้ว` }, { status: 400 });
      }
      item.code = code.trim().toUpperCase();
    }

    if (name) item.name = name.trim();
    if (categoryCode) item.categoryCode = categoryCode.trim();
    if (seq !== undefined) item.seq = parseInt(seq, 10);
    if (note !== undefined) item.note = note;
    if (status) item.status = status;

    await item.save();

    return NextResponse.json({
      message: "อัปเดตหมวดสินค้าสำเร็จ",
      subCategory: item,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

// DELETE /api/sub-categories/[id] - Delete sub category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/sub-categories"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบหมวดสินค้า" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();
    const item = await SubCategory.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ error: "ไม่พบหมวดสินค้าที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบหมวดสินค้าสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
