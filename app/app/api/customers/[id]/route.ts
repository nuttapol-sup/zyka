import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Refer from "@/models/Refer";
import { getSession } from "@/lib/auth";

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/customers"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขข้อมูลลูกค้า" }, { status: 403 });
    }

    const { id } = await params;
    const {
      referType,
      personnelType,
      prefix,
      fullname,
      address,
      taxId,
      phone,
      contactName,
      note,
      status,
    } = await request.json();

    await connectDB();
    const item = await Refer.findById(id);
    if (!item) {
      return NextResponse.json({ error: "ไม่พบข้อมูลลูกค้าที่ต้องการแก้ไข" }, { status: 404 });
    }

    const selectedType = referType || personnelType;
    if (selectedType) item.referType = selectedType === "3" ? "3" : "2";
    if (prefix !== undefined) item.prefix = prefix;
    if (fullname) item.fullname = fullname;
    if (address !== undefined) item.address = address;
    if (taxId !== undefined) item.taxId = taxId;
    if (phone !== undefined) item.phone = phone;
    if (contactName !== undefined) item.contactName = contactName;
    if (note !== undefined) item.note = note;
    if (status) item.status = status;

    await item.save();

    return NextResponse.json({
      message: "อัปเดตข้อมูลลูกค้าสำเร็จ",
      customer: item,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/customers"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบข้อมูลลูกค้า" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();
    const item = await Refer.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ error: "ไม่พบข้อมูลลูกค้าที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบข้อมูลลูกค้าสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
