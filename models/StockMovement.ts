import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStockMovement extends Document {
  productId: mongoose.Types.ObjectId | string;
  locationId?: mongoose.Types.ObjectId | string;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  refDoc?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  note?: string;
  createdByName?: string;
  createdAt: Date;
}

const StockMovementSchema: Schema<IStockMovement> = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "StorageLocation",
    },
    type: {
      type: String,
      enum: ["IN", "OUT", "ADJUST"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
      default: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      default: 0,
    },
    refDoc: {
      type: String,
      trim: true,
    },
    attachmentUrl: {
      type: String,
      trim: true,
    },
    attachmentName: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    createdByName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "stock_movements",
  }
);

const StockMovement: Model<IStockMovement> =
  mongoose.models.StockMovement ||
  mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);

export default StockMovement;
