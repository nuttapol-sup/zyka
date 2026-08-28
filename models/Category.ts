import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  code: string;
  name: string;
  note?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    code: {
      type: String,
      required: [true, "กรุณากรอกรหัสประเภท"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อประเภทหมวดสินค้า"],
      trim: true,
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
    collection: "categories",
  }
);

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
