import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Refer from "@/models/Refer";
import { getSession } from "@/lib/auth";

// GET /api/customers - List all customers (referType = "2" or "3")
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/customers"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลลูกค้า" }, { status: 403 });
    }

    await connectDB();
    const customers = await Refer.find({ referType: { $in: ["2", "3"] } }).sort({ createdAt: -1 });
    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}

// POST /api/customers - Create new customer (referType = "2" | "3")
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/customers"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์บันทึกข้อมูลลูกค้า" }, { status: 403 });
    }

    const {
      referType, // "2" (บุคคลทั่วไป) or "3" (นิติบุคคล)
      personnelType, // fallback if sent
      prefix,
      fullname,
      address,
      taxId,
      phone,
      contactName,
      note,
      status,
    } = await request.json();

    if (!fullname) {
      return NextResponse.json({ error: "กรุณากรอกชื่อบุคคลหรือชื่อบริษัท/ห้างหุ้นส่วน/ร้านค้า" }, { status: 400 });
    }

    const selectedType = referType || personnelType;
    const typeToSave = selectedType === "3" ? "3" : "2";

    await connectDB();

    const newCustomer = await Refer.create({
      referType: typeToSave,
      prefix: prefix || "",
      fullname,
      address: address || "",
      taxId: taxId || "",
      phone: phone || "",
      contactName: contactName || "",
      note: note || "",
      status: status || "active",
    });

    return NextResponse.json({
      message: "บันทึกข้อมูลลูกค้าสำเร็จ",
      customer: newCustomer,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "ไม่สามารถบันทึกข้อมูลได้" }, { status: 500 });
  }
}
