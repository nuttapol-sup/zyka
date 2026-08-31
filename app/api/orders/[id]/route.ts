import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";
import StockMovement from "@/models/StockMovement";
import { getSession } from "@/lib/auth";

// GET /api/orders/[id] - Fetch single order details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const order = await Order.findById(id)
      .populate({ path: "customerId", strictPopulate: false })
      .populate({ path: "salespersonId", strictPopulate: false })
      .populate({ path: "items.productId", strictPopulate: false })
      .populate({ path: "items.locationId", strictPopulate: false });

    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order details or tracking status & deduct stock on demand / status change
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/orders"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขคำสั่งซื้อ" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อที่ต้องการแก้ไข" }, { status: 404 });
    }

    // Check if user requests stock deduction now or if delivery status changed to SHIPPED/DELIVERED with stock deduction requested
    const shouldDeductStock =
      !order.stockDeducted &&
      (body.deductStock === true ||
        (body.autoDeductOnDelivery && (body.deliveryStatus === "SHIPPED" || body.deliveryStatus === "DELIVERED")));

    if (shouldDeductStock && order.items && order.items.length > 0) {
      const locId = body.locationId || order.deductedLocationId || undefined;

      for (const item of order.items) {
        const invFilter = {
          productId: item.productId,
          locationId: locId || null,
        };

        let inventory = await Inventory.findOne(invFilter);
        if (!inventory) {
          inventory = new Inventory({
            productId: item.productId,
            locationId: locId || undefined,
            quantity: 0,
          });
        }

        const balanceBefore = inventory.quantity || 0;
        const balanceAfter = Math.max(0, balanceBefore - item.quantity);
        inventory.quantity = balanceAfter;
        await inventory.save();

        // Audit log in StockMovement
        await StockMovement.create({
          productId: item.productId,
          locationId: locId || undefined,
          type: "OUT",
          quantity: item.quantity,
          balanceBefore,
          balanceAfter,
          refDoc: order.orderNo,
          note: `ตัดสต็อกจากการอัปเดตคำสั่งซื้อ/จัดส่ง (${order.customerName})`,
          createdByName: session.username || "System",
        });
      }

      order.stockDeducted = true;
      order.deductedLocationId = locId || undefined;
    }

    if (body.salespersonId !== undefined) (order as any).salespersonId = body.salespersonId || undefined;
    if (body.salespersonName !== undefined) (order as any).salespersonName = body.salespersonName;
    if (body.deliveryStatus !== undefined) order.deliveryStatus = body.deliveryStatus;
    if (body.shippingCarrier !== undefined) order.shippingCarrier = body.shippingCarrier;
    if (body.trackingNo !== undefined) order.trackingNo = body.trackingNo;
    if (body.paymentStatus !== undefined) order.paymentStatus = body.paymentStatus;
    if (body.paymentMethod !== undefined) order.paymentMethod = body.paymentMethod;
    if (body.dueDate !== undefined) order.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
    if (body.billingDate !== undefined) order.billingDate = body.billingDate ? new Date(body.billingDate) : undefined;
    if (body.creditDays !== undefined) order.creditDays = body.creditDays;
    if (body.attachmentUrl !== undefined) order.attachmentUrl = body.attachmentUrl;
    if (body.attachmentName !== undefined) order.attachmentName = body.attachmentName;
    if (body.note !== undefined) order.note = body.note;

    await order.save();

    const updated = await Order.findById(id)
      .populate({ path: "customerId", strictPopulate: false })
      .populate({ path: "salespersonId", strictPopulate: false })
      .populate({ path: "items.productId", strictPopulate: false })
      .populate({ path: "items.locationId", strictPopulate: false });

    return NextResponse.json({
      message: "อัปเดตข้อมูลคำสั่งซื้อสำเร็จ",
      order: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Delete order (and revert stock if deducted)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/orders"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบคำสั่งซื้อ" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อที่ต้องการลบ" }, { status: 404 });
    }

    // Revert stock deduction if stock was deducted for this order
    if (order.stockDeducted && order.items && order.items.length > 0) {
      for (const item of order.items) {
        let inventory = null;

        if (item.locationId) {
          inventory = await Inventory.findOne({ productId: item.productId, locationId: item.locationId });
        }

        if (!inventory) {
          inventory = await Inventory.findOne({ productId: item.productId }).sort({ quantity: -1 });
        }

        if (!inventory) {
          inventory = new Inventory({
            productId: item.productId,
            locationId: item.locationId || order.deductedLocationId || undefined,
            quantity: 0,
          });
        }

        const balanceBefore = inventory.quantity || 0;
        const balanceAfter = balanceBefore + item.quantity;
        inventory.quantity = balanceAfter;
        await inventory.save();

        const itemLocId = inventory.locationId ? inventory.locationId.toString() : (order.deductedLocationId || undefined);

        await StockMovement.create({
          productId: item.productId,
          locationId: itemLocId || undefined,
          type: "IN",
          quantity: item.quantity,
          balanceBefore,
          balanceAfter,
          refDoc: order.orderNo,
          note: `คืนสต็อกเข้าคลังอัตโนมัติจากการยกเลิก/ลบคำสั่งซื้อ (${order.customerName})`,
          createdByName: session.username || "System",
        });
      }
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({ message: "ลบคำสั่งซื้อสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการลบคำสั่งซื้อ" },
      { status: 500 }
    );
  }
}
