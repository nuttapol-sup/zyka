import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StorageLocation from "@/models/StorageLocation";
import { getSession } from "@/lib/auth";

// PUT /api/locations/[id] - Update storage location
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/locations"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขข้อมูลสถานที่เก็บสินค้า" }, { status: 403 });
    }

    const { id } = await params;
    const { code, name, type, address, capacity, status, note } = await request.json();

    await connectDB();
    const location = await StorageLocation.findById(id);
    if (!location) {
      return NextResponse.json({ error: "ไม่พบข้อมูลสถานที่เก็บสินค้าที่ต้องการแก้ไข" }, { status: 404 });
    }

    // Check duplicate code if changed
    if (code && code.toUpperCase().trim() !== location.code) {
      const existing = await StorageLocation.findOne({ code: code.toUpperCase().trim() });
      if (existing) {
        return NextResponse.json({ error: "รหัสสถานที่เก็บสินค้านี้มีอยู่ในระบบแล้ว" }, { status: 400 });
      }
      location.code = code.toUpperCase().trim();
    }

    if (name) location.name = name;
    if (type) location.type = type;
    if (address !== undefined) location.address = address;
    if (capacity !== undefined) location.capacity = Number(capacity) || 0;
    if (status) location.status = status;
    if (note !== undefined) location.note = note;

    await location.save();

    return NextResponse.json({
      message: "อัปเดตข้อมูลสถานที่เก็บสินค้าสำเร็จ",
      location,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

// DELETE /api/locations/[id] - Delete storage location
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/locations"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบข้อมูลสถานที่เก็บสินค้า" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();
    const location = await StorageLocation.findByIdAndDelete(id);
    if (!location) {
      return NextResponse.json({ error: "ไม่พบข้อมูลสถานที่เก็บสินค้าที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบข้อมูลสถานที่เก็บสินค้าสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
