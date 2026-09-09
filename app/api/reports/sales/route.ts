import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Refer from "@/models/Refer";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import StorageLocation from "@/models/StorageLocation";
import { getSession } from "@/lib/auth";

// Ensure models are registered for Mongoose population
if (!Order || !Refer || !Product || !Category || !SubCategory || !StorageLocation) {
  // Models registered
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const canAccess =
      session.role === "admin" ||
      (Array.isArray(session.allowedPages) &&
        (session.allowedPages.includes("/dashboard") || session.allowedPages.includes("/reports")));

    if (!canAccess) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงรายงานสรุปยอดขาย" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const preset = searchParams.get("preset") || "7days";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const filterPaymentStatus = searchParams.get("paymentStatus") || "all";

    await connectDB();

    const yearParam = searchParams.get("year");

    // Determine Date Range
    let start: Date;
    let end: Date = new Date();
    end.setHours(23, 59, 59, 999);

    const now = new Date();

    if (yearParam && !isNaN(Number(yearParam))) {
      const selectedYear = Number(yearParam);
      start = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
      end = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    } else if (preset === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (preset === "this_week") {
      // Start of current week (Monday)
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
    } else if (preset === "7days") {
      start = new Date();
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (preset === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    } else if (preset === "30days") {
      start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (preset === "this_year") {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    } else if (preset === "custom" && startDateParam && endDateParam) {
      start = new Date(startDateParam);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    }

    // Build Mongoose Query
    const query: any = {
      orderDate: { $gte: start, $lte: end },
    };

    if (filterPaymentStatus !== "all") {
      if (filterPaymentStatus === "PENDING_COLLECTION") {
        query.paymentStatus = { $in: ["UNPAID", "BILLED", "OVERDUE"] };
      } else {
        query.paymentStatus = filterPaymentStatus;
      }
    }

    // Fetch Orders
    const orders = await Order.find(query)
      .populate("customerId")
      .populate("items.productId")
      .sort({ orderDate: -1 });

    let totalSales = 0;
    let paidSales = 0;
    let pendingSales = 0;

    let totalOrdersCount = orders.length;
    let paidOrdersCount = 0;
    let pendingOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let totalItemsSold = 0;

    let deliveredOrdersCount = 0;
    let shippedOrdersCount = 0;
    let pendingDeliveryCount = 0;

    const monthlyMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 };
    const categoryMap: Record<string, number> = {};
    const subCategoryMap: Record<string, number> = {};
    const locationMap: Record<string, number> = {};

    const dispatcherMap: Record<
      string,
      { senderName: string; totalOrders: number; deliveredCount: number; shippedCount: number; pendingCount: number; grandTotal: number }
    > = {};

    const customerMap: Record<
      string,
      {
        customerName: string;
        taxId?: string;
        totalOrders: number;
        paidAmount: number;
        pendingAmount: number;
        grandTotal: number;
        orders: any[];
        productsMap: Record<string, any>;
      }
    > = {};
    const productMap: Record<string, { code: string; name: string; unit: string; totalQty: number; totalAmount: number }> = {};
    const dailyMap: Record<string, { date: string; total: number; paid: number; pending: number }> = {};
    const salespersonMap: Record<
      string,
      {
        salespersonName: string;
        totalOrders: number;
        paidAmount: number;
        pendingAmount: number;
        totalSales: number;
        orders: any[];
      }
    > = {};

    orders.forEach((o) => {
      const gTotal = o.grandTotal || 0;

      if (o.deliveryStatus === "CANCELLED") {
        cancelledOrdersCount++;
        return;
      }

      totalSales += gTotal;

      if (o.paymentStatus === "PAID") {
        paidSales += gTotal;
        paidOrdersCount++;
      } else {
        pendingSales += gTotal;
        pendingOrdersCount++;
      }

      const deliv = o.deliveryStatus || "PENDING";
      if (deliv === "DELIVERED") deliveredOrdersCount++;
      else if (deliv === "SHIPPED") shippedOrdersCount++;
      else if (deliv === "PENDING") pendingDeliveryCount++;

      const sender = (o as any).senderName || "ไม่ระบุผู้ส่ง";
      if (!dispatcherMap[sender]) {
        dispatcherMap[sender] = { senderName: sender, totalOrders: 0, deliveredCount: 0, shippedCount: 0, pendingCount: 0, grandTotal: 0 };
      }
      dispatcherMap[sender].totalOrders += 1;
      dispatcherMap[sender].grandTotal += gTotal;
      if (deliv === "DELIVERED") dispatcherMap[sender].deliveredCount += 1;
      else if (deliv === "SHIPPED") dispatcherMap[sender].shippedCount += 1;
      else if (deliv === "PENDING") dispatcherMap[sender].pendingCount += 1;

      // Monthly Trend
      const oDate = new Date(o.orderDate);
      const mIdx = oDate.getMonth();
      monthlyMap[mIdx] = (monthlyMap[mIdx] || 0) + gTotal;

      // Customer Sales Breakdown
      const custId = o.customerId ? (o.customerId as any)._id?.toString() || o.customerName : o.customerName;
      const custTaxId = o.customerId ? (o.customerId as any).taxId : undefined;
      if (!customerMap[custId]) {
        customerMap[custId] = {
          customerName: o.customerName,
          taxId: custTaxId,
          totalOrders: 0,
          paidAmount: 0,
          pendingAmount: 0,
          grandTotal: 0,
          orders: [],
          productsMap: {},
        };
      }
      customerMap[custId].totalOrders += 1;
      customerMap[custId].grandTotal += gTotal;
      if (o.paymentStatus === "PAID") {
        customerMap[custId].paidAmount += gTotal;
      } else {
        customerMap[custId].pendingAmount += gTotal;
      }

      // Salesperson Sales Breakdown
      const spName = (o as any).salespersonName || "ไม่ระบุพนักงานขาย";
      if (!salespersonMap[spName]) {
        salespersonMap[spName] = {
          salespersonName: spName,
          totalOrders: 0,
          paidAmount: 0,
          pendingAmount: 0,
          totalSales: 0,
          orders: [],
        };
      }
      salespersonMap[spName].totalOrders += 1;
      salespersonMap[spName].totalSales += gTotal;
      if (o.paymentStatus === "PAID") {
        salespersonMap[spName].paidAmount += gTotal;
      } else {
        salespersonMap[spName].pendingAmount += gTotal;
      }
      salespersonMap[spName].orders.push({
        _id: o._id,
        orderNo: o.orderNo,
        customerName: o.customerName,
        orderDate: o.orderDate,
        grandTotal: gTotal,
        paymentStatus: o.paymentStatus,
      });

      // Add order item details to customer's order history
      customerMap[custId].orders.push({
        _id: o._id,
        orderNo: o.orderNo,
        orderDate: o.orderDate,
        deliveryStatus: o.deliveryStatus,
        paymentStatus: o.paymentStatus,
        grandTotal: gTotal,
        itemsCount: o.items?.length || 0,
      });

      // Product & Category Breakdown
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const qty = item.quantity || 0;
          const amt = item.amount || 0;
          totalItemsSold += qty;

          const pKey = item.productCode || item.productName;
          if (!productMap[pKey]) {
            productMap[pKey] = {
              code: item.productCode || "-",
              name: item.productName || "สินค้า",
              unit: item.unit || "ชิ้น",
              totalQty: 0,
              totalAmount: 0,
            };
          }
          productMap[pKey].totalQty += qty;
          productMap[pKey].totalAmount += amt;

          // SubCategory Breakdown
          const subCatName = item.productId?.subCategoryId?.name || item.subCategoryName || "ทั่วไป";
          subCategoryMap[subCatName] = (subCategoryMap[subCatName] || 0) + amt;

          // Category Breakdown
          const catName = item.productId?.subCategoryId?.categoryName || "อุปกรณ์ & สินค้าทั่วไป";
          categoryMap[catName] = (categoryMap[catName] || 0) + amt;

          // Location / Region Breakdown
          const locName = item.locationName || "คลังหลัก (Central)";
          locationMap[locName] = (locationMap[locName] || 0) + amt;

          // Aggregated product purchase by customer
          if (!customerMap[custId].productsMap[pKey]) {
            customerMap[custId].productsMap[pKey] = {
              code: item.productCode || "-",
              name: item.productName || "สินค้า",
              unit: item.unit || "ชิ้น",
              totalQty: 0,
              totalAmount: 0,
            };
          }
          customerMap[custId].productsMap[pKey].totalQty += qty;
          customerMap[custId].productsMap[pKey].totalAmount += amt;
        });
      }

      // Daily Sales Trend Breakdown
      const dateStr = new Date(o.orderDate).toISOString().split("T")[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, total: 0, paid: 0, pending: 0 };
      }
      dailyMap[dateStr].total += gTotal;
      if (o.paymentStatus === "PAID") {
        dailyMap[dateStr].paid += gTotal;
      } else {
        dailyMap[dateStr].pending += gTotal;
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySales = monthNames.map((name, i) => ({
      month: name,
      total: monthlyMap[i] || 0,
    }));

    const categorySales = Object.entries(categoryMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const subCategorySales = Object.entries(subCategoryMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const locationSales = Object.entries(locationMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const customerSales = Object.values(customerMap)
      .map((c) => ({
        customerName: c.customerName,
        taxId: c.taxId,
        totalOrders: c.totalOrders,
        paidAmount: c.paidAmount,
        pendingAmount: c.pendingAmount,
        grandTotal: c.grandTotal,
        orders: c.orders,
        purchasedProducts: Object.values(c.productsMap).sort((a: any, b: any) => b.totalAmount - a.totalAmount),
      }))
      .sort((a, b) => b.grandTotal - a.grandTotal);
    const productSales = Object.values(productMap).sort((a, b) => b.totalAmount - a.totalAmount);
    const dailySales = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    const salespersonSales = Object.values(salespersonMap).sort((a, b) => b.totalSales - a.totalSales);
    const dispatchers = Object.values(dispatcherMap).sort((a, b) => b.totalOrders - a.totalOrders);

    return NextResponse.json({
      dateRange: {
        preset,
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      },
      summary: {
        totalSales,
        paidSales,
        pendingSales,
        totalOrdersCount,
        paidOrdersCount,
        pendingOrdersCount,
        cancelledOrdersCount,
        totalItemsSold,
      },
      deliverySummary: {
        deliveredOrdersCount,
        shippedOrdersCount,
        pendingDeliveryCount,
        cancelledOrdersCount,
        dispatchers,
      },
      monthlySales,
      categorySales,
      subCategorySales,
      locationSales,
      customerSales,
      productSales,
      salespersonSales,
      dailySales,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการดึงรายงานสรุปยอดขาย" },
      { status: 500 }
    );
  }
}
