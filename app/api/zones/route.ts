import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Zone from "@/models/Zone";
import { getSession } from "@/lib/auth";

// GET /api/zones - Fetch all zones
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    await connectDB();
    const zones = await Zone.find().sort({ createdAt: -1 });

    return NextResponse.json({ zones });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลโซนสินค้า" },
      { status: 500 }
    );
  }
}

// POST /api/zones - Create a new zone
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (
      session.role !== "admin" &&
      (!session.allowedPages || !session.allowedPages.includes("/zones"))
    ) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เพิ่มโซนสินค้า" }, { status: 403 });
    }

    const { code, name, description, status } = await request.json();

    if (!code || !name) {
      return NextResponse.json(
        { error: "กรุณากรอกรหัสและชื่อโซนสินค้า" },
        { status: 400 }
      );
    }

    await connectDB();

    const formattedCode = code.toUpperCase().trim();

    // Check code duplication
    const existing = await Zone.findOne({ code: formattedCode });
    if (existing) {
      return NextResponse.json(
        { error: `รหัสโซน "${formattedCode}" มีอยู่ในระบบแล้ว` },
        { status: 400 }
      );
    }

    const newZone = await Zone.create({
      code: formattedCode,
      name: name.trim(),
      description: description ? description.trim() : "",
      status: status || "active",
    });

    return NextResponse.json({
      message: "สร้างข้อมูลโซนสินค้าสำเร็จ",
      zone: newZone,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการบันทึกโซนสินค้า" },
      { status: 500 }
    );
  }
}
