import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  code: string;
  name: string;
  unit: string;
  subCategoryId?: mongoose.Types.ObjectId | string;
  description?: string;
  imageUrl?: string;
  minQuantity: number;
  seq: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    code: {
      type: String,
      required: [true, "กรุณากรอกรหัสสินค้า"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อสินค้า"],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, "กรุณาระบุหน่วยนับ"],
      default: "ชิ้น",
      trim: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    minQuantity: {
      type: Number,
      required: [true, "กรุณากำหนดจำนวนขั้นต่ำ (min)"],
      default: 0,
      min: 0,
    },
    seq: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
