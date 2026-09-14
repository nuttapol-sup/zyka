import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Department from "@/models/Department";
import { getSession } from "@/lib/auth";

const DEFAULT_DEPARTMENTS = [
  "ฝ่ายทรัพยากรบุคคล",
  "ประธานกรรมการบริษัท",
  "จัดซื้อต่างประเทศ",
  "ฝ่ายจัดซื้อ",
  "ฝ่ายขาย",
  "บริหารงานทั่วไป",
  "ฝ่ายคลังสินค้า",
  "ฝ่ายผลิต",
  "ธุรการ",
  "ฝ่ายบัญชีและการเงิน",
];

// GET /api/departments - Fetch all departments (with auto-seeding)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    await connectDB();
    let departments = await Department.find().sort({ seq: 1, createdAt: 1 });

    // Auto-seed default Thai departments if none exist
    if (!departments || departments.length === 0) {
      const docs = DEFAULT_DEPARTMENTS.map((deptName, idx) => ({
        code: `D-${(idx + 1).toString().padStart(2, "0")}`,
        name: deptName,
        description: "",
        seq: idx + 1,
        status: "active",
      }));
      await Department.insertMany(docs);
      departments = await Department.find().sort({ seq: 1, createdAt: 1 });
    }

    return NextResponse.json({ departments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแผนก" },
      { status: 500 }
    );
  }
}

// POST /api/departments - Create a new department
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (
      session.role !== "admin" &&
      (!session.allowedPages || !session.allowedPages.includes("/departments"))
    ) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เพิ่มข้อมูลแผนก" }, { status: 403 });
    }

    const { code, name, description, seq, status } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อแผนก" }, { status: 400 });
    }

    await connectDB();

    const formattedName = name.trim();

    // Check duplicate name
    const existing = await Department.findOne({ name: formattedName });
    if (existing) {
      return NextResponse.json(
        { error: `แผนกชื่อ "${formattedName}" มีอยู่ในระบบแล้ว` },
        { status: 400 }
      );
    }

    const maxSeqDoc = await Department.findOne().sort({ seq: -1 });
    const nextSeq = seq ? Number(seq) : (maxSeqDoc ? maxSeqDoc.seq + 1 : 1);

    const newDepartment = await Department.create({
      code: code ? code.trim() : "",
      name: formattedName,
      description: description ? description.trim() : "",
      seq: nextSeq,
      status: status || "active",
    });

    return NextResponse.json({
      message: "สร้างข้อมูลแผนกสำเร็จ",
      department: newDepartment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลแผนก" },
      { status: 500 }
    );
  }
}
