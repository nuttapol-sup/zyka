import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubCategory extends Document {
  code: string;
  name: string;
  categoryCode: string;
  seq: number;
  note?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema: Schema<ISubCategory> = new Schema(
  {
    code: {
      type: String,
      required: [true, "กรุณากรอกรหัสหมวดสินค้า"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อหมวดสินค้า"],
      trim: true,
    },
    categoryCode: {
      type: String,
      required: [true, "กรุณาเลือกประเภทหมวดสินค้า"],
      trim: true,
    },
    seq: {
      type: Number,
      required: true,
      default: 1,
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "sub_categories",
  }
);

const SubCategory: Model<ISubCategory> =
  mongoose.models.SubCategory || mongoose.model<ISubCategory>("SubCategory", SubCategorySchema);

export default SubCategory;
