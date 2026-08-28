import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StorageLocation from "@/models/StorageLocation";
import { getSession } from "@/lib/auth";

// GET /api/locations - List all storage locations
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    // Check page permission (admin always allowed)
    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/locations"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลสถานที่เก็บสินค้า" }, { status: 403 });
    }

    await connectDB();
    const locations = await StorageLocation.find().sort({ createdAt: -1 });
    return NextResponse.json({ locations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}

// POST /api/locations - Create new storage location
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/locations"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์บันทึกข้อมูลสถานที่เก็บสินค้า" }, { status: 403 });
    }

    const { code, name, type, address, capacity, status, note } = await request.json();

    if (!code || !name) {
      return NextResponse.json({ error: "กรุณากรอกรหัสและชื่อสถานที่เก็บสินค้า" }, { status: 400 });
    }

    await connectDB();

    // Check existing code
    const existing = await StorageLocation.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json({ error: "รหัสสถานที่เก็บสินค้านี้มีอยู่ในระบบแล้ว" }, { status: 400 });
    }

    const newLocation = await StorageLocation.create({
      code: code.toUpperCase().trim(),
      name,
      type: type || "คลังสินค้าหลัก",
      address: address || "",
      capacity: Number(capacity) || 0,
      status: status || "active",
      note: note || "",
    });

    return NextResponse.json({
      message: "บันทึกสถานที่เก็บสินค้าสำเร็จ",
      location: newLocation,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "ไม่สามารถบันทึกข้อมูลได้" }, { status: 500 });
  }
}
