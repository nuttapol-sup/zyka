import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPosition extends Document {
  code?: string;
  name: string;
  description?: string;
  departmentId?: mongoose.Types.ObjectId;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const PositionSchema: Schema<IPosition> = new Schema(
  {
    code: {
      type: String,
      trim: true,
      default: "",
    },
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อตำแหน่งงาน"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "positions",
  }
);

delete (mongoose.models as any).Position;

const Position: Model<IPosition> =
  mongoose.models.Position || mongoose.model<IPosition>("Position", PositionSchema);

export default Position;
