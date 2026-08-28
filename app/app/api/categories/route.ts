import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth";

// Helper function to auto-generate next numeric Category code ("1", "2", "3"...)
async function getNextCategoryCode() {
  const categories = await Category.find({}, { code: 1 });
  let maxNum = 0;

  for (const cat of categories) {
    if (cat.code) {
      const numPart = parseInt(cat.code, 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }

  return (maxNum + 1).toString();
}

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/categories"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงประเภทหมวดสินค้า" }, { status: 403 });
    }

    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    const nextCode = await getNextCategoryCode();

    return NextResponse.json({ categories, nextCode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทหมวดสินค้า" }, { status: 500 });
  }
}

// POST /api/categories - Create new category
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/categories"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เพิ่มประเภทหมวดสินค้า" }, { status: 403 });
    }

    const { code, name, note, status } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "กรุณากรอกชื่อประเภทหมวดสินค้า" }, { status: 400 });
    }

    await connectDB();

    // Auto-generate numeric code (1, 2, 3...)
    const finalCode = code && code.trim() ? code.trim() : await getNextCategoryCode();

    // Check duplicate code if custom code provided
    const existing = await Category.findOne({ code: finalCode });
    if (existing) {
      // If code already exists, get next numeric code
      const autoCode = await getNextCategoryCode();
      const newCategory = await Category.create({
        code: autoCode,
        name: name.trim(),
        note: note ? note.trim() : undefined,
        status: status || "active",
      });
      return NextResponse.json({
        message: "บันทึกประเภทหมวดสินค้าสำเร็จ",
        category: newCategory,
      });
    }

    const newCategory = await Category.create({
      code: finalCode,
      name: name.trim(),
      note: note ? note.trim() : undefined,
      status: status || "active",
    });

    return NextResponse.json({
      message: "บันทึกประเภทหมวดสินค้าสำเร็จ",
      category: newCategory,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}
