import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Inventory from "@/models/Inventory";
import SubCategory from "@/models/SubCategory";
import { getSession } from "@/lib/auth";

// Register SubCategory model explicitly for populate
if (!SubCategory) {
  // Ensure schema registered
}

// Helper function to auto-generate next sequence number (seq: 1, 2, 3...)
async function getNextSeq() {
  const items = await Product.find({}, { seq: 1 }).sort({ seq: -1 }).limit(1);
  if (items.length > 0 && items[0].seq) {
    return items[0].seq + 1;
  }
  return 1;
}

// Helper function to auto-generate next Product code (P-001, P-002...)
async function getNextCode() {
  const items = await Product.find({}, { code: 1 }).sort({ createdAt: -1 });
  let maxNum = 0;

  for (const item of items) {
    if (item.code && item.code.startsWith("P-")) {
      const numPart = parseInt(item.code.replace("P-", ""), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }

  return `P-${(maxNum + 1).toString().padStart(3, "0")}`;
}

// GET /api/products - Get all products with subCategory populated and total stock
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (
      session.role !== "admin" &&
      (!session.allowedPages ||
        (!session.allowedPages.includes("/products") && !session.allowedPages.includes("/orders")))
    ) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงสินค้า" }, { status: 403 });
    }

    await connectDB();
    const productsRaw = await Product.find().populate("subCategoryId").sort({ seq: 1 });
    const inventories = await Inventory.find({});

    const stockMap: Record<string, number> = {};
    inventories.forEach((inv) => {
      const pId = inv.productId ? inv.productId.toString() : "";
      if (pId) {
        stockMap[pId] = (stockMap[pId] || 0) + (inv.quantity || 0);
      }
    });

    const products = productsRaw.map((p) => {
      const obj = p.toObject();
      return {
        ...obj,
        stock: stockMap[p._id.toString()] || 0,
      };
    });

    const nextSeq = await getNextSeq();
    const nextCode = await getNextCode();

    return NextResponse.json({
      products,
      nextSeq,
      nextCode,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า" }, { status: 500 });
  }
}

// POST /api/products - Create new product
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/products"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์สร้างสินค้า" }, { status: 403 });
    }

    const { seq, code, name, subCategoryId, unit, minQuantity, isRawMaterial, status } = await request.json();

    if (!code || !name) {
      return NextResponse.json({ error: "กรุณากรอกรหัสและชื่อสินค้า" }, { status: 400 });
    }

    await connectDB();

    // Check duplicate code
    const existing = await Product.findOne({ code: code.trim() });
    if (existing) {
      return NextResponse.json({ error: "รหัสสินค้านี้มีอยู่ในระบบแล้ว" }, { status: 400 });
    }

    const product = await Product.create({
      seq: seq || (await getNextSeq()),
      code: code.trim(),
      name: name.trim(),
      subCategoryId: subCategoryId || undefined,
      unit: unit ? unit.trim() : "ชิ้น",
      minQuantity: minQuantity || 0,
      status: status || "active",
    });

    const populated = await Product.findById((product as any)._id).populate("subCategoryId");

    return NextResponse.json({
      message: "สร้างสินค้าสำเร็จ",
      product: populated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการสร้างสินค้า" }, { status: 500 });
  }
}
