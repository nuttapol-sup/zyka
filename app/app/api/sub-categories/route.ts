import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SubCategory from "@/models/SubCategory";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth";

// Helper function to auto-generate next sequence number (seq: 1, 2, 3...)
async function getNextSeq() {
  const items = await SubCategory.find({}, { seq: 1 }).sort({ seq: -1 }).limit(1);
  if (items.length > 0 && items[0].seq) {
    return items[0].seq + 1;
  }
  return 1;
}

// GET /api/sub-categories - Get all sub categories with parent category details
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/sub-categories"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงหมวดสินค้า" }, { status: 403 });
    }

    await connectDB();
    const subCategories = await SubCategory.find().sort({ seq: 1 });
    const categories = await Category.find({ status: "active" }).sort({ createdAt: 1 });

    const nextSeq = await getNextSeq();

    // Map parent category name to each subCategory item for easy display
    const mappedItems = subCategories.map((sub) => {
      const parent = categories.find((c) => c.code === sub.categoryCode);
      return {
        ...sub.toObject(),
        categoryName: parent ? parent.name : sub.categoryCode,
      };
    });

    return NextResponse.json({
      subCategories: mappedItems,
      categories,
      nextSeq,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดสินค้า" }, { status: 500 });
  }
}

// POST /api/sub-categories - Create new sub category
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/sub-categories"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เพิ่มหมวดสินค้า" }, { status: 403 });
    }

    const { code, name, categoryCode, seq, note, status } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "กรุณากรอกรหัสหมวดสินค้า" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "กรุณากรอกชื่อหมวดสินค้า" }, { status: 400 });
    }
    if (!categoryCode) {
      return NextResponse.json({ error: "กรุณาเลือกประเภทหมวดสินค้า" }, { status: 400 });
    }

    await connectDB();

    const finalCode = code.trim().toUpperCase();
    const finalSeq = seq ? parseInt(seq, 10) : await getNextSeq();

    // Check duplicate code
    const existing = await SubCategory.findOne({ code: finalCode });
    if (existing) {
      return NextResponse.json({ error: `รหัสหมวดสินค้า ${finalCode} มีในระบบแล้ว` }, { status: 400 });
    }

    const newItem = await SubCategory.create({
      code: finalCode,
      name: name.trim(),
      categoryCode: categoryCode.trim(),
      seq: finalSeq,
      note: note ? note.trim() : undefined,
      status: status || "active",
    });

    return NextResponse.json({
      message: "บันทึกหมวดสินค้าสำเร็จ",
      subCategory: newItem,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}
