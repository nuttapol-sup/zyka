import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth";

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/categories"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขประเภทหมวดสินค้า" }, { status: 403 });
    }

    const { id } = await params;
    const { code, name, note, status } = await request.json();

    await connectDB();
    const item = await Category.findById(id);
    if (!item) {
      return NextResponse.json({ error: "ไม่พบประเภทหมวดสินค้าที่ต้องการแก้ไข" }, { status: 404 });
    }

    if (code && code.trim().toUpperCase() !== item.code) {
      const existing = await Category.findOne({ code: code.trim().toUpperCase() });
      if (existing) {
        return NextResponse.json({ error: `รหัสประเภท ${code.toUpperCase()} มีในระบบแล้ว` }, { status: 400 });
      }
      item.code = code.trim().toUpperCase();
    }

    if (name) item.name = name.trim();
    if (note !== undefined) item.note = note;
    if (status) item.status = status;

    await item.save();

    return NextResponse.json({
      message: "อัปเดตประเภทหมวดสินค้าสำเร็จ",
      category: item,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/categories"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบประเภทหมวดสินค้า" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();
    const item = await Category.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ error: "ไม่พบประเภทหมวดสินค้าที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบประเภทหมวดสินค้าสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
