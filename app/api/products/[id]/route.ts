import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import SubCategory from "@/models/SubCategory";
import { getSession } from "@/lib/auth";

// Register SubCategory model explicitly for populate
if (!SubCategory) {
  // Ensure schema registered
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/products"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขสินค้า" }, { status: 403 });
    }

    const { id } = await params;
    const { code, name, unit, subCategoryId, description, minQuantity, seq, status } = await request.json();

    await connectDB();
    const item = await Product.findById(id);
    if (!item) {
      return NextResponse.json({ error: "ไม่พบสินค้าที่ต้องการแก้ไข" }, { status: 404 });
    }

    if (code && code.trim().toUpperCase() !== item.code) {
      const existing = await Product.findOne({ code: code.trim().toUpperCase() });
      if (existing) {
        return NextResponse.json({ error: `รหัสสินค้า ${code.toUpperCase()} มีในระบบแล้ว` }, { status: 400 });
      }
      item.code = code.trim().toUpperCase();
    }

    if (name) item.name = name.trim();
    if (unit) item.unit = unit.trim();
    item.subCategoryId = subCategoryId || undefined;
    if (description !== undefined) item.description = description;
    if (minQuantity !== undefined) item.minQuantity = Math.max(0, parseInt(minQuantity, 10));
    if (seq !== undefined) item.seq = parseInt(seq, 10);
    if (status) item.status = status;

    await item.save();

    const updatedItem = await Product.findById(id).populate("subCategoryId");

    return NextResponse.json({
      message: "อัปเดตข้อมูลสินค้าสำเร็จ",
      product: updatedItem,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/products"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบสินค้า" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();
    const item = await Product.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ error: "ไม่พบสินค้าที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบสินค้าสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
