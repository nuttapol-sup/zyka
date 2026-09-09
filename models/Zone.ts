import mongoose, { Schema, Document, Model } from "mongoose";

export interface IZone extends Document {
  code: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const ZoneSchema: Schema<IZone> = new Schema(
  {
    code: {
      type: String,
      required: [true, "กรุณากรอกรหัสโซนสินค้า"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อโซนสินค้า"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
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
    collection: "zones",
  }
);

const Zone: Model<IZone> =
  mongoose.models.Zone || mongoose.model<IZone>("Zone", ZoneSchema);

export default Zone;
