import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStorageLocation extends Document {
  code: string;
  name: string;
  type: string;
  address?: string;
  capacity?: number;
  status: "active" | "inactive";
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StorageLocationSchema: Schema<IStorageLocation> = new Schema(
  {
    code: {
      type: String,
      required: [true, "กรุณากรอกรหัสสถานที่เก็บสินค้า"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อสถานที่เก็บสินค้า"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "กรุณาเลือกประเภทสถานที่เก็บสินค้า"],
      default: "คลังสินค้าหลัก",
    },
    address: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const StorageLocation: Model<IStorageLocation> =
  mongoose.models.StorageLocation ||
  mongoose.model<IStorageLocation>("StorageLocation", StorageLocationSchema);

export default StorageLocation;
