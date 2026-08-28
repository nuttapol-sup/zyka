import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Refer from "@/models/Refer";
import { getSession } from "@/lib/auth";

// GET /api/personnel - List all personnel (referType = "1")
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/personnel"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลบุคลากร" }, { status: 403 });
    }

    await connectDB();
    const personnel = await Refer.find({ referType: "1" }).sort({ createdAt: -1 });
    return NextResponse.json({ personnel });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}

// POST /api/personnel - Create new personnel (referType = "1")
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/personnel"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์บันทึกข้อมูลบุคลากร" }, { status: 403 });
    }

    const { prefix, fullname, position, phone, note, status } = await request.json();

    if (!fullname || !position) {
      return NextResponse.json({ error: "กรุณากรอกชื่อ-นามสกุล และตำแหน่ง" }, { status: 400 });
    }

    await connectDB();

    const newPersonnel = await Refer.create({
      referType: "1",
      prefix: prefix || "นาย",
      fullname,
      position,
      phone: phone || "",
      note: note || "",
      status: status || "active",
    });

    return NextResponse.json({
      message: "บันทึกข้อมูลบุคลากรสำเร็จ",
      personnel: newPersonnel,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "ไม่สามารถบันทึกข้อมูลได้" }, { status: 500 });
  }
}
