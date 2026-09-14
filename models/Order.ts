import mongoose, { Schema, Document, Model } from "mongoose";
import "@/models/Refer";
import "@/models/Personnel";
import "@/models/Product";
import "@/models/StorageLocation";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId | string;
  productCode: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  amount: number;
  locationId?: mongoose.Types.ObjectId | string;
  locationName?: string;
}

export interface IOrder extends Document {
  orderNo: string;
  customerId: mongoose.Types.ObjectId | string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerTaxId?: string;
  salespersonId?: mongoose.Types.ObjectId | string;
  salespersonName?: string;
  poNo?: string;
  expectedDeliveryDate?: Date;
  shippedDate?: Date;
  senderName?: string;
  [key: string]: any;
  orderDate: Date;
  billingNo?: string;
  billingDate?: Date;
  dueDate?: Date;
  creditDays?: number;
  deliveryStatus: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingCarrier?: string;
  trackingNo?: string;
  paymentStatus: "UNPAID" | "BILLED" | "PAID" | "OVERDUE";
  paymentMethod?: "CASH" | "TRANSFER" | "CREDIT_CARD" | "CHEQUE";
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  hasTax: boolean;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  stockDeducted: boolean;
  deductedLocationId?: mongoose.Types.ObjectId | string;
  attachmentUrl?: string;
  attachmentName?: string;
  note?: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema<IOrderItem> = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productCode: { type: String, required: true },
  productName: { type: String, required: true },
  unit: { type: String, default: "ชิ้น" },
  price: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true, default: 1 },
  amount: { type: Number, required: true, default: 0 },
  locationId: {
    type: Schema.Types.ObjectId,
    ref: "StorageLocation",
  },
  locationName: { type: String, default: "" },
});

const OrderSchema: Schema<IOrder> = new Schema(
  {
    orderNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Refer",
      required: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, trim: true, default: "" },
    customerAddress: { type: String, trim: true, default: "" },
    customerTaxId: { type: String, trim: true, default: "" },
    salespersonId: {
      type: Schema.Types.ObjectId,
      ref: "Refer",
    },
    salespersonName: { type: String, trim: true, default: "" },
    poNo: { type: String, trim: true, default: "" },
    expectedDeliveryDate: { type: Date },
    shippedDate: { type: Date },
    senderName: { type: String, trim: true, default: "" },
    orderDate: { type: Date, default: Date.now },
    billingNo: { type: String, trim: true, default: "" },
    billingDate: { type: Date },
    dueDate: { type: Date },
    creditDays: { type: Number, default: 0 },
    deliveryStatus: {
      type: String,
      enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    shippingCarrier: { type: String, trim: true, default: "Kerry Express" },
    trackingNo: { type: String, trim: true, default: "" },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "BILLED", "PAID", "OVERDUE"],
      default: "UNPAID",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "TRANSFER", "CREDIT_CARD", "CHEQUE"],
      default: "TRANSFER",
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    hasTax: { type: Boolean, default: true },
    taxRate: { type: Number, default: 7 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    stockDeducted: { type: Boolean, default: true },
    deductedLocationId: {
      type: Schema.Types.ObjectId,
      ref: "StorageLocation",
    },
    attachmentUrl: { type: String, trim: true },
    attachmentName: { type: String, trim: true },
    note: { type: String, trim: true },
    createdByName: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: "orders",
    strictPopulate: false,
  }
);

delete (mongoose.models as any).Order;

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
