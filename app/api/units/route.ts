import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Unit from "@/models/Unit";
import { getSession } from "@/lib/auth";

const DEFAULT_UNITS = [
  { name: "ชิ้น", description: "หน่วยนับสินค้าทั่วไป (ชิ้น)" },
  { name: "แพ็ค", description: "หน่วยนับสินค้าบรรจุแพ็ค" },
  { name: "กล่อง", description: "หน่วยนับบรรจุกล่อง" },
  { name: "ขวด", description: "หน่วยนับบรรจุขวด" },
  { name: "ลัง", description: "หน่วยนับบรรจุลัง" },
  { name: "ถุง", description: "หน่วยนับบรรจุถุง" },
  { name: "แผง", description: "หน่วยนับยาหรือสินค้าบรรจุแผง" },
  { name: "กิโลกรัม", description: "หน่วยวัดน้ำหนักกิโลกรัม" },
  { name: "ตลับ", description: "หน่วยนับบรรจุตลับ" },
  { name: "หลอด", description: "หน่วยนับบรรจุหลอด" },
  { name: "ซอง", description: "หน่วยนับบรรจุซอง" },
];

async function seedDefaultUnits() {
  const count = await Unit.countDocuments();
  if (count === 0) {
    let seq = 1;
    for (const item of DEFAULT_UNITS) {
      const code = `U-${seq.toString().padStart(2, "0")}`;
      await Unit.create({
        code,
        name: item.name,
        description: item.description,
        seq,
        status: "active",
      });
      seq++;
    }
  }
}

// GET /api/units - Fetch all units
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    await connectDB();
    await seedDefaultUnits();

    const units = await Unit.find().sort({ seq: 1, createdAt: 1 });
    return NextResponse.json({ units });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยนับ" }, { status: 500 });
  }
}

// POST /api/units - Create new unit
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/units"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการข้อมูลหน่วยนับ" }, { status: 403 });
    }

    const { code, name, description, status } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อหน่วยนับ" }, { status: 400 });
    }

    await connectDB();

    // Check duplicate name
    const existingName = await Unit.findOne({ name: name.trim() });
    if (existingName) {
      return NextResponse.json({ error: `ชื่อหน่วยนับ "${name.trim()}" มีอยู่ในระบบแล้ว` }, { status: 400 });
    }

    // Generate automatic code if not provided
    let finalCode = code?.trim()?.toUpperCase();
    if (!finalCode) {
      const count = await Unit.countDocuments();
      finalCode = `U-${(count + 1).toString().padStart(2, "0")}`;
      // Ensure unique code
      let exists = await Unit.findOne({ code: finalCode });
      let extra = 1;
      while (exists) {
        finalCode = `U-${(count + 1 + extra).toString().padStart(2, "0")}`;
        exists = await Unit.findOne({ code: finalCode });
        extra++;
      }
    } else {
      const existingCode = await Unit.findOne({ code: finalCode });
      if (existingCode) {
        return NextResponse.json({ error: `รหัสหน่วยนับ "${finalCode}" มีอยู่ในระบบแล้ว` }, { status: 400 });
      }
    }

    const maxSeqUnit = await Unit.findOne().sort({ seq: -1 });
    const nextSeq = (maxSeqUnit?.seq || 0) + 1;

    const newUnit = await Unit.create({
      code: finalCode,
      name: name.trim(),
      description: description?.trim() || "",
      seq: nextSeq,
      status: status || "active",
    });

    return NextResponse.json({ message: "บันทึกหน่วยนับสำเร็จ", unit: newUnit }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการบันทึกหน่วยนับ" }, { status: 500 });
  }
}
