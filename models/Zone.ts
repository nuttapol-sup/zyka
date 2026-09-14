import mongoose, { Schema, Document, Model } from "mongoose";
import StorageLocation from "./StorageLocation";

// Ensure StorageLocation is registered for populate
if (!StorageLocation) {
  // model registered
}

export interface IZone extends Document {
  code?: string;
  name: string;
  locationId?: mongoose.Types.ObjectId | any;
  description?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const ZoneSchema: Schema<IZone> = new Schema(
  {
    code: {
      type: String,
      required: false,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อโซนสินค้า"],
      trim: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "StorageLocation",
      required: false,
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

if (mongoose.models.Zone) {
  delete mongoose.models.Zone;
}

const Zone: Model<IZone> = mongoose.model<IZone>("Zone", ZoneSchema);

export default Zone;
