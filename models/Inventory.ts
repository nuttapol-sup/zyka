import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId | string;
  locationId?: mongoose.Types.ObjectId | string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema: Schema<IInventory> = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "กรุณาระบุสินค้า"],
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "StorageLocation",
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "inventories",
  }
);

// Compound index for unique product-location stock record
InventorySchema.index({ productId: 1, locationId: 1 }, { unique: true });

const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>("Inventory", InventorySchema);

export default Inventory;
