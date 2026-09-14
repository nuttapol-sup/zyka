import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getLineCredentials, pushLineMessage } from "@/lib/line";

export async function generateSalesSummaryText(
  type: "weekly" | "monthly" | "yearly",
  userScope?: { role: string; referId?: any; name?: string }
): Promise<string> {
  await connectDB();
  const now = new Date();
  let startDate = new Date();
  let titleType = "";

  if (type === "weekly") {
    titleType = "รายสัปดาห์ (7 วันย้อนหลัง)";
    startDate.setDate(now.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
  } else if (type === "monthly") {
    titleType = `รายเดือน (${now.toLocaleDateString("th-TH", { month: "long", year: "numeric" })})`;
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  } else {
    titleType = `รายปี (ปี ${now.getFullYear() + 543})`;
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
  }

  const query: any = {
    orderDate: { $gte: startDate },
    deliveryStatus: { $ne: "CANCELLED" },
  };

  const isRestrictedSalesperson = userScope && userScope.role !== "admin";
  if (isRestrictedSalesperson) {
    const spConditions: any[] = [];
    if (userScope.referId) {
      spConditions.push({ salespersonId: userScope.referId });
    }
    if (userScope.name) {
      spConditions.push({ salespersonName: userScope.name });
    }
    if (spConditions.length > 0) {
      query.$or = spConditions;
    }
  }

  const orders = await Order.find(query).sort({ orderDate: -1 });

  let totalSales = 0;
  let paidSales = 0;
  let pendingSales = 0;
  let paidCount = 0;
  let pendingCount = 0;

  const customerMap: Record<string, number> = {};

  orders.forEach((o) => {
    const amount = o.grandTotal || 0;
    totalSales += amount;
    if (o.paymentStatus === "PAID") {
      paidSales += amount;
      paidCount++;
    } else {
      pendingSales += amount;
      pendingCount++;
    }

    if (o.customerName) {
      customerMap[o.customerName] = (customerMap[o.customerName] || 0) + amount;
    }
  });

  const topCustomers = Object.entries(customerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  let msg = `📊 รายงานสรุปยอดขาย ${titleType}\n`;
  if (isRestrictedSalesperson && userScope.name) {
    msg += `👤 พนักงานขาย: ${userScope.name}\n`;
  }
  msg += `========================\n`;
  msg += `📦 จำนวนคำสั่งซื้อ: ${orders.length.toLocaleString()} รายการ\n`;
  msg += `💰 ยอดขายรวมสุทธิ: ฿${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  msg += `------------------------\n`;
  msg += `🟢 ชำระแล้ว: ฿${paidSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${paidCount} รายการ)\n`;
  msg += `⏳ รอเก็บเงิน: ฿${pendingSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pendingCount} รายการ)\n`;

  if (topCustomers.length > 0) {
    msg += `------------------------\n`;
    msg += `🏆 ลูกค้ายอดสั่งซื้อสูงสุด:\n`;
    topCustomers.forEach(([cName, amt], idx) => {
      msg += ` ${idx + 1}. ${cName}: ฿${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    });
  }

  msg += `========================\n`;
  msg += `⏰ อัปเดต ณ วันที่: ${now.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} น.`;

  return msg;
}

export async function generateMonthlyPaymentReportText(
  userScope?: { role: string; referId?: any; name?: string }
): Promise<string> {
  await connectDB();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

  const query: any = {
    orderDate: { $gte: startOfMonth },
    deliveryStatus: { $ne: "CANCELLED" },
  };

  const isRestrictedSalesperson = userScope && userScope.role !== "admin";
  if (isRestrictedSalesperson) {
    const spConditions: any[] = [];
    if (userScope.referId) {
      spConditions.push({ salespersonId: userScope.referId });
    }
    if (userScope.name) {
      spConditions.push({ salespersonName: userScope.name });
    }
    if (spConditions.length > 0) {
      query.$or = spConditions;
    }
  }

  const orders = await Order.find(query).sort({ orderDate: -1 });

  let totalSales = 0;
  let paidSales = 0;
  let pendingSales = 0;

  const pendingList: { orderNo: string; customerName: string; grandTotal: number; paymentStatus: string }[] = [];

  orders.forEach((o) => {
    const amount = o.grandTotal || 0;
    totalSales += amount;
    if (o.paymentStatus === "PAID") {
      paidSales += amount;
    } else {
      pendingSales += amount;
      pendingList.push({
        orderNo: o.orderNo,
        customerName: o.customerName || "ไม่ระบุ",
        grandTotal: amount,
        paymentStatus: o.paymentStatus || "UNPAID",
      });
    }
  });

  const monthName = now.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

  let msg = `💰 รายงานยอดเก็บเงินประจำเดือน (${monthName})\n`;
  if (isRestrictedSalesperson && userScope.name) {
    msg += `👤 พนักงานขาย: ${userScope.name}\n`;
  }
  msg += `========================\n`;
  msg += `💵 ยอดขายรวมเดือนนี้: ฿${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  msg += `🟢 เก็บเงินแล้ว (Paid): ฿${paidSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  msg += `⏳ รอเก็บเงิน/วางบิล (Pending): ฿${pendingSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;

  if (pendingList.length > 0) {
    msg += `------------------------\n`;
    msg += `📋 รายการรอเก็บเงิน (${pendingList.length} รายการ):\n`;
    pendingList.slice(0, 5).forEach((item, idx) => {
      const statusBadge = item.paymentStatus === "BILLED" ? "[วางบิลแล้ว]" : item.paymentStatus === "OVERDUE" ? "[เกินกำหนด]" : "[ยังไม่ชำระ]";
      msg += `${idx + 1}. ${item.orderNo} - ${item.customerName}\n   ยอด: ฿${item.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${statusBadge}\n`;
    });
    if (pendingList.length > 5) {
      msg += `...และอีก ${pendingList.length - 5} รายการ\n`;
    }
  } else {
    msg += `------------------------\n`;
    msg += `🎉 เดือนนี้เก็บเงินครบถ้วนทุกรายการแล้ว!\n`;
  }

  msg += `========================\n`;
  msg += `⏰ อัปเดต ณ วันที่: ${now.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} น.`;

  return msg;
}

export async function sendLineReportNotification(
  reportType: "sales_weekly" | "sales_monthly" | "sales_yearly" | "payment_monthly",
  targetId?: string
) {
  const creds = await getLineCredentials();
  if (!creds.channelAccessToken) {
    throw new Error("ยังไม่ได้ตั้งค่า LINE Channel Access Token");
  }

  const destination = targetId || creds.lineGroupId;
  if (!destination) {
    throw new Error("ยังไม่ได้ตั้งค่า LINE Group ID หรือ Target Recipient");
  }

  let text = "";
  if (reportType === "sales_weekly") {
    text = await generateSalesSummaryText("weekly");
  } else if (reportType === "sales_monthly") {
    text = await generateSalesSummaryText("monthly");
  } else if (reportType === "sales_yearly") {
    text = await generateSalesSummaryText("yearly");
  } else if (reportType === "payment_monthly") {
    text = await generateMonthlyPaymentReportText();
  }

  await pushLineMessage(destination, [{ type: "text", text }], creds.channelAccessToken);

  return { success: true, destination, reportType, text };
}
