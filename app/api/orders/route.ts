import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Refer from "@/models/Refer";
import Product from "@/models/Product";
import StorageLocation from "@/models/StorageLocation";
import Inventory from "@/models/Inventory";
import StockMovement from "@/models/StockMovement";
import { getSession } from "@/lib/auth";

// GET /api/orders - List all orders with filters
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/orders"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลรายการสั่งซื้อ" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const deliveryStatus = searchParams.get("deliveryStatus") || "all";
    const paymentStatus = searchParams.get("paymentStatus") || "all";

    await connectDB();

    const query: any = {};

    if (deliveryStatus !== "all") {
      query.deliveryStatus = deliveryStatus;
    }

    if (paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { orderNo: searchRegex },
        { billingNo: searchRegex },
        { poNo: searchRegex },
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { salespersonName: searchRegex },
        { senderName: searchRegex },
        { trackingNo: searchRegex },
        { shippingCarrier: searchRegex },
      ];
    }

    const orders = await Order.find(query)
      .populate({ path: "customerId", strictPopulate: false })
      .populate({ path: "salespersonId", strictPopulate: false })
      .populate({ path: "items.productId", strictPopulate: false })
      .populate({ path: "items.locationId", strictPopulate: false })
      .sort({ createdAt: -1 });

    // Summary Statistics
    const allOrders = await Order.find({});
    const stats = {
      totalOrders: allOrders.length,
      pendingDelivery: allOrders.filter((o) => o.deliveryStatus === "PENDING" || o.deliveryStatus === "SHIPPED").length,
      pendingPayment: allOrders.filter((o) => o.paymentStatus === "UNPAID" || o.paymentStatus === "BILLED").length,
      totalRevenue: allOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0),
      unpaidCount: allOrders.filter((o) => o.paymentStatus === "UNPAID").length,
      billedCount: allOrders.filter((o) => o.paymentStatus === "BILLED").length,
      paidCount: allOrders.filter((o) => o.paymentStatus === "PAID").length,
      overdueCount: allOrders.filter((o) => o.paymentStatus === "OVERDUE").length,
    };

    return NextResponse.json({ orders, stats });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new Order and ALWAYS deduct stock from matched product storage location
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/orders"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์บันทึกคำสั่งซื้อ" }, { status: 403 });
    }

    const {
      customerId,
      salespersonId,
      salespersonName,
      poNo,
      expectedDeliveryDate,
      shippedDate,
      senderName,
      orderDate,
      billingNo,
      billingDate,
      creditDays,
      dueDate,
      shippingCarrier,
      trackingNo,
      deliveryStatus,
      paymentStatus,
      paymentMethod,
      items,
      discount,
      hasTax,
      taxRate,
      defaultLocationId,
      attachmentUrl,
      attachmentName,
      note,
    } = await request.json();

    if (!customerId) {
      return NextResponse.json({ error: "กรุณาเลือกลูกค้า" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "กรุณาเลือกรายการสินค้าอย่างน้อย 1 รายการ" }, { status: 400 });
    }

    await connectDB();

    const customer = await Refer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ error: "ไม่พบข้อมูลลูกค้าที่ระบุ" }, { status: 404 });
    }

    // Auto Generate Order Number (ORD-2026-0001)
    const currentYear = new Date().getFullYear();
    const countToday = await Order.countDocuments({});
    const seqNum = String(countToday + 1).padStart(4, "0");
    const orderNo = `ORD-${currentYear}-${seqNum}`;

    // Process Order Items & ALWAYS deduct stock from assigned product location
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const prod = await Product.findById(item.productId);
      if (!prod) continue;

      const qty = parseInt(item.quantity, 10) || 1;
      const price = parseFloat(item.price) || 0;
      const amount = qty * price;
      subtotal += amount;

      // Find the exact Inventory document for this product to deduct stock
      let inventory = null;

      if (item.locationId) {
        inventory = await Inventory.findOne({ productId: prod._id, locationId: item.locationId });
      }

      if (!inventory) {
        inventory = await Inventory.findOne({ productId: prod._id, quantity: { $gt: 0 } }).sort({ quantity: -1 });
      }

      if (!inventory) {
        inventory = await Inventory.findOne({ productId: prod._id });
      }

      if (!inventory) {
        inventory = new Inventory({
          productId: prod._id,
          locationId: defaultLocationId || undefined,
          quantity: 0,
        });
      }

      const balanceBefore = inventory.quantity || 0;
      const balanceAfter = Math.max(0, balanceBefore - qty);
      inventory.quantity = balanceAfter;
      await inventory.save();

      const itemLocId = inventory.locationId ? inventory.locationId.toString() : (defaultLocationId || undefined);
      let itemLocName = "คลังหลัก";

      if (inventory.locationId) {
        const locObj = await StorageLocation.findById(inventory.locationId);
        if (locObj) itemLocName = locObj.name;
      }

      // Log StockMovement ("OUT")
      await StockMovement.create({
        productId: prod._id,
        locationId: itemLocId || undefined,
        type: "OUT",
        quantity: qty,
        balanceBefore,
        balanceAfter,
        refDoc: orderNo,
        note: `ตัดสต็อกอัตโนมัติจากการสั่งซื้อ (${customer.fullname})`,
        createdByName: session.username || "System",
      });

      processedItems.push({
        productId: prod._id,
        productCode: prod.code,
        productName: prod.name,
        unit: prod.unit || "ชิ้น",
        price,
        quantity: qty,
        amount,
        locationId: itemLocId || undefined,
        locationName: itemLocName,
      });
    }

    const disc = parseFloat(discount) || 0;
    const currentSubtotal = Math.max(0, subtotal - disc);
    const isTaxIncluded = hasTax !== false && taxRate !== 0;
    const rate = isTaxIncluded ? (taxRate !== undefined ? parseFloat(taxRate) : 7) : 0;
    const taxAmount = isTaxIncluded ? (currentSubtotal * rate) / 100 : 0;
    const grandTotal = currentSubtotal + taxAmount;

    const orderPayload: any = {
      orderNo,
      customerId: customer._id,
      customerName: customer.fullname,
      customerPhone: customer.phone || "",
      customerAddress: customer.address || "",
      customerTaxId: customer.taxId || "",
      salespersonId: salespersonId || undefined,
      salespersonName: salespersonName ? salespersonName.trim() : "",
      poNo: poNo ? poNo.trim() : "",
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
      shippedDate: shippedDate ? new Date(shippedDate) : undefined,
      senderName: senderName ? senderName.trim() : "",
      orderDate: orderDate ? new Date(orderDate) : new Date(),
      billingNo: billingNo ? billingNo.trim() : "",
      billingDate: billingDate ? new Date(billingDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      creditDays: creditDays || 0,
      deliveryStatus: deliveryStatus || "PENDING",
      shippingCarrier: shippingCarrier || "Kerry Express",
      trackingNo: trackingNo ? trackingNo.trim() : "",
      paymentStatus: paymentStatus || "UNPAID",
      paymentMethod: paymentMethod || "TRANSFER",
      items: processedItems,
      subtotal,
      discount: disc,
      hasTax: isTaxIncluded,
      taxRate: rate,
      taxAmount,
      grandTotal,
      stockDeducted: true,
      deductedLocationId: defaultLocationId || undefined,
      attachmentUrl: attachmentUrl || undefined,
      attachmentName: attachmentName || undefined,
      note: note ? note.trim() : undefined,
      createdByName: session.username || "System",
    };

    const newOrder: any = await Order.create(orderPayload);

    const populatedOrder = await Order.findById(newOrder._id)
      .populate({ path: "customerId", strictPopulate: false })
      .populate({ path: "salespersonId", strictPopulate: false })
      .populate({ path: "items.productId", strictPopulate: false })
      .populate({ path: "items.locationId", strictPopulate: false });

    return NextResponse.json({
      message: "บันทึกคำสั่งซื้อและตัดสต็อกตามสถานที่เก็บเรียบร้อยแล้ว",
      order: populatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ" },
      { status: 500 }
    );
  }
}
