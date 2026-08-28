import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inventory from "@/models/Inventory";
import Product from "@/models/Product";
import StorageLocation from "@/models/StorageLocation";
import StockMovement from "@/models/StockMovement";
import SubCategory from "@/models/SubCategory";
import { getSession } from "@/lib/auth";

// Ensure models registered for population
if (!Product || !StorageLocation || !SubCategory || !StockMovement) {
  // Models registered
}

// GET /api/inventory - Get stock balances, products, locations, and movements
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.role !== "admin" && (!session.allowedPages || !session.allowedPages.includes("/inventory"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงระบบสต็อกสินค้า" }, { status: 403 });
    }

    await connectDB();

    // Fetch all active products
    const products = await Product.find({ status: "active" }).populate("subCategoryId").sort({ seq: 1 });
    const locations = await StorageLocation.find({ status: "active" }).sort({ createdAt: 1 });

    // Fetch existing inventory balances
    const inventories = await Inventory.find().populate({
      path: "productId",
      populate: { path: "subCategoryId" },
    }).populate("locationId");

    // Fetch recent 50 stock movements
    const movements = await StockMovement.find()
      .populate("productId")
      .populate("locationId")
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate total stock per product and check min alert
    const productStockMap: Record<string, number> = {};
    inventories.forEach((inv: any) => {
      const pId = inv.productId?._id?.toString() || inv.productId?.toString();
      if (pId) {
        productStockMap[pId] = (productStockMap[pId] || 0) + (inv.quantity || 0);
      }
    });

    const lowStockAlerts = products.filter((p: any) => {
      const currentStock = productStockMap[p._id.toString()] || 0;
      return currentStock <= (p.minQuantity || 0);
    });

    return NextResponse.json({
      inventories,
      products,
      locations,
      movements,
      productStockMap,
      lowStockAlertCount: lowStockAlerts.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสต็อกสินค้า" }, { status: 500 });
  }
}
