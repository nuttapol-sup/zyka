import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Position from "@/models/Position";
import { getSession } from "@/lib/auth";

// GET /api/positions - Fetch all job positions
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    await connectDB();

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status !== "all") {
      query.status = status;
    }

    const positions = await Position.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ positions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลตำแหน่งงาน" },
      { status: 500 }
    );
  }
}

// POST /api/positions - Create a new job position
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const { code, name, description, status } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อตำแหน่งงาน" }, { status: 400 });
    }

    await connectDB();

    // Check duplicate name
    const existing = await Position.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ error: `ตำแหน่งงานชื่อ "${name.trim()}" มีอยู่ในระบบแล้ว` }, { status: 400 });
    }

    const position = await Position.create({
      code: code ? code.trim() : "",
      name: name.trim(),
      description: description ? description.trim() : "",
      status: status || "active",
    });

    return NextResponse.json({ message: "เพิ่มตำแหน่งงานใหม่เรียบร้อยแล้ว", position });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการเพิ่มตำแหน่งงาน" },
      { status: 500 }
    );
  }
}
