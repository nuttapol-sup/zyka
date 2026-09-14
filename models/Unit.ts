import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUnit extends Document {
  code: string;
  name: string;
  description?: string;
  seq: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema: Schema<IUnit> = new Schema(
  {
    code: {
      type: String,
      required: [true, "กรุณากรอกรหัสหน่วยนับ"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อหน่วยนับ"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    seq: {
      type: Number,
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
    collection: "units",
  }
);

if (process.env.NODE_ENV === "development" && mongoose.models.Unit) {
  delete mongoose.models.Unit;
}

const Unit: Model<IUnit> =
  mongoose.models.Unit || mongoose.model<IUnit>("Unit", UnitSchema);

export default Unit;
