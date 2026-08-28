import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRefer extends Document {
  referType: "1" | "2" | "3"; // 1=บุคลากร, 2=ลูกค้าบุคคลทั่วไป, 3=ลูกค้านิติบุคคล
  prefix: string;
  fullname: string;
  position?: string;
  address?: string;
  taxId?: string;
  phone?: string;
  contactName?: string;
  note?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const ReferSchema: Schema<IRefer> = new Schema(
  {
    referType: {
      type: String,
      enum: ["1", "2", "3"],
      required: true,
      default: "1",
      index: true,
    },
    prefix: {
      type: String,
      default: "",
      trim: true,
    },
    fullname: {
      type: String,
      required: [true, "กรุณากรอกชื่อ"],
      trim: true,
    },
    position: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    taxId: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    contactName: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "refers",
  }
);

const Refer: Model<IRefer> =
  mongoose.models.Refer || mongoose.model<IRefer>("Refer", ReferSchema);

export default Refer;
