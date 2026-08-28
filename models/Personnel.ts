import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPersonnel extends Document {
  prefix: string;
  fullname: string;
  position: string;
  phone?: string;
  note?: string;
  personnelType: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const PersonnelSchema: Schema<IPersonnel> = new Schema(
  {
    prefix: {
      type: String,
      required: [true, "กรุณาระบุคำนำหน้า"],
      trim: true,
      default: "นาย",
    },
    fullname: {
      type: String,
      required: [true, "กรุณากรอกชื่อ-นามสกุล"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "กรุณากรอกตำแหน่ง"],
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    personnelType: {
      type: String,
      default: "1",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Personnel: Model<IPersonnel> =
  mongoose.models.Personnel ||
  mongoose.model<IPersonnel>("Personnel", PersonnelSchema);

export default Personnel;
