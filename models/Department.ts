import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartment extends Document {
  code?: string;
  name: string;
  description?: string;
  seq: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema<IDepartment> = new Schema(
  {
    code: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อแผนก"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "departments",
  }
);

if (mongoose.models.Department) {
  delete mongoose.models.Department;
}

const Department: Model<IDepartment> =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", DepartmentSchema);

export default Department;
